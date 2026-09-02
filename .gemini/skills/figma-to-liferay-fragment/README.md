# Liferay DXP Presales Guide: Figma to Fragment Generator Skill

This guide explains how to automatically convert Figma designs (via Design URLs, Prototype links, raw screenshots, or exported JSON) into ready-to-use Liferay DXP Page Fragments using the Gemini CLI and the custom `figma-to-liferay-fragment` skill.

---

## The Hybrid Approach (Recommended)

When converting complex UI designs to code, relying on either raw code or visual mockups alone has limitations:

* **JSON/API Data alone:** Provides exact text copies, hex colors, and font specs, but complex nested frames or auto-layouts can yield confusing CSS hierarchies.
* **Image/Screenshots alone:** Provides accurate visual context and layout relationships, but lacks exact CSS variables, exact pixel specs, or easy text copy-pasting.

**The Hybrid Solution:** The skill automatically extracts **BOTH** the semantic JSON tree and a high-resolution PNG snapshot directly from Figma's API. Gemini processes both files simultaneously to deliver pixel-perfect layout fidelity combined with exact CSS and copy.

---

## Step 1: Generate Your Figma Access Token

To enable Hybrid Mode, you need a Figma Personal Access Token:

1. Log in to [Figma](https://www.figma.com) in your browser.
2. Click in the **Main Manu** logo, then **Help and Account** and then select **Accunt Settings**.
3. Select **Security** tab and then scroll down to **Personal access tokens** and click **Generate new token**.
4. Name it (e.g., `Gemini CLI Presales`), set **Read-only** access to *File content*, and choose an expiration date.
5. Click **Generate token** and copy the token immediately.

---

## Step 2: Set Up the Environment Variable

Store your token as an environment variable so the script executes seamlessly.

### Windows (PowerShell)
[System.Environment]::SetEnvironmentVariable('FIGMA_TOKEN', 'your_figma_token_here', 'User')
*(Restart your terminal after executing this).*

### Windows (CMD)
setx FIGMA_TOKEN "your_figma_token_here"

### macOS / Linux (zsh or bash)
Add this line to your ~/.zshrc or ~/.bashrc:
export FIGMA_TOKEN="your_figma_token_here"

---

## Step 3: Install or Update the Skill

Place the skill files inside your local project or global Gemini skills directory:

* **Global Location:** `~/.gemini/skills/figma-to-liferay-fragment/`
* **Project Location:** `./.gemini/skills/figma-to-liferay-fragment/`

Ensure the folder structure contains:

figma-to-liferay-fragment/
├── SKILL.md
└── scripts/
    └── fetch_figma.node.js

> **Note on updating skills:** If you are running an active interactive Gemini CLI session (`gemini`), exit (`Ctrl + C` or `exit`) and restart it to load the latest `SKILL.md` changes into memory.

## Step 4: Choose Your Input Method

The skill flexibly handles multiple inputs, automatically defaulting to Hybrid Mode when a URL is supplied:

| Input Method | Example Parameter / Syntax | Processing Mode |
| :--- | :--- | :--- |
| **Figma Design URL** | `https://www.figma.com/design/a1b2c3/Demo?node-id=10-20` | Hybrid (JSON Tree + Rendered PNG) |
| **Figma Prototype URL** | `https://www.figma.com/proto/vsuJoQEKsY/Gartner-Demo?node-id=17098-114086` | Hybrid (JSON Tree + Rendered PNG) |
| **Manual Screenshot** | `--image ./mockup.png` | Visual Only (Fallback for offline/no-token) |
| **Local JSON File** | `./exported_figma_frame.json` | Data Only (Offline API payload) |

---

## Step 5: Executing the Skill with Gemini CLI

Open your terminal and run Gemini CLI using your preferred prompt:

### Option A: Full Page URL (Hybrid Collection Generation)
This automatically downloads both the node tree and the rendered PNG screenshot of the full frame, splitting top-level sections into separate fragment folders.

gemini "Analyze this full Figma page URL using hybrid mode and create a Liferay fragment collection with separate folders for each section: https://www.figma.com/proto/vsuJoQEKsYGARNQxTSZ5ux/Gartner-Demo--2026?node-id=17098-114086"

### Option B: Single Component URL (Hybrid Fragment Generation)
Ideal for converting a specific hero banner, feature card, or dynamic callout.

gemini "Generate a single Liferay DXP fragment from this Figma component URL using hybrid analysis: https://www.figma.com/design/a1b2c3d4e5/My-Project?node-id=101-202"

---

## Step 6: Output Structure & Liferay Import

The skill outputs standard Liferay DXP fragment directories into `./src/liferay-fragments/`:

src/
└── liferay-fragments/
    ├── collection.json
    ├── hero-banner/
    │   ├── fragment.json
    │   ├── index.html       <-- Includes <lfr-editable> tags
    │   ├── styles.css       <-- Scoped CSS using Clay/Bootstrap 4
    │   └── configuration.json
    └── feature-grid/
        ├── fragment.json
        ├── index.html
        ├── styles.css
        └── configuration.json

### Importing to Liferay DXP:
1. Compress the `liferay-fragments` folder into a `.zip` file (or build it via Liferay Workspace CLI).
2. Go to your Liferay DXP instance: **Site Administration → Design → Fragments**.
3. Click **Dots Menu** (top right) → **Import** and upload your `.zip` file.

---

## Presales Prompt Examples Library

### 1. Configurable Hero Section (Hybrid Mode)
gemini "Analyze this Figma component URL: https://www.figma.com/design/a1b2c3/Demo?node-id=10-20 and Generate a Liferay fragment "

### 2. Splitting a Complex Presentation Flow into Fragment Collections
gemini "Process this prototype URL: https://www.figma.com/proto/vsuJoQEKsY/Gartner-Demo?node-id=17098-114086. Identify top-level frames (Header, Hero, Feature Cards, Footer) and output a full Liferay fragment collection."

### 3. Offline / Fast Screenshot Fallback
gemini "Analyze this design mockup screenshot and generate a responsive Liferay DXP Page Fragment using Flexbox and Clay CSS." --image ./landing-page-screenshot.png