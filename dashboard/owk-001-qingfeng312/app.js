const DATA_URL = new URLSearchParams(window.location.search).get("data") || "./data/reputation-sample.json";

const state = {
  contributors: [],
  scored: [],
  selectedId: null,
  filters: {
    search: "",
    category: "all",
    status: "all",
    sort: "score"
  }
};

const weights = {
  completion: 34,
  rewards: 18,
  proof: 18,
  streak: 16,
  breadth: 8,
  recency: 6
};

const els = {
  search: document.querySelector("#searchInput"),
  category: document.querySelector("#categorySelect"),
  status: document.querySelector("#statusSelect"),
  sort: document.querySelector("#sortSelect"),
  leaderboard: document.querySelector("#leaderboardBody"),
  resultCount: document.querySelector("#resultCount"),
  metricContributors: document.querySelector("#metricContributors"),
  metricCompleted: document.querySelector("#metricCompleted"),
  metricRewards: document.querySelector("#metricRewards"),
  metricCoverage: document.querySelector("#metricCoverage"),
  detailName: document.querySelector("#detailName"),
  detailWallet: document.querySelector("#detailWallet"),
  detailScore: document.querySelector("#detailScore"),
  detailCompleted: document.querySelector("#detailCompleted"),
  detailEarned: document.querySelector("#detailEarned"),
  detailStreak: document.querySelector("#detailStreak"),
  categoryBars: document.querySelector("#categoryBars"),
  proofList: document.querySelector("#proofList"),
  timeline: document.querySelector("#timeline"),
  emptyState: document.querySelector("#emptyState"),
  reload: document.querySelector("#reloadButton"),
  export: document.querySelector("#exportButton")
};

