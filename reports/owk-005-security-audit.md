# OWK-005 Security Audit: Bounty Escrow and Payment Flow

Issue: https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/5

Target reviewed: `owocki-bot/ai-bounty-board` at commit `774c3a58ddc7052309f2fc8ade1e924abbedefdc`

Scope note: I did not find a Solidity escrow contract in the public GitHub org or synced bounty repository. The review therefore focuses on the public bounty board server that implements escrow state, approval, and USDC payout behavior for the Base/x402 bounty system. I did not attempt live exploitation or trigger any transfer. See `reports/owk-005-maintainer-triage.md` for the source-discovery reconciliation and acceptance checklist.

## Executive Summary

The bounty board payment path is not safe to operate with real funds in its current form. The most serious issue is that `POST /bounties/:id/approve` accepts a plain `modWallet` string and treats that as moderator authorization. Since the moderator wallet addresses are hard-coded in the public source, any unauthenticated caller can impersonate a moderator and approve a submitted bounty. Depending on deployment configuration, this either queues a USDC payment for the local relay or directly transfers USDC from the server wallet.

The escrow model also marks bounties as funded based on a self-signed x402-like header without verifying an on-chain USDC transfer, nonce uniqueness, facilitator settlement, or recipient binding. This means `escrow.funded = true` is an application flag, not proof of deposited funds.

I recommend disabling bounty approval and creation until the critical items below are fixed.

## Findings

### Critical: Moderator approval can be spoofed with a public wallet address

Evidence:
- Moderator wallet addresses are hard-coded in `server.js` lines 17-27.
- Approval reads `modWallet` directly from the JSON body in `server.js` line 1560.
- `isMod(modWallet)` is the only authorization check in lines 1570-1581.
- If no hot wallet is configured, the same approval path queues `pendingPayment` in lines 1669-1703.
- If a hot wallet is configured, the path transfers USDC in lines 1706-1730.

Impact:
- Any unauthenticated caller who knows a listed moderator address can approve any bounty in `submitted` state.
- If the local relay trusts `pendingPayment`, the attacker can force payout queue entries.
- If `WALLET_PRIVATE_KEY` is set, the attacker can trigger direct USDC transfer to the bounty claimant.

Recommendation:
- Require EIP-191/EIP-712 signatures from the moderator wallet over a typed approval payload containing `bountyId`, `submissionId`, `recipient`, `amount`, `chainId`, `deadline`, and a server nonce.
- Store and consume nonces server-side.
- Do not accept a wallet address as proof of control.
- Put all moderator/admin routes behind authenticated sessions or signed requests.

Relevant source links:
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L17-L27
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1559-L1581
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1669-L1703
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1706-L1730

### Critical: Escrow funding is not verified on-chain

Evidence:
- The generic payment middleware says the verification is simplified and only checks a signature in `server.js` lines 524-541.
- Bounty creation parses a base64 payment header, verifies `payer` signed `x402:{recipient}:{amount}:{nonce}`, and checks only that `payment.amount >= totalRequired` in lines 1177-1191.
- The new bounty is then persisted with `escrow.funded: true` in lines 1237-1243.
- There is no visible call to an x402 facilitator settlement endpoint, Base transaction lookup, USDC `Transfer` event verification, nonce replay table, recipient check against `TREASURY_ADDRESS`, token address check, or expiry check.

Impact:
- A caller can produce a valid self-signature over arbitrary payment fields without actually transferring USDC.
- The system can create bounties that appear escrow-funded but have no corresponding funds.
- This undermines worker trust and can create unpaid liabilities or treasury-funded payouts for fake escrows.

Recommendation:
- Use the official x402 server/facilitator verification flow, or independently verify a confirmed Base USDC transfer to the treasury before setting `escrow.funded = true`.
- Bind verification to `chainId`, token address, recipient, exact amount, payer, bounty creation intent, nonce, and expiry.
- Persist payment nonce or transaction hash and reject replay.
- Store escrow records as settled only after finality criteria are met.

Relevant source links:
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L524-L541
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1177-L1191
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1224-L1243

### High: Blocklist admin endpoints are unauthenticated

Evidence:
- `POST /admin/blocklist` mutates the blocklist without checking `X-Internal-Key` or a moderator signature in lines 2205-2251.
- `DELETE /admin/blocklist/:wallet` removes entries without authentication in lines 2258-2279.

Impact:
- Anyone can blocklist a competitor, worker, or moderator wallet.
- Anyone can remove their own wallet from the blocklist.
- This weakens anti-abuse controls and can be combined with the approval spoofing issue.

Recommendation:
- Require the same signed moderator/admin authorization for blocklist mutation.
- Record who performed the action based on verified identity, not a request body field.
- Keep `GET /admin/blocklist` non-public unless public disclosure is intentional.

