---

description: Connect Liferay DXP to Liferay AI Hub, inventory its agents, call an agent from DXP (Kaleo workflow node or browser code with Cell on-behalf-of auth), build agents that call back into DXP (HTTP Request node, Liferay Search RAG over Search Blueprints), and put a chatbot on a page. Agents and chatbots cannot be created over the API: the skill hands the developer a build sheet, then verifies the result. Use when the user mentions AI Hub, an AI Hub agent or chatbot, Agent Builder, a RAG chatbot over CMS content, or an AI step in a workflow. Requires feature flag LPD-62272.
name: manage-ai-hub

---

# Manage AI Hub

Liferay AI Hub is a separate cloud service (`https://ai.hub.liferay.com`) where agents and chatbots are built. Agents are authored in its **Agent Builder** as small workflows of nodes (LLM, HTTP Request, Liferay Search). A DXP instance connects to it as a **Cell**: DXP mints tokens that let AI Hub act on behalf of a DXP user, and AI Hub calls DXP's Headless APIs back.

Two directions, two identities — keep them apart, most failures here are an identity mix-up:

| Direction | Who calls | Identity used |
| --- | --- | --- |
| DXP → AI Hub (run an agent, send a chat message) | DXP itself, or browser code on a DXP page | A Cell token minted by DXP for a DXP user (`Liferay-AI-Hub-Cell-On-Behalf-Of`) |
| AI Hub → DXP (HTTP Request node, Liferay Search RAG) | The agent's workflow | The token AI Hub holds for that DXP; what it may do depends on the DXP OAuth2 application's scopes and on the user it acts as (see "Which User an Agent Acts As") |
| Any client → AI Hub management API (list agents) | A script, this skill | Client credentials from AI Hub → Configurations — read only |

Sources: the AI Hub quick starts at <https://github.com/fabian-bouche-liferay/ai-hub-quick-start> (QS1 HTTP Requests, QS2 RAG, QS3 Kaleo Workflow, QS4 External RAG — still being validated —, QS5 Using AI Hub APIs from the browser), DXP 2026.q3.2 bytecode for the Cell and Kaleo modules, and live calls against `ai.hub.liferay.com` on 2026-10-01. Each section says which.

## When to Invoke

- "Connect DXP to AI Hub", "the AI Hub connection does not work"
- "Which agents exist?", "what does `L_IMPROVE_WRITING` expect as input?"
- Any task that needs a new agent or chatbot — produce the build sheet for the developer
- "Fix the spelling of every new blog entry with AI", "add an AI step to this workflow"
- "Call an agent from a fragment", "build a chatbot widget", "let an assistant fill this form"
- "Build a chatbot that answers from our CMS content", "the chatbot never finds anything"
- "Let an agent read the current user's orders"

## Building Blocks

| Concept | What it is | Where it lives |
| --- | --- | --- |
| Agent | A workflow of nodes with declared Input Variables and one Output Variable, keyed by an ERC | AI Hub → Agent Builder → Agents |
| System agent | One of the 16 Liferay-provided agents, ERC prefixed `L_` (account `L_AI_HUB`) | Same, `system: true` |
| Chatbot | One or more agents behind a chat UI; with several agents, the native **Supervisor** routes between them from their descriptions | AI Hub → Chatbots |
| Data Source | An indexed external website, assigned to an agent | Agent Builder → Data Sources |
| Search Blueprint | The DXP-side query an agent's Liferay Search node retrieves through | DXP → Search Experiences → Blueprints |
| Cell | The DXP ↔ AI Hub connection, configured on both sides | DXP Instance Settings → AI Hub, and AI Hub → Configurations |

## Prerequisites — Connect DXP to AI Hub

Documented in QS2 steps 2–4, on DXP 2026.Q3 or later:

1. **DXP:** Control Panel → Instance Settings → Feature Flags → **Release** → **AI Hub (`LPD-62272`)** → enable.
1. **AI Hub:** AI Hub → Configurations → **Environment URL** = the **public HTTPS URL of DXP**. It is not an AI Hub URL. Save, then copy the **Client ID** and **Client Secret** it shows. Keep the secret out of source control.
1. **DXP:** Control Panel → Instance Settings → AI Hub → paste Client ID and Client Secret, Service URL `https://ai.hub.liferay.com/`, save.

