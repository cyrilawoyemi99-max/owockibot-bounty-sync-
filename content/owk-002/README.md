# OWK-002 Public Goods Funding Thread Pack

This deliverable contains a five-part Twitter/X thread series for bounty
`owk-002`: the history and future of public goods funding in crypto.

## Files

- `public-goods-funding-thread-pack.md` - five ready-to-post threads, each with
  12 posts, a CTA, source block, and publisher notes.
- `../../scripts/validate-owk-002-content.mjs` - local validator for thread
  count, post count, CTA placement, source blocks, and 280-character limits.

## Editorial angle

The pack is designed as a scheduled educational series rather than a single
long essay split into posts. Each thread has a different job:

1. Frame public goods as crypto infrastructure, not charity.
2. Explain quadratic funding with concrete operator lessons.
3. Explain retroactive funding and the tradeoffs of impact measurement.
4. Show why maintainer stewardship matters for protocol resilience.
5. Connect the next wave to reputation, receipts, and bounty coordination.

## Validation

Run from the repository root:

```bash
node scripts/validate-owk-002-content.mjs
git diff --check -- content/owk-002 scripts/validate-owk-002-content.mjs
```

The validator confirms:

- exactly five thread sections
- exactly twelve posts in each thread
- every post is 280 characters or fewer
- every thread ends with a `CTA:` post
- every thread includes a `Sources` block

