---
name: playwright-scraper
description: Headless browser automation for DOM extraction using Playwright. Use when standard web fetching fails to capture JavaScript-rendered content for fragment analysis.
---

# Playwright Scraper Skill

This skill provides the procedural knowledge for using Playwright to extract full, rendered DOMs from modern, dynamic websites.

## Core Workflows

- **Headless Browsing**: Launching Chromium instances to execute client-side JavaScript.
- **Rendered HTML Capture**: Navigating to URLs and waiting for `domcontentloaded` to capture the final state of a page.
- **Fragment Analysis Preparation**: Saving full DOM extractions to enable accurate analysis for fragment creation.

## References

Load this reference file for installation and usage scripts:

- **[PLAYWRIGHT_GUIDE_DOM_EXTRACTION.md](references/PLAYWRIGHT_GUIDE_DOM_EXTRACTION.md)**: Detailed instructions for setting up Playwright and the `get_dom.py` script.
