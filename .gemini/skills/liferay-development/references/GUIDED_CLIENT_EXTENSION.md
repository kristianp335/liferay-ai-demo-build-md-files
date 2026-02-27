---
description: Guide for generating, deploying, and verifying Liferay Client Extensions for beginners
globs: client-extensions/**
alwaysApply: false
---

# Liferay Client Extension Mentor Protocol (Beginner Friendly)

## 0. Pre-Flight Check
- Verify if the user wants a guided experience with creating a sample Client Extension. If they decline, this guide should only be used as a reference

## 1. One-Shot Generation
- Create `client-extensions/liferay-hello-world/` folder
**ALWAYS** reference the official Liferay sample as the source of truth:
- **Sample Location**: https://github.com/liferay/liferay-portal/tree/master/workspaces/liferay-sample-workspace/client-extensions/liferay-sample-custom-element-1
- **Key Files to Reference**:
  - `client-extension.yaml` - Use this as the template structure, start with the **exact** sample configuration for now.
  - `assets/index.js` - Reference for JavaScript structure
  - `assets/style.css` - Reference for CSS structure
- **No build.gradle needed**: The Liferay workspace plugin automatically detects client extensions in the `client-extensions/` directory
- Add "Hello World" message with custom styling

## 2. Deployment Guidance
- Explain that Blade uses the Gradle Wrapper (`blade gw`) to package your code into a `.zip` file and deploy to the Liferay server
- Deploy command: `blade gw deploy`. Will automatically copy zip to the Liferay server in `osgi/client-extensions`. Run this for the user as part of the One-shot generation.
- Verify the `bundles/` folder exists. If it doesn't exist, guide users through the initial setup guide
- Verify the Liferay server is currently running at `localhost:8080` so the user can test the extension
- Explain in Liferay, Client Extensions are "detached" from the core. We are building a small application that the portal will "host"

## 3. Log Verification
- Look for the log entry similar to `STARTED [extension-id]`
- Explain this log entry confirms Liferay detected your new extension and has registered it in the OSGi registry

## 4. UI Registration & Interaction 
Guide the user through the Liferay UI using the following steps
1. Open a Site Page and enter **Edit Mode** (Click the 'Pencil' icon)
2. Open the **Fragments and Widgets** sidebar (Click the '+' icon)
3. Select the **Widgets** tab and scroll to the **Client Extensions** category
4. Drag `[Extension Name]` onto the page layout
5. Click **Publish** to view the widget and interact with it

## 5. Follow-up Actions
- Ask the user if they want to create another type of Client Extension
- Additional Client Extension samples and types can be found under https://github.com/liferay/liferay-portal/tree/master/workspaces/liferay-sample-workspace/client-extensions/