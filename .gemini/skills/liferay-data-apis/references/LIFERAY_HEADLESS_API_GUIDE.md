# Liferay Headless API Guide

This guide details specific nuances, workarounds, and best practices when interacting with Liferay's Headless APIs, specifically focusing on User Accounts, Roles, and Account Onboarding.

## 1. Fetching User Roles (The `my-user-account` Endpoint)

When fetching the current user's profile via `/o/headless-admin-user/v1.0/my-user-account`, Liferay does not return a simple flat array of all roles a user holds. 

Instead, roles are strictly scoped and nested based on where they are assigned. If you need to verify if a user has a specific role (e.g., "Ricoh Dealer"), you must recursively or broadly flatten the arrays across all possible contexts:

```javascript
const userUrl = '/o/headless-admin-user/v1.0/my-user-account';
const userData = await Liferay.Util.fetch(userUrl).then(res => res.json());

// Flatten all possible role locations
const allRoles = [
    ...(userData.roleBriefs || []), // Global roles
    ...(userData.accountBriefs || []).flatMap(acc => acc.roleBriefs || []), // Account roles
    ...(userData.organizationBriefs || []).flatMap(org => org.roleBriefs || []), // Organization roles
    ...(userData.siteBriefs || []).flatMap(site => site.roleBriefs || []), // Site roles
    ...(userData.userGroupBriefs || []).flatMap(ug => ug.roleBriefs || []) // User Group roles
];

const hasSpecificRole = allRoles.some(role => role.name === 'Ricoh Dealer');
```

## 2. Onboarding an Account via Headless APIs

Creating an account, assigning an address, and granting a user access requires specific schema compliance.

### A. Creating the Account
Standard `POST` to `/o/headless-admin-user/v1.0/accounts`.

```json
{
    "name": "Company Name",
    "type": "business",
    "status": 0,
    "taxId": "12345678"
}
```

### B. Adding a Postal Address
When adding an address via `/o/headless-admin-user/v1.0/accounts/{accountId}/postal-addresses`, Liferay enforces strict validation against its internal dictionaries:
- **`addressCountry`**: Must perfectly match the `name` or `name_i18n` in Liferay (e.g., `"United Kingdom"`, NOT `"GB"` or `"united-kingdom"`).
- **`addressRegion`**: Must perfectly match the Liferay region dictionary. For the UK, this is very strict (e.g., `"London, City of"`, NOT `"Greater London"`). If a third-party API like Google Places provides a region that doesn't match Liferay's strict list, the request will fail with a `400 BAD REQUEST` ("Region not found"). It is highly recommended to wrap address creation in a `try/catch` block so a region mismatch does not crash the entire onboarding flow.
- **`addressType`**: Must match an existing Liferay List Type exactly (lowercase, e.g., `"billing"`, `"shipping"`).

### C. Assigning a User to the Account
You **cannot** use the ID-to-ID endpoint for associating an existing user with a new account via standard POST mapping. 
Instead, you must link them using the email endpoint:
```javascript
// Correct
await Liferay.Util.fetch(`/o/headless-admin-user/v1.0/accounts/${accountId}/user-accounts/by-email-address/${userEmail}`, { method: 'POST' });

// Incorrect (Will return 405 Method Not Allowed)
// await Liferay.Util.fetch(`/o/headless-admin-user/v1.0/accounts/${accountId}/user-accounts/${userId}`, { method: 'POST' });
```

### D. Assigning Account Roles
After the user is linked to the account, you can grant them Account Roles (such as Account Administrator). The most reliable endpoint is assigning by the role's External Reference Code (ERC) mapped against the user's ID.
```javascript
await Liferay.Util.fetch(`/o/headless-admin-user/v1.0/accounts/${accountId}/account-roles/by-external-reference-code/ACCOUNT_ADMINISTRATOR/user-accounts/${userId}`, {
    method: 'POST'
});
```

### E. Assigning to Account Groups
To organize accounts into segments (e.g., for pricing or visibility), you can assign them to Account Groups. Using the ERC-based endpoint is recommended for robustness.

```javascript
// Assign account to group using ERCs
await Liferay.Util.fetch(`/o/headless-admin-user/v1.0/account-groups/by-external-reference-code/${groupErc}/accounts/by-external-reference-code/${accountErc}`, {
    method: 'POST'
});
```

## 3. Fetching and Filtering Commerce Orders

When building custom order dashboards or details fragments, you often need to fetch orders specifically for the current Commerce Account.

### A. Getting the Current Account ID
Use the `Liferay.CommerceContext` object (available in the browser) to get the `accountId`.

```javascript
if (Liferay.CommerceContext && Liferay.CommerceContext.account) {
    const accountId = Liferay.CommerceContext.account.accountId;
}
```

### B. Fetching Orders with Nested Items
To get full order details including line items in a single request, use the `nestedFields=orderItems` parameter.

