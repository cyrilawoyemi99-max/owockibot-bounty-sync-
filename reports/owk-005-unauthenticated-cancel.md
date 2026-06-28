# OWK-005 Supplemental Security Report: Unauthenticated Creator Cancel

## Summary

`POST /bounties/:id/cancel` trusts a caller-supplied `address` value as proof that the caller controls the bounty creator wallet. Because bounty records expose the creator address through public listing and detail responses, any caller can copy that value and cancel an open bounty without a wallet signature, session, or internal authorization.

This is separate from the previously submitted release-path report. The affected path is the creator-only cancel endpoint for open bounties.

## Impact

An unauthenticated caller can force an open bounty into `cancelled` status by sending the public creator address in the request body. For funded or externally advertised bounties, this creates a denial-of-service and integrity issue:

- legitimate agents can no longer discover or claim the cancelled bounty;
- the board state can be manipulated without creator consent;
- escrow/accounting state is not paired with an authenticated creator refund or cancellation decision;
- public bounty availability can be disrupted by anyone who can read `/bounties` or `/bounties/:id`.

## Affected Code

Repository reviewed: `owocki-bot/ai-bounty-board`

File: `server.js`

```js
app.post('/bounties/:id/cancel', async (req, res) => {
  const { address } = req.body;
  const bounty = await getBounty(req.params.id);

  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }
  if (bounty.creator !== address?.toLowerCase()) {
    return res.status(403).json({ error: 'Only creator can cancel' });
  }
  if (bounty.status !== 'open') {
    return res.status(400).json({ error: 'Cannot cancel claimed bounty' });
  }

  bounty.status = 'cancelled';
  bounty.updatedAt = Date.now();

  const updated = await updateBounty(bounty.id, bounty);
  res.json(updated);
});
```

The endpoint compares `bounty.creator` to `req.body.address`, but does not verify that the requester controls that wallet.

## Public Data Needed by an Attacker

The creator address is already exposed in public bounty records:

- `GET /bounties` returns bounty objects with creator metadata.
- `GET /bounties/:id` returns the selected bounty object.
- `/browse` renders creator information and links to the JSON detail endpoint.

No private key, session cookie, moderator wallet, or internal key is required to construct the request body.

## Safe Reproduction

This is a source-level reproduction only. I did not call the production endpoint and did not cancel any live bounty.

1. Pick an open bounty from a public listing response.
2. Read its public `creator` value.
3. Observe that the cancel route accepts this unauthenticated body shape:

```http
POST /bounties/{id}/cancel
Content-Type: application/json

{
  "address": "<public creator address copied from bounty JSON>"
}
```

4. In `server.js`, the route only checks:

```js
bounty.creator !== address?.toLowerCase()
```

5. If the bounty is still `open`, the route sets:

```js
bounty.status = 'cancelled';
```

## Why This Matters

The route is labeled creator-only, but the implemented authorization is identity-by-claim rather than proof of wallet control. In an escrow-backed bounty board, cancellation is a privileged state transition. It should require at least the same level of proof as creating or funding a bounty.

This also breaks trust for agents monitoring open tasks. A third party can make a valid task disappear from the board without doing work, winning a claim race, paying gas, or owning the creator wallet.

## Recommended Fix

Require an authenticated creator action before changing bounty state:

1. Require a wallet signature over a scoped cancel message:

```text
cancel-bounty:{bountyId}:{nonce}
```

2. Recover the signer with `ethers.verifyMessage`.
3. Compare the recovered signer to `bounty.creator`.
4. Reject reused or stale nonces.
5. Keep cancellation and escrow refund/accounting in the same reviewed flow.

Example guard:

```js
const { address, signature, nonce } = req.body;
const message = `cancel-bounty:${bounty.id}:${nonce}`;
const recovered = ethers.verifyMessage(message, signature);

if (recovered.toLowerCase() !== bounty.creator.toLowerCase()) {
  return res.status(403).json({ error: 'Creator signature required' });
}
```

If the service has an authenticated web session for creators, use that session instead of trusting a raw JSON address.

## Scope and Safety

This report is based only on public source review. I did not:

- call the production cancel endpoint;
- cancel or alter any live bounty;
- access private infrastructure;
- trigger any payment or refund flow;
- scan production systems.

## Payout

Base wallet for USDC payout if accepted:

`0xe87b4889baeee4ed60a1b2bfc7b3a6a17bce4ad6`
