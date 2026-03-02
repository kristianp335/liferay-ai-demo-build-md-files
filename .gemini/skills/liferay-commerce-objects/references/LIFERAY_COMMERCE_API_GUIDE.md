# Liferay Commerce API Guide

## Overview

This guide provides comprehensive documentation for building B2B commerce systems using Liferay Commerce Headless APIs. It covers complete product creation workflows, SKU management, category systems, and working specifications based on A the proven Pharmaceuticals implementation.

## System Architecture

### Key Implementation Findings & Corrections (Dec 2025)
**This section contains crucial corrections to the original guide based on recent implementation experience. Read this first.**

- **Product Identifier:** The most critical finding is that the **`externalReferenceCode` (ERC) is the only reliable identifier** for a product after its creation. The original guide's references to using the internal `{id}` for `PATCH` or sub-resource endpoints are incorrect and will lead to `404 NOT FOUND` errors. All `PATCH`, `DELETE`, and sub-resource `POST` or `PATCH` calls (like for `/categories` or `/images`) MUST use the ERC-based endpoint: `/products/by-externalReferenceCode/{ERC}`.

- **Product Option Creation:** Product Options (e.g., for size, color, or in our case, consultation slots) are **global, prerequisite entities**. They are NOT defined within the product itself. They must be created *before* you create a product that uses them.
    - **Correct Endpoint:** `POST /o/headless-commerce-admin-catalog/v1.0/options`
    - The `id` returned from this creation (`optionId`) is then used when linking the option to a product.

- **Image Uploads:** The original guide's two-step process of uploading to the document library and then attaching by `fileEntryId` is unreliable. A more direct and robust method is to first generate the image (e.g., using the `generate_image` tool or similar), then read that image file, Base64 encode it, and directly upload it to the product via its ERC.
    - **Correct Endpoint:** `POST /products/by-externalReferenceCode/{ERC}/images/by-base64`

- **Specifications:** Attaching specifications via the nested `/productSpecifications` endpoint is prone to mapping errors (`404 NOT FOUND`). The reliable method is to update the product itself using its ERC via `PATCH /products/by-externalReferenceCode/{ERC}` and supplying a `productSpecifications` array containing the `specificationKey` and the `value`.
    - **Note on Creation:** When creating the global specifications (via `POST /o/headless-commerce-admin-catalog/v1.0/specifications`), you should normally set `"facetable": true` in the payload so that users can use these specifications to filter searches in the storefront.

### AI Agent Directives: Scripting Standards
**CRITICAL INSTRUCTION:** Do NOT rely on or copy legacy `.py` scripts that may already exist in the user's workspace (e.g., old `create_products.py` files). Legacy scripts often contain outdated API patterns (such as nested POSTs for specifications or missing `facetable` flags). 

You MUST always create new scripts based on the **Working API Structure** below. When creating new global specifications, ALWAYS set `"facetable": true`. 

#### Gold Standard Boilerplate Script
Use this complete, working boilerplate as your definitive starting point for any new commerce imports:

