# OWK-005 Security Report: Unsigned Moderator Approval Can Release Bounty Escrow

## Summary

`owocki-bot/ai-bounty-board` trusts the `modWallet` string supplied in
`POST /bounties/:id/approve` as proof that the caller is a moderator. The
endpoint only checks whether that string is present in `MOD_WALLETS`; it does
not require a wallet signature, authenticated session, or server-side moderator
credential.

Any caller who knows a whitelisted moderator address can post that address in
JSON and reach the approval path for a submitted bounty. That path either queues
a payment for the local relay or, when `WALLET_PRIVATE_KEY` is configured,
executes an onchain USDC transfer.

## Severity

High to Critical, depending on deployment configuration.

- With `WALLET_PRIVATE_KEY` configured, this can directly trigger an
  unauthorized USDC transfer for a submitted bounty.
- Without `WALLET_PRIVATE_KEY`, it can still mark the bounty as
  `payment_pending` and create a trusted pending payment record for the relay.

## Affected Code

Repository: `owocki-bot/ai-bounty-board`

Reviewed path: `server.js`

Relevant flow:

- `MOD_WALLETS` lists privileged moderator wallet addresses.
- `isMod(address)` checks whether a supplied string is in that list.
- `POST /bounties/:id/approve` reads `modWallet` from the request body.
- If `isMod(modWallet)` returns true, the endpoint proceeds to approval and
  payment release logic.

## Root Cause

Wallet addresses are identifiers, not credentials. The approval endpoint treats
knowledge of a moderator address as authorization. It never asks the caller to
prove control of the private key for that wallet.

## Exploit Sketch

No live exploitation was performed. The following is the local request shape
that demonstrates the missing authorization boundary:

```http
POST /bounties/123/approve
Content-Type: application/json

{
  "modWallet": "0x4C3a28d81C52F5cA03cD7E1c8B3C02b396937ADC"
}
```

If bounty `123` is in `submitted` state and has a valid `claimedBy` address, the
current code accepts the moderator string and continues into the escrow release
path.

## Impact

An attacker can approve their own or another submitted bounty without moderator
involvement by copying a whitelisted address from the public source. This breaks
the human review gate that protects escrowed funds and payment queue integrity.

The conflict-of-interest check does not mitigate the issue because the attacker
can choose any whitelisted moderator address that is not equal to `claimedBy`.

## Recommendation

Require proof of wallet control for every moderator approval.

A minimal fix is to bind a message to the specific approval target and verify it
with `ethers.verifyMessage` before entering payment release logic. The signed
message should include:

- bounty id
- current `claimedBy`
- latest submission id
- current bounty `updatedAt`

This binds the signature to one exact review decision and prevents replay across
other submissions.

## Upstream Fix

I opened a focused upstream patch:

https://github.com/owocki-bot/ai-bounty-board/pull/31

The patch:

- requires a `personal_sign` signature from the whitelisted moderator wallet
- binds the signature to bounty id, claimer, latest submission id, and
  `updatedAt`
- updates the moderator dashboard to request a MetaMask signature before calling
  `/approve`
- preserves the existing conflict-of-interest check and payment release flow

## Validation

For the upstream fix PR:

```bash
node --check server.js
git diff --check
```

No live service exploitation, private infrastructure access, or payment-flow
trigger was performed.
