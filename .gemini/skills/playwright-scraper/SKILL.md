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

## STRICT EXECUTION PROTOCOL (MANDATORY READS)

You MUST NOT attempt to write Playwright scripts from memory. You MUST use the `read_file` tool to read the following reference document BEFORE generating any Python scraping scripts:

- **Playwright Setup & Scripts**: You MUST read **[PLAYWRIGHT_GUIDE_DOM_EXTRACTION.md](references/PLAYWRIGHT_GUIDE_DOM_EXTRACTION.md)** to obtain the validated installation commands and the correct `get_dom.py` implementation logic.