# OWK-005 Security Report: Unauthenticated Autograder Cost Abuse

## Summary

The public `POST /bounties/:id/grade` endpoint can be called by any unauthenticated client for any bounty in `submitted` status. If `OPENAI_API_KEY` is configured, each request sends the bounty and latest submission to the OpenAI chat completions API.

The route does not require an internal key, moderator wallet proof, claimant proof, creator proof, or any rate limit. A third party can therefore repeatedly trigger server-paid model calls against submitted bounties without controlling any relevant wallet.

This is separate from the previously reported unsigned approval, release, cancel, submission mutation, rendering XSS, and blocklist mutation paths. It does not require calling a payment endpoint.

## Affected Code

Repository reviewed: `owocki-bot/ai-bounty-board`

File: `server.js`

Relevant route:

```js
app.post('/bounties/:id/grade', async (req, res) => {
  const bounty = await getBounty(req.params.id);
  ...
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    return res.json({
      recommendation: 'manual_review',
      reason: 'No AI grading API configured',
      grades: bounty.requirements.map(r => ({ requirement: r, status: 'UNKNOWN', reason: 'API not configured' }))
    });
  }

  const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })
  });
  ...
});
```

Key observations:

- The endpoint is a public `POST` route.
- It does not inspect `x-internal-key`.
- It does not require `modWallet`, wallet signature, session state, or creator/claimer proof.
- It does not call `checkRateLimit(...)`.
- If a server key is configured, each accepted request makes an outbound paid model request.

## Impact

An external caller can:

1. Enumerate public bounty IDs and wait for or locate bounties in `submitted` state.
2. Repeatedly call `POST /bounties/:id/grade`.
3. Force the server to spend OpenAI API quota for each call.
4. Generate noisy or misleading automated grading output that may be mistaken for trusted review context.

This creates a cost-amplification and review-integrity issue:

- Maintainers pay for calls they did not authorize.
- There is no per-wallet, per-IP, or per-bounty throttling on this path.
- The route processes the latest submission content and proof URL on demand for anonymous callers.
- A burst of requests can add operational noise around submitted work without touching the payment route.

The endpoint is especially risky because submitted bounties are already the stage where review and payment decisions are imminent.

## Attack Preconditions

- The application is deployed with `OPENAI_API_KEY`.
- At least one bounty is in `submitted` status.
- The attacker knows or can discover the bounty ID from public listing/detail pages.

No wallet private key, moderator wallet, creator wallet, claimant wallet, internal key, or payment action is needed.

## Safe Reproduction Plan

Do not run this against production. The following is a local-only reproduction outline:

1. Start a local instance with a dummy or metered test `OPENAI_API_KEY`.
2. Create or seed a bounty with:
   - `status: "submitted"`
   - one or more `requirements`
   - at least one item in `submissions`
3. Send:

```bash
curl -X POST http://localhost:3000/bounties/123/grade
```

4. Observe that no auth header or wallet proof is required before the route reaches the model-call branch.
5. Repeat the request and observe that there is no route-specific throttling.

This report was produced from public source review only. I did not call the production grading endpoint, trigger model usage on the live service, access private data, or interact with payment flows.

## Expected Behavior

Automated grading should be available only to trusted review actors or internal automation.

Reasonable controls include:

- require `x-internal-key` for `/bounties/:id/grade`; or
- require signed moderator authorization; and
- rate-limit by bounty ID and caller identity; and
- cache or persist one grade per submission revision; and
- avoid running a new model request when the latest submission has already been graded.

## Suggested Patch

Minimal defensive pattern:

```js
app.post('/bounties/:id/grade', async (req, res) => {
  const internalKey = req.headers['x-internal-key'];
  if (internalKey !== process.env.INTERNAL_KEY) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Continue with existing grading logic.
});
```

If moderator-triggered grading is desired, use the same standard as the approval path should use: a moderator wallet plus a fresh signature over the bounty ID, submission ID, action, and nonce.

## Regression Tests

Add tests for:

- anonymous `POST /bounties/:id/grade` returns `401`;
- wrong `x-internal-key` returns `401`;
- correct internal key can grade a submitted bounty;
- non-submitted bounty still returns the existing `No submission to grade` response after authentication;
- repeated grading of the same unchanged submission reuses a cached result or is rate-limited.

## Payout

If accepted for OWK-005, payout can be sent to:

`0xe87b4889baeee4ed60a1b2bfc7b3a6a17bce4ad6`