async function loadData() {
  const response = await fetch(DATA_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load reputation data: ${response.status}`);
  }
  const payload = await response.json();
  state.contributors = payload.contributors || [];
  state.scored = scoreContributors(state.contributors);
  state.selectedId = state.scored[0]?.id || null;
  hydrateCategoryFilter(payload.categories || inferCategories(state.contributors));
  render();
}

function scoreContributors(contributors) {
  const maxReward = Math.max(
    1,
    ...contributors.map((contributor) => sumRewards(completedWork(contributor)))
  );
  const maxCompleted = Math.max(
    1,
    ...contributors.map((contributor) => completedWork(contributor).length)
  );
  const maxStreak = Math.max(1, ...contributors.map((contributor) => activeWeekStreak(contributor)));

  return contributors.map((contributor) => {
    const completed = completedWork(contributor);
    const rewardTotal = sumRewards(completed);
    const categories = categoryTotals(completed);
    const proofQuality = average(completed.map(proofScore));
    const streak = activeWeekStreak(contributor);
    const recency = recencyScore(completed);
    const breadth = Math.min(1, Object.keys(categories).length / 5);
    const completion = completed.length / maxCompleted;
    const rewards = Math.sqrt(rewardTotal / maxReward);

    const score = Math.round(
      weights.completion * completion +
        weights.rewards * rewards +
        weights.proof * proofQuality +
        weights.streak * (streak / maxStreak) +
        weights.breadth * breadth +
        weights.recency * recency
    );

    return {
      ...contributor,
      completed,
      rewardTotal,
      categories,
      proofQuality,
      streak,
      score: Math.max(0, Math.min(100, score)),
      primarySkill: primarySkill(categories)
    };
  });
}

function completedWork(contributor) {
  return (contributor.contributions || []).filter((item) =>
    ["accepted", "merged", "paid"].includes(item.status)
  );
}

function sumRewards(items) {
  return items.reduce((sum, item) => sum + Number(item.rewardUsd || 0), 0);
}

function categoryTotals(items) {
  return items.reduce((totals, item) => {
    totals[item.category] = (totals[item.category] || 0) + 1;
    return totals;
  }, {});
}

function primarySkill(categories) {
  const [top] = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  return top ? top[0] : "Unverified";
}

function proofScore(item) {
  const signals = [
    Boolean(item.proofUrl),
    Boolean(item.prUrl),
    Boolean(item.txHash),
    Boolean(item.maintainerReceipt),
    item.status === "paid"
  ];
  return signals.filter(Boolean).length / signals.length;
}

function activeWeekStreak(contributor) {
  const weekKeys = (contributor.contributions || [])
    .filter((item) => item.completedAt || item.submittedAt)
    .map((item) => weekKey(new Date(item.completedAt || item.submittedAt)))
    .sort()
    .reverse();
  const uniqueWeeks = [...new Set(weekKeys)];
  if (!uniqueWeeks.length) return 0;

  let streak = 1;
  let cursor = parseWeekKey(uniqueWeeks[0]);
  for (let index = 1; index < uniqueWeeks.length; index += 1) {
    const next = parseWeekKey(uniqueWeeks[index]);
    const expected = addDays(cursor, -7);
    if (weekKey(expected) !== weekKey(next)) break;
    streak += 1;
    cursor = next;
  }
  return streak;
}

function weekKey(date) {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() - weekday + 1);
  return day.toISOString().slice(0, 10);
}

function parseWeekKey(key) {
  return new Date(`${key}T00:00:00Z`);
}

function addDays(date, days) {
  const clone = new Date(date);
  clone.setUTCDate(clone.getUTCDate() + days);
  return clone;
}

function recencyScore(items) {
  const latest = items
    .map((item) => new Date(item.completedAt || item.submittedAt || 0).getTime())
    .sort((a, b) => b - a)[0];
  if (!latest) return 0;
  const ageDays = (Date.now() - latest) / 86400000;
  return Math.max(0, Math.min(1, 1 - ageDays / 90));
}

function inferCategories(contributors) {
  return [
    ...new Set(
      contributors.flatMap((contributor) =>
        (contributor.contributions || []).map((item) => item.category).filter(Boolean)
      )
    )
  ].sort();
}

function hydrateCategoryFilter(categories) {
  const existing = new Set([...els.category.options].map((option) => option.value));
  categories.forEach((category) => {
    if (!existing.has(category)) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      els.category.append(option);
    }
  });
}

function render() {
  const filtered = filteredContributors();
  renderMetrics(filtered);
  renderLeaderboard(filtered);
  renderDetail(filtered.find((item) => item.id === state.selectedId) || filtered[0] || state.scored[0]);
  renderTimeline(filtered);
}

function filteredContributors() {
  const query = state.filters.search.trim().toLowerCase();
  return [...state.scored]
    .filter((contributor) => {
      const text = [
        contributor.handle,
        contributor.displayName,
        contributor.wallet,
        ...(contributor.contributions || []).flatMap((item) => [
          item.id,
          item.title,
          item.category,
          item.status,
          item.proofUrl,
          item.txHash
        ])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesCategory =
        state.filters.category === "all" ||
        (contributor.contributions || []).some((item) => item.category === state.filters.category);
      const matchesStatus =
        state.filters.status === "all" ||
        (contributor.contributions || []).some((item) => item.status === state.filters.status);
      return matchesQuery && matchesCategory && matchesStatus;
    })
    .sort(sortContributors);
}

function sortContributors(a, b) {
  const sorters = {
    score: () => b.score - a.score,
    earned: () => b.rewardTotal - a.rewardTotal,
    completed: () => b.completed.length - a.completed.length,
    streak: () => b.streak - a.streak
  };
  return (sorters[state.filters.sort] || sorters.score)() || a.handle.localeCompare(b.handle);
}

function renderMetrics(contributors) {
  const completed = contributors.flatMap((contributor) => contributor.completed);
  const proofs = completed.filter((item) => item.proofUrl || item.txHash || item.maintainerReceipt).length;
  els.metricContributors.textContent = String(contributors.length);
  els.metricCompleted.textContent = String(completed.length);
  els.metricRewards.textContent = money(sumRewards(completed));
  els.metricCoverage.textContent = percent(completed.length ? proofs / completed.length : 0);
}

function renderLeaderboard(contributors) {
  els.leaderboard.replaceChildren();
  els.resultCount.textContent = `${contributors.length} shown`;
  if (!contributors.length) {
    els.leaderboard.append(els.emptyState.content.cloneNode(true));
    return;
  }

  contributors.forEach((contributor, index) => {
    const row = document.createElement("tr");
    row.className = contributor.id === state.selectedId ? "is-selected" : "";
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div class="name-cell">
          <strong>${escapeHtml(contributor.displayName || contributor.handle)}</strong>
          <span>${escapeHtml(contributor.handle)} | ${shortWallet(contributor.wallet)}</span>
        </div>
      </td>
      <td>
        <div class="score-bar">
          <strong>${contributor.score}</strong>
          <span class="score-track"><span style="width:${contributor.score}%"></span></span>
        </div>
      </td>
      <td>${contributor.completed.length}</td>
      <td>${money(contributor.rewardTotal)}</td>
      <td>${contributor.streak}w</td>
      <td><span class="status">${escapeHtml(contributor.primarySkill)}</span></td>
    `;
    row.addEventListener("click", () => {
      state.selectedId = contributor.id;
      render();
    });
    els.leaderboard.append(row);
  });
}