> **`localhost` is rejected as the Environment URL.** AI Hub runs outside your network and calls DXP back, so DXP needs a public HTTPS address. For local work use a tunnel **without an interstitial page** — ngrok's free plan injects one, which breaks unattended API calls. Everything that only goes DXP → AI Hub works without it; anything where AI Hub calls DXP (HTTP Request, Liferay Search RAG) does not.

### Behind a Tunnel or Reverse Proxy

DXP calls **itself** to mint Cell tokens (`/o/ai-hub-cell/v1.0/authorization-tokens`, see below), sometimes from a background thread with no HTTP request to read forwarded headers from. Without a static port, the JVM's listening port (`8080`) is appended to the public `https://` URL and the self-call fails. Set, in `portal-ext.properties` (QS3):

```properties
web.server.http.port=80
web.server.https.port=443

web.server.forwarded.host.enabled=true
web.server.forwarded.port.enabled=true
web.server.forwarded.protocol.enabled=true
```

Do not also set `web.server.host` or `web.server.protocol` while the matching `forwarded.*.enabled` is on. These are read at startup only, so a restart is needed — apply the session restart policy in `CLAUDE.md` → "Server Restarts".

## Inventory the Agents

Verified live against `ai.hub.liferay.com` on 2026-10-01. Use it to find an agent's ERC and its input and output variable names before writing any call — those names are the contract.

### Get a Token

The Client ID and Client Secret from AI Hub → Configurations work as an OAuth2 **client credentials** client against AI Hub itself. The token lasts 600 s.

```bash
TOKEN=$(curl \
	--data "client_id=${AIHUB_CLIENT_ID}" \
	--data "client_secret=${AIHUB_CLIENT_SECRET}" \
	--data "grant_type=client_credentials" \
	--request POST \
	--silent \
	--url "https://ai.hub.liferay.com/o/oauth2/token" \
	| jq --raw-output '.access_token')
```

Read the two values from a git-ignored file or the environment; never echo them or the token.

### Two Endpoints, Different Strengths

| | `/o/ai-hub/v1.0/agent-definitions` | `/o/ai-hub/agent-definitions` (object entries) |
| --- | --- | --- |
| List | Yes | Yes |
| Get by ERC | **No** — `405` | `GET …/by-external-reference-code/{erc}` |
| `filter` | `active` only; any other field → `400` "A property used in the filter criteria is not supported" | Any field: `system`, `active`, `externalReferenceCode`, `r_accountToAIHubAgentDefinitions_accountEntryERC`, … |
| `search` | Yes | Yes |
| Extra data | `model` (LLM name), typed `inputVariables` / `outputVariable`, `version` | `creator`, owning account, dates; variables as a comma-separated string |
| Completeness | Omits some system agents (`L_PAGE_BUILDER`, `L_SITE_BUILDER`) | All agents the token may see |

Use the object endpoint to find and filter, the v1.0 endpoint to read the model and typed variables.

```bash
# System agents
curl \
	--get \
	--data-urlencode "filter=system eq true" \
	--data "pageSize=100" \
	--header "Authorization: Bearer ${TOKEN}" \
	--silent \
	--url "https://ai.hub.liferay.com/o/ai-hub/agent-definitions" \
	| jq '[.items[] | {externalReferenceCode, title, active, inputVariables, outputVariable}]'

# The user's own agents: filter on the account the credentials belong to
curl \
	--get \
	--data-urlencode "filter=r_accountToAIHubAgentDefinitions_accountEntryERC eq '<account-erc>' and system eq false" \
	--header "Authorization: Bearer ${TOKEN}" \
	--silent \
	--url "https://ai.hub.liferay.com/o/ai-hub/agent-definitions"
```

The token sees the system agents, the agents of its own account, and possibly a few agents of other accounts. Filter by account rather than assuming everything listed belongs to the user. A **`404` by ERC means "absent or outside this token's visibility"** — a permission refusal on a read surfaces as `404`, so do not conclude the agent does not exist.

### System Agents (2026-10-01)

