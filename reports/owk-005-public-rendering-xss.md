# OWK-005 Supplemental Audit: Public Rendering Stored XSS

Issue: https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/5

Target reviewed: `owocki-bot/ai-bounty-board` at commit `774c3a58ddc7052309f2fc8ade1e924abbedefdc`

Related upstream fix: https://github.com/owocki-bot/ai-bounty-board/pull/30

This is a supplemental finding for OWK-005. Existing report PR #11 documents stored XSS in the moderator review modal. This report covers a separate public rendering surface: the landing page and `/browse` page that normal visitors and workers can open without using the moderator dashboard.

I did not exploit the live service, access private infrastructure, or trigger any payment flow. Validation was done against a local clone with synthetic bounty data.

## Finding

### High: Public bounty pages allow stored XSS through bounty fields

The public pages render bounty fields from storage into HTML and inline JavaScript without using the correct escaping for the destination context.

Affected paths:

- `GET /`
- `GET /browse`

Key evidence:

- Bounty creation stores `title`, `description`, and `tags` directly from the request body after only length checks.
- The landing page inserts `b.title`, `b.description`, `b.rewardFormatted`, and `b.tags` directly into a template string.
- `/browse` escapes visible title and description text, but embeds raw bounty values into inline JavaScript with `JSON.stringify(...)`.
- `/browse` also builds tag filter links and `<option value="...">` values by concatenating raw tag values into attributes.
- Submission proof links are rendered as clickable `href` values without a protocol allowlist.

Relevant source links:

- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L1124-L1230
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/server.js#L2452-L2463
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/browse-handler.js#L59-L70
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/browse-handler.js#L110-L119
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/browse-handler.js#L131-L137
- https://github.com/owocki-bot/ai-bounty-board/blob/774c3a58ddc7052309f2fc8ade1e924abbedefdc/browse-handler.js#L352-L354

## Why This Is Distinct From PR #11

PR #11's XSS finding is centered on the moderator review modal in `server.js`. That requires a moderator to open the detailed review UI.

This finding affects public pages. A malicious bounty can execute script for any visitor who opens `/` or `/browse`, including workers browsing available bounties. It also includes a script-context breakout in inline JSON, not only an `innerHTML` sink.

## Local Proof of Concept

A synthetic bounty with this title breaks out of the inline script in `/browse`:

```js
title: '</script><script>window.__owkPublicXss=1</script>'
```

A synthetic tag like this breaks out of the `href` attribute in tag filter links:

```js
tags: ['x" autofocus onfocus="window.__owkTagXss=1']
```

Local harness result before the fix:

```text
script-breakout-present: true
raw-tag-attribute-present: true
javascript-proof-href-present: true
```

Local harness result after upstream fix PR #30:

```text
script-breakout-present: false
raw-tag-attribute-present: false
javascript-proof-href-present: false
encoded-script-json-present: true
```

## Impact

Any actor who can create or import a bounty with attacker-controlled fields can run JavaScript in the browser of public visitors.

Possible outcomes include:

- Defacing public bounty listings.
- Phishing wallet addresses or payment details from workers.
- Altering the visible bounty content before a worker acts on it.
- Calling same-origin API endpoints from the visitor browser.
- Combining with the body-supplied wallet identity issues in PR #11 to grief claim, submit, release, or cancel flows.

The current code contains a temporary admin-wallet restriction for public bounty creation, but the stored XSS remains relevant because:

- existing stored bounty records are still rendered publicly;
- internal/admin import paths can still create bounty records;
- PR #11 documents related internal-key and escrow verification weaknesses;
- the public creation pause is temporary and does not remove the unsafe render sinks.

## Recommendation

Use output encoding appropriate to each context:

1. Escape all database-backed text before inserting it into HTML text nodes.
2. Escape attribute values and build query strings with `URLSearchParams` instead of string concatenation.
3. Do not place raw `JSON.stringify(...)` output inside `<script>` tags. Escape `<`, `>`, `&`, U+2028, and U+2029, or serve JSON from a separate `application/json` endpoint.
4. Allow only `http:` and `https:` for proof links shown as clickable anchors.
5. Add `rel="noopener noreferrer"` to external links opened with `target="_blank"`.
6. Add a restrictive Content Security Policy that blocks inline scripts after existing inline JavaScript is removed or nonce-protected.
7. Add regression tests with `</script>` in title/description/submission fields, quotes in tags, and `javascript:` proof values.

## Upstream Patch

I submitted https://github.com/owocki-bot/ai-bounty-board/pull/30 with a minimal public-rendering patch:

- escapes landing page bounty fields;
- builds `/browse` URLs with `URLSearchParams`;
- escapes attributes after URL construction;
- encodes JSON for inline script context;
- avoids clickable links for non-http(s) proof values;
- adds `rel="noopener noreferrer"` to proof links.

Validation performed on the patch:

```text
node --check server.js
node --check browse-handler.js
git diff --check
local /browse harness with malicious title, tag, submission id, and javascript: proof URL
```