```python
import os
import requests
from requests.auth import HTTPBasicAuth

url = "https://YOUR_INSTANCE/o/headless-commerce-admin-catalog/v1.0"
catalog_id = 12345
auth = HTTPBasicAuth('user@email.com', 'password')

# Example payload for creating a Facetable Specification
spec_payload = {
    "key": "example-spec",
    "title": {"en_US": "Example Spec"},
    "facetable": True
}
# requests.post(f"{url}/specifications", json=spec_payload, auth=auth)

erc = "PRODUCT-ERC-123"

# 1. Create Product (Requires ERC at creation)
prod_payload = {
    "active": True,
    "catalogId": catalog_id,
    "externalReferenceCode": erc,
    "name": {"en_US": "Example Product"},
    "productType": "simple"
}
# requests.post(f"{url}/products", json=prod_payload, auth=auth)

# 2. Assign Categories via PATCH
cat_patch = [{"id": 99999}]
# requests.patch(f"{url}/products/by-externalReferenceCode/{erc}/categories", json=cat_patch, auth=auth)

# 3. Create SKU via PATCH
sku_payload = {
    "skus": [{
        "sku": f"SKU-{erc}",
        "price": 100.0,
        "purchasable": True,
        "published": True
    }]
}
# requests.patch(f"{url}/products/by-externalReferenceCode/{erc}", json=sku_payload, auth=auth)

# 4. Attach Specifications via PATCH (Do NOT use nested POST /productSpecifications)
spec_patch_payload = {
    "productSpecifications": [
        {
            "specificationKey": "example-spec",
            "value": {"en_US": "Example Value"}
        }
    ]
}
# requests.patch(f"{url}/products/by-externalReferenceCode/{erc}", json=spec_patch_payload, auth=auth)

# 5. Attach Image directly via Base64 to ERC
# img_payload = {
#     "attachment": "BASE64_STRING",
#     "contentType": "image/png",
#     "priority": 0,
#     "title": {"en_US": "Main Image"}
# }
# requests.post(f"{url}/products/by-externalReferenceCode/{erc}/images/by-base64", json=img_payload, auth=auth)
```

### Working API Structure (Validated Dec 2025)

**Prerequisites:**
1.  **Create Vocabularies & Categories:** As described in the Taxonomy section.
2.  **Create Global Product Option:** `POST /o/headless-commerce-admin-catalog/v1.0/options` to create a reusable option like "Consultation Slot". Capture the `id` of this new option.

**Product-Specific Workflow:**
**Step 1 - Create Product:** `POST /products` with basic fields (`name`, `description`, `catalogId`, etc.). **Crucially, you must include a unique `externalReferenceCode` in this initial post.**

**Step 2 - Generate & Upload Image:**
    - **Generate Image:** Use the `generate_image` tool (or equivalent) with a descriptive prompt to create the desired image file.
    - **Upload Image:** Read the generated image file, Base64 encode its content, and then `POST` to `/products/by-externalReferenceCode/{ERC}/images/by-base64` with a payload containing the Base64-encoded image string and content type.

**Step 3 - Assign Categories:** `PATCH /products/by-externalReferenceCode/{ERC}/categories` with a payload of `[{"id": categoryId}]`.

**Step 4 - Assign Options & SKUs:** If a product requires variant SKUs (e.g., standard vs. high capacity), you MUST generate the options and map the SKUs correctly. First, clear any base SKUs. Then, `PATCH` the product via its ERC with a `productOptions` array to attach the option. Finally, `POST` the variant SKUs directly to the product's SKUs endpoint using the ERC, including the `skuOptions` block to map the specific `optionValueId`.

**Example:**
```python
# 1. Attach Option via PATCH
payload_opt = {
    'productOptions': [
        {
            'optionId': 184112,
            'name': {'en_US': 'Paper Tray Configuration'},
            'fieldType': 'select',
            'required': True
        }
    ]
}
requests.patch(f'{url}/products/by-externalReferenceCode/{ERC}', json=payload_opt)

# 2. Add Option Values via POST to the new ProductOption ID
requests.post(f'{url}/productOptions/{productOptionId}/productOptionValues', json={'key': '2-trays', 'name': {'en_US': 'Standard'}})

# 3. Create Variant SKUs via POST using the optionValueId
payload_sku = {
    'sku': 'SKU-VARIANT-1',
    'price': 22000,
    'purchasable': True,
    'published': True,
    'skuOptions': [
        {
            'key': 'paper-tray-config',
            'optionId': 184172, # The productOption instance ID
            'optionValueId': 184173 # The newly created value ID
        }
    ]
}
requests.post(f'{url}/products/by-externalReferenceCode/{ERC}/skus', json=payload_sku)
```

