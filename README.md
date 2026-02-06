# Gemini CLI Demo Build Documentation

This directory (`demo-build-md-files`) contains a curated set of Markdown documentation files that are leveraged by the Gemini CLI agent to provide context and guidance for various Liferay development tasks.

---

## How Markdown Files Provide Context (via `settings.json`)

The Gemini CLI agent utilizes a `settings.json` file (typically located in `.gemini/settings.json`) to define which documentation files are relevant for its context. By listing Markdown files in this `settings.json` under `context.fileName`, these documents become part of the agent's knowledge base, allowing it to understand project conventions, best practices, and Liferay-specific requirements.

For example, a `settings.json` might look like this:

```json
{
  "context": {
    "fileName": [
      "LIFERAY_FRAGMENT_DEVELOPMENT_GUIDE.md",
      "LIFERAY_BEST_PRACTICES.md",
      "NANOBANANA_GUIDE.md",
      "WHO_YOU_ARE.md"
      // ... other .md files
    ]
  }
}
```

This mechanism ensures the agent has up-to-date and relevant information specific to your project's ecosystem.

---

## Prompting the Gemini CLI Agent for Liferay Development Tasks

The Gemini CLI agent is designed to assist with various software engineering tasks, including analyzing websites, creating Liferay fragments, and managing client extensions. Here are examples of how to effectively prompt the agent:

### 1. Copying Site Designs and Building Fragments

To instruct the agent to analyze a website and build Liferay fragments based on its design, provide a clear request that includes the target URL and specific requirements.

**Example Prompt:**
> "Create Liferay fragments and CSS for the site `www.example.com`. Go to the site and understand its layout. Make sure to capture the main header, a hero section, and a product card component. The global CSS should adhere to Liferay Classic CSS variables for colors."

**What the Agent Will Do:**
*   Attempt to analyze `www.example.com` (using tools like `web_fetch` or Playwright for DOM extraction).
*   Identify distinct visual components on the site.
*   Propose a plan for creating Liferay fragments (e.g., `header`, `hero`, `product-card`) and a global CSS.
*   Implement the fragments, including `fragment.json`, `configuration.json`, `index.html`, `index.css`, `index.js`, and `thumbnail.png`.
*   Create a global CSS client extension, mapping site colors to Liferay Classic CSS variables.
*   Package the fragments into a Liferay-compatible ZIP file.
*   Provide deployment instructions.

### 2. Including Existing Header Fragments (e.g., from `.gemini` folder)

If you have an existing fragment (like a feature-rich header) in your `.gemini` folder that you want to integrate into a new fragment collection without altering its core functionality, provide explicit instructions.

**Example Prompt:**
> "For the header, use the `ef-header` fragment in `.gemini/ef-header`. Do not change any of its functionality, only styling. Update its styling to match the new site's theme."

**What the Agent Will Do:**
*   Locate the specified header fragment (e.g., `.gemini/ef-header/ef-header`).
*   Copy all its files (`index.html`, `index.css`, `index.js`, etc.) into the new fragment collection under a new name (e.g., `o2-header`).
*   **Crucially, it will preserve the original `index.js` and HTML structure to maintain functionality.**
*   Modify only the `index.css` of the copied fragment to update its visual appearance based on the new site's theme and global CSS variables, ensuring that no functional code is touched.
*   Update the fragment's `fragment.json` to reflect the new name (e.g., `o2-header`).

---

This README aims to clarify how documentation and interaction patterns are handled within this environment, ensuring effective collaboration with the Gemini CLI agent for Liferay development.
