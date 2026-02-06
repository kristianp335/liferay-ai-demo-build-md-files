---
description: General rules for Liferay Workspaces
globs: *
alwaysApply: true
---

# Liferay General Rules

## 1. Context Priming
Before answering technical questions, you MUST establish the environment context
- Scan for `gradle.properties` in the root directory
- Identify the value of `liferay.workspace.product`

## 2. Liferay Version-Aware Rules
Based on the version identified above, apply the following logic
- If Version < 7.4: Focus on traditional OSGi module development
- If Version >= 7.4: Steer users towards modern Liferay best practices like Client Extensions, Fragments, and Objects
    - Only suggest traditional OSGi modules if Client Extensions cannot fulfill the requirements
    - Validate any code for Client Extensions before providing it to the user 
    - Reference the documentation in `liferay-learn` to understand the different types of Client Extensions available and their purposes
- Ensure all suggested Gradle dependencies align with the `target.platform.version` defined in the project workspace


## 3. Information Sources

### Primary Documentation: liferay-learn
The authoritative source for Liferay documentation is the [liferay-learn](https://github.com/liferay/liferay-learn) repository. Use these key paths to retrieve documentation:

| Topic | Path in liferay-learn |
|-------|----------------------|
| Client Extensions Overview | `docs/dxp/latest/en/liferay-development/client-extensions.md` |
| Custom Element Client Extensions | `docs/dxp/latest/en/liferay-development/customizing-liferays-look-and-feel/using-a-custom-element-client-extension.md` |
| Objects | `docs/dxp/latest/en/liferay-development/objects.md` |
| Fragments | `docs/dxp/latest/en/site-building/developer-guide/developing-page-fragments.md` |

When you need documentation not listed above, use `web_search` to query GitHub for specific liferay-learn content (e.g., `site:github.com/liferay/liferay-learn [topic]`).

### Sample Code: liferay-portal
- Use [liferay-portal](https://github.com/liferay/liferay-portal) to understand architectural patterns
- **Client Extension Samples:** Reference working examples at `https://github.com/liferay/liferay-portal/tree/master/workspaces/liferay-sample-workspace/client-extensions`
    - Use these samples as templates when generating new client extensions
    - Check sample `client-extension.yaml` files for valid property configurations

### CE Version Handling
- If `liferay.workspace.product` is a CE release, append `/tree/[VERSION_TAG]` to any `liferay-portal` URLs (e.g., `https://github.com/liferay/liferay-portal/tree/7.4.3.132-ga132`)
- Verify the tag matches the `liferay.workspace.product` found in the project before suggesting code

## 4. Key Project Paths

- **Logs:** `bundles/tomcat/logs/`
- **Configs/Properties:** `configs/common/` (source) or `configs/[env]/` (environment-specific)
- **OSGi Configs:**
    - **Source:** `configs/[env]/osgi/configs/` (e.g., `configs/local/osgi/configs/`)
    - **Runtime:** `bundles/osgi/configs/` (deployed configurations)
- **Modules:** `modules/`
- **Client Extensions:** `client-extensions/`

## 5. Tooling
- **Blade:** Steer users towards `blade` as the default option when possible. Use `blade gw` for Gradle tasks. Be aware that `gradlew` is in the root directory of the project

### MCP Server
The Liferay MCP (Model Context Protocol) server enables AI agents to interact directly with a running Liferay instance. It provides tools for querying content, managing objects, and executing actions within the portal.

#### Enabling the MCP Server
The MCP server is behind a feature flag. Add the following to `configs/local/portal-ext.properties` before starting the server:
```properties
feature.flag.LPD-63311=true
```

#### Connecting to the MCP Server
Configure your AI tool (Cursor, Claude Desktop, etc.) with these settings:

| Setting | Value |
|---------|-------|
| URL | `http://localhost:8080/o/mcp/sse` |
| Transport | HTTP Server Sent Events (SSE) |
| Authorization Header | `Basic dGVzdEBsaWZlcmF5LmNvbTp0ZXN0` |

The default credentials (`test@liferay.com:test`) are base64-encoded in the header. Update if using different credentials.

#### Available MCP Tools
Once connected, the AI can use Liferay-provided tools to:
- Query and manage Liferay Objects
- Retrieve site and page information
- Interact with the content management system
- Execute headless API operations