**Endpoint:** `/o/headless-commerce-admin-order/v1.0/orders?nestedFields=orderItems&pageSize=100`

### C. Client-Side Filtering by Account ID
Currently, the `headless-commerce-admin-order` API does not always support direct `filter=accountId eq ...` queries depending on the Liferay version and permissions. A reliable pattern is to fetch the latest orders and filter them client-side:

```javascript
const ordersUrl = `/o/headless-commerce-admin-order/v1.0/orders?nestedFields=orderItems&pageSize=100`;
const ordersData = await Liferay.Util.fetch(ordersUrl).then(res => res.json());

// Filter by the accountId from Liferay.CommerceContext
const accountOrders = ordersData.items.filter(order => order.accountId == accountId);
```

## 4. Linking Orders to Custom Objects

A powerful pattern for B2B applications (like Ricoh Finance) is linking standard Commerce Orders to custom Liferay Objects (e.g., "Finance Originations").

### A. Relationship Naming Convention
Custom object relationships follow a specific naming pattern in the API: `r_<sourceObject>To<targetObject>_<targetObjectIdField>`.

**Example:**
If a `FinanceOrigination` object has a relationship to a `CommerceOrder`, the field in the `financeoriginations` API response will likely be:
`r_commerceOrderToFinance_commerceOrderId`

### B. Matching Data Client-Side
Fetch both datasets and use the relationship field to join them:

```javascript
const financeData = await Liferay.Util.fetch('/o/c/financeoriginations?pageSize=100').then(res => res.json());
const financeItems = financeData.items || [];

// Inside your order loop:
const matchingFinance = financeItems.find(f => f.r_commerceOrderToFinance_commerceOrderId == order.id);
```

## 5. Unauthenticated Guest Access & Service Access Policies (SAP)

By default, Liferay Headless APIs block unauthenticated (Guest) requests. If you are building fragments or front-end components meant for public pages, you MUST configure a **Service Access Policy (SAP)**.

### Configuring the SAP
1. Navigate to **Global Menu &rarr; Control Panel &rarr; Security &rarr; Service Access Policy**.
2. Click **Add** to create a new policy.
3. Configure the following critical settings:
   - **Enabled:** Checked
   - **Default:** Checked *(This is required to apply the policy to unauthenticated/guest users automatically).*
   - **Title:** e.g., "Guest Headless Delivery Access"
4. Switch to **Advanced Mode** at the bottom of the page.
5. In the **Allowed Service Signatures** box, add the fully qualified implementation signatures required for your use case.

**Common Signatures for Public Sites:**

To allow guests to fetch individual Web Content Articles (Structured Content):
```text
com.liferay.headless.delivery.internal.resource.v1_0.StructuredContentResourceImpl#getStructuredContent
```

To allow guests to fetch Navigation Menus via the Headless API:
```text
com.liferay.headless.delivery.internal.resource.v1_0.NavigationMenuResourceImpl#getNavigationMenu
```

*Note: You must also ensure the actual resource (e.g., the Web Content Article) has its View permissions granted to the Guest role.*

## 6. Dynamic Fragment Integration via Headless API

When building custom UI fragments that rely on complex data (like Geolocation fields which cannot be mapped natively via `data-lfr-editable-type="html"`), you can use the Headless API to dynamically fetch and inject the data client-side.

### Example: Google Maps Integration via URL Path Parsing

If a fragment sits on a Display Page Template, it lacks direct FreeMarker access to the underlying structured content's ID in the browser. You can parse the URL to extract the Content ID and make an API call to retrieve the necessary fields (like latitude and longitude).

```javascript
(function() {
    const iframe = fragmentElement.querySelector('.dynamic-map');

    // 1. Abort if inside Liferay Site Builder edit mode to prevent breaking the editor
    if (document.body.classList.contains('has-edit-mode-menu') || document.querySelector('[data-editor-enabled="true"]')) {
        return;
    }

    // 2. Extract the Structured Content ID from the last segment of the Display Page URL
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const contentId = pathSegments[pathSegments.length - 1];

    if (contentId && !isNaN(contentId)) {
        // 3. Securely fetch the article details using Liferay's built-in utility (handles CSRF/Auth automatically)
        Liferay.Util.fetch(`/o/headless-delivery/v1.0/structured-contents/${contentId}`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                // 4. Extract the nested geolocation field
                if (data.contentFields) {
                    const geoField = data.contentFields.find(f => f.name === 'geolocationOfPrimaryHomeCourse');
                    if (geoField && geoField.contentFieldValue && geoField.contentFieldValue.geo) {
                        const lat = geoField.contentFieldValue.geo.latitude;
                        const lng = geoField.contentFieldValue.geo.longitude;
                        
                        // 5. Update the iframe source
                        iframe.src = `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${lat},${lng}&zoom=14`;
                    }
                }
            })
            .catch(err => console.error("Failed to fetch data:", err));
    }
})();
```
