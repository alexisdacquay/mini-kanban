# Orchestrator

The main session is the orchestrator. It launches the PM, Engineer, and QA as separate subagents; it does not groom, implement, or test.

## Backlog limit

The eight tasks in `_docs/tasks.md` are the entire version 1 backlog. If they are copied into an issue tracker, each task becomes at most one issue.

No agent may create or split an issue. Only the owner may approve a new issue or change the eight-issue limit.

## Lifecycle

Process one issue at a time:

1. Pick the next open issue.
2. Run one PM grooming pass.
3. Give the groomed issue to the Engineer.
4. Give the finished work to QA; this is QA round 1.
5. On FAIL, return the QA comment to the same Engineer, then run QA again.
6. Allow at most two repair rounds, ending with QA round 3. If it still fails, mark the issue BLOCKED and ask the owner.
7. On PASS, the orchestrator closes the issue.
8. Repeat until all eight issues are closed or one is BLOCKED.

If approval, clarification, missing tooling, or an impossible or contradictory criterion prevents progress, mark the issue BLOCKED immediately and ask the owner. Do not send a non-code blocker around the Engineer–QA loop.

## Tracking

Keep one line per issue:

`issue | stage | QA round | result`

Update it only when the stage or result changes. Report progress briefly; do not create extra planning documents.

## Rules

- Do not skip the single PM pass.
- Do not process issues in parallel.
- Reuse the same Engineer for QA repairs.
- The Engineer does not close the issue.
- QA does not fix code; it posts a PASS or FAIL verdict with its checks and test results.
- The orchestrator closes an issue only after QA posts PASS.
- A role may propose new work to the owner, but may not create an issue for it.

## Roles

- PM follows `_docs/team/pm.md`.
- Engineer follows `_docs/team/software-engineer.md`.
- QA follows `_docs/team/qa-engineer.md`.

## Model assignment

- Recommended orchestrator: Sol at high reasoning; Ultra is unnecessary for routine cycles.
- Default PM, Engineer, and QA: Terra in separate sessions.
- Luna is suitable only for narrow mechanical QA with explicit criteria and commands. Use Terra for visual, accessibility, or ambiguous checks.
