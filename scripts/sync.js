// owockibot → GitHub Issues sync
// Polls the bounty board API and mirrors open bounties as GitHub Issues.
// Supports demo mode for first-run demonstration.

const https = require('https');
const http  = require('http');

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
const GITHUB_REPO   = process.env.GITHUB_REPO;   // "owner/repo"
const DEMO_MODE     = process.env.DEMO_MODE === 'true';
const API_BASE      = process.env.OWOCKIBOT_API_URL || 'https://owockibot.xyz/api';

if (!GITHUB_TOKEN || !GITHUB_REPO) {
  console.error('Missing GITHUB_TOKEN or GITHUB_REPO');
  process.exit(1);
}

const MOCK_BOUNTIES = [
  {
    id: 'owk-001',
    title: 'Build an onchain reputation dashboard for contributors',
    description: 'Create a web dashboard that visualises a contributor\'s onchain reputation across owockibot bounties. Should show completed work, streaks, and category expertise. Stack is open — deploy to GitHub Pages or Vercel.',
    reward: 750,
    currency: 'USDC',
    deadline: offsetDate(14),
    category: 'Engineering',
    status: 'open',
    url: 'https://owockibot.xyz/bounty/owk-001',
    postedAt: offsetDate(-2),
  },
  {
    id: 'owk-002',
    title: 'Write a Twitter/X thread series on public goods funding',
    description: 'Produce a 5-part thread series covering the history and future of public goods funding in crypto. Each thread should be 10–15 tweets, well-sourced, and end with a clear CTA.',
    reward: 200,
    currency: 'USDC',
    deadline: offsetDate(21),
    category: 'Content',
    status: 'open',
    url: 'https://owockibot.xyz/bounty/owk-002',
    postedAt: offsetDate(-1),
  },
  {
    id: 'owk-003',
    title: 'Translate contributor docs into Portuguese (Brazil)',
    description: 'Translate the full owockibot contributor documentation into Brazilian Portuguese. Maintain all formatting, code examples, and links. Submit as a PR to the docs repo.',
    reward: 150,
    currency: 'USDC',
    deadline: offsetDate(10),
    category: 'Translation',
    status: 'open',
    url: 'https://owockibot.xyz/bounty/owk-003',
    postedAt: offsetDate(-3),
  },
  {
    id: 'owk-004',
    title: 'Design a contributor badge system (SVG assets)',
    description: 'Design a set of 8 contributor badges awarded for milestones. Deliver as optimised SVGs with a style guide.',
    reward: 400,
    currency: 'USDC',
    deadline: offsetDate(7),
    category: 'Design',
    status: 'open',
    url: 'https://owockibot.xyz/bounty/owk-004',
    postedAt: offsetDate(-1),
  },
  {
    id: 'owk-005',
    title: 'Security audit — bounty escrow smart contract',
    description: 'Perform a manual security review of the owockibot escrow contract on Base. Deliver a written report covering vulnerabilities found with severity ratings and recommendations.',
    reward: 1200,
    currency: 'USDC',
    deadline: offsetDate(30),
    category: 'Security',
    status: 'open',
    url: 'https://owockibot.xyz/bounty/owk-005',
    postedAt: offsetDate(-5),
  },
  {
    id: 'owk-006',
    title: 'Community call recap — June 2026',
    description: 'Write a detailed recap of the June 2026 owockibot community call. Include key decisions, action items, and a TL;DR summary.',
    reward: 75,
    currency: 'USDC',
    deadline: offsetDate(3),
    category: 'Content',
    status: 'claimed',
    claimedBy: '0xaBcD...1234',
    url: 'https://owockibot.xyz/bounty/owk-006',
    postedAt: offsetDate(-7),
  },
];

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function rewardTierLabel(reward) {
  if (reward >= 1000) return { name: 'reward: 💎 $1000+', color: '7c3aed', description: 'Bounty reward $1000 or above' };
  if (reward >= 500)  return { name: 'reward: 🥇 $500+',  color: '2563eb', description: 'Bounty reward $500–$999' };
  if (reward >= 200)  return { name: 'reward: 🥈 $200+',  color: '0891b2', description: 'Bounty reward $200–$499' };
  return                     { name: 'reward: 🥉 <$200',  color: '6b7280', description: 'Bounty reward under $200' };
}

const CATEGORY_COLORS = {
  Engineering: '6d28d9', Content: '0369a1', Design: 'be185d',
  Research: 'b45309', Security: 'dc2626', Translation: '047857',
};

function categoryLabel(cat) {
  return { name: `category: ${cat}`, color: CATEGORY_COLORS[cat] || '374151', description: `Bounty category: ${cat}` };
}

const STATUS_LABELS = {
  open:      { name: 'status: open',      color: '16a34a', description: 'Bounty is open for claims' },
  claimed:   { name: 'status: claimed',   color: 'd97706', description: 'Bounty has been claimed' },
  completed: { name: 'status: completed', color: '6b7280', description: 'Bounty has been completed' },
};