| ERC | Inputs → output |
| --- | --- |
| `L_AUTO_CATEGORIZE` | `candidateCategories`, `content`, `count` → `suggestedCategories` |
| `L_CATEGORIZATION_INTENT` (inactive) | `message` → `intent` |
| `L_CHANGE_TONE` | `text`, `tone` → `rewrittenText` |
| `L_CONTENT_GAP_ANALYST` | `request` → `output` |
| `L_FIX_SPELLING_AND_GRAMMAR` | `text` → `rewrittenText` |
| `L_GENERATE_CONTENT` | `brief`, `count` → `output` |
| `L_GENERATE_FIELD_VALUE` | `instruction` → `properties` |
| `L_GENERATE_IMAGE` | `description` → `output` |
| `L_GENERATE_TAGS` | `content`, `count`, `existingTags` → `suggestedTags` |
| `L_IMPROVE_WRITING`, `L_MAKE_LONGER`, `L_MAKE_SHORTER` | `text` → `rewrittenText` |
| `L_LIFERAY_SEARCH` | `request` → `response` |
| `L_PAGE_BUILDER` | `instruction`, `currentPage` → `response` |
| `L_SITE_BUILDER` (inactive) | `generationExternalReferenceCode`, `request` → `output` |
| `L_TRANSLATE_CONTENT` | `instruction` → `output` |

The list changes with AI Hub releases — re-list rather than trust this table for an exact contract.

### Agents Cannot Be Changed Over the API With These Credentials

Verified 2026-10-01, on an agent the user owned and authorized for the test:

- The v1.0 API has no update operation. Its write operations on an existing agent are `update-active`, `copy`, and `delete`; `POST /agent-definitions/draft` takes no body.
- The Agent Builder UI saves with `PUT /o/ai-hub/agent-definitions/by-external-reference-code/{erc}` and the full entry (`active`, `description`, `externalReferenceCode`, `inputVariables`, `outputVariable`, `r_accountToAIHubAgentDefinitions_accountEntryERC`, `title_i18n`, `workflowDefinitionName`), as the signed-in user's session.
- Replaying that exact `PUT`, a `PATCH`, or `update-active` with the client credentials token returns **`403 {"status": "FORBIDDEN"}`**. The token carries the `*.write` scopes, so this is the permission layer: the client's service account holds `VIEW`, not `UPDATE`, on agents created by a person.

So agents and chatbots are created and edited **by the developer, in the AI Hub UI** — never attempt the write yourself. Follow "Ask the Developer to Build It" below.

## Ask the Developer to Build It

You can read AI Hub and call it, but you cannot create or change an agent, a chatbot, or a Data Source. When a task needs one, your job is to hand the developer an exact build sheet, wait, then verify what they built over the API.

### 1. Reuse Before Asking

List the agents first ("Inventory the Agents"). In order of preference:

1. **A system agent already does it** (`L_FIX_SPELLING_AND_GRAMMAR`, `L_TRANSLATE_CONTENT`, `L_GENERATE_TAGS`, …): use its ERC and its variables as listed. Ask only that it be **enabled** if `active` is false.
1. **An agent of the user's account already does it:** confirm with the developer that it is theirs to reuse.
1. **Otherwise** ask for a new one — and when a system agent is close, ask for a **copy** of it (Agent Builder → the agent → Copy), which keeps its workflow.

### 2. Pick the Pattern

Each pattern has a worked example in the quick starts, <https://github.com/fabian-bouche-liferay/ai-hub-quick-start> — point the developer to the matching one:

