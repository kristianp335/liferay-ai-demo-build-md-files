---
name: glowroot-performance
description: Diagnose Liferay performance, JVM, and database-side issues with Glowroot APM through its MCP server — slow pages, slow traces, errors, N+1 SQL, connection-pool saturation, cache misses, thread contention, background tasks, FreeMarker rendering. Use when the user asks why something is slow, wants a performance or DB investigation, asks to read Glowroot data, profile a transaction, add a Glowroot gauge or instrumentation, or validate a fix with measurements.
---

# Glowroot Performance Investigation

Measure, then conclude. Every claim in a finding must cite a Glowroot number
(trace id, transaction name, count, duration, sample count and %, gauge
value) — never a guess from code reading alone. Code reading forms a
hypothesis; Glowroot confirms or kills it.

Reference cards (load only what the step needs):

- `references/mcp-tools.md` — the 36 MCP tools by purpose, argument
  conventions, known defects and their workarounds, backend API fallback.
- `references/gauges-and-instrumentation.md` — **Liferay gauge presets**
  (ready `create_gauge` calls), instrumentation recipes, the cleanup ledger.
- `references/liferay-performance-patterns.md` — what "normal" looks like in
  Liferay and how each symptom maps to a root cause.
- `scripts/profile_hotspots.py` — re-summarize a `raw: true` profile when the
  server-side summary is not readable (known defect, see mcp-tools.md).

## 0. Connect (once per session)

Glowroot's embedded UI and MCP server run inside the Liferay JVM. Locally:
`http://localhost:4000/o/glowroot/mcp` (context path from `web.contextPath`
in `<glowroot dir>/admin.json`).

1. Prefer the MCP tools (`mcp__glowroot__*` when registered in `.mcp.json`);
   otherwise POST JSON-RPC to the endpoint with curl (stateless). Read
   `result.structuredContent`.
2. Embedded mode: one agent, omit `agentId`.
3. Times are epoch ms; durations are in fields suffixed `Nanos`/`Millis`.
   Every response carries a `glowrootUrl` — give it to the user as the UI
   link for what you looked at.
4. If nothing answers on port 4000, Glowroot is not attached
   (`-javaagent:<path>/glowroot.jar` in `bundles/tomcat/bin/setenv.*`). Never
   restart Tomcat yourself — tell the user what to change and ask.
5. The MCP server only exists in the Liferay fork of Glowroot — the stock
   Glowroot agent bundled with DXP has none (`/o/glowroot/mcp` or `/mcp`
   absent). Latest release (agent dist zip):
   https://github.com/fabian-bouche-liferay/glowroot/releases — unzip it next
   to the bundle and point `-javaagent` at its `glowroot.jar`. When a tool
   listed in `references/mcp-tools.md` is missing or behaves differently,
   check `serverInfo.version` from `initialize` against that release before
   assuming a defect.

## 1. Frame the question

Pin down the **symptom**, the **time window** (default is the last 60 min —
pass `from`/`to` explicitly when the user tested earlier, and widen it if a
summary comes back empty), the **transaction type** (`list_transaction_types`:
`Web`, `Background`, `Startup`, or custom ones once instrumented), and the
**load conditions**.

## 2. Trust check — is the data interpretable?

**Before reading any duration.** When the CPU is saturated the run-queue
becomes a funnel: threads wait to be scheduled, and that wait lands inside
whatever timer was open — a JDBC query, a lock, a template. Under saturation,
durations and even "slowest SQL" rankings are unreliable.

1. `get_gauge_values` for `java.lang:type=OperatingSystem:ProcessCpuLoad`,
   `:SystemCpuLoad` (0–1 ratios), GC `CollectionTime`, heap used — over the
   window, or `aroundTraceId` for one slow trace.
