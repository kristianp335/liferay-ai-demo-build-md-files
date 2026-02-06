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

**Step 4 - Assign Options & SKUs:** `PATCH /products/by-externalReferenceCode/{ERC}` with a payload containing the `productOptions` and `skus` arrays. The `productOptions` object must reference the global `optionId` created as a prerequisite.
```json
{
    "productOptions": [{
        "optionId": 12345, // The ID of the global option
        "productOptionValues": [
            {"key": "value1", "name": {"en_US": "Value 1"}}
        ]
    }],
    "skus": [{
        "sku": "SKU-001",
        "price": 99.99,
        "purchasable": true,
        "skuOptionValues": [{"optionValueKey": "value1"}]
    }]
}
```

**Step 5 - Specifications (If needed):** This would likely also use the ERC endpoint: `POST /products/by-externalReferenceCode/{ERC}/productSpecifications`.


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