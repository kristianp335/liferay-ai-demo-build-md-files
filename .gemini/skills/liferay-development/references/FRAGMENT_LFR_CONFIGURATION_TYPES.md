# Liferay Fragment Configuration Types Reference

This document provides a reference for the valid `type` values that can be used for fields in a fragment's `configuration.json` file.

> **IMPORTANT NOTE:** Types such as `image`, `link`, and `rich-text` are **not valid** for this configuration file. They will cause import errors. Content like images, links, and rich text should be made editable directly in the `index.html` file using the `data-lfr-editable-type` attribute. Refer to `FRAGMENT_LFR_EDITABLE_TYPES.md` for more information.

## Complete JSON Example

This is a complete `configuration.json` file example for reference.

```json
{
  "fieldSets": [
    {
      "fields": [
        {
          "dataType": "string",
          "defaultValue": "block",
          "label": "content-display",
          "name": "contentDisplay",
          "type": "select",
          "typeOptions": {
            "validValues": [
              {
                "label": "Block",
                "value": "block"
              },
              {
                "label": "flex-row",
                "value": "flex-row"
              },
              {
                "label": "flex-column",
                "value": "flex-column"
              }
            ]
          }
        },
        {
          "dataType": "string",
          "defaultValue": "nowrap",
          "label": "flex-wrap",
          "name": "flexWrap",
          "type": "select",
          "typeOptions": {
            "validValues": [
              {
                "label": "nowrap",
                "value": "nowrap"
              },
              {
                "label": "wrap",
                "value": "wrap"
              },
              {
                "label": "wrap-reverse",
                "value": "wrap-reverse"
              }
            ]
          }
        },
        {
          "dataType": "string",
          "defaultValue": "stretch",
          "label": "align-items",
          "name": "alignItems",
          "type": "select",
          "typeOptions": {
            "validValues": [
              {
                "label": "start",
                "value": "start"
              },
              {
                "label": "center[alignment]",
                "value": "center"
              },
              {
                "label": "end",
                "value": "end"
              },
              {
                "label": "stretch",
                "value": "stretch"
              },
              {
                "label": "baseline",
                "value": "baseline"
              }
            ]
          }
        },
        {
          "dataType": "string",
          "defaultValue": "start",
          "label": "justify-content",
          "name": "justifyContent",
          "type": "select",
          "typeOptions": {
            "validValues": [
              {
                "label": "start",
                "value": "start"
              },
              {
                "label": "center[alignment]",
                "value": "center"
              },
              {
                "label": "end",
                "value": "end"
              },
              {
                "label": "between",
                "value": "between"
              },
              {
                "label": "around",
                "value": "around"
              }
            ]
          }
        },
        {
          "defaultValue": "var(--spacer-2, .5rem)",
          "label": "flex-gap",
          "name": "flexGap",
          "type": "length"
        },
        {
          "name": "allowMenuOverride",
          "label": "allow-menu-override",
          "type": "checkbox",
          "defaultValue": true
        }
      ],
      "label": "layout"
    },
    {
      "fields": [
        {
          "dataType": "string",
          "defaultValue": "increase-hamburger",
          "label": "logo-adaption",
          "name": "logoAdaption",
          "type": "select",
          "typeOptions": {
            "validValues": [
              {
                "label": "reduce-logo",
                "value": "reduce-logo"
              },
              {
                "label": "increase-hamburger",
                "value": "increase-hamburger"
              }
            ]
          }
        },
        {
          "name": "alwaysDisplayLogo",
          "label": "always-display-logo",
          "type": "checkbox",
          "defaultValue": false
        }
      ],
      "label": "logo"
    },
    {
      "fields": [
        {
          "defaultValue": true,
          "label": "logo-zone-header",
          "name": "logoZoneHeader",
          "type": "checkbox"
        }
      ],
      "label": "editor"
    }
  ]
}
```

## `text`

A basic, single-line text input field.

-   **Use Case:** For short strings like headlines, labels, or simple values.
-   **JSON Example:**
    ```json
    {
      "name": "myText",
      "label": "My Text Field",
      "type": "text",
      "defaultValue": "Default Value"
    }
    ```

## `select`

A dropdown select menu. The available options are defined in the `typeOptions` property.

-   **Use Case:** For providing a predefined set of choices.
-   **JSON Example:**
    ```json
    {
      "name": "textAlign",
      "label": "Text Alignment",
      "type": "select",
      "defaultValue": "left",
      "typeOptions": {
        "validValues": [
          {"value": "left", "label": "Left"},
          {"value": "center", "label": "Center"},
          {"value": "right", "label": "Right"}
        ]
      }
    }
    ```

## `checkbox`

A boolean toggle, rendered as a checkbox.