2. Classify:
   - **Low CPU (≈ ≤ 10–20%)** — preferred. Remaining slowness is not a
     resource shortage: algorithmic, I/O, locking, remote. Timings are
     trustworthy.
   - **Moderate** — compare with a low-CPU window before concluding.
   - **Saturated (> ~70–80%) or heavy GC** — per-trace durations are suspect.
     Investigate *what consumes the CPU* (aggregated profile, CPU time in
     summaries), and recommend re-running at low CPU to locate time loss
     without the resource effect.
3. Pool and thread signals need gauges that are **not configured by
   default**. `list_gauge_configs`; if Hikari / HTTP threads / sessions are
   missing, propose the presets (step 6). Meanwhile `read_mbean_values` gives a
   point-in-time reading.
4. Sampling: `get_transaction_config` → `profilingIntervalMillis` (default
   1000). A 300 ms request rarely gets a sample; aggregated profiles over many
   calls are meaningful, a 5-sample trace profile is anecdotal. Always report
   the sample count with a percentage.

## 3. Rank — where does the time go?

Total cost = **count × average**.

1. `get_transaction_summaries` — CPU time ≈ total = CPU-bound; CPU ≪ total =
   waiting (I/O, locks, pool).
2. `get_transaction_percentiles` (`valueMillis`) — wide p50→p99 gap =
   intermittent cause; high p50 = structural.
3. `list_traces` (slow), `get_error_summary` then `list_traces` with
   `errorsOnly`.
4. Exclude noise: first request after startup (class loading, lazy service
   trackers — see the patterns card), `/combo/`, static documents, `HEAD /`
   probes. **Tell "cold first request" from "every request"** by re-requesting
   the page before calling something an N+1.

## 4. Profile first — find candidate blocking points

1. `get_transaction_profile` (aggregate over the window, optionally `include`
   a package) or `get_trace_profile` (one slow trace; `auxiliary: true` for
   async threads).
2. Read `hotPath` (branch points down to the leaves), `topFramesSelf`, and
   `leafThreadStates`:
   - `RUNNABLE` = CPU work; `WAITING`/`TIMED_WAITING` = I/O, futures, pool
     waits (socket read → DB/HTTP, `HikariPool.getConnection` → starvation);
     `BLOCKED` = `synchronized` contention.
   - Ignore `topFramesInclusive` while it is filled with the Tomcat/filter
     trunk (known defect); if the summary is unreadable, re-run with
     `raw: true` and pipe it through `scripts/profile_hotspots.py`.
3. Cross-check `get_trace` thread stats (CPU / blocked / waited / allocated).
4. I/O for the trace or transaction:
   - `get_trace_queries` — counts are authoritative; distinct queries sharing
     the same `executionCount` = N+1 candidate.
   - `get_trace_entries` with `kind`, `minDurationMillis`, `messageContains`,
     `offset`/`limit` for the timeline. **Check `get_trace` →
     `entryLimitExceeded`**: traces are capped at 2000 entries, and
     `aggregate: true` then undercounts silently.
   - `get_transaction_queries` (omit `transactionName` for the whole type),
     `get_transaction_service_calls`.
5. Write each candidate as a falsifiable hypothesis: "*X% of N samples of
   `/web/site/page` sit under `FooService.bar` waiting on JDBC; a timer on
   `bar` should account for ~M ms per request.*"

## 5. Instrument — answer the open question precisely

Pick the lightest capture kind that answers the question:

| Need | `captureKind` | Where it shows |
| --- | --- | --- |
| Total time / call count of method M inside existing transactions | `timer` | Breakdown of every transaction and trace (cheapest) |
| Which individual calls (with arguments) were slow, in order | `trace-entry` (+ `traceEntryMessageTemplate`, `traceEntryStackThresholdMillis` to find callers) | Trace entries |
| Work that is not an HTTP request (background task, scheduler, listener, reindex), or a sub-operation to rank on its own | `transaction` (+ `transactionType`, `transactionNameTemplate`, `alreadyInTransactionBehavior`) | Its own transaction type |

Procedure:

1. Target: `search_classes` → `search_methods` → `get_method_signatures`;
   restrict `methodParameterTypes` when overloads exist.
