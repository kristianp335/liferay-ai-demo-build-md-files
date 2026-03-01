# Liferay AI Demo Build - Skills-Based Architecture

Welcome to the Liferay AI Demo Build repository. This project has transitioned from a static file-based context to a **Skills-Based Architecture** using the Gemini CLI.

## Why We Moved from MD Files to Skills

Previously, we used `settings.json` to load multiple Markdown files into the agent's context. We have moved to **Skills** for several critical reasons:

1.  **Surgical Context Management**: Instead of loading every guide at once, we activate specific skills on-demand. This keeps the context window lean and high-signal, preventing "context fatigue" and ensuring more accurate responses.
2.  **Expert Procedural Guidance**: Skills aren't just documentation; they are active "expert modes." When a skill is activated, the agent receives specialized instructions and workflows that prioritize project-specific best practices.
3.  **Tool & Script Integration**: Skills are tightly coupled with utility scripts (e.g., Python scripts for image generation or DOM scraping), providing a seamless bridge between knowledge and execution.
4.  **Modular Scalability**: Adding new capabilities (like a new API or a specific design system) is as simple as creating a new skill folder without cluttering the global `settings.json`.

---

## Available Skills

The following skills are available and can be activated by name:

### 1. `liferay-development`
Expert guidance for building Liferay fragments and client extensions.
- **Use for**: HTML structure, CSS token mapping (Liferay Classic), `configuration.json` schemas, and `data-lfr-editable` attributes.
- **Key References**: Best practices, configuration types, and Stylebook tokens.

### 2. `generate-images`
Workflow management for the `imagen-4.0-generate-001` model.
- **Use for**: Generating high-quality visual assets, enforcing aspect ratios (16:9), and optimizing for web (1K resolution).
- **Key References**: Imagen 4 API usage and Pillow-based image processing.

### 3. `liferay-admin`
Procedural knowledge for Liferay workspace setup and deployment.
- **Use for**: Environment configuration, zipping collections, and Lighthouse performance optimization (90+ scores).
- **Key References**: Deployment guides and performance strategies.

### 4. `liferay-commerce-objects`
Specialized workflows for Liferay Headless APIs.
- **Use for**: Managing B2B catalogs, SKUs, and programmatically defining Liferay Object Definitions.
- **Key References**: Commerce API guide and Object population workflows.

### 5. `playwright-scraper`
Headless browser automation for deep DOM extraction.
- **Use for**: Capturing JavaScript-rendered content for accurate site analysis and fragment recreation.
- **Key References**: Playwright setup and DOM capture scripts.

---

## How to Interact with Skills

You can ask Shirley (your AI assistant) to activate a skill or simply describe your task, and she will activate the appropriate expert mode.

**Example Prompts:**
- *"Activate the `liferay-development` skill and help me build a hero fragment."*
- *"Use the `generate-images` skill to create a 16:9 banner for a new site."*
- *"I need to deploy these fragments. Help me with the `liferay-admin` workflows."*

---

This architecture ensures that Shirley remains a focused, expert partner in building creative Liferay demos.

---

## How to Install

To use these skills in your own project, simply copy the `.gemini` folder from this repository and paste it into the root of your Liferay working directory. This will allow Shirley to access all the specialized expert modes and configurations defined here. Make sure the WHO_ARE_YOU.md file is in the working directory also.
