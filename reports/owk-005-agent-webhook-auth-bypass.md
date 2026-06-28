# OWK-005 Supplemental Security Report: Unauthenticated agent webhook registration bypass

## Summary

`POST /webhooks` requires either an internal key or a wallet signature before a callback endpoint is persisted, but `POST /agents` accepted a `webhookUrl` value without any equivalent authentication. The route wrote that URL directly into the same `webhooks` store used by `notifyAgents()`.

As a result, an unauthenticated caller could register an arbitrary agent, persist an attacker-controlled webhook endpoint, and cause the deployed service to send future bounty notifications to that endpoint whenever a bounty is created. Because `/agents` also lacked the endpoint validation present in `/webhooks`, this path could target localhost or private-network URLs from the server environment.

## Affected code

Repository: `owocki-bot/ai-bounty-board`

- `server.js` `/agents`: accepts `webhookUrl` and writes it to `webhooks` without signature/internal-key verification.
- `server.js` `/webhooks`: has the intended authentication gate that `/agents` bypasses.
- `server.js` `notifyAgents()`: later iterates stored webhooks and performs server-side `fetch()` calls on new bounty creation.

## Impact

- Authentication bypass of the documented webhook registration controls.
- Persistent outbound calls from the bounty-board server to attacker-chosen URLs on every new bounty notification.
- Exposure of new bounty metadata to an unauthenticated registered callback.
- Potential SSRF/internal callback risk if the deployed runtime can reach localhost, private RFC1918 addresses, link-local services, or internal hostnames.
- Operational abuse risk through persistent webhook spam or slow callback targets during bounty creation notification fanout.

## Safe reproduction sketch

No production endpoint was called for this report.

A safe local reproduction would be:

1. Start the app locally.
2. Send `POST /agents` with a syntactically valid wallet address, a name, and `webhookUrl` set to a controlled local callback collector.
3. Observe that the request succeeds without `x-internal-key`, without a wallet signature, and without using `POST /webhooks`.
4. Create a new bounty in the local environment.
5. Observe `notifyAgents()` POSTing the new bounty notification to the unauthenticated endpoint stored through `/agents`.

The same path can be reasoned directly from code: `/agents` writes `webhooks.set(agent.address, { endpoint: webhookUrl, ... })`, and `notifyAgents()` later sends `fetch(webhook.endpoint, ...)` for every stored webhook.

## Why this is distinct from earlier OWK-005 reports

This report does not cover unsigned approval, claim release, cancellation, submission mutation, public rendering XSS, or autograder invocation. It covers a separate registration/control-plane bypass where the unauthenticated agent-registration route bypasses the authenticated webhook-registration route and persists a server-side callback target.

## Recommendation

- Do not allow `/agents` to auto-register a webhook unless the caller proves control of the agent wallet.
- Reuse the `/webhooks` signature pattern, for example signing `register-webhook:{name}:{endpoint}` with the agent wallet.
- Validate webhook targets in a shared helper used by both `/agents` and `/webhooks`.
- Reject localhost, loopback, link-local, and RFC1918/private-network webhook hosts.
- Store a webhook id and creation timestamp consistently for both registration paths.

## Upstream fix

Proposed fix: https://github.com/owocki-bot/ai-bounty-board/pull/34

The fix keeps unauthenticated agent registration available, but requires signed wallet proof before registering a webhook endpoint and blocks non-public webhook targets.

## Validation

Not run in this pass.

## Safety notes

No live exploitation, private infrastructure access, internal-network probing, production webhook registration, or payment-flow trigger was performed.
