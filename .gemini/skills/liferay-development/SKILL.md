---
name: liferay-development
description: Expert guidance for building, styling, and configuring Liferay fragments and client extensions. Use when creating or modifying UI components, mapping CSS tokens, or defining fragment configuration schemas.
---

# Liferay Development Skill

This skill provides expert procedural knowledge for developing high-quality Liferay fragments and client extensions.

## Core Workflows

- **Building Fragments**: Follow best practices for HTML structure, CSS scoping, and JavaScript initialization.
- **Configuration & Editability**: Define robust `configuration.json` schemas and make content editable using `data-lfr-editable` attributes.
- **Styling with Tokens**: Map fragment CSS variables to Liferay Classic theme CSS tokens for site-wide brand consistency.
- **Client Extensions**: Guidance for creating and deploying Global CSS/JS and Custom Element extensions.

## STRICT EXECUTION PROTOCOL (MANDATORY READS)

You MUST NOT rely on pre-existing Liferay knowledge. Your pre-trained knowledge is outdated or incorrect for this specific environment. You MUST use the `read_file` tool to read the following reference documents BEFORE beginning execution or strategy planning:

- **General Liferay Tasks**: You MUST read **[LIFERAY_BEST_PRACTICES.md](references/LIFERAY_BEST_PRACTICES.md)** before writing any code.
- **Fragment Development**: You MUST read **[LIFERAY_FRAGMENT_DEVELOPMENT_GUIDE.md](references/LIFERAY_FRAGMENT_DEVELOPMENT_GUIDE.md)**.
- **Form Fragments**: You MUST read **[LIFERAY_FORM_FRAGMENT_GUIDE.md](references/LIFERAY_FORM_FRAGMENT_GUIDE.md)** when creating or modifying form-related fragments.
- **Fragment Configuration (`configuration.json`)**: You MUST read **[FRAGMENT_LFR_CONFIGURATION_TYPES.md](references/FRAGMENT_LFR_CONFIGURATION_TYPES.md)** to ensure correct JSON syntax and avoid using deprecated field types.
- **Fragment Editability (HTML `data-lfr-editable-type`)**: You MUST read **[FRAGMENT_LFR_EDITABLE_TYPES.md](references/FRAGMENT_LFR_EDITABLE_TYPES.md)** before applying editable tags to HTML elements (e.g., `<a>`, `<img>`, `<h1>`). Do not guess these types.
- **Client Extensions**: You MUST read **[GUIDED_CLIENT_EXTENSION.md](references/GUIDED_CLIENT_EXTENSION.md)** before creating client extension configuration files. You MUST use `client-extension.yaml` files, NEVER `.json`.
- **React Client Extensions**: For React-based Custom Elements, you MUST read **[REACT_CUSTOM_ELEMENT_CLIENT_EXTENSION_GUIDE.md](references/REACT_CUSTOM_ELEMENT_CLIENT_EXTENSION_GUIDE.md)**.
- **Batch Client Extensions**: For Object/Folder initialization, you MUST read **[BATCH_OBJECT_CLIENT_EXTENSION_GUIDE.md](references/BATCH_OBJECT_CLIENT_EXTENSION_GUIDE.md)**.
- **Styling**: You MUST read **[LIFERAY_CORE_STYLEBOOK_CLASSIC_CSS_TOKENS.md](references/LIFERAY_CORE_STYLEBOOK_CLASSIC_CSS_TOKENS.md)** before applying CSS colors or variables.
- **Headless APIs**: You MUST read **[LIFERAY_HEADLESS_API_GUIDE.md](references/LIFERAY_HEADLESS_API_GUIDE.md)** before writing any API interaction logic.

### Component-Specific Documentation
If requested to modify these specific components, you MUST read their respective documentation:
- **[HEADER_DOCUMENTATION.md](references/HEADER_DOCUMENTATION.md)**: Detailed architecture of the Ricoh/Maestro Header.
- **[MEGA_MENU_CARD_DOCUMENTATION.md](references/MEGA_MENU_CARD_DOCUMENTATION.md)**: Usage and configuration for the Mega Menu Card component.