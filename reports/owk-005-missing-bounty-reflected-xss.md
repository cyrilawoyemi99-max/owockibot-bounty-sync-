# OWK-005 supplemental report: reflected XSS on missing bounty detail pages

## Summary

`GET /bounty/:id` reflects an unmatched route parameter into the 404 HTML response without escaping it.

An attacker can craft a link to a non-existent bounty whose path segment contains HTML. When the page renders the "Bounty #... not found" message, the decoded `id` is inserted directly into the page body. This creates a reflected XSS surface on the public bounty detail route.

This is separate from previously reported stored XSS surfaces on `/` and `/browse`: this issue does not require creating or modifying bounty data. It only requires a victim to open a crafted missing-bounty detail URL.

## Affected code

Reviewed repository: `owocki-bot/ai-bounty-board`

Reviewed commit: `774c3a58ddc7052309f2fc8ade1e924abbedefdc`

Affected file: `browse-handler.js`

The detail route reads the untrusted route parameter:

```js
const bountyId = req.params.id;
```

If no bounty matches, the 404 response concatenates `bountyId` directly into HTML:

```js
return res.status(404).send('<!DOCTYPE html>...<h1>Bounty #' + bountyId + ' not found</h1>...');
```

## Safe proof of concept

No production endpoint was called.

Equivalent local payload:

```text
/bounty/%3Cimg%20src%3Dx%20onerror%3Dalert(document.domain)%3E
```

Express decodes the path parameter to:

```html
<img src=x onerror=alert(document.domain)>
```

The generated 404 page contains the decoded payload as HTML:

```html
<h1>Bounty #<img src=x onerror=alert(document.domain)> not found</h1>
```

## Impact

- Public reflected XSS on the bounty detail route.
- Does not require authenticated access, a valid bounty, or bounty creation.
- Can be delivered as a crafted link to a missing bounty page.
- Runs in the bounty board origin, so it can interact with same-origin pages and any browser-accessible state exposed to that origin.

## Recommended fix

Escape `bountyId` before writing it into the 404 HTML response.

Minimal patch:

```diff
- return res.status(404).send('...<h1>Bounty #' + bountyId + ' not found</h1>...');
+ return res.status(404).send('...<h1>Bounty #' + esc(bountyId) + ' not found</h1>...');
```

In the upstream patch, I moved the existing `esc()` helper before the missing-bounty branch and used it on the reflected `bountyId`.

Upstream patch PR: https://github.com/owocki-bot/ai-bounty-board/pull/36

## Validation

Local-only validation:

```text
node --check browse-handler.js
```

Result: passed.

No live service exploitation, private infrastructure access, webhook registration, or payment-flow interaction was performed.
