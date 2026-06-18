# OWK-005 Maintainer Triage Packet

Issue: https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/5

Primary report: `reports/owk-005-security-audit.md`

Reviewed target: `owocki-bot/ai-bounty-board` at commit `774c3a58ddc7052309f2fc8ade1e924abbedefdc`

## Scope Reconciliation

The synced bounty asks for a security audit of the "escrow smart contract". I could not locate a public Solidity escrow contract in the `owocki-bot` GitHub org during the review window. Public code search for escrow/x402 references pointed to the `ai-bounty-board` server, and the board README describes the server as the system that creates bounties, marks escrow as funded, approves submissions, and releases USDC payments.

For that reason, the audit treats the public server-side escrow/payment implementation as the available bounty escrow surface. If there is a separate private or deployed contract, it should be reviewed as a separate artifact before real funds are entrusted to the system.

## Highest-Risk Decision Points

1. Do not operate the current approval route with real funds. `POST /bounties/:id/approve` accepts `modWallet` from the request body and checks it against public constants. That is identity assertion, not authentication.
2. Do not mark bounties as escrow-funded from the current payment header alone. The public code verifies a self-signed payload but does not prove Base USDC settlement to the treasury.
3. Do not rely on body-supplied wallet addresses for claim, submit, edit, delete, release, or cancel operations. Each action must prove control of the wallet it attributes the action to.
4. Treat the moderator UI as untrusted input until the `innerHTML` review modal is replaced or fully escaped. The XSS finding can amplify the approval issue.
5. Restrict blocklist mutation routes before using the blocklist as an abuse-control primitive.

## Minimum Patch Acceptance Checklist

- Moderator/admin actions require a verified EIP-712 or EIP-191 signature over action, bounty ID, submission ID, recipient, amount, chain ID, deadline, and a server-issued nonce.
- Creator/claimer actions require the same signed-action pattern instead of trusting `{ address }` in JSON bodies.
- Escrow funding is set only after official x402 facilitator settlement or independent Base USDC transfer verification to the configured treasury.
- Payment records persist transaction hash, payer, recipient, amount, token, chain ID, nonce, and verification status.
- Nonces are single-use and expire.
- Approval cannot queue or execute a payment unless the escrow record is settled and unreleased.
- The moderator review modal renders untrusted values with `textContent` or equivalent DOM construction, not interpolated `innerHTML`.
- Proof URL verification rejects private, loopback, link-local, multicast, and metadata IP destinations, including after redirects.
- Blocklist POST/DELETE routes require verified admin authorization.

## Suggested Regression Tests

These tests are safe to run against a local clone or isolated test harness only.

| Area | Test expectation |
| --- | --- |
| Moderator approval | A request containing a known moderator address but no valid signature is rejected and does not create `pendingPayment`. |
| Moderator replay | Reusing a prior valid moderator approval signature with the same nonce is rejected. |
| Escrow funding | A syntactically valid payment header without confirmed settlement does not set `escrow.funded = true`. |
| Wallet attribution | Claim, submit, edit, delete, release, and cancel fail unless the signer matches the affected wallet role. |
| Conflict of interest | A verified moderator still cannot approve a bounty they claimed or submitted. |
| XSS | HTML in title, description, submission, and proof fields is displayed as text in the moderator modal. |
| SSRF | Proof URLs resolving to private IPv4, private IPv6, loopback, link-local, or metadata endpoints are rejected. |
| Blocklist admin | Unauthenticated POST/DELETE blocklist calls are rejected. |

## Practical Fix Order

1. Temporarily disable approval, blocklist mutation, and public bounty creation in production.
2. Add a shared signed-action verifier and nonce store.
3. Replace escrow funding verification with real x402 settlement or Base USDC transfer checks.
4. Gate payment queue/direct transfer on a settled escrow record.
5. Fix the moderator modal rendering and deploy a restrictive Content Security Policy.
6. Harden proof URL verification.
7. Add the regression tests above before re-enabling real-value flows.

## Residual Risk

If the intended escrow is a separate contract that is not public, this report should be treated as a server/payment-flow audit rather than a final smart-contract audit. The public server issues are still critical because they can authorize release or queue payment independent of a contract review.
