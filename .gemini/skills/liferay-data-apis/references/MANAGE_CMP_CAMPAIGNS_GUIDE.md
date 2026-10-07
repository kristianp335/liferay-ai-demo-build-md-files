---

description: Plan and track content production work in Liferay's separately licensed CMP (Content Marketing Platform) product — Projects (campaigns) and Tasks, with assignees, due dates, and state. Use when the user asks for a campaign, a content refresh project, or task tracking around CMS content. The content itself, and permissions, belong to other skills.
name: manage-cmp-campaigns

---

# Manage CMP Campaigns

CMP is a separately licensed Liferay product for planning editorial work on top of CMS. A **Project** (`CMPProject`) is a campaign; a **Task** (`CMPTask`) is one unit of work inside it, optionally assigned to a user, with a due date and a state.

Everything below was verified live on 2026.q3.2 (2026-09-08) over REST, and cross-checked with the reporting endpoints. The Control Panel UI path was not captured.

## When to Invoke

- "Create a campaign", "plan the content refresh", "track who writes what by when"
- "Assign a task to …", "move this task to In Progress"
- Before building any custom object to track editorial work — check whether CMP already covers it

## Modeling Decision

| Need | Use |
| --- | --- |
| Plan who produces or refreshes which piece of content, by when | CMP Project + Tasks (this skill) |
| The content itself (structures, entries, Spaces) | `manage-cms` |
| A transactional record unrelated to content production | A plain object (`manage-objects`) |

A Task can name work that does not exist yet (a white paper still to be written). Attaching a real content item goes through `CMPTaskLink` / `CMPProjectLink`, whose write shape is **unverified** — discover it live before relying on it (see "Unverified" below).

## Prerequisites — a License, Not a Feature Flag

CMP is gated by a **DXP module license**, not a `feature.flag.*`. Do not route it to `feature-flags`. Without a valid license, the day's log shows, for every CMP bundle:

```text
ERROR [...][AppResolverHook:115] Unable to resolve com.liferay.headless.cmp.impl: This application does not have a valid license
```

The bundles are `com.liferay.headless.cmp.api` / `.client` / `.impl`, `com.liferay.site.cmp.site.initializer`, and `com.liferay.site.initializer.cmp`. When they end `STARTED`, CMP is available; check with `GET /o/headless-cmp/v1.0/openapi.json` → `200`. Otherwise the fix is Control Panel → License Manager.

## Module Map

| Purpose | Surface |
| --- | --- |
| Project, Task, and Link CRUD | Object entry REST at **custom** `restContextPath`s (below), not `/o/c/<plural>` |
| Read-only reporting and lookups | `/o/headless-cmp/v1.0/...` (own `openapi.json`) |
| `state` picklist | `headless-admin-list-type`, list type definition ERC `L_CMP_STATES` |

| Object `name` | ERC | `scope` | `restContextPath` |
| --- | --- | --- | --- |
| `CMPProject` | `L_CMP_PROJECT` | `depot` | `/o/cmp/projects` |
| `CMPTask` | `L_CMP_TASK` | `depot` | `/o/cmp/tasks` |
| `CMPProjectLink` | `L_CMP_PROJECT_LINK` | `depot` | `/o/cmp/project-links` |
| `CMPTaskLink` | `L_CMP_TASK_LINK` | `depot` | `/o/cmp/task-links` |

Key fields:

