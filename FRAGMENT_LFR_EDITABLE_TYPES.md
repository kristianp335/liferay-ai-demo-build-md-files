# Liferay DXP `data-lfr-editable-type` Reference

This document provides a definitive reference for the valid values of the `data-lfr-editable-type` attribute used in Liferay fragments. Using the correct type is crucial for making fragment content configurable and editable by content editors.

> **BEST PRACTICE:** Using these attributes is the correct way to make content editable directly on the page. When you use `data-lfr-editable-type`, especially for `image`, `link`, and `rich-text`, you should **not** create a corresponding field in your `configuration.json` file. Doing so is redundant and will cause import errors.

## 1. `text`

Makes plain text content editable. This renders as a simple text input in the configuration sidebar.

-   **HTML Tag:** Any tag that contains text (e.g., `<h1>`, `<h2>`, `<span>`, `<p>`).
-   **Configuration Field Type:** If you want to configure the default value in `configuration.json`, you would use a field of `type: "text"`.

### Example:

```html
<h1 data-lfr-editable-id="my-headline" data-lfr-editable-type="text">
  This is the default headline.
</h1>
```

## 2. `rich-text`

Makes a block of text editable with a WYSIWYG editor.

-   **HTML Tag:** Typically a `<div>` or other block-level element.
-   **Configuration Field Type:** Not typically configured via `configuration.json`. The default content is placed directly in the `index.html`.

### Example:

```html
<div data-lfr-editable-id="my-rich-text-block" data-lfr-editable-type="rich-text">
  <p>This is the <b>default</b> rich text content.</p>
</div>
```

## 3. `image`

Makes an image replaceable. Content editors can select an image from the Documents and Media library.

-   **HTML Tag:** `<img>`
-   **Configuration Field Type:** Not configured in `configuration.json`. The default image `src` must be set using the `[resources:...]` syntax in `index.html`.

### Example:

```html
<img
   src="[resources:default-image.png]"
   alt="A default image"
   data-lfr-editable-id="my-editable-image"
   data-lfr-editable-type="image"
>
```

## 4. `link`

Makes a link editable. Content editors can change the URL and the target of the link.

-   **HTML Tag:** `<a>`
-   **Configuration Field Type:** Not configured in `configuration.json`. The default `href` and text are set directly in `index.html`.

### Example:

```html
<a href="/default-link" data-lfr-editable-id="my-editable-link" data-lfr-editable-type="link">
  Default Link Text
</a>
```

## 5. `date-time`

Makes a date and time value editable with a date picker in the UI.

-   **HTML Tag:** A tag that will display the date, like `<span>` or `<time>`.
-   **Configuration Field Type:** Likely a `text` field in `configuration.json` to store the date string, though the UI provides a date picker.

### Example:
```html
<time datetime="2025-12-16" data-lfr-editable-id="my-date" data-lfr-editable-type="date-time">
  December 16, 2025
</time>
```

## 6. `action`

Triggers an object action, such as downloading a file or initiating a workflow.

-   **HTML Tag:** Typically a `<button>`.
-   **Configuration Field Type:** The specific action is likely configured in the fragment's settings.

### Example:
```html
<button data-lfr-editable-id="my-action-button" data-lfr-editable-type="action">
  Download Report
</button>
```