import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dashboardDir = path.join(root, "dashboard", "owk-001-qingfeng312");
const files = [
  "index.html",
  "styles.css",
  "app.js",
  "README.md",
  path.join("data", "reputation-sample.json")
];

for (const file of files) {
  const fullPath = path.join(dashboardDir, file);
  assert(fs.existsSync(fullPath), `Missing ${path.relative(root, fullPath)}`);
}

const html = fs.readFileSync(path.join(dashboardDir, "index.html"), "utf8");
const css = fs.readFileSync(path.join(dashboardDir, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(dashboardDir, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(dashboardDir, "README.md"), "utf8");
const data = JSON.parse(
  fs.readFileSync(path.join(dashboardDir, "data", "reputation-sample.json"), "utf8")
);

assert(html.includes('<link rel="stylesheet" href="./styles.css">'), "HTML must load local CSS");
assert(html.includes('<script src="./app.js"></script>'), "HTML must load local app JS");
assert(!/<script[^>]+src=["']https?:/i.test(html), "No external script dependencies allowed");
assert(!/<link[^>]+href=["']https?:/i.test(html), "No external stylesheet dependencies allowed");
assert(css.includes("@media"), "Responsive CSS media queries are required");
assert(app.includes("scoreContributors"), "App must include scoring logic");
assert(app.includes("exportCsv"), "App must include CSV export");
assert(readme.includes("Validation"), "README must document validation steps");

assert(data.schemaVersion, "Data schemaVersion is required");
assert(Array.isArray(data.categories) && data.categories.length >= 4, "Expected at least four categories");
assert(Array.isArray(data.contributors) && data.contributors.length >= 3, "Expected at least three contributors");

const statuses = new Set(["submitted", "accepted", "merged", "paid"]);
let completedCount = 0;
let proofCount = 0;
let hasBase = false;
let hasSolana = false;

for (const contributor of data.contributors) {
  assert(contributor.id, "Contributor id is required");
  assert(contributor.handle, `Contributor ${contributor.id} missing handle`);
  assert(contributor.wallet, `Contributor ${contributor.id} missing wallet`);
  assert(Array.isArray(contributor.contributions), `${contributor.handle} missing contributions`);

  for (const item of contributor.contributions) {
    assert(item.id && /^owk-\d{3}$/.test(item.id), `${contributor.handle} has invalid bounty id`);
    assert(item.title, `${contributor.handle} contribution ${item.id} missing title`);
    assert(data.categories.includes(item.category), `${item.id} has unknown category`);
    assert(statuses.has(item.status), `${item.id} has invalid status ${item.status}`);
    assert(Number.isFinite(Number(item.rewardUsd)), `${item.id} rewardUsd must be numeric`);
    assert(item.proofUrl && item.proofUrl.startsWith("https://github.com/"), `${item.id} needs GitHub proof`);
    assert(item.submittedAt, `${item.id} missing submittedAt`);
    if (["accepted", "merged", "paid"].includes(item.status)) completedCount += 1;
    if (item.proofUrl || item.txHash || item.maintainerReceipt) proofCount += 1;
    if (item.chain === "Base") hasBase = true;
    if (item.chain === "Solana") hasSolana = true;
  }
}

assert(completedCount >= 6, "Expected at least six completed/accepted/merged/paid contributions");
assert(proofCount >= completedCount, "Every completed contribution should have public proof");
assert(hasBase, "Expected Base receipt readiness");
assert(hasSolana, "Expected Solana receipt readiness");

console.log("OWK-001 dashboard validation passed");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
