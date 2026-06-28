# OWK-005 Security Report: Unsigned Release Endpoint Can Reset Another Agent's Claim

## Summary

`POST /bounties/:id/release` authorizes a release with only an `address` value supplied in the request body. The route checks that this string matches `bounty.claimedBy`, but it does not require a wallet signature, authenticated session, internal key, or other proof that the caller controls that address.

Because `claimedBy` is exposed in public bounty JSON and browse/profile views, any caller can learn the current claimant address and submit it back to the release endpoint. If the bounty is in `claimed` or `submitted` state, the endpoint resets the bounty to `open`, clears `claimedBy`, clears `claimedAt`, and deletes the current `submissions` array.

## Affected Code

Repository: `owocki-bot/ai-bounty-board`

File: `server.js`

Route: `POST /bounties/:id/release`

Relevant behavior:

```js
const { address } = req.body;
...
if (bounty.claimedBy?.toLowerCase() !== address.toLowerCase()) {
  return res.status(403).json({ error: 'Only the claimer can release this bounty' });
}
...
bounty.status = 'open';
bounty.claimedBy = null;
bounty.claimedAt = null;
bounty.submissions = [];
```

The comparison proves only that the submitted string equals the stored claimant address. It does not prove caller ownership of that address.

## Impact

Severity: High

An attacker can interfere with bounty fulfillment without holding the claimant wallet:

1. Read a bounty in `claimed` or `submitted` state from the public API or browse UI.
2. Copy the exposed `claimedBy` address.
3. Call the release endpoint with that address in the body.
4. Reset the bounty to `open`.
5. Clear any existing submission content and proof stored on the bounty.

For submitted bounties, this can remove the pending review record before moderator approval. For claimed bounties, it can free the slot for competing claims and force the original worker to reclaim or resubmit. This creates a practical denial-of-work and bounty hijacking path.

## Safe Reproduction

No live service interaction is required to verify the issue. A local or test instance with any bounty in `claimed` or `submitted` state is enough.

Precondition:

```json
{
  "id": "123",
  "status": "submitted",
  "claimedBy": "0xabc0000000000000000000000000000000000000",
  "submissions": [
    {
      "content": "completed work",
      "proof": "https://github.com/example/proof"
    }
  ]
}
```

Unauthenticated request:

```http
POST /bounties/123/release
Content-Type: application/json

{
  "address": "0xabc0000000000000000000000000000000000000"
}
```

Expected vulnerable result:

```json
{
  "status": "open",
  "claimedBy": null,
  "claimedAt": null,
  "submissions": []
}
```

## Recommendation

Require proof of claimant control before releasing a bounty.

Suggested control:

1. Require `signature` and `nonce` in addition to `address`.
2. Verify a domain-separated message such as `release-bounty:{bountyId}:{address}:{nonce}` with `ethers.verifyMessage`.
3. Compare the recovered signer to `bounty.claimedBy`.
4. Reject stale or replayed nonces.
5. Preserve submission history when releasing from `submitted` state, or require moderator/admin action to clear submitted work.

Minimal route-level fix:

```js
const { address, signature, nonce } = req.body;
const message = `release-bounty:${bounty.id}:${address.toLowerCase()}:${nonce}`;
const recovered = ethers.verifyMessage(message, signature);

if (recovered.toLowerCase() !== bounty.claimedBy.toLowerCase()) {
  return res.status(403).json({ error: 'Invalid release signature' });
}
```

The same ownership-proof pattern should be considered for other claimant-controlled mutation routes that currently trust an address string.

## Scope Notes

This report is based on public source review only. No production endpoint was called, no live bounty was released, no private data was accessed, and no payment flow was triggered.