**Step 5 - Specifications:** Do not use the nested POST endpoint. Instead, `PATCH` the product via its ERC with a `productSpecifications` array using the `specificationKey`:
```json
{
    "productSpecifications": [
        {
            "specificationKey": "print-speed",
            "value": {"en_US": "115 ppm"}
        }
    ]
}
```


## Complete Product Portfolio Implementation

## Specification System Implementation

**Working Specifications:**
- **Active Ingredient Spec (ID: 66585)**: Primary pharmaceutical ingredient (key: "active-ingredient")
- **Strength Spec (ID: 66409)**: Dosage strength information (key: "strength")
- **Storage Conditions Spec (ID: 66410)**: Required storage conditions (key: "storage-conditions")
- Each product has 3 specifications properly attached using localized value maps

## Taxonomy Structure

**Therapeutic Areas Vocabulary (ID: 62442)**: 
- Cardiovascular (62443)
- Respiratory (62452)
- Antibiotics & Anti-infectives (62446)
- Pain Relief & Anti-inflammatories (62449)
- Gastrointestinal (62455)
- Dermatological (62458)

**Product Types Vocabulary (ID: 62461)**: 
- POM (62462)
- P Medicine (62465)
- GSL (62468)
- Medical Devices (62471)
- Controlled Substances (62474)

## Option Templates (Reusable)

- **pack-size (ID: 62686)**: For tablet pack variants (28, 56, 84, 24, 48 tablets)
- **dosage-strength (ID: 63140)**: Ready for future dosage variants
- **inhaler-doses (ID: 63141)**: For inhaler dose counts (100, 200 doses)

## B2B Pricing Structure

- Professional pricing with cost margins for wholesale pharmaceutical distribution
- Varied pricing by pack size and therapeutic category
- All products have purchasable SKUs with proper cost/price ratios

## External Dependencies

**User and Account Management:**
- **Headless Admin User API**: Used for fetching user and account information.
- **Get Account by ID**: `/o/headless-admin-user/v1.0/accounts/{accountId}`

**Liferay Commerce Platform:**
- **Liferay Commerce Headless APIs**: Core API for product, catalog, and specification management
- **Headless Commerce Admin Catalog v1.0**: Primary API endpoints for all commerce operations
- **Headless Admin Taxonomy API**: For category and vocabulary management
- **Headless Delivery API**: For document and image upload

**Commerce API Endpoints:**
- **Products**: `/o/headless-commerce-admin-catalog/v1.0/products`
- **Product Specifications**: `/o/headless-commerce-admin-catalog/v1.0/products/{id}/productSpecifications`
- **Product Categories**: `/o/headless-commerce-admin-catalog/v1.0/products/{id}/categories`
- **Product Images**: `/o/headless-commerce-admin-catalog/v1.0/products/{id}/images`
- **Specifications**: `/o/headless-commerce-admin-catalog/v1.0/specifications`
- **Taxonomies**: `/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/{id}/taxonomy-categories`

**Authentication:**
- Basic Auth credentials configured securely via environment variables
- Site ID: 20123, Catalog ID: 33181

## Generated Assets

- Professional pharmaceutical product images via AI generation
- Complete 3-image systems for all 25 products
- Packaging, product photos, and consultation scenes for each therapeutic category
- Total: 75 professional pharmaceutical images with working src URLs

## Three-Image Solution Workflow

- **Step 1**: Generate professional pharmaceutical images (packaging, product photo, consultation context)
- **Step 2**: Upload images via Headless Delivery API: POST `/sites/{siteId}/documents`
- **Step 3**: Attach images via Commerce API: POST `/products/{id}/images` with fileEntryId, title, priority
- **Priority System**: 0=Packaging, 1=Product Photo, 2=Medical Consultation
- **Complete Coverage**: All 25 products have 3 professional images with working src URLs
- **API Statistics**: 75 uploads + 75 attachments = 150 successful API calls total