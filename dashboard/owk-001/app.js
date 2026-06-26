const DEFAULT_REPO = "cyrilawoyemi99-max/owockibot-bounty-sync-";
const RECEIPT_URL = "./data/receipts.example.json";

const fallbackIssues = [
  {
    number: 1,
    title: "[owockibot] Build an onchain reputation dashboard for contributors",
    state: "open",
    url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/1",
    createdAt: "2026-06-17T23:00:57Z",
    updatedAt: "2026-06-26T02:36:40Z",
    bountyId: "owk-001",
    category: "Engineering",
    reward: 750,
    status: "open",
    comments: [
      {
        author: "gchahal1982",
        createdAt: "2026-06-18T00:10:35Z",
        body: "Submitted implementation for owk-001: PR: https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/pull/8",
        url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/1#issuecomment-4736643856",
      },
      {
        author: "jaxassistant55",
        createdAt: "2026-06-18T11:31:53Z",
        body: "Submitted alternate implementation for `owk-001`: PR: https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/pull/13",
        url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/1#issuecomment-4741503603",
      },
    ],
  },
  {
    number: 2,
    title: "[owockibot] Public goods funding thread series",
    state: "open",
    url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/2",
    createdAt: "2026-06-17T23:00:58Z",
    updatedAt: "2026-06-18T00:17:28Z",
    bountyId: "owk-002",
    category: "Content",
    reward: 250,
    status: "open",
    comments: [
      {
        author: "gchahal1982",
        createdAt: "2026-06-18T00:17:28Z",
        body: "Submitted public goods funding thread series for owk-002: https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/pull/9",
        url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/2#issuecomment-4736697195",
      },
    ],
  },
  {
    number: 3,
    title: "[owockibot] Translate contributor docs into Portuguese (Brazil)",
    state: "open",
    url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/3",
    createdAt: "2026-06-17T23:00:58Z",
    updatedAt: "2026-06-26T02:36:41Z",
    bountyId: "owk-003",
    category: "Translation",
    reward: 150,
    status: "open",
    comments: [
      {
        author: "gchahal1982",
        createdAt: "2026-06-18T00:38:12Z",
        body: "Claim for bounty `owk-003`: Brazilian Portuguese contributor docs translation. PR: https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/pull/10",
        url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/3#issuecomment-4736767786",
      },
      {
        author: "jaxassistant55",
        createdAt: "2026-06-18T11:39:22Z",
        body: "Submitted alternate deliverable for `owk-003`: PR: https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/pull/15",
        url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/3#issuecomment-4741563569",
      },
      {
        author: "GautamKumarOffical",
        createdAt: "2026-06-22T06:25:59Z",
        body: "PR submitted: https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/pull/16",
        url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/3#issuecomment-4765503252",
      },
    ],
  },
  {
    number: 5,
    title: "[owockibot] Security audit - bounty escrow smart contract",
    state: "open",
    url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/5",
    createdAt: "2026-06-17T23:00:59Z",
    updatedAt: "2026-06-26T14:53:25Z",
    bountyId: "owk-005",
    category: "Security",
    reward: 1200,
    status: "open",
    comments: [
      {
        author: "securityreview-lab",
        createdAt: "2026-06-24T12:08:00Z",
        body: "Audit notes and proof package pending maintainer review.",
        url: "https://github.com/cyrilawoyemi99-max/owockibot-bounty-sync-/issues/5",
      },
    ],
  },
];

const state = {
  issues: fallbackIssues,
  receipts: [],
  contributors: [],
  filtered: [],
  selected: null,
  source: "fallback",
};