| The task needs | Agent workflow | Called from | Quick start |
| --- | --- | --- | --- |
| Live DXP data (the user's account, an order, an object entry) | `Start → HTTP Request → LLM → End` | A chatbot | QS1 |
| Answers from CMS content, permission-aware | Search Workers (`Start → Liferay Search → End`) + Answer Builder (`Start → LLM → End`) under one chatbot | A chatbot | QS2 |
| An AI step on content as it moves through a workflow | Any agent, often a system one | A Kaleo `<ai-hub-agent>` node | QS3 |
| Answers from a public external website | `Start → LLM → End` with a Data Source assigned | A chatbot | QS4 |
| A page that drives a UI from the agent's answer (fill a form, render cards) | `Start → LLM → End` returning JSON | A single-agent chatbot, from browser code | QS5 |

### 3. Write the Build Sheet

Give the developer every value, ready to paste, in the order the UI asks for it. Choose the ERCs yourself — they are what your code will reference — and suffix them per developer in a shared AI Hub (`_FBO`), as the quick starts do. Leave nothing to guess: an unstated variable name is the most common cause of a silently empty value.

```text
AGENT — AI Hub → Agent Builder → Agents → New
  Title:                    <title>
  External Reference Code:  <AGENT_ERC>
  Description:              <text — the Supervisor's routing and invocation contract>
  Input Variables:          <comma-separated — only what the Supervisor fills: request for a chatbot agent>
  Output Variable:          <name>
  Assigned Sources:         <Data Source title, QS4 only>
  → Save as Draft BEFORE Edit Workflow (otherwise the form is lost)

WORKFLOW — Edit Workflow: Start → <nodes> → End
  <Node> node
    Input Variables:   <JSON array, every {{name}} the node uses, context keys included>
    Output Variables:  <JSON array, first entry only is used>
    User Message:      <text with {{name}} placeholders>
    Prompt:            <text>
    <HTTP Request>     Method / URL ({{aiHubCellLiferayDXPURL}}/o/…) / Request Body
    <Liferay Search>   {"contentRetriever": {"key": "liferay", "blueprintExternalReferenceCode": "<BLUEPRINT_ERC>"}}
  → Update, then Enable Agent and Publish

CHATBOT — AI Hub → Chatbots → New (chat use only)
  Title / External Reference Code: <CHATBOT_ERC> / Assigned Agents / Intro message
  → Enable, save; copy the embed snippet if the page uses the native embed
```

Add, in the same message, everything **you** will do on the DXP side so the developer knows what is already covered: the Blueprint and its ERC (created over `/o/search-experiences-rest/v1.0`), the OAuth2 scopes the HTTP Request node needs on the connection's application (that grant is a Control Panel action for the developer), the fragment or workflow that will call the agent, and the context keys the page will send.

### 4. Verify What Was Built

When the developer says it is done, read it back rather than trusting it:

- `GET /o/ai-hub/agent-definitions/by-external-reference-code/<AGENT_ERC>` returns `200`, `active: true`, and `inputVariables` / `outputVariable` match the sheet. A `404` usually means a different ERC or another account.
- For a chatbot agent, the agent definition lists **`request` only** ("Passing Data Through `context`").
- Then run the real call from DXP (Kaleo, or the page) and check the raw reply — the workflow nodes themselves are not readable over the API, so a wrong prompt or node variable shows only in behavior. Report a mismatch to the developer with the exact field to fix.

## Call an Agent From DXP

Agents are called **through DXP**, never with the AI Hub Configurations credentials: DXP mints a Cell token for a DXP user, so the agent — and any RAG or HTTP Request node it runs — acts with that user's identity.

### The Cell Token

The Cell module adds exactly one REST endpoint to DXP (2026.q3.2 bytecode, `com.liferay.ai.hub.cell.rest.impl`):

```text
POST /o/ai-hub-cell/v1.0/authorization-tokens
→ {"accessToken": "...", "scope": "...", "serviceURL": "https://ai.hub.liferay.com", "userToken": "..."}
```

The caller then talks to AI Hub at `serviceURL` with two headers:

```text
Authorization: Bearer <accessToken>
Liferay-AI-Hub-Cell-On-Behalf-Of: <userToken>
```

That is exactly what the Kaleo node below does internally, and what AI Hub's own chatbot embed does before every message.

### From a Kaleo Workflow — the `<ai-hub-agent>` Node

The simplest server-side call, and the one to reach for first (QS3; node `NodeType.AI_HUB_AGENT`, executor `AIHubAgentNodeExecutor`, gated by `LPD-62272`). On entry it mints a Cell token, `POST`s `{serviceURL}/o/ai-hub/v1.0/agent-instances` **synchronously** with `{agentDefinitionExternalReferenceCode, asynchronous: false, context}`, merges the response into the workflow context, and takes its single outgoing transition.

```xml
<ai-hub-agent>
	<name>review</name>
	<metadata>
		<![CDATA[
			{
				"xy": [
					300,
					380
				]
			}
		]]>
	</metadata>
	<labels>
		<label language-id="en_US">Fix Spelling and Grammar</label>
	</labels>
	<agent-definition-external-reference-code>L_FIX_SPELLING_AND_GRAMMAR</agent-definition-external-reference-code>
	<timeout>60000</timeout>
	<transitions>
		<transition>
			<labels>
				<label language-id="en_US">Write Content</label>
			</labels>
			<name>write-content</name>
			<target>write-content</target>
			<default>true</default>
		</transition>
	</transitions>
</ai-hub-agent>
```

**`workflowContext` is the only channel**, in both directions:

- **In:** every `Boolean`, `Number`, and `String` in `workflowContext` when the node fires becomes the agent's `context`, so each is available as an input variable of that name. A preceding action puts the value there: `workflowContext.put("text", ...)` feeds `L_FIX_SPELLING_AND_GRAMMAR`'s `text`. Nothing else declares the mapping.
- **Out:** the result comes back under the literal key **`output`**, whatever the agent's Output Variable is named. Reading `rewrittenText` silently returns `null` — the workflow completes and nothing is updated. One value only; return JSON text from the agent if you need several.

Traps (QS3):

- **Set an explicit, generous `timeout`** (ms). The default is 120000. A low value such as `1000` fails nearly every real call with `SocketTimeoutException: Read timed out` and nothing more.
- **The agent acts as the virtual instance's default user** when triggered from Kaleo — not the author, not the signed-in user. A RAG node then sees only what that user may read (an empty result looks like a Blueprint problem), and an HTTP Request node to a protected endpoint gets `403`. Grant that user exactly what the workflow needs.
- **A localized object field is read and written through `<field>_i18n`**, a `Map` keyed by language ID (`"en_US"`). Writing the bare field name through `ObjectEntryLocalServiceUtil.updateObjectEntry` succeeds and changes nothing, and the flat key on read resolves to the entry's default language.
- **The Workflow Designer is stricter than the Kaleo XSD.** Keep `<metadata>` with `xy` on every node and `<labels>` on every transition, or re-opening the definition in the Designer throws `Cannot read properties of undefined (reading '0')` and refuses to save. Strip any `<version>` element before pasting XML into the Designer.
- **Log the whole `workflowContext`** right after the node the first time you wire an agent (`_log.error(...)` so it shows without changing log levels), rather than guessing key names.

The read and write steps in QS3 are Groovy actions, which need Script Management's "Allow administrator to create and execute code" — off by default, and a portal-wide decision to surface to the user rather than enable silently (`rules/object-actions-catalog.md`). The production-shaped alternative is a `workflowAction` CET (`manage-object-logic`, `scaffold-client-extension`).

### From Browser Code

For a fragment or widget that runs an agent or sends a chat message as the signed-in visitor:

1. `POST` to `/o/ai-hub-cell/v1.0/authorization-tokens` on the **same origin** as the page, with `x-csrf-token: Liferay.authToken` (a plain `fetch`, not `Liferay.Util.fetch`, because the AI Hub calls that follow are cross-origin). DXP obtains the tokens from AI Hub with the Instance Settings connection, so the browser never holds the Client Secret. A `404` means the Cell module is absent; cache that and stop probing. **A Guest gets no token** and the conversation falls back to anonymous (QS5).
1. Call `{serviceURL}/o/ai-hub/v1.0/...` with the two headers above.

To run one agent: `POST {serviceURL}/o/ai-hub/v1.0/agent-instances` with `{"agentDefinitionExternalReferenceCode": "<erc>", "asynchronous": false, "context": {"<input>": "<value>"}}`. The `AgentInstance` DTO also carries `output`, `sseEventSinkKey` (asynchronous results, streamed by `GET /agent-instances/subscribe`), and `instructionDefinitionScope`; `PUT /agent-instances/{id}/resume` resumes a waiting instance.

> **Unverified from the browser.** The `agent-instances` request shape is confirmed from the Kaleo executor's bytecode and the AI Hub OpenAPI spec, but the response key holding the result outside Kaleo (whether it is `output`, as Kaleo sees it), and the CORS behavior for an arbitrary DXP origin, have not been observed. Capture one real response before building on it.

**Prefer the chat API to `agent-instances` from the browser.** QS5 drives a page from a chatbot with a single agent assigned (the Supervisor then always routes to it) over the chat API in "Put a Chatbot on a Page" — that path is verified end to end on 2026.q3.2.

> **A missing Instance Settings connection does not show as an error.** The token request fails, the page falls back to an anonymous conversation, and the assistant keeps working — until an agent relies on the user's identity (RAG, HTTP Request). Check that `authorization-tokens` returns `200` in DevTools (QS5).

## Build an Agent That Calls DXP

Built by the developer in Agent Builder — this section holds what to put on the build sheet ("Ask the Developer to Build It"). Variables are JSON arrays of `{"name": "...", "type": "string"}` on every node, referenced as `{{name}}`. **A variable not declared in the node's Input Variables is not substituted** — `{{name}}` is sent literally, which fails somewhere that looks unrelated.

> **Click Save as Draft before Edit Workflow.** Opening the workflow editor leaves the agent form, and unsaved title, ERC, description, variables, and sources are lost (QS4).

### HTTP Request Node — Live DXP Data

Documented in QS1:

| Field | Behavior |
| --- | --- |
| URL, Request Body | `{{name}}` substitution from declared Input Variables; a `json`-typed variable is escaped for safe insertion into a JSON body; an empty body sends no body and no `Content-Type` |
| Headers | `Authorization: Bearer <token>` always, `Content-Type: application/json` with a body, **nothing else** — no custom headers |
| Output Variables | **Only the first** is used; it receives the **raw response body as text** |
| Non-2xx | Stops the workflow at this node |
| Timeout | 10 s by default |

- Prefix DXP URLs with **`{{aiHubCellLiferayDXPURL}}`** (declare it as an input variable) instead of hardcoding the host — it is the Website URL of the connection's OAuth2 application, so the call goes back to the same DXP the token was issued for.
- **The token is a DXP-issued OAuth2 token, and its scopes come from that DXP OAuth2 application.** A first call typically returns `403`: open Control Panel → OAuth 2 Administration → that application → Scopes, and grant the narrowest scope (`Liferay.Headless.Admin.User.everything.read` for `GET /my-user-account`). Then sign out and in again so a fresh token is minted.
- `401` is the token itself; `403` is scope first, then the Service Access Policy (`rules/guest-access.md`). Decoding the JWT answers most "denied, and as whom" questions — `scope`, `sub`/`username`, `grant_type`, `iss`.
- **Only Liferay APIs accept that token.** For a third-party API, front it with an `objectEntryManager` CET (`integrate-external-data`) so it becomes one more Liferay endpoint.

### Which User an Agent Acts As

| Triggered from | Identity of its HTTP Request and RAG calls |
| --- | --- |
| A chat on a DXP page, with Cell auth | The signed-in user |
| A Kaleo `<ai-hub-agent>` node | The virtual instance's default user (QS3) |
| A token decoded as `grant_type: CLIENT_CREDENTIALS` | A fixed service account — `/my-user-account` always returns the same user (QS1) |

### Liferay Search Node — RAG Over DXP Content

The node retrieves through a Search Blueprint and respects the acting user's permissions (QS2). Its retrieval configuration:

```json
{
	"contentRetriever": {
		"blueprintExternalReferenceCode": "<blueprint-erc>",
		"key": "liferay"
	}
}
```

**The Blueprint** (DXP, `/o/search-experiences-rest/v1.0/sxp-blueprints`, also importable in Search Experiences → Blueprints) scopes retrieval. The minimal shape restricts it to one CMS Space and some of its structures:

```json
{
	"configuration": {
		"generalConfiguration": {
			"clauseContributorsExcludes": [],
			"clauseContributorsIncludes": ["*"],
			"collectionProvider": false,
			"collectionProviderType": "com.liferay.asset.kernel.model.AssetEntry",
			"scope": ["<space-erc>"],
			"searchableAssetTypes": ["com.liferay.object.model.ObjectDefinition#<code>"]
		},
		"queryConfiguration": {
			"applyIndexerClauses": true
		}
	},
	"elementInstances": [],
	"externalReferenceCode": "<blueprint-erc>",
	"schemaVersion": "1.2",
	"title_i18n": {
		"en_US": "<Title>"
	}
}
```

- `scope` lists Space **ERCs**, not names (`manage-cms`).
- `searchableAssetTypes` are the structures' suffixed class names. The `#<code>` is random per database, so resolve it with `GET /o/object-admin/v1.0/object-definitions/by-external-reference-code/<structure-erc>` on each instance; never copy one from another environment.
- Check a Blueprint with `GET /o/search-experiences-rest/v1.0/sxp-blueprints/by-external-reference-code/<erc>`.

### The Supervisor / Search Worker / Answer Builder Pattern

For a chatbot over several knowledge domains (QS2):

```text
Chatbot → native Supervisor ─┬─> Search Worker (domain A) → Blueprint A
                             ├─> Search Worker (domain B) → Blueprint B
                             └─> Answer Builder (no RAG) → final answer
```

- **Search Worker**: `Start → Liferay Search → End`, input `request`, output `response`, User Message `{{request}}`, one Blueprint per domain.
- **The request a worker receives *is* the search query** — nothing rewrites it before retrieval. So query-formulation rules (short keyword query, never the raw user question, one document ID per call, call again for each document) go in the **agent description**, which the Supervisor reads before invoking. The workflow **prompt** tells the worker how to read what was retrieved: evidence only, keep document identifiers, no final answer.
- **Answer Builder**: inputs `originalRequest` and `gatheredInformation`, output `response`, **no retriever**. Its description says to call it last with all evidence.
- The Supervisor is LangChain4j's, with no prompt of its own to author: **agent descriptions are its routing contract.** Most "it called the wrong agent" problems are description problems.
- Judge a test by the retrieval behavior (which workers, which queries, which documents), not only the wording of the final answer.

### External Website RAG — No DXP

QS4, **still being validated**: an AI Hub **Data Source** (Agent Builder → Data Sources: External Website URL plus a description written like an agent description), assigned to an agent whose workflow is `Start → LLM → End`. Run **Sync Now** after every site change — a stale index reads as a hallucination, and AI Hub shows no last-sync date. It indexes **public content only** and ignores the user's identity, so anything permission-dependent belongs in DXP RAG. Both can sit under one Supervisor.

## Put a Chatbot on a Page

1. **Native embed first.** AI Hub → Chatbots → the chatbot → copy the HTML snippet at the bottom → paste it into a plain fragment's HTML (`scaffold-fragment`). No CET, no build. It performs Cell auth before every message, so RAG runs as the signed-in user. The snippet is self-contained and also works on a non-Liferay site.
1. **A custom widget** only when the native embed cannot do the job (per-placement configuration, styling isolation). Its API, on `serviceURL`:

| Purpose | Call |
| --- | --- |
| Chatbot settings (title, intro, suggested questions) | `GET /o/ai-hub/v1.0/chatbots/by-external-reference-code/{erc}` |
| Open the stream | `GET /o/ai-hub/v1.0/chats/subscribe` (SSE). The first event, `Subscribe`, carries the `eventSourceReference` |
| Send a message | `POST /o/ai-hub/v1.0/chats/by-external-reference-code/{eventSourceReference}/messages` with `{chatbotExternalReferenceCode, context, instructionDefinitionScope: "clickToChat", text}` |
| Feedback | `POST /o/ai-hub/v1.0/reports` |

Widget traps:

- **Send the Cell headers on the message `POST`, always.** Without them the chat is anonymous, retrieval runs as Guest, and a Blueprint over non-public content finds nothing — the same chatbot answers well through the native embed and "never finds anything" in the widget. The native browser `EventSource` cannot set headers; the `eventsource` npm package can, or keep native `EventSource` for the subscribe and authenticate the `POST`, where retrieval happens.
- **Only `Chat Message Sent` and `Agent Invocation Failed` end a turn.** The stream also emits one event per workflow node (named after the node, or its UUID) with intermediate text, plus `: heartbeat` comments. Treating every event as the reply fires duplicate side effects.
- **Track a turn only on its terminal event** (`Chat Message Sent` or `Agent Invocation Failed`); how to track is in `manage-analytics`.
- **Pass page data through `context`, not in `text`** — see "Passing Data Through `context`" below.
- **The Supervisor may rephrase an agent's answer.** When the page parses the reply (JSON), state in the agent description that the output goes to a program and must be returned verbatim, then check the raw `Chat Message Sent` payload in DevTools before blaming the prompt.
- **Keep `context` compact anyway.** The agent's own LLM still reads whatever its User Message references, every turn: state formats once in the prompt and send only what the agent uses.
- **`htmlAttributes` of a `customElement` CET did not reach the rendered tag** when placed from the Page Editor widget palette (2026.q3.2), so a widget reading its configuration from attributes finds none and silently never mounts. Configure it through a fragment wrapping a `jsImportMapsEntry` element instead (`scaffold-client-extension`).

### Passing Data Through `context`

From the AI Hub source (`liferay-aihub-workspace`), confirmed live on 2026-10-02:

1. `POST …/chats/by-external-reference-code/{ref}/messages` starts the `L_SUPERVISOR` agent with every `context` key plus `request` (the message text) as input (`MessageResourceImpl`).
1. The Supervisor — an LLM — is called with **`request` only** (`SupervisorAgentImpl`). It never sees the `context` keys, so it cannot forward them or route on them.
1. When it calls a sub-agent, that agent's workflow context is built in **two passes** (`InternalAgentImpl`): first each name in the **agent definition's** Input Variables is set to the value the Supervisor supplied, or `""` if it supplied none; then every key of the original input (`context` keys and `request`) is added **unless already set**.
1. Each node reads its own Input Variables from that workflow context; a missing key becomes `""` (`VariablesUtil`).

So `context` keys reach every sub-agent of the chatbot directly, without passing through the Supervisor's prompt or its chat memory — which accumulates and is summarized every turn. Appending the same data to `text` works, but every turn gets slower and the memory grows with each copy: about 40 s per turn with 3.5k characters appended, 15–30 s with 1.9k, 12–17 s with nothing appended (QS5). The agent's own LLM call costs the same either way; the saving is on the Supervisor's side.

Rules:

- **List only `request` in the agent definition's Input Variables** (agent → Variables, comma-separated). Those are the arguments the Supervisor fills in; a `context` key also listed there is overwritten by the Supervisor's empty value and reaches the nodes as `""` — no error, no literal `{{name}}`, just empty.
- **Declare the `context` keys on the nodes**: in the LLM node's Input Variables (JSON array), referenced as `{{name}}` in its User Message.
- **Send strings.** Lists are converted to JSON and other values go through a plain string conversion, so `JSON.stringify` objects yourself.
- **Reserved names cannot be overridden from `context`:** `agentDefinitionExternalReferenceCode`, `agentInstancePermit`, `instructionDefinitionScope`, `memoryId`, `oAuth2ApplicationId`, `outBoundEventName`, `sseEventSinkKey`, `userToken`.
- **`request` comes from the Supervisor and may be reworded.** When the agent needs the exact text, its description asks the Supervisor to pass the customer's message unchanged.
- **With several agents, routing uses the message text only** — the Supervisor cannot pick an agent from `context`.

### A Page Driven by a JSON Contract

QS5 (2026.q3.2) generalizes the custom widget: browser code sends the page's own context and acts on a **structured** answer instead of displaying chat text. Its worked example fills a Form Container from a conversation, and the source is reusable as is: <https://github.com/fabian-bouche-liferay/ai-hub-claim-chat-assistant>.

- **Ship it with no build:** a `jsImportMapsEntry` client extension created in Applications → Client Extensions (bare specifier → script URL), and a fragment whose JS runs `import('<bare-specifier>')` outside edit mode. Pin a versioned URL; host it yourself, or deploy it from the workspace, for production.
- **Read the form from the DOM, not from the prompt.** Every form field fragment renders `data-field-name` (`ObjectField_<name>`), `data-field-type`, `aria-labelledby`, `aria-describedby`, `required`, and `[role="option"][data-option-value]`. The same code then works for any Form Container (`manage-form-containers`), and labels and help texts become the agent's field documentation.
- **Send the whole form state every turn**, so direct edits are seen and nothing is asked twice.
- **The agent answers one JSON object** (`message`, `fieldUpdates`, `questions`, `suggestions`, `complete`), and **the browser validates every value**: unknown field names ignored, picklist values matched to an option or rejected, numbers and dates normalized, form revealed only when `complete` is true **and** no required field is empty. A non-JSON reply is shown as text and fills nothing.
- **The agent never writes.** Submission stays with the native Form Container, under the user's own permissions, validations, and workflow. Treat what was submitted as user input: the visitor can steer a free-text field through the prompt.
- **More agents behind the Supervisor** (a profile or policy lookup over HTTP Request, a terms Search Worker) can pre-fill from what Liferay knows, with the signed-in user's permissions — test with two users, and keep them off public pages, since a Guest has no account and a non-2xx stops the worker.

## Success Signal

- **Connection:** an agent whose HTTP Request node calls `{{aiHubCellLiferayDXPURL}}/o/headless-admin-user/v1.0/my-user-account` returns that account in its test run, and `POST /o/ai-hub-cell/v1.0/authorization-tokens` as a signed-in DXP user returns `200` with an `accessToken`.
- **Kaleo:** the workflow instance reaches its terminal state in Control Panel → Workflow → Submissions, and the logged `workflowContext` holds a non-empty `output`.
- **RAG:** the same question asked by two users with different permissions returns answers grounded in what each may read; a question about content nobody can read returns "not found", not an invented answer.
- **Inventory:** the agent's ERC and its input and output variable names were read from the API, not guessed.

## References

- AI Hub quick starts (worked examples, prompts, sample corpora): <https://github.com/fabian-bouche-liferay/ai-hub-quick-start>
- AI Hub ↔ DXP integration: <https://learn.liferay.com/w/ai-hub/integrating-ai-hub-with-liferay-dxp>
- `rules/headless-apis.md` — the AI Hub and Cell base URIs
- `rules/feature-flags-catalog.md` — `LPD-62272`
- `rules/guest-access.md` — what an anonymous chat can retrieve
- `manage-cms` — Spaces and structures a Blueprint scopes to
- `manage-object-logic` — Kaleo workflows and `workflowAction` CETs
- LangChain4j agents and Supervisor: <https://github.com/langchain4j/langchain4j/blob/main/docs/docs/tutorials/agents.md>