-   **Use Case:** For simple true/false or on/off settings.
-   **JSON Example:**
    ```json
    {
      "name": "showImage",
      "label": "Show Image",
      "type": "checkbox",
      "defaultValue": true
    }
    ```

## `colorPicker`

A UI tool for selecting a color.

-   **Use Case:** Allowing editors to choose custom colors for elements.
-   **JSON Example:**
    ```json
    {
      "name": "backgroundColor",
      "label": "Background Color",
      "type": "colorPicker",
      "defaultValue": "#FFFFFF"
    }
    ```

## `length`

A field for defining CSS length units (e.g., px, %, rem).

-   **Use Case:** For controlling dimensions like width, height, or font size.
-   **JSON Example:**
    ```json
    {
      "name": "imageWidth",
      "label": "Image Width",
      "type": "length",
      "defaultValue": "100%"
    }
    ```

## `itemSelector`

A dialog for selecting an item from the Liferay instance, such as a web content article, document, or category.

-   **Use Case:** For creating relations to other content in the portal.
-   **JSON Example:**
    ```json
    {
      "name": "webContentArticle",
      "label": "Web Content Article",
      "type": "itemSelector",
      "typeOptions": {
        "itemType": "com.liferay.journal.model.JournalArticle"
      }
    }
    ```

## `url`

A specialized field for inputting URLs.

-   **Use Case:** For any field that requires a URL, providing validation.
-   **JSON Example:**
    ```json
    {
      "name": "linkUrl",
      "label": "Link URL",
      "type": "url",
      "defaultValue": "https://www.liferay.com"
    }
    ```

## `videoSelector`

A dialog for selecting a video from Liferay's Documents and Media library.

-   **Use Case:** For embedding videos into a fragment.
-   **JSON Example:**
    ```json
    {
        "name": "video",
        "label": "Video",
        "type": "videoSelector"
    }
    ```

### Advanced Usage: Rendering the Video

The `videoSelector` does not return a simple URL. Instead, it returns a **JSON string** that contains the necessary HTML to embed the video. You must process this JSON in your fragment's JavaScript (`index.js`).

**1. Access the Configuration in JavaScript:**

Do not pass the video configuration through a `data-` attribute in your HTML, as this can cause rendering issues. Instead, access it directly from the global `configuration` object that Liferay makes available to your fragment's JavaScript.

```javascript
// In your index.js
const videoConfigStr = configuration.video;
```

**2. Parse the JSON and Inject the HTML:**

The `videoConfigStr` contains a JSON object. Parse it to get the `html` property, which contains the `<iframe>` or `<video>` tag.

```javascript
let videoData;
try {
    videoData = JSON.parse(videoConfigStr);
} catch (e) {
    console.error('Failed to parse video JSON:', e);
    return;
}

if (videoData && videoData.html) {
    const container = fragmentElement.querySelector('.my-video-container');
    container.innerHTML = videoData.html;
}
```

**3. Modify the Injected Element (Handling Timing):**

If you need to add attributes to the video (like `autoplay` or `controls`), you must wait for the browser to add the new HTML to the DOM. Use `requestAnimationFrame` to safely access the element after it has been injected.

```javascript
if (videoData && videoData.html) {
    const container = fragmentElement.querySelector('.my-video-container');
    container.innerHTML = videoData.html;

    // Wait for the DOM to update
    requestAnimationFrame(() => {
        const mediaElement = container.querySelector('iframe, video');
        if (mediaElement) {
            // Now you can safely modify the element
            if (mediaElement.tagName === 'VIDEO') {
                mediaElement.controls = true;
                mediaElement.autoplay = true;
            }
            if (mediaElement.tagName === 'IFRAME') {
                // Add URL parameters for embedded players like YouTube
                const src = new URL(mediaElement.src);
                src.searchParams.set('autoplay', '1');
                mediaElement.src = src.toString();
            }
        }
    });
}
```

## `collectionSelector`

A dialog for selecting a collection of items (e.g., an asset publisher collection).

-   **Use Case:** For displaying dynamic lists of content.
-   **JSON Example:**
    ```json
    {
        "name": "assetCollection",
        "label": "Asset Collection",
        "type": "collectionSelector"
    }
    ```

## `colorPalette`

A field for selecting a color from a predefined palette.

-   **Use Case:** Ensuring brand consistency by limiting color choices.
-   **JSON Example:**
    ```json
    {
      "name": "brandColor",
      "label": "Brand Color",
      "type": "colorPalette",
      "typeOptions": {
        "colors": ["#00A5B8", "#002D3A", "#ff0082"]
      }
    }
    ```

## `navigationMenuSelector`

A dialog for selecting a navigation menu from the Liferay instance.

-   **Use Case:** For creating dynamic navigation within a fragment.
-   **JSON Example:**
    ```json
    {
        "name": "navigationMenu",
        "label": "Navigation Menu",
        "type": "navigationMenuSelector"
    }
    ```
