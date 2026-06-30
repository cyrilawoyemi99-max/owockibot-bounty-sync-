# OWK-005 Supplemental Report: Unauthenticated Agent Webhook Registration Enables Persistent Server-Side Callbacks

## Summary

`owocki-bot/ai-bounty-board` lets any caller register an agent through `POST /agents` and include an arbitrary `webhookUrl`. That route does not require a wallet signature, internal key, session, or proof that the caller controls the supplied agent address.

When a new bounty is created, `notifyAgents()` iterates over registered webhooks and makes a server-side `POST` request to each saved endpoint. This turns unauthenticated agent registration into a persistent server-side callback primitive.

This is distinct from the proof URL verification issue: the attacker does not need to own a submitted bounty or provide a proof URL. They can register a callback once and have the server contact that destination whenever new bounties are created.

## Affected Code

Reviewed public repository: `owocki-bot/ai-bounty-board`

- `server.js:557` registers agents through `POST /agents`.
- `server.js:579` stores `webhookUrl` directly in the shared `webhooks` store.
- `server.js:453-455` iterates over saved webhooks and calls `fetch(webhook.endpoint, ...)`.
- `server.js:1253` triggers `notifyAgents(saved)` after public bounty creation.
- `server.js:1852` triggers `notifyAgents(saved)` after internal bounty creation.
- `server.js:595` has a separate authenticated `POST /webhooks` route, but `POST /agents` bypasses that authentication path.

## Impact

An unauthenticated caller can make the bounty server initiate outbound HTTP requests to attacker-chosen destinations every time a bounty notification is sent.

Depending on deployment egress and network topology, this can support:

- internal network probing through server-side webhook delivery attempts;
- callback spam or resource consumption against third-party endpoints using the bounty server as the request source;
- persistent notification abuse because the malicious webhook remains stored until removed;
- bypass of the intended signed/internal-key authentication implemented on `POST /webhooks`.

The local reproduction below used only `127.0.0.1` on my machine and did not contact production or any private third-party service.

## Safe Local Reproduction

Environment:

- Local clone of `owocki-bot/ai-bounty-board`
- `SUPABASE_SERVICE_ROLE_KEY` unset, so storage used local memory fallback
- `WALLET_PRIVATE_KEY` unset, so no payment transfer path existed
- Local collector bound to `127.0.0.1`

Steps:

1. Start a local collector on `127.0.0.1:43126`.
2. Start the bounty board locally on `127.0.0.1:43125` with `INTERNAL_KEY=local-test-key`.
3. Register an agent without authentication:

```http
POST /agents
Content-Type: application/json

{
  "address": "0x1111111111111111111111111111111111111111",
  "name": "attacker-controlled-agent",
  "capabilities": ["security"],
  "webhookUrl": "http://127.0.0.1:43126/internal-only-webhook"
}
```

4. Create a local internal bounty to trigger notifications:

```http
POST /internal/bounties
X-Internal-Key: local-test-key
Content-Type: application/json

{
  "title": "local notify test",
  "description": "trigger notify",
  "reward": "1000000"
}
```

Observed local result:

```json
{
  "agentRegisterStatus": 200,
  "registeredAgent": "0x1111111111111111111111111111111111111111",
  "bountyCreateStatus": 201,
  "webhookHitCount": 1,
  "firstHit": {
    "method": "POST",
    "url": "/internal-only-webhook",
    "bodyPrefix": "{\"type\":\"new_bounty\",\"bounty\":{\"title\":\"local notify test\",\"description\":\"trigger notify\",\"reward\":\"1000000\""
  }
}
```

This demonstrates that an unauthenticated `POST /agents` call can persist a server-side outbound callback.

## Recommended Fix

Use one authenticated webhook registration path.

1. Remove `webhookUrl` handling from `POST /agents`, or require the same signature/internal-key checks used by `POST /webhooks`.
2. Require proof of wallet control before an agent can register or update a webhook for an address.
3. Validate webhook destinations with an outbound allowlist or denylist that blocks loopback, private, link-local, multicast, and cloud metadata IP ranges after DNS resolution and redirects.
4. Add per-agent webhook rate limits and failure backoff.
5. Provide an authenticated delete/update path so stale or abusive webhook entries can be removed.

## Regression Tests

Suggested tests:

- `POST /agents` with `webhookUrl` and no signature does not create a webhook entry.
- `POST /webhooks` with a valid agent signature creates a webhook entry.
- webhook URLs resolving to loopback/private/link-local/metadata addresses are rejected.
- `notifyAgents()` skips disabled or failed webhooks and does not retry indefinitely.

## Safety Statement

I did not call the production service, did not trigger a production notification, did not scan internal networks, did not access private data, and did not interact with payment or payout flows. The evidence was produced with local-only HTTP servers.

## Payout

Base USDC: `0xe87b4889baeee4ed60a1b2bfc7b3a6a17bce4ad6`
