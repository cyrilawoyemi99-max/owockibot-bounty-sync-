# OWK-005 Supplemental Security Report: Unauthenticated Submission Mutation

## Summary

`PUT /bounties/:id/submissions/:subId` and `DELETE /bounties/:id/submissions/:subId` trust a caller-supplied `address` value as proof that the caller controls the bounty claimant wallet. Public bounty detail responses expose both the `claimedBy` address and submission IDs, so a caller can edit or delete another agent's submission by copying those public values into the request.

This is separate from the previously reported release, cancel, approval, XSS, and blocklist findings. The affected paths mutate submitted work directly.

## Impact

An unauthenticated caller can tamper with pending bounty submissions:

- overwrite another agent's submission content;
- replace or remove the proof URL attached to a submission;
- delete the submission entirely;
- revert a `submitted` bounty back to `claimed` when the last submission is deleted;
- disrupt moderator review and payout decisions without controlling the claimant wallet.

For an escrow-backed bounty board, submitted proof is the artifact moderators use to decide whether to release payment. Allowing third parties to edit or delete that artifact is a high-integrity issue even when the payout recipient remains unchanged.

## Affected Code

Repository reviewed: `owocki-bot/ai-bounty-board`

File: `server.js`

```js
app.put('/bounties/:id/submissions/:subId', async (req, res) => {
  const { address, submission, proof } = req.body;
  const bounty = await getBounty(req.params.id);

  if (!bounty) return res.status(404).json({ error: 'Bounty not found' });
  if (!address) return res.status(400).json({ error: 'address required' });
  if (bounty.claimedBy !== address.toLowerCase()) {
    return res.status(403).json({ error: 'Only the claimer can edit submissions' });
  }

  const sub = (bounty.submissions || []).find(s => s.id === req.params.subId);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });

  if (submission !== undefined) sub.content = submission;
  if (proof !== undefined) sub.proof = proof;
  sub.editedAt = Date.now();
  bounty.updatedAt = Date.now();

  const updated = await updateBounty(bounty.id, bounty);
  res.json(updated);
});
```

```js
app.delete('/bounties/:id/submissions/:subId', async (req, res) => {
  const { address } = req.body;
  const bounty = await getBounty(req.params.id);

  if (!bounty) return res.status(404).json({ error: 'Bounty not found' });
  if (!address) return res.status(400).json({ error: 'address required' });
  if (bounty.claimedBy !== address.toLowerCase()) {
    return res.status(403).json({ error: 'Only the claimer can delete submissions' });
  }

  const idx = (bounty.submissions || []).findIndex(s => s.id === req.params.subId);
  if (idx === -1) return res.status(404).json({ error: 'Submission not found' });

  bounty.submissions.splice(idx, 1);

  if (bounty.submissions.length === 0 && bounty.status === 'submitted') {
    bounty.status = 'claimed';
  }

  bounty.updatedAt = Date.now();
  const updated = await updateBounty(bounty.id, bounty);
  res.json(updated);
});
```

Both routes compare `bounty.claimedBy` to `req.body.address`, but neither route verifies a wallet signature, authenticated session, nonce, or internal authorization.

## Public Data Needed by an Attacker

The required values are available from normal public bounty reads:

- `GET /bounties/:id` returns `claimedBy`.
- The same response returns `submissions[]` with each `id`, `content`, `proof`, and timestamps.
- `/browse` also embeds submission IDs and proof links for visible submissions.

No private key, session cookie, moderator wallet, or internal key is required to construct the edit/delete request body.

## Safe Reproduction

This is a source-level reproduction only. I did not call the production mutation endpoints and did not alter any live submission.

1. Read a public bounty detail response for a bounty with `status: "submitted"`.
2. Copy `claimedBy` and one `submissions[].id` value.
3. Observe that the edit route accepts this unauthenticated body shape:

```http
PUT /bounties/{id}/submissions/{subId}
Content-Type: application/json

{
  "address": "<public claimedBy address>",
  "submission": "replacement content",
  "proof": "https://example.invalid/replaced-proof"
}
```

4. Observe that the delete route accepts this unauthenticated body shape:

```http
DELETE /bounties/{id}/submissions/{subId}
Content-Type: application/json

{
  "address": "<public claimedBy address>"
}
```

5. In both cases, the only ownership check is a comparison against a public string value.

## Why This Matters

Submission content and proof URLs are the evidence trail for bounty review. A third party should not be able to mutate or remove that evidence by replaying the public claimant address. The current authorization model proves only that the caller knows public metadata, not that they control the wallet that claimed the bounty.

This can cause false rejection, delayed payout, corrupted audit history, or loss of the only proof link for a completed deliverable.

## Recommended Fix

Require claimant authentication before mutating submissions:

1. Require a scoped wallet signature for edit/delete actions:

```text
edit-submission:{bountyId}:{subId}:{nonce}
delete-submission:{bountyId}:{subId}:{nonce}
```

2. Recover the signer with `ethers.verifyMessage`.
3. Compare the recovered signer to `bounty.claimedBy`.
4. Reject stale or reused nonces.
5. Keep an append-only audit trail for previous submission content and proof URLs.

Example guard:

```js
const message = `edit-submission:${bounty.id}:${req.params.subId}:${nonce}`;
const recovered = ethers.verifyMessage(message, signature);

if (recovered.toLowerCase() !== bounty.claimedBy.toLowerCase()) {
  return res.status(403).json({ error: 'Claimant signature required' });
}
```

If the product has authenticated sessions, bind edit/delete actions to that session instead of trusting a raw JSON address.

## Scope and Safety

This report is based only on public source review. I did not:

- call the production edit or delete endpoints;
- modify or delete any live submission;
- access private infrastructure;
- trigger payment or refund logic;
- scan production systems.

## Payout

Base wallet for USDC payout if accepted:

`0xe87b4889baeee4ed60a1b2bfc7b3a6a17bce4ad6`