2. `create_instrumentation` with `dryRun: true`. Read `warnings` (class or
   method not found) and `methodSignatures`. The dry run does **not** yet
   check template placeholders against the arity, nor how many classes an
   interface or `*` pattern hits: avoid wide interfaces (`ModelListener`,
   `BaseModelListener`) and wildcard method names unless the user accepts the
   scope.
3. `create_instrumentation` for real → **record the returned `version` in the
   session ledger** (gauges-and-instrumentation.md). The config is saved but
   not active (`jvmOutOfSync: true`).
4. `apply_instrumentation_changes` re-weaves loaded classes and can freeze the
   JVM; a bad config can crash it. **Ask the user first**, stating the exact
   instrumentation(s), the expected pause, and the rollback. Never on a shared
   or production JVM without their explicit go.
5. Re-run the scenario, re-read the same metric, compare with the hypothesis.
6. Clean up: `delete_instrumentation` with the ledger's versions, then
   `apply_instrumentation_changes` (same confirmation). There is no tag field —
   the ledger is the only record of what this session added. If the user wants
   to keep an instrumentation, say so in the report.

Ready-made configs (background tasks, reindex, upgrade, batch engine) and the
FreeMarker plugin: `references/gauges-and-instrumentation.md`.

## 6. Gauges — resources over time

Gauges are mandatory context for "it was slow at time T". Default set: CPU,
heap, memory pools, GC only. Apply the **Liferay presets** from
`references/gauges-and-instrumentation.md` (Hikari pool, HTTP threads, Tomcat
sessions, targeted Ehcache caches) — a config write with no re-weave, but
confirm with the user once, and record each returned `version` in the ledger.

- Discover: `search_mbeans` → `get_mbean_attributes` (it also says whether a
  gauge exists) → `read_mbean_values` for an instant reading.
- `create_gauge` is idempotent and merges new attributes into an existing
  gauge. Mark ever-increasing totals in `counterAttributes` (rate per second).
- Avoid property-list patterns like `org.ehcache:type=CacheStatistics,*`
  (one series per cache, and the server logs warnings on that form); target
  named caches.
- Values appear after the next collections (every 5 s);
  `get_gauge_values` with `aroundTraceId` aligns them on a slow trace.

Reading: `ThreadsAwaitingConnection > 0` or `Active == Total` at slow
moments → pool starvation (long transactions, leak, undersizing);
`currentThreadsBusy` near `maxThreads` → request queueing (users see more
latency than the JVM measures); cache evictions with stable entries → cache too
small; sudden `HeapEntries` drops → cache clears.

## 7. Report

1. **Conditions** — window, type, CPU regime, sample counts; say plainly when
   data is unreliable.
2. **Findings**, most costly first, each with its evidence and the likely root
   cause from the patterns card, plus the `glowrootUrl`.
3. **Confirmed vs. hypothesis** — what an instrumentation or re-measure
   proved, what remains a candidate and which measurement would settle it.
4. **Next step** — fix to try or measurement to take, and how to re-verify.
5. **Session changes** — the ledger: what was added, what was removed, what
   remains (gauges kept on purpose, instrumentations left active).

## Guardrails

- Read-only by default. Writes (`create_gauge`, `delete_gauge`,
  `create_instrumentation`, `delete_instrumentation`,
  `set_slow_trace_threshold`) are within the user's request when they asked
  for that kind of change; `apply_instrumentation_changes` and
  `get_heap_histogram` pause the JVM — always ask first. Heap dumps and force
  GC are not exposed; don't reach for them through the backend API without
  explicit consent (a heap dump can contain personal data).
- Lowering the slow-trace threshold (e.g. a `0` override on one transaction)
  captures more traces — scope it to one transaction and remove the override
  afterwards (ledger).
- Do not restart Tomcat; ask the user.
- Do not tune pool sizes, caches, or JVM flags from a single trace or a
  saturated window.
- The UI has no auth here (anonymous admin) and binds to 127.0.0.1; never
  suggest exposing it without authentication.