- **`CMPProject`:** `title` (required, drives `friendlyUrlPath`), `description`, `dueDate` (`"YYYY-MM-DD"` on write, read back as `…T00:00:00.000Z`), `state` (defaults to `notStarted`), `completionRate`, and two User relationships written with a plain numeric user id: `r_userToCMPProjectManager_userId` and `r_userToCMPProjectSponsor_userId`.
- **`CMPTask`:** `title` (required), `description`, `dueDate`, `state`, the required parent FK `r_cmpProjectToCMPTasks_c_cmpProjectId` (the Project's numeric entry `id`), and `assignTo` (business type `Assignee`, see below).

## Workflow

### 1. Create the Project — Unscoped, It Creates Its Own Depot

Unlike a CMS content structure, whose Space must exist first, **creating a `CMPProject` provisions a brand new asset library just for it**. So the create call takes no scope, and there is no field to target an existing Space:

```bash
curl \
	--data '{
		"description": "<Description>",
		"dueDate": "2026-10-31",
		"r_userToCMPProjectManager_userId": <user-id>,
		"title": "<Campaign Title>"
	}' \
	--header "Content-Type: application/json" \
	--request POST \
	--silent \
	--url "http://localhost:${PORT}/o/cmp/projects/" \
	--user "test@liferay.com:test"
```

Keep two values from the response:

- **`id`** — the Project's entry id, which Tasks put in their FK;
- **`scopeId`** — the new depot, which Tasks are created under.

They are different numbers and easy to swap.

### 2. Create the Tasks — Scoped to the Project's Depot

A bare `POST /o/cmp/tasks/` returns `409 "Conflict with postObjectEntry"`. Create each Task under the Project's `scopeId`:

```bash
curl \
	--data '{
		"assignTo": {"externalReferenceCode": "<user-erc>", "type": "User"},
		"description": "<Description>",
		"dueDate": "2026-10-15",
		"r_cmpProjectToCMPTasks_c_cmpProjectId": <project-id>,
		"title": "<Task Title>"
	}' \
	--header "Content-Type: application/json" \
	--request POST \
	--silent \
	--url "http://localhost:${PORT}/o/cmp/tasks/scopes/<project-scope-id>" \
	--user "test@liferay.com:test"
```

### 3. Assign — `assignTo` Takes a User ERC, Never an Id

`assignTo` is stored as a `Long`, but no numeric shape persists. Resolve the user's ERC first:

```bash
curl \
	--silent \
	--url "http://localhost:${PORT}/o/headless-admin-user/v1.0/user-accounts/<user-id>?fields=externalReferenceCode" \
	--user "test@liferay.com:test"
```

Then send `{"assignTo": {"externalReferenceCode": "<user-erc>", "type": "User"}}`. The response shows the resolved assignee (`externalReferenceCode`, `name`, `type`), and it survives a follow-up GET.

These shapes all return `200` and read back as `"assignTo": {}`:

- `<user-id>` (a bare integer)
- `{"id": …}`
- `{"userId": …}`
- `{"classPK": …}`
- `{"classPK": …, "className": "com.liferay.portal.kernel.model.User"}`

`{"id": …, "type": "User"}` returns `400`. Do not retry any of them.

`GET /o/headless-cmp/v1.0/task-assignees?search=&type=` lists candidate assignees for a picker. Its `id` and `type` are for display, not a write shape.

### 4. Move a Task Between States

```bash
curl \
	--data '{"state": "inProgress"}' \
	--header "Content-Type: application/json" \
	--request PATCH \
	--silent \
	--url "http://localhost:${PORT}/o/cmp/tasks/<task-id>" \
	--user "test@liferay.com:test"
```

`L_CMP_STATES` has exactly four keys: `notStarted`, `inProgress`, `blocked`, `done`. There is no "To Do" or "In Review". Map the request's vocabulary onto these four rather than adding picklist entries the UI may not support.

## Reporting Endpoints (`/o/headless-cmp/v1.0`)

| Endpoint | Verified behavior |
| --- | --- |
| `GET /projects/{projectId}/task-statistics` | `{totalCount, inProgressCount, blockedCount, overdueCount}`; `totalCount` reflected new Tasks immediately, with no indexing delay |
| `GET /projects/{projectId}/content-coverage` | `{assetCount, contentCoverageEntries, funnelStages, personas}`; all empty on a Project with no links, and the shape with links is unverified |
| `GET /task-statistics`, `GET /projects/{projectId}/user-accounts`, `GET /task-assignees` | Reachable; not exercised beyond the schema |

## Unverified

- **`CMPTaskLink` / `CMPProjectLink` write shape.** Their fields suggest the usual polymorphic reference (`className` + `classExternalReferenceCode` + `groupExternalReferenceCode`). Discover it live: `POST {}` and read the required-field errors.
- **`completionRate`** — it may roll up from Task states, but that is not confirmed.
- **The Control Panel label and path** ("Campaigns" vs "Projects", inside the CMS product).

## Success Signal

Every planned Task exists under the right Project, with the intended assignee (read back, not `{}`), due date, and state, and `GET /o/headless-cmp/v1.0/projects/{projectId}/task-statistics` returns a `totalCount` equal to the number of Tasks created.