const OWOCKIBOT_LABEL = {
  name: 'owockibot',
  color: '00e887',
  description: 'Synced automatically from owockibot.xyz bounty board',
};

function githubRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'owockibot-bounty-sync/1.0',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 400) reject(new Error(`GitHub API ${res.statusCode}: ${JSON.stringify(parsed)}`));
          else resolve(parsed);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function ensureLabel(owner, repo, label) {
  try {
    await githubRequest('GET', `/repos/${owner}/${repo}/labels/${encodeURIComponent(label.name)}`);
  } catch {
    try {
      await githubRequest('POST', `/repos/${owner}/${repo}/labels`, label);
      console.log(`  Created label: ${label.name}`);
    } catch (e) { console.warn(`  Could not create label "${label.name}": ${e.message}`); }
  }
}

async function getExistingIssues(owner, repo) {
  return githubRequest('GET', `/repos/${owner}/${repo}/issues?state=all&labels=owockibot&per_page=100`);
}

function buildIssueBody(b) {
  const claimLine = b.claimedBy ? `\n> 🔒 **Claimed by:** \`${b.claimedBy}\`` : '';
  return `## ${b.title}

${b.description}

---

| Field | Value |
|---|---|
| **Reward** | $${b.reward} ${b.currency} |
| **Category** | ${b.category} |
| **Deadline** | ${b.deadline || 'Open'} |
| **Status** | ${b.status} |
| **Bounty ID** | \`${b.id}\` |
${claimLine}

---

🔗 **[View on owockibot.xyz →](${b.url})**

> _This issue is automatically synced from the [owockibot bounty board](https://owockibot.xyz/bounty). Do not edit manually._
`;
}

function fetchBounties() {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}/bounties?status=open`;
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'owockibot-bounty-sync/1.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { const p = JSON.parse(data); resolve(p.bounties || p); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const [owner, repo] = GITHUB_REPO.split('/');
  console.log(`\n🤖 owockibot bounty sync`);
  console.log(`   Repo: ${GITHUB_REPO}`);
  console.log(`   Mode: ${DEMO_MODE ? 'DEMO' : 'LIVE'}\n`);

  let bounties;
  if (DEMO_MODE) {
    console.log('📦 Using mock bounty data (demo mode)');
    bounties = MOCK_BOUNTIES;
  } else {
    console.log('🌐 Fetching from owockibot API...');
    try {
      bounties = await fetchBounties();
      if (!Array.isArray(bounties) || !bounties.length) throw new Error('Empty response');
      console.log(`✅ Fetched ${bounties.length} bounties`);
    } catch (e) {
      console.warn(`⚠️  API unavailable (${e.message}), falling back to mock data`);
      bounties = MOCK_BOUNTIES;
    }
  }

  console.log('\n🏷️  Ensuring labels exist...');
  const allLabels = [
    OWOCKIBOT_LABEL,
    ...Object.values(STATUS_LABELS),
    rewardTierLabel(0), rewardTierLabel(200), rewardTierLabel(500), rewardTierLabel(1000),
    ...Object.keys(CATEGORY_COLORS).map(categoryLabel),
  ];
  for (const label of allLabels) await ensureLabel(owner, repo, label);

  console.log('\n🔍 Loading existing synced issues...');
  const existing = await getExistingIssues(owner, repo);
  const issueByBountyId = {};
  for (const issue of existing) {
    const match = issue.body && issue.body.match(/`(owk-[^`]+)`/);
    if (match) issueByBountyId[match[1]] = issue;
  }

  console.log('\n🔄 Syncing bounties...\n');
  let created = 0, updated = 0, skipped = 0;

  for (const b of bounties) {
    const labels = [OWOCKIBOT_LABEL.name, rewardTierLabel(b.reward).name, categoryLabel(b.category).name, (STATUS_LABELS[b.status] || STATUS_LABELS.open).name];
    const body  = buildIssueBody(b);
    const state = b.status === 'completed' ? 'closed' : 'open';

    if (issueByBountyId[b.id]) {
      const issue = issueByBountyId[b.id];
      if (issue.body !== body || issue.state !== state || !labels.every(l => issue.labels.some(il => il.name === l))) {
        await githubRequest('PATCH', `/repos/${owner}/${repo}/issues/${issue.number}`, { title: `[owockibot] ${b.title}`, body, labels, state });
        console.log(`  ✏️  Updated  #${issue.number} — ${b.title.slice(0, 55)}`);
        updated++;
      } else {
        console.log(`  ⏭️  Skipped  #${issue.number} — no changes`);
        skipped++;
      }
    } else {
      const issue = await githubRequest('POST', `/repos/${owner}/${repo}/issues`, { title: `[owockibot] ${b.title}`, body, labels });
      if (state === 'closed') await githubRequest('PATCH', `/repos/${owner}/${repo}/issues/${issue.number}`, { state: 'closed' });
      console.log(`  ✅ Created  #${issue.number} — ${b.title.slice(0, 55)}`);
      created++;
    }
  }

  console.log(`\n📊 Done — Created: ${created}  Updated: ${updated}  Skipped: ${skipped}\n`);
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