Relevant source links:
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L2205-L2251
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L2258-L2279

### High: Claim, submit, edit, delete, release, and cancel trust caller-supplied addresses

Evidence:
- Claim accepts `{ address }` and records that address as claimant in lines 1283-1340.
- Submit accepts `{ address }` and compares it to stored `claimedBy` in lines 1364-1410.
- Edit and delete submission endpoints use the same body-address check in lines 1501-1551.
- Release trusts `{ address }` in lines 2069-2104.
- Cancel trusts `{ address }` as creator identity in lines 2111-2129.
- The browser UI also supports manual address entry and sends it directly in `browse-handler.js` lines 474-484, 520-534, 563-575, and 585-592.

Impact:
- A caller can claim bounties under any wallet address, causing griefing and slot exhaustion.
- A caller who knows the claimant address can alter, delete, or release that claimant's submission.
- A caller who knows a creator address can cancel an open bounty.

Recommendation:
- Require wallet signatures for every state-changing action that is attributed to a wallet.
- Use typed payloads with bounty ID, action, nonce, and expiry.
- Normalize all stored addresses consistently and compare only verified signers.

Relevant source links:
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1283-L1340
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1364-L1410
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1501-L1551
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L2069-L2129
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/browse-handler.js#L474-L592

### High: Stored XSS in the moderator review modal can combine with approval spoofing

Evidence:
- The pending table escapes row fields in lines 784-823.
- The detailed modal later writes bounty fields and submission fields into `innerHTML` without escaping in lines 1050-1062.
- User-controlled fields include bounty title, description, requirements, submission content, and proof.

Impact:
- A malicious submission can execute script when a moderator opens "View" in the mod dashboard.
- The script can read the locally stored `modWallet` value and call `/bounties/:id/approve`.
- Even after approval authorization is fixed, XSS can still attack the moderator UI, alter displayed evidence, or call any API reachable by the moderator browser.

Recommendation:
- Render modal content with `textContent`/DOM node construction instead of string concatenation.
- Escape all user-controlled fields before any `innerHTML` assignment.
- Add a restrictive Content Security Policy that blocks inline scripts.
- Treat proof links as untrusted URLs and set `rel="noopener noreferrer"`.

Relevant source links:
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L784-L823
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1050-L1062

### Medium: Proof URL verification allows SSRF-style outbound requests

Evidence:
- `verifyProofUrl` accepts user-provided URLs and performs a server-side `HEAD` request in lines 107-180.
- The placeholder denylist includes `localhost` and `127.0.0.1` but does not parse and reject private IP ranges, link-local ranges, IPv6 loopback, metadata endpoints, redirects to private ranges, or DNS rebinding.
- Submit calls this verifier for user-controlled `proof` URLs in lines 1438-1450.

Impact:
- Attackers can use the bounty server as an HTTP client against internal network surfaces or cloud metadata endpoints, depending on hosting environment.
- Even when response bodies are not returned, timing/status differences can leak reachability.

Recommendation:
- Parse URLs with `new URL`, allow only `https:`, and resolve DNS before fetch.
- Reject private, loopback, link-local, multicast, and metadata IP ranges for both initial and redirected destinations.
- Disable redirects or revalidate every redirect hop.
- Consider moving proof verification to an asynchronous sandboxed worker with egress controls.

Relevant source links:
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L107-L180
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1438-L1450

### Low: Browser-side reject flow references `process.env`

Evidence:
- The mod dashboard's `rejectBounty` JavaScript sends `X-Internal-Key: process.env.INTERNAL_KEY` in browser code in lines 1022-1031.

Impact:
- In a normal browser, `process` is undefined, so the reject action is likely broken before the request is sent.
- This can prevent moderators from rejecting bad submissions from the UI.

Recommendation:
- Do not embed server secrets in browser code.
- Implement authenticated server sessions or signed moderator actions, then call reject without exposing an internal key.

Relevant source link:
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1022-L1031

## Recommended Fix Order

1. Disable `/bounties/:id/approve`, `/admin/blocklist`, and public bounty creation until authorization and escrow verification are fixed.
2. Add a common signed-action middleware for moderator/admin/creator/claimer actions.
3. Replace the custom x402 verification with real facilitator/on-chain settlement checks.
4. Escape or DOM-render the mod dashboard modal and add CSP.
5. Harden proof URL verification or remove synchronous server-side fetching.
6. Add regression tests for authorization failures, unsigned body-address spoofing, duplicate x402 nonce replay, unescaped HTML in mod views, and private-IP proof URLs.

## Verification Performed

- Reviewed the public source at commit `774c3a58ddc7052309f2fc8ade1e924abbedefdc`.
- Traced bounty creation, claim, submit, approval, payment, blocklist, release, cancel, and proof verification paths.
- Did not exploit the live service or send any transaction.
