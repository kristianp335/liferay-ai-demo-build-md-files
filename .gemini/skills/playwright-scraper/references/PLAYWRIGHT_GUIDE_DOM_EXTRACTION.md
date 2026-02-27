# Playwright for Full DOM Extraction

This document outlines the process of installing and using Playwright to extract the full, JavaScript-rendered DOM of a web page. This is a necessary step to accurately analyze modern, dynamic websites that load content asynchronously. 

## The Problem

The standard `web_fetch` tool does not execute JavaScript. This means it only retrieves the initial HTML served by the server, which is often a minimal skeleton of the final page. Key components and content are frequently loaded and rendered by client-side JavaScript, which `web_fetch` cannot see.

## The Solution: Headless Browsing with Playwright

Playwright is a powerful Python library that automates browser actions. By using it in a "headless" mode (without a visible UI), we can programmatically:

1.  Launch a real browser engine (like Chromium).
2.  Navigate to a specific URL.
3.  Wait for the browser to execute JavaScript and finish rendering the page.
4.  Extract the complete, final HTML DOM.

## Installation

To use Playwright, two installation steps were required:

### 1. Install the Python Library

The Playwright library was installed using `pip`, Python's package installer.

**Command:**
```bash
pip install playwright
```

### 2. Install Browser Binaries

After installing the library, Playwright needs to download the browser engines it controls.

**Command:**
```bash
playwright install
```
This command downloads and sets up browsers like Chromium, Firefox, and WebKit in Playwright's own managed location, making them available for automation.

## Usage: The `get_dom.py` Script

To make the process reusable, a Python script named `get_dom.py` was created.

### Script Functionality:

-   **Accepts URL:** Takes a URL as a command-line argument.
-   **Launches Headless Browser:** Uses `playwright.async_api` to start a browser instance.
-   **Navigates and Waits:** Goes to the specified URL and waits for the `domcontentloaded` event. This is a reliable event that fires when the initial HTML document has been completely loaded and parsed, without waiting for all stylesheets and images to finish loading. It's a good compromise between getting the full DOM and avoiding timeouts on pages with continuous network activity.
-   **Saves the DOM:** Retrieves the final HTML content of the page and saves it to a file named `everflow_rendered.html`.

### Execution:

The script example was executed with the following command:
```bash
python get_dom.py https://everflowutilities.com/ --output everflow_rendered.html
```

This process provided the full, rendered HTML of the Everflow homepage, enabling a much more accurate analysis for fragment creation.
