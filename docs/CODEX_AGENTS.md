# Codex agent setup

The main conversation is the orchestrator. Specialist agents are started only
when they help complete the request. This setup avoids a permanently running team
and does not require additional provider API keys.

| Role | Model / reasoning | Use |
| --- | --- | --- |
| Orchestrator | GPT-6.1-Sol / low | Small edits, delegation, integration, release commands |
| Frontend | GPT-6.1-Sol / medium | Angular pages, responsive styles, interactions |
| CMS | GPT-6-Luna / medium | Simple Sanity fields and editor changes |
| Backend | GPT-6.1-Sol / high | Supabase, SQL, booking, auth, Stripe |
| QA | GPT-6-Luna / medium | Focused test work and straightforward failure diagnosis |
| Reviewer | GPT-6.1-Sol / medium | Substantial diffs and regression checks |
| Deep debug | GPT-6-Astra / high | Difficult investigations and architecture |

Model availability depends on the account and runtime. If a requested model is
unavailable, the orchestrator should report the limitation and use an available
coding model. These choices follow OpenAI's model guidance; credit savings have
not been measured on this project.

## Codex CLI

1. Open this checkout in an up-to-date Codex CLI using your own ChatGPT login.
2. Trust this repository when prompted so project configuration can load.
3. Start a new session from the repository root with `codex`.

`.codex/config.toml` selects the lead model, caps simultaneous spawned workers at
two, and registers the role files in `.codex/agents/`. V1 nesting is capped at
one; V2 ignores that setting, so AGENTS.md and each role also prohibit nested
delegation. Account or managed settings can override project settings.

No web server, service, or background orchestrator needs to be installed.
Agent role files configure model behavior; they do not start agents by themselves.

## Codex web, including your mom's account

1. Commit and push AGENTS.md, `.codex/`, and this guide to the GitHub branch
   Codex will use (normally `master` for this repository).
2. On your mom's own ChatGPT account, connect the GitHub account that accepted
   collaborator access and make driverext/awellyoga available to Codex.
3. Select the repository and updated branch, then start a new task whose checkout
   includes these files. Existing tasks keep their own checkouts; a GitHub push
   does not automatically update an already-running task.

Codex reads AGENTS.md for the file map and coordination rules.
You can simply ask: "Update the homepage layout using the repository's agent
workflow." Small requests should be handled directly by the lead.

Web sessions may not load CLI project settings or expose custom role/model
selection. AGENTS.md provides routing guidance for available delegation tools,
but it cannot enable missing tools or guarantee a particular model. Confirm
actual agent/model activity in the session before relying on automatic routing.
When delegation is unavailable, the main agent follows the same scoped workflow.

## Examples and credit controls

- Change a headline: lead only.
- Redesign a page: frontend, followed by reviewer for substantial behavior changes.
- Add a simple Studio field: CMS; build Studio only.
- Change reservation logic: backend, frontend if needed, then reviewer.
- Investigate a difficult payment defect: backend; use deep_debug when justified.

Use at most two workers simultaneously, give each separate file ownership and
a short brief, reuse findings, and run final relevant checks once. The lead can
execute ordinary build/test/release commands without a dedicated agent.
Do not activate the full team for routine edits. AGENTS.md defines validation
and production-service boundaries.

## Sources

Configuration was checked against the installed Codex CLI and OpenAI sources:

- [Current model catalog](https://github.com/openai/codex/blob/main/codex-rs/models-manager/models.json)
- [Configuration schema](https://github.com/openai/codex/blob/main/codex-rs/core/config.schema.json)
- [Agent role loading](https://github.com/openai/codex/blob/main/codex-rs/agent-roles/src/loader.rs)
- [Role-specific model overrides](https://github.com/openai/codex/blob/main/codex-rs/core/src/agent/role.rs)