const els = {
  sourceStatus: document.querySelector("#sourceStatus"),
  repoInput: document.querySelector("#repoInput"),
  refreshButton: document.querySelector("#refreshButton"),
  exportButton: document.querySelector("#exportButton"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  scoreFilter: document.querySelector("#scoreFilter"),
  scoreFilterLabel: document.querySelector("#scoreFilterLabel"),
  completedOnly: document.querySelector("#completedOnly"),
  resetFilters: document.querySelector("#resetFilters"),
  statContributors: document.querySelector("#statContributors"),
  statBounties: document.querySelector("#statBounties"),
  statReward: document.querySelector("#statReward"),
  statProofs: document.querySelector("#statProofs"),
  lastUpdated: document.querySelector("#lastUpdated"),
  notice: document.querySelector("#notice"),
  rows: document.querySelector("#leaderboardRows"),
  emptyState: document.querySelector("#emptyState"),
  closeDetail: document.querySelector("#closeDetail"),
  profileAvatar: document.querySelector("#profileAvatar"),
  profileName: document.querySelector("#profileName"),
  profileMeta: document.querySelector("#profileMeta"),
  profileScore: document.querySelector("#profileScore"),
  categoryBars: document.querySelector("#categoryBars"),
  factCompleted: document.querySelector("#factCompleted"),
  factProofs: document.querySelector("#factProofs"),
  factReward: document.querySelector("#factReward"),
  factFirstProof: document.querySelector("#factFirstProof"),
  proofLedger: document.querySelector("#proofLedger"),
};

init();

async function init() {
  bindEvents();
  state.receipts = await loadReceiptFile();
  rebuild("Loaded bundled sample data. Click Refresh now to pull public GitHub data.", "warning");
}

function bindEvents() {
  els.refreshButton.addEventListener("click", refreshLiveData);
  els.exportButton.addEventListener("click", exportCsv);
  els.searchInput.addEventListener("input", applyFilters);
  els.categoryFilter.addEventListener("change", applyFilters);
  els.scoreFilter.addEventListener("input", () => {
    els.scoreFilterLabel.textContent = `${Number(els.scoreFilter.value).toLocaleString()}+`;
    applyFilters();
  });
  els.completedOnly.addEventListener("change", applyFilters);
  els.resetFilters.addEventListener("click", () => {
    els.searchInput.value = "";
    els.categoryFilter.value = "all";
    els.scoreFilter.value = "0";
    els.scoreFilterLabel.textContent = "0+";
    els.completedOnly.checked = false;
    applyFilters();
  });
  els.closeDetail.addEventListener("click", () => {
    state.selected = state.filtered[0] || null;
    renderDetail();
    renderRows();
  });
}

async function refreshLiveData() {
  const repo = els.repoInput.value.trim() || DEFAULT_REPO;
  setNotice("Fetching public issues, comments, and PR metadata from GitHub...", "");
  els.sourceStatus.textContent = "Syncing";
  els.refreshButton.disabled = true;

  try {
    const issues = await fetchMirrorIssues(repo);
    if (!issues.length) {
      throw new Error("No owockibot issues were returned by GitHub.");
    }
    state.issues = issues;
    state.source = "live";
    rebuild(`Live sync complete for ${repo}.`, "");
  } catch (error) {
    state.source = "fallback";
    rebuild(`Live sync failed: ${error.message}. Showing bundled sample data.`, "error");
  } finally {
    els.refreshButton.disabled = false;
  }
}

async function fetchMirrorIssues(repo) {
  const issueUrl = `https://api.github.com/repos/${repo}/issues?state=all&labels=owockibot&per_page=100`;
  const rawIssues = await fetchJson(issueUrl);
  const issues = rawIssues.filter((issue) => !issue.pull_request);
  const enriched = await Promise.all(
    issues.map(async (issue) => {
      const comments = await fetchJson(issue.comments_url);
      const parsed = parseIssue(issue);
      parsed.comments = comments.map((comment) => ({
        author: comment.user?.login || "unknown",
        createdAt: comment.created_at,
        body: comment.body || "",
        url: comment.html_url,
      }));
      parsed.prs = await fetchLinkedPulls(repo, parsed.comments);
      return parsed;
    }),
  );
  return enriched;
}

async function fetchLinkedPulls(repo, comments) {
  const urls = new Set();
  comments.forEach((comment) => {
    for (const url of comment.body.matchAll(/https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/pull\/(\d+)/g)) {
      urls.add(url[0]);
    }
  });

  const pulls = [];
  for (const url of urls) {
    const match = url.match(/github\.com\/([^/\s]+\/[^/\s]+)\/pull\/(\d+)/);
    if (!match) continue;
    const [, linkedRepo, number] = match;
    const apiRepo = linkedRepo || repo;
    try {
      const pr = await fetchJson(`https://api.github.com/repos/${apiRepo}/pulls/${number}`);
      pulls.push({
        number: pr.number,
        repo: apiRepo,
        title: pr.title,
        state: pr.state,
        merged: Boolean(pr.merged_at),
        url: pr.html_url,
        author: pr.user?.login || "unknown",
        createdAt: pr.created_at,
      });
    } catch {
      pulls.push({
        number: Number(number),
        repo: apiRepo,
        title: `Pull request #${number}`,
        state: "unknown",
        merged: false,
        url,
        author: "unknown",
        createdAt: null,
      });
    }
  }
  return pulls;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function loadReceiptFile() {
  try {
    const response = await fetch(RECEIPT_URL, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload.receipts) ? payload.receipts : [];
  } catch {
    return [];
  }
}

function parseIssue(issue) {
  const body = issue.body || "";
  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    url: issue.html_url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    bountyId: extractField(body, "Bounty ID") || `issue-${issue.number}`,
    category: extractField(body, "Category") || labelValue(issue.labels, "category:") || "Uncategorized",
    reward: parseReward(extractField(body, "Reward") || labelValue(issue.labels, "reward:") || "0"),
    status: extractField(body, "Status") || labelValue(issue.labels, "status:") || issue.state,
    comments: [],
    prs: [],
  };
}

function extractField(body, label) {
  const tableMatch = body.match(new RegExp(`\\| \\*\\*${label}\\*\\* \\| ([^|]+)\\|`, "i"));
  if (tableMatch) return tableMatch[1].replace(/`/g, "").trim();
  const lineMatch = body.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i"));
  return lineMatch ? lineMatch[1].replace(/`/g, "").trim() : "";
}

function labelValue(labels, prefix) {
  const label = labels?.find((item) => item.name?.toLowerCase().startsWith(prefix));
  return label ? label.name.slice(prefix.length).trim() : "";
}

function parseReward(value) {
  const match = String(value).replace(/,/g, "").match(/\$?\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function rebuild(message, tone) {
  state.contributors = buildContributors(state.issues, state.receipts);
  populateCategoryFilter();
  applyFilters();
  renderStats();
  setNotice(message, tone);
  els.sourceStatus.textContent = state.source === "live" ? "Live data loaded" : "Sample data loaded";
  els.lastUpdated.textContent = `Updated ${new Date().toLocaleString()}`;
}

function buildContributors(issues, receipts) {
  const contributors = new Map();

  issues.forEach((issue) => {
    const proofComments = issue.comments.filter(isProofComment);
    proofComments.forEach((comment) => {
      const contributor = getContributor(contributors, comment.author);
      const linkedPrs = (issue.prs || []).filter((pr) => {
        return pr.author === comment.author || comment.body.includes(`/pull/${pr.number}`);
      });
      const receiptMatches = receipts.filter((receipt) => {
        return receipt.contributor?.toLowerCase() === comment.author.toLowerCase() && receipt.bountyId === issue.bountyId;
      });
      const completed = issue.state === "closed" || issue.status.toLowerCase() === "completed" || linkedPrs.some((pr) => pr.merged) || receiptMatches.length > 0;
      const bountyKey = issue.bountyId || `issue-${issue.number}`;

      contributor.proofs.push({
        type: completed ? "Completed proof" : "Submitted proof",
        title: issue.title.replace(/^\[owockibot\]\s*/i, ""),
        bountyId: issue.bountyId,
        category: issue.category,
        reward: issue.reward,
        completed,
        commentUrl: comment.url,
        issueUrl: issue.url,
        prUrls: linkedPrs.map((pr) => pr.url),
        receiptUrls: receiptMatches.map((receipt) => receipt.receiptUrl).filter(Boolean),
        date: comment.createdAt,
      });

      if (!contributor.bountyIds.has(bountyKey)) {
        contributor.bountyIds.add(bountyKey);
        contributor.categories[issue.category] = (contributor.categories[issue.category] || 0) + 1;
        contributor.eligibleReward += issue.reward;
      }

      if (completed && !contributor.completedBountyIds.has(bountyKey)) {
        contributor.completedBountyIds.add(bountyKey);
        contributor.completed += 1;
        contributor.awardedReward += sum(receiptMatches.map((receipt) => Number(receipt.amountUsdc || issue.reward)));
      }
    });
  });

  return Array.from(contributors.values())
    .map((contributor) => {
      contributor.proofs.sort((a, b) => new Date(b.date) - new Date(a.date));
      contributor.streak = computeWeeklyStreak(contributor.proofs);
      contributor.score = computeScore(contributor);
      contributor.topCategories = Object.entries(contributor.categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);
      return contributor;
    })
    .sort((a, b) => b.score - a.score || b.proofs.length - a.proofs.length);
}

function isProofComment(comment) {
  return /(submitted|claim|claiming|pr:|pull\/\d+)/i.test(comment.body || "");
}

function getContributor(map, login) {
  if (!map.has(login)) {
    map.set(login, {
      login,
      avatar: `https://github.com/${encodeURIComponent(login)}.png?size=96`,
      profileUrl: `https://github.com/${encodeURIComponent(login)}`,
      completed: 0,
      proofs: [],
      categories: {},
      bountyIds: new Set(),
      completedBountyIds: new Set(),
      eligibleReward: 0,
      awardedReward: 0,
      streak: 0,
      score: 0,
      topCategories: [],
    });
  }
  return map.get(login);
}

function computeWeeklyStreak(proofs) {
  const weeks = new Set(
    proofs.map((proof) => {
      const date = new Date(proof.date);
      const firstDay = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      return `${date.getUTCFullYear()}-${Math.ceil(((date - firstDay) / 86400000 + firstDay.getUTCDay() + 1) / 7)}`;
    }),
  );
  return weeks.size;
}

function computeScore(contributor) {
  const categoryBreadth = Object.keys(contributor.categories).length;
  return Math.round(
    contributor.completed * 450 +
      contributor.proofs.length * 90 +
      contributor.eligibleReward * 0.35 +
      contributor.awardedReward * 0.75 +
      contributor.streak * 45 +
      categoryBreadth * 120,
  );
}

function applyFilters() {
  const query = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const minScore = Number(els.scoreFilter.value);
  const completedOnly = els.completedOnly.checked;

  state.filtered = state.contributors.filter((contributor) => {
    const matchesQuery = !query || contributor.login.toLowerCase().includes(query);
    const matchesCategory = category === "all" || contributor.categories[category];
    const matchesScore = contributor.score >= minScore;
    const matchesCompleted = !completedOnly || contributor.completed > 0;
    return matchesQuery && matchesCategory && matchesScore && matchesCompleted;
  });

  if (!state.filtered.includes(state.selected)) {
    state.selected = state.filtered[0] || null;
  }

  renderRows();
  renderDetail();
}

function renderRows() {
  els.rows.innerHTML = "";
  state.filtered.forEach((contributor, index) => {
    const row = document.createElement("tr");
    row.className = contributor === state.selected ? "is-selected" : "";
    row.addEventListener("click", () => {
      state.selected = contributor;
      renderRows();
      renderDetail();
    });
    row.innerHTML = `
      <td class="rank">${index + 1}</td>
      <td>
        <div class="contributor-cell">
          <img class="avatar" src="${escapeAttr(contributor.avatar)}" alt="" />
          <div>
            <strong>${escapeHtml(contributor.login)}</strong>
            <span>@${escapeHtml(contributor.login)}</span>
          </div>
        </div>
      </td>
      <td class="reputation">${formatNumber(contributor.score)}</td>
      <td>${formatNumber(contributor.completed)}</td>
      <td>${formatCurrency(contributor.eligibleReward)}</td>
      <td>${formatNumber(contributor.streak)} weeks</td>
      <td><div class="pill-row">${contributor.topCategories.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div></td>
      <td><a class="proof-link" href="${escapeAttr(contributor.profileUrl)}" target="_blank" rel="noreferrer">${formatNumber(contributor.proofs.length)}</a></td>
    `;
    els.rows.append(row);
  });
  els.emptyState.hidden = state.filtered.length > 0;
}

function renderDetail() {
  const contributor = state.selected;
  if (!contributor) {
    els.profileAvatar.removeAttribute("src");
    els.profileName.textContent = "No contributor selected";
    els.profileMeta.textContent = "Change filters or refresh the data source.";
    els.profileScore.textContent = "0";
    els.categoryBars.innerHTML = "";
    els.factCompleted.textContent = "0";
    els.factProofs.textContent = "0";
    els.factReward.textContent = "$0";
    els.factFirstProof.textContent = "n/a";
    els.proofLedger.innerHTML = "";
    return;
  }

  els.profileAvatar.src = contributor.avatar;
  els.profileName.textContent = contributor.login;
  els.profileMeta.textContent = `${contributor.proofs.length} proof links across ${Object.keys(contributor.categories).length} categories`;
  els.profileScore.textContent = formatNumber(contributor.score);
  els.factCompleted.textContent = formatNumber(contributor.completed);
  els.factProofs.textContent = formatNumber(contributor.proofs.length);
  els.factReward.textContent = formatCurrency(contributor.eligibleReward);
  els.factFirstProof.textContent = contributor.proofs.at(-1) ? formatDate(contributor.proofs.at(-1).date) : "n/a";

  const maxCategory = Math.max(1, ...Object.values(contributor.categories));
  els.categoryBars.innerHTML = Object.entries(contributor.categories)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => {
      const width = Math.max(12, Math.round((count / maxCategory) * 100));
      return `
        <div class="bar-row">
          <header><span>${escapeHtml(category)}</span><strong>${count}</strong></header>
          <div class="bar"><span style="width:${width}%"></span></div>
        </div>
      `;
    })
    .join("");

  els.proofLedger.innerHTML = contributor.proofs
    .map((proof) => {
      const links = [
        `<a href="${escapeAttr(proof.commentUrl)}" target="_blank" rel="noreferrer">comment</a>`,
        `<a href="${escapeAttr(proof.issueUrl)}" target="_blank" rel="noreferrer">issue</a>`,
        ...proof.prUrls.map((url, index) => `<a href="${escapeAttr(url)}" target="_blank" rel="noreferrer">PR ${index + 1}</a>`),
        ...proof.receiptUrls.map((url, index) => `<a href="${escapeAttr(url)}" target="_blank" rel="noreferrer">receipt ${index + 1}</a>`),
      ].join("");
      return `
        <article class="proof-card">
          <header>
            <strong>${escapeHtml(proof.title)}</strong>
            <span class="pill">${proof.completed ? "completed" : "submitted"}</span>
          </header>
          <p>${escapeHtml(proof.bountyId)} · ${escapeHtml(proof.category)} · ${formatCurrency(proof.reward)} · ${formatDate(proof.date)}</p>
          <div class="proof-actions">${links}</div>
        </article>
      `;
    })
    .join("");
}

function renderStats() {
  const proofCount = state.contributors.reduce((total, item) => total + item.proofs.length, 0);
  const reward = sum(state.issues.map((issue) => issue.reward));
  els.statContributors.textContent = formatNumber(state.contributors.length);
  els.statBounties.textContent = formatNumber(state.issues.length);
  els.statReward.textContent = formatCurrency(reward);
  els.statProofs.textContent = formatNumber(proofCount);
}

function populateCategoryFilter() {
  const categories = Array.from(new Set(state.issues.map((issue) => issue.category))).sort();
  const current = els.categoryFilter.value;
  els.categoryFilter.innerHTML = '<option value="all">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.categoryFilter.append(option);
  });
  els.categoryFilter.value = categories.includes(current) ? current : "all";
}

function setNotice(message, tone = "") {
  els.notice.hidden = !message;
  els.notice.textContent = message || "";
  els.notice.className = `notice ${tone || ""}`.trim();
}

function exportCsv() {
  const header = ["rank", "contributor", "reputation", "completed", "eligible_reward_usdc", "streak_weeks", "categories", "proofs"];
  const rows = state.filtered.map((contributor, index) => [
    index + 1,
    contributor.login,
    contributor.score,
    contributor.completed,
    contributor.eligibleReward,
    contributor.streak,
    contributor.topCategories.join(";"),
    contributor.proofs.length,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "owk-001-reputation.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDate(value) {
  if (!value) return "n/a";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