function renderDetail(contributor) {
  if (!contributor) {
    els.detailName.textContent = "No contributor selected";
    els.detailWallet.textContent = "";
    els.detailScore.textContent = "0";
    els.detailCompleted.textContent = "0";
    els.detailEarned.textContent = "$0";
    els.detailStreak.textContent = "0w";
    els.categoryBars.replaceChildren();
    els.proofList.replaceChildren();
    return;
  }

  state.selectedId = contributor.id;
  els.detailName.textContent = contributor.displayName || contributor.handle;
  els.detailWallet.textContent = `${contributor.handle} | ${contributor.wallet}`;
  els.detailScore.textContent = String(contributor.score);
  els.detailCompleted.textContent = String(contributor.completed.length);
  els.detailEarned.textContent = money(contributor.rewardTotal);
  els.detailStreak.textContent = `${contributor.streak}w`;
  renderCategoryBars(contributor);
  renderProofList(contributor);
}

function renderCategoryBars(contributor) {
  els.categoryBars.replaceChildren();
  const max = Math.max(1, ...Object.values(contributor.categories));
  Object.entries(contributor.categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, value]) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `
        <strong>${escapeHtml(category)}</strong>
        <span class="bar-track"><span style="width:${(value / max) * 100}%"></span></span>
        <span>${value}</span>
      `;
      els.categoryBars.append(row);
    });
}

function renderProofList(contributor) {
  els.proofList.replaceChildren();
  contributor.completed
    .slice()
    .sort((a, b) => new Date(b.completedAt || b.submittedAt) - new Date(a.completedAt || a.submittedAt))
    .forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${escapeHtml(item.id)}:</strong> ${escapeHtml(item.title)}
        <br>
        <span>${escapeHtml(item.status)} | ${money(item.rewardUsd || 0)} | ${escapeHtml(item.chain || "offchain")}</span>
        <br>
        ${item.proofUrl ? `<a href="${escapeAttr(item.proofUrl)}" target="_blank" rel="noreferrer">Open proof</a>` : ""}
        ${item.txHash ? `<span>Tx: ${escapeHtml(shortHash(item.txHash))}</span>` : ""}
      `;
      els.proofList.append(li);
    });
}

function renderTimeline(contributors) {
  els.timeline.replaceChildren();
  contributors
    .flatMap((contributor) =>
      contributor.completed.map((item) => ({
        ...item,
        handle: contributor.handle,
        displayName: contributor.displayName || contributor.handle
      }))
    )
    .sort((a, b) => new Date(b.completedAt || b.submittedAt) - new Date(a.completedAt || a.submittedAt))
    .slice(0, 8)
    .forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${escapeHtml(item.displayName)}</strong> completed ${escapeHtml(item.id)}
        <br>
        <span>${dateLabel(item.completedAt || item.submittedAt)} | ${escapeHtml(item.category)} | ${money(item.rewardUsd || 0)}</span>
        ${item.proofUrl ? `<br><a href="${escapeAttr(item.proofUrl)}" target="_blank" rel="noreferrer">Review proof</a>` : ""}
      `;
      els.timeline.append(li);
    });
}

function exportCsv() {
  const rows = [
    ["rank", "handle", "wallet", "score", "completed", "earned_usdc", "streak_weeks", "primary_skill"]
  ];
  filteredContributors().forEach((contributor, index) => {
    rows.push([
      index + 1,
      contributor.handle,
      contributor.wallet,
      contributor.score,
      contributor.completed.length,
      contributor.rewardTotal,
      contributor.streak,
      contributor.primarySkill
    ]);
  });
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "owk-001-reputation.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

function shortWallet(wallet = "") {
  return wallet.length > 14 ? `${wallet.slice(0, 6)}...${wallet.slice(-6)}` : wallet;
}

function shortHash(hash = "") {
  return hash.length > 16 ? `${hash.slice(0, 8)}...${hash.slice(-8)}` : hash;
}

function dateLabel(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "unknown date";
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

els.search.addEventListener("input", (event) => {
  state.filters.search = event.target.value;
  render();
});

els.category.addEventListener("change", (event) => {
  state.filters.category = event.target.value;
  render();
});

els.status.addEventListener("change", (event) => {
  state.filters.status = event.target.value;
  render();
});

els.sort.addEventListener("change", (event) => {
  state.filters.sort = event.target.value;
  render();
});

els.reload.addEventListener("click", () => loadData().catch(showError));
els.export.addEventListener("click", exportCsv);

function showError(error) {
  els.leaderboard.innerHTML = `<tr><td colspan="7" class="empty">${escapeHtml(error.message)}</td></tr>`;
}

loadData().catch(showError);
