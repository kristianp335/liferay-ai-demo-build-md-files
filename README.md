# 🌸 Shirley: The Liferay Demo Specialist

**Shirley** is a specialized AI agent designed for **Liferay Solutions Engineers**. She is an expert architect capable of autonomously building high-impact Liferay demos using Fragments, Client Extensions, Objects, and Commerce APIs.

By utilizing the **Gemini CLI** and a custom **5-Domain Skill Architecture**, Shirley understands the nuances of Liferay DXP development—from core CSS tokens to complex Headless API orchestrations.

---

## 🚀 Quick Start

### 1. Install Gemini CLI
Shirley runs on the [Gemini CLI](https://github.com/google/gemini-cli). To install the engine, run:

```bash
npm install -g @google/gemini-cli
```

### 2. "Hire" Shirley (Installation)
To give the Gemini CLI "Shirley's expertise," copy the `.gemini` folder from this repository into the root of your Liferay Workspace and also the `WHO_YOU_ARE.md` file: 

```bash
# In your workspace root
cp -r path/to/this/repo/.gemini .
```

---

## 🧠 The 5-Domain Architecture
Shirley's brain is split into specialized domains to keep context lean and accuracy high. Each domain has its own documentation and reference guides:

*   **[Liferay UI Fragments](./.gemini/skills/liferay-ui-fragments/SKILL.md)**: Master of the DOM. Handles HTML, CSS tokens, and `LFR` editable tags.
*   **[Liferay CX Frontend](./.gemini/skills/liferay-cx-frontend/SKILL.md)**: Expert in packaging. Handles React Custom Elements and Client Extension integration.
*   **[Liferay Data APIs](./.gemini/skills/liferay-data-apis/SKILL.md)**: The data engine. Handles Objects, Headless APIs, and Commerce logic.
*   **[Liferay Server CX](./.gemini/skills/liferay-server-cx/SKILL.md)**: The backend logic. Specialized in Python/Node microservices and Object Actions.
*   **[Liferay Admin](./.gemini/skills/liferay-admin/SKILL.md)**: The orchestrator. Handles workspace setup, deployment, and performance.

---

## ⚙️ Configuration (`settings.json`)

To enable Shirley's full capabilities, you should configure your `settings.json`. Based on our current setup, your configuration should look like this:

```json
{
  "context": {
    "fileName": [
      "WHO_YOU_ARE.md",
      "GEMINI.md"
    ]
  },
  "experimental": { 
    "enableAgents": true 
  },
  "agents": {
    "overrides": {
      "browser_agent": {
        "enabled": true
      }
    },
    "browser": {
      "sessionMode": "persistent",
      "visualModel": "gemini-2.5-computer-use-preview-10-2025"
    }
  },
  "mcpServers": {
    "liferay-mcp": {
      "httpUrl": "$LIFERAY_MCP_URL",
      "headers": {
        "Authorization": "Basic $LIFERAY_MCP_BASIC_AUTH"
      }
    }
  }
}
```

### Key Configuration Tips:
- **`context`**: Ensure `WHO_YOU_ARE.md` is included so Shirley always remembers her persona and protocols.
- **`experimental`**: Must be `true` to allow Shirley to use sub-agents for complex tasks.
- **`browser`**: Setting `sessionMode` to `persistent` allows Shirley to stay logged into your Liferay instance across different tasks.
- **`mcpServers`**: Registers the `liferay-mcp` server. Ensure that your system environment has the following variables configured (typically in a `.env` file or global system environment):
  - `LIFERAY_MCP_URL`: Point to your Liferay MCP servlet path (e.g., `https://<your-domain>/o/mcp`).
  - `LIFERAY_MCP_BASIC_AUTH`: Your Base64-encoded `username:password` string for authentication.

---

## 🎨 Image Generation Skill

Shirley uses the [generate-images](./.gemini/skills/generate-images/SKILL.md) skill to create professional-grade assets (Hero backgrounds, product thumbnails, avatars) so your demos never look like "empty templates."

### How the Key Works:
1.  **API Key**: This skill requires a Google API Key with access to the **Gemini Flash 3.1** model.
2.  **Environment Variable**: Store your key in your system's environment variables as `GEMINI_API_KEY` (or `NANOBANANA_GEMINI_API_KEY`).
3.  **Automatic Detection**: Shirley's Python scripts are configured to automatically pick up this key from your environment to securely generate thumbnails for new Fragments.

---

## 🛠️ Usage Protocol

Shirley follows a **Strict Execution Protocol**. When you ask her to build something, she will:
1.  **Research**: Activate the relevant domain skill (e.g., `liferay-ui-fragments`).
2.  **Strategy**: Read the `.md` reference files to ensure the latest Liferay standards are met.
3.  **Execution**: Write surgical, idiomatic code.
4.  **Validation**: Verify the implementation against Liferay's best practices.

**"My job is to make you look like a hero in front of the customer." — Shirley**
