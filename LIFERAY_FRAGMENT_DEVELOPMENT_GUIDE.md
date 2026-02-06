# Liferay Fragment Development Guide

## Overview

This comprehensive guide provides best practices, architectural patterns, and optimization techniques for creating production-ready Liferay fragments and client extensions. It covers responsive design, performance optimization, advanced functionality integration, and proven patterns from Johnson Matthey and Vanden Recycling implementations.

## Common Fragment Import Errors

This section details the most common errors encountered when importing fragments and how to solve them. **If you are having trouble importing a fragment, check here first.**

---

### 1. Error: "HTML content must not be empty"

This error is almost always caused by an incorrect or incomplete `fragment.json` file. Liferay cannot find the fragment's files because the paths are not specified with the correct keys.

**Solution:** Ensure all file paths in `fragment.json` use the correct keys (`htmlPath`, `cssPath`, etc.).

#### ❌ Incorrect `fragment.json`
```json
{
  "fragmentEntryKey": "my-fragment",
  "name": "My Fragment",
  "type": "component",
  "html": "index.html",
  "css": "index.css"
}
```

#### ✅ Correct `fragment.json`
```json
{
  "fragmentEntryKey": "my-fragment",
  "name": "My Fragment",
  "type": "component",
  "htmlPath": "index.html",
  "cssPath": "index.css",
  "jsPath": "index.js",
  "configurationPath": "configuration.json",
  "thumbnailPath": "thumbnail.png"
}
```

---

### 2. Error: "Fragment configuration is invalid. required key [fieldSets] not found"

This error means the `configuration.json` file has the wrong structure. All configurable fields must be nested within a `fieldSets` array.

**Solution:** Wrap your `fields` array inside a `fieldSets` array.

#### ❌ Incorrect `configuration.json` Structure
```json
{
    "fields": [
        {
            "name": "title",
            "label": "Title",
            "type": "text"
        }
    ]
}
```

#### ✅ Correct `configuration.json` Structure
```json
{
    "fieldSets": [
        {
            "fields": [
                {
                    "name": "title",
                    "label": "Title",
                    "type": "text"
                }
            ]
        }
    ]
}
```

---

### 3. Error: "Fragment configuration is invalid. ... is not a valid enum value"

This error occurs when you use an invalid `type` for a field in `configuration.json`. Common invalid types are `image`, `link`, and `rich-text`. These are not configured via `configuration.json`.

**Solution:** Remove fields with these invalid types from `configuration.json`. Instead, make the corresponding HTML elements editable directly using `data-lfr-editable-type`.

#### ❌ Incorrect `configuration.json`
```json
{
    "fieldSets": [{
        "fields": [{
            "name": "myImage",
            "label": "My Image",
            "type": "image" 
        }]
    }]
}
```
#### ✅ Correct Approach
1.  **Remove the field from `configuration.json`**.
2.  **Make the HTML tag editable**:
    ```html
    <img src="/default/image.png" data-lfr-editable-id="myImage" data-lfr-editable-type="image" />
    ```

---

### 4. Error: "FreeMarker syntax is invalid. The following has evaluated to null or missing"

This happens when a variable in your `index.html` template (e.g., `${configuration.title}`) is null because no value has been set for it and there is no default.

**Solution:** Always provide a default value for every configuration variable used in your template.

#### ❌ Incorrect Template Expression
```html
<h2>${configuration.title}</h2>
<a href="${configuration.buttonLink}">Click me</a>
```

#### ✅ Correct Template Expression
For strings and URLs, use `!'defaultValue'`.
```html
<h2>${configuration.title!'My Default Title'}</h2>
<a href="${configuration.buttonLink!'/default-url'}">Click me</a>
```
For booleans used in `[#if]` conditions, wrap the variable in parentheses and provide a default.
```html
[#if (configuration.showFeature)!false]
    <div>My awesome feature!</div>
[/#if]
```

---

### 5. Error: `java.lang.NullPointerException` related to Fragment Configuration or ZIP Packaging

This is a common, multi-faceted error that can prevent fragment collections from importing successfully. The stack trace often points to `com.liferay.fragment.internal.util.configuration.FragmentEntryConfigurationParserImpl` or issues with ZIP file parsing.

#### Root Causes & Solutions:

1.  **Missing `collection.json`**:
    *   **Problem**: The fragment collection ZIP did not contain a `collection.json` file in the root of the collection directory. Liferay's importer requires this for basic collection metadata.
    *   **Solution**: Create `collection.json` (e.g., `o2-fragment-collection/collection.json`) with `name` and `description` properties, and ensure it's included at the root of the ZIP.
        ```json
        {
          "name": "My Fragment Collection",
          "description": "Description of my fragments."
        }
        ```

2.  **Sensitive ZIP Archiving Method**:
    *   **Problem**: Liferay's importer is highly sensitive to the internal structure and metadata of the `.zip` archive. Using standard shell utilities (like `Compress-Archive` or `tar`) or even Python's `zipfile` module with implicit path handling (e.g., `os.path.relpath`) can introduce subtle differences that cause import failures.
    *   **Solution**: Always use a dedicated Python script that explicitly adds each file to the ZIP archive. This means iterating through known fragment and resource files, and carefully constructing the `arcname` (the internal path within the ZIP) to ensure it matches Liferay's expected `collection-name/path/to/file` structure. Avoid generic directory traversal or implicit path derivation where possible.

3.  **`url` Field `defaultValue` Issues & Redundant Configuration**:
    *   **Problem**: A `java.lang.NullPointerException` (e.g., `Cannot invoke "com.liferay.portal.kernel.json.JSONObject.getJSONObject(String)" because "jsonObject" is null` at `_getURLValue`) can occur during parsing of `configuration.json` for `url` type fields. This often happens if the `defaultValue` is `null`, empty, or a relative path that Liferay interprets as something other than a simple string. Additionally, duplicating configuration for editable content (like button text/links) in both `configuration.json` and `index.html` is a common anti-pattern.
    *   **Solution**:
        *   For `url` type fields, ensure `defaultValue` is always a non-empty, simple string (e.g., `"#"` or a full URL). Avoid relative paths in `defaultValue` within `configuration.json` as they can be problematic.
        *   **Best Practice**: For editable content such as image sources, link `href`s, and rich text, **DO NOT** create corresponding fields in `configuration.json`. Instead, make the HTML element directly editable using `data-lfr-editable-type` and provide the default value directly in `index.html`.
            *   **❌ Incorrect `configuration.json` (for buttons/links)**:
                ```json
                // This is redundant and can cause issues
                {
                  "name": "buttonLink",
                  "label": "Button Link",
                  "type": "url",
                  "defaultValue": "/some-path"
                }
                ```
            *   **✅ Correct `index.html` (for editable links)**:
                ```html
                <a href="/default-path" data-lfr-editable-id="myButtonLink" data-lfr-editable-type="link">
                  Click Here
                </a>
                ```
                In this correct approach, `myButtonLink` handles both the URL and the text, without needing corresponding configuration fields.

---

### Conclusion

Addressing these issues collectively should provide a robust and Liferay-compliant fragment collection ZIP file. The key takeaways are: strict adherence to the `collection.json` structure, using explicit Python `zipfile` operations, and following best practices for `configuration.json` and `data-lfr-editable-type` for URL and button fields.
