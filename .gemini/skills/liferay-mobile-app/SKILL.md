---
name: liferay-mobile-app
description: Guidance for developing and deploying a React Native / Expo mobile application integrated with Liferay DXP. Use when working on mobile app codebases, running the Expo development server, configuring OAuth2 authentication, or interacting with Liferay Headless, Custom Object, and Document REST APIs.
---

# Liferay Mobile App Skill

This skill provides expert procedural knowledge for developing, integrating, and deploying React Native mobile applications built on the **Expo SDK** platform and integrated with Liferay DXP.

## Core Workflows

- **Local Development**: Setting up the developer environment, starting the Expo bundler, and debugging.
- **Authentication**: Implementing and managing OAuth2 Resource Owner Password Credentials Grant with Liferay DXP.
- **Liferay Custom Object REST API Integration**: Querying, creation, and synchronization of dynamic Liferay custom objects.
- **Liferay Document Storage Integration**: Multipart uploads of image/media files into Liferay Document Library folders.

---

## 1. Local Development & Expo Environment

Liferay-connected mobile applications typically package using Expo SDK (e.g., `"expo": "~54.0.0"`).

### Version Integrity (MANDATORY RULE)
> **CRITICAL**: Expo APIs can change significantly between major versions. Always read the official versioned documentation (e.g., **https://docs.expo.dev/versions/v54.0.0/** for v54) before writing or refactoring any core navigation, asset picker, or system device APIs.

### Developer Commands
Run these commands inside your mobile app root directory:
* **Start Metro Bundler Console**: `npx expo start` or `npm run start`
* **Run in Android Emulator**: `npx expo start --android` or `npm run android`
* **Run in iOS Simulator**: `npx expo start --ios` or `npm run ios`
* **Run in Web Browser**: `npx expo start --web` or `npm run web`

---

## 2. Authentication Mechanism (Liferay OAuth2)

The application utilizes Liferay's **Resource Owner Password Credentials Grant** (OAuth2 Password Grant) to obtain authorization.

### Client Credentials Configuration
Establish configuration constants or environment variables for your Liferay portal settings:
* **Liferay Base URL**: `https://<YOUR_LIFERAY_PORTAL_URL>`
* **OAuth2 Client ID**: `<YOUR_OAUTH2_CLIENT_ID>`
* **OAuth2 Client Secret**: `<YOUR_OAUTH2_CLIENT_SECRET>`

### Obtaining an Access Token
To authenticate a user, execute a `POST` request to Liferay's OAuth2 token endpoint using the `application/x-www-form-urlencoded` format:

```javascript
const handleLogin = async (username, password) => {
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: OAUTH2_CLIENT_ID,
    client_secret: OAUTH2_CLIENT_SECRET,
    username: username,
    password: password
  });

  const response = await fetch(`${LIFERAY_HOST}/o/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await response.json();
  if (data.access_token) {
    // Save access token and username to your AuthContext / state
    login(data.access_token, username);
  } else {
    throw new Error(data.error_description || "Invalid credentials.");
  }
};
```

### Authenticating API Requests
Every API request to Liferay must include the JWT access token in the `Authorization` header:

```javascript
const fetchWithAuth = async (endpoint, token, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...options.headers
  };
  return fetch(`${LIFERAY_HOST}${endpoint}`, { ...options, headers });
};
```

---

## 3. Liferay API Integration Patterns

The mobile app reads and writes to Liferay's custom Objects and core Document Library.

### A. Custom Object REST APIs
Fetch, create, and update entries via custom object endpoints:

#### 1. Fetching Object Entries (with Nested Relations)
Query custom objects, including nested fields or custom relations where necessary, using parameters such as `nestedFields`:
```javascript
const res = await fetchWithAuth(
  '/o/c/<YOUR_CUSTOM_OBJECT_URL>?nestedFields=<YOUR_RELATION_FIELD>',
  token
);
const data = await res.json();
// data.items contains the list of custom object entries
```

#### 2. Updating Object Entries
To update properties of an object entry, send a `PATCH` update:
```javascript
const updateObjectEntry = async (entryId, updateData) => {
  const res = await fetchWithAuth(`/o/c/<YOUR_CUSTOM_OBJECT_URL>/${entryId}`, token, { 
    method: 'PATCH', 
    body: JSON.stringify(updateData) 
  });
  return res.ok;
};
```

---

### B. Uploading Files to the Liferay Document Library
Images taken by the device's camera or selected from the library are uploaded into Liferay's Headless Document system using `multipart/form-data`:

* **Upload Endpoint**: `POST /o/headless-delivery/v1.0/document-folders/<FOLDER_ID>/documents`

```javascript
const uploadDocument = async (uri, token, folderId) => {
  const filename = uri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  let formData = new FormData();
  formData.append('file', { uri, name: filename, type });

  const res = await fetch(`${LIFERAY_HOST}/o/headless-delivery/v1.0/document-folders/${folderId}/documents`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  return data.id; // Returns the generated document ID to be linked on the Custom Object
};
```

---

### C. Chat & Messaging Channels via Objects
Real-time messaging can be implemented using custom Liferay Objects as standard data tables:

#### 1. Creating a Message or Channel Entry
```javascript
const res = await fetchWithAuth('/o/c/<MESSAGE_OBJECT_URL>', token, {
  method: 'POST',
  body: JSON.stringify({
    senderId: currentUserEmail,
    recipientGroupId: String(groupId),
    messageBody: textContent,
    timestamp: new Date().toISOString() + "Z"
  })
});
```

#### 2. Querying and Polling Messages
Query messages using query parameters like `filter` and `sort`:
* **API Call**: `/o/c/<MESSAGE_OBJECT_URL>?filter=recipientGroupId eq '${groupId}'&sort=timestamp:desc`
