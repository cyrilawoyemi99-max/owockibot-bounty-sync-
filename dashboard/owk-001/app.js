(function () {
  "use strict";

  const CATEGORY_WEIGHT = {
    Security: 1.25,
    Engineering: 1.15,
    Research: 1.05,
    Design: 1,
    Content: 0.9,
    Translation: 0.85
  };

  const els = {
    dataStatus: document.getElementById("dataStatus"),
    contributorSelect: document.getElementById("contributorSelect"),
    walletSearch: document.getElementById("walletSearch"),
    refreshButton: document.getElementById("refreshButton"),
    profileName: document.getElementById("profileName"),
    profileBio: document.getElementById("profileBio"),
    profileWallet: document.getElementById("profileWallet"),
    scoreRing: document.getElementById("scoreRing"),
    reputationScore: document.getElementById("reputationScore"),
    completedCount: document.getElementById("completedCount"),
    earnedTotal: document.getElementById("earnedTotal"),
    streakCount: document.getElementById("streakCount"),
    primarySkill: document.getElementById("primarySkill"),
    expertiseBars: document.getElementById("expertiseBars"),
    proofList: document.getElementById("proofList"),
    timeline: document.getElementById("timeline"),
    bountyRows: document.getElementById("bountyRows")
  };

  let state = {
    contributors: [],
    selectedId: null,
    source: "sample"
  };

  async function fetchJson(url) {
    const response = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async function loadData() {
    setStatus("Loading data", false);
    const sample = await fetchJson("./data/sample-reputation.json");
    state.contributors = normalizeSample(sample);
    state.source = "sample";

    try {
      const remote = await fetchJson("https://owockibot.xyz/api/bounties?status=completed");
      const remoteContributors = normalizeRemote(remote);
      if (remoteContributors.length > 0) {
        state.contributors = mergeContributors(state.contributors, remoteContributors);
        state.source = "sample plus live API";
      }
    } catch (error) {
      state.source = "sample";
    }

    if (!state.selectedId || !state.contributors.some((item) => item.id === state.selectedId)) {
      state.selectedId = state.contributors[0] ? state.contributors[0].id : null;
    }

    renderOptions();
    render();
    setStatus(state.source === "sample" ? "Sample data active" : "Live API merged", state.source !== "sample");
  }

  function normalizeSample(payload) {
    return Array.isArray(payload.contributors) ? payload.contributors.map(normalizeContributor) : [];
  }

  function normalizeRemote(payload) {
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload.bounties) ? payload.bounties : [];
    const byWallet = new Map();

    rows.filter((row) => String(row.status || "").toLowerCase() === "completed").forEach((row) => {
      const wallet = row.completedBy || row.claimedBy || row.wallet || row.contributorWallet || "unknown";
      const key = String(wallet).toLowerCase();
      if (!byWallet.has(key)) {
        byWallet.set(key, {
          id: `remote-${key.replace(/[^a-z0-9]+/g, "-")}`,
          display_name: shortIdentity(wallet),
          wallet,
          joined_at: row.postedAt || row.createdAt || row.deadline || "",
          last_active: row.completedAt || row.updatedAt || "",
          bio: "Completed owockibot contributor activity from the public bounty API.",
          proofs: [],
          completed_bounties: []
        });
      }

      byWallet.get(key).completed_bounties.push({
        id: row.id || row.bountyId || row.slug || "remote",
        title: row.title || "Completed bounty",
        category: row.category || "General",
        reward: Number(row.reward || row.amount || 0),
        currency: row.currency || "USDC",
        completed_at: dateOnly(row.completedAt || row.updatedAt || row.deadline),
        proof_url: row.url || row.issueUrl || row.proofUrl || "",
        tx_hash: row.txHash || row.transactionHash || ""
      });
    });

    return Array.from(byWallet.values()).map(normalizeContributor);
  }

  function normalizeContributor(contributor) {
    const completed = Array.isArray(contributor.completed_bounties) ? contributor.completed_bounties : [];
    return {
      id: contributor.id || contributor.wallet || contributor.display_name || cryptoRandomId(),
      display_name: contributor.display_name || shortIdentity(contributor.wallet || "Contributor"),
      wallet: contributor.wallet || "",
      joined_at: dateOnly(contributor.joined_at),
      last_active: dateOnly(contributor.last_active),
      bio: contributor.bio || "",
      proofs: Array.isArray(contributor.proofs) ? contributor.proofs : [],
      completed_bounties: completed.map((bounty) => ({
        id: bounty.id || "",
        title: bounty.title || "Completed bounty",
        category: bounty.category || "General",
        reward: Number(bounty.reward || 0),
        currency: bounty.currency || "USDC",
        completed_at: dateOnly(bounty.completed_at),
        proof_url: bounty.proof_url || "",
        tx_hash: bounty.tx_hash || ""
      }))
    };
  }

  function mergeContributors(sample, remote) {
    const merged = new Map(sample.map((item) => [String(item.wallet || item.id).toLowerCase(), item]));
    remote.forEach((item) => {
      const key = String(item.wallet || item.id).toLowerCase();
      if (!merged.has(key)) {
        merged.set(key, item);
      }
    });
    return Array.from(merged.values());
  }

  function renderOptions() {
    els.contributorSelect.replaceChildren();
    state.contributors.forEach((contributor) => {
      const option = document.createElement("option");
      option.value = contributor.id;
      option.textContent = `${contributor.display_name} - ${shortIdentity(contributor.wallet)}`;
      els.contributorSelect.append(option);
    });
    els.contributorSelect.value = state.selectedId || "";
  }

  function render() {
    const contributor = currentContributor();
    if (!contributor) {
      return;
    }

    const metrics = buildMetrics(contributor);
    els.profileName.textContent = contributor.display_name;
    els.profileBio.textContent = contributor.bio;
    els.profileWallet.textContent = contributor.wallet;
    els.reputationScore.textContent = String(metrics.score);
    els.scoreRing.style.setProperty("--score", `${Math.min(metrics.score, 100) * 3.6}deg`);
    els.completedCount.textContent = String(metrics.completed);
    els.earnedTotal.textContent = money(metrics.earned);
    els.streakCount.textContent = String(metrics.streak);
    els.primarySkill.textContent = metrics.primarySkill;

    renderBars(metrics.categoryTotals, metrics.earned);
    renderProofs(contributor);
    renderTimeline(contributor.completed_bounties);
    renderRows(contributor.completed_bounties);
  }

  function currentContributor() {
    return state.contributors.find((item) => item.id === state.selectedId) || state.contributors[0];
  }

  function buildMetrics(contributor) {
    const bounties = [...contributor.completed_bounties].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
    const categoryTotals = new Map();
    let weighted = 0;
    let earned = 0;

    bounties.forEach((bounty) => {
      const reward = Number(bounty.reward || 0);
      earned += reward;
      weighted += Math.sqrt(Math.max(reward, 0)) * 6 * (CATEGORY_WEIGHT[bounty.category] || 1);
      categoryTotals.set(bounty.category, (categoryTotals.get(bounty.category) || 0) + reward);
    });

    const streak = activeWeekStreak(bounties);
    const diversityBonus = categoryTotals.size * 4;
    const proofBonus = Math.min((contributor.proofs.length + bounties.filter((b) => b.tx_hash).length) * 4, 18);
    const score = Math.min(100, Math.round(weighted + streak * 5 + diversityBonus + proofBonus));
    const primarySkill = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    return {
      completed: bounties.length,
      earned,
      streak,
      score,
      primarySkill,
      categoryTotals
    };
  }

  function activeWeekStreak(bounties) {
    const weeks = new Set(bounties.map((bounty) => weekKey(bounty.completed_at)).filter(Boolean));
    if (weeks.size === 0) {
      return 0;
    }
    const sorted = Array.from(weeks).sort().reverse();
    let streak = 1;
    for (let i = 1; i < sorted.length; i += 1) {
      if (weekDistance(sorted[i - 1], sorted[i]) === 1) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }

  function renderBars(categoryTotals, earned) {
    els.expertiseBars.replaceChildren();
    const rows = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);
    rows.forEach(([category, value]) => {
      const row = document.createElement("div");
      row.className = "bar-row";

      const meta = document.createElement("div");
      meta.className = "bar-meta";

      const label = document.createElement("strong");
      label.textContent = category;
      const amount = document.createElement("span");
      amount.textContent = money(value);
      meta.append(label, amount);

      const track = document.createElement("div");
      track.className = "bar-track";
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = `${earned > 0 ? Math.max(6, Math.round((value / earned) * 100)) : 0}%`;
      track.append(fill);

      row.append(meta, track);
      els.expertiseBars.append(row);
    });
  }

  function renderProofs(contributor) {
    els.proofList.replaceChildren();
    const proofs = [
      ...contributor.proofs,
      ...contributor.completed_bounties.filter((bounty) => bounty.tx_hash).map((bounty) => ({
        kind: "payout",
        label: `${bounty.id} payout`,
        tx_hash: bounty.tx_hash,
        status: "settled"
      }))
    ].slice(0, 5);

    proofs.forEach((proof) => {
      const item = document.createElement("div");
      item.className = "proof-item";
      const label = document.createElement(proof.url ? "a" : "strong");
      label.textContent = proof.label || proof.kind || "Proof";
      if (proof.url) {
        label.href = proof.url;
      }
      const detail = document.createElement("span");
      detail.textContent = proof.tx_hash || proof.status || proof.url || "";
      item.append(label, detail);
      els.proofList.append(item);
    });
  }

  function renderTimeline(bounties) {
    els.timeline.replaceChildren();
    [...bounties]
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .forEach((bounty) => {
        const item = document.createElement("li");
        const time = document.createElement("time");
        time.dateTime = bounty.completed_at;
        time.textContent = humanDate(bounty.completed_at);
        const title = document.createElement("strong");
        title.textContent = bounty.title;
        const meta = document.createElement("span");
        meta.textContent = `${bounty.category} / ${money(bounty.reward)} ${bounty.currency}`;
        item.append(time, title, meta);
        els.timeline.append(item);
      });
  }

  function renderRows(bounties) {
    els.bountyRows.replaceChildren();
    [...bounties]
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .forEach((bounty) => {
        const row = document.createElement("tr");
        row.append(
          cell(`${bounty.id} - ${bounty.title}`),
          tagCell(bounty.category),
          cell(`${money(bounty.reward)} ${bounty.currency}`),
          cell(humanDate(bounty.completed_at)),
          linkCell(bounty.proof_url, bounty.tx_hash ? shortIdentity(bounty.tx_hash) : "View")
        );
        els.bountyRows.append(row);
      });
  }

  function cell(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
  }

  function tagCell(text) {
    const td = document.createElement("td");
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    td.append(tag);
    return td;
  }

  function linkCell(url, text) {
    const td = document.createElement("td");
    if (!url) {
      td.textContent = "-";
      return td;
    }
    const link = document.createElement("a");
    link.href = url;
    link.textContent = text;
    td.append(link);
    return td;
  }

  function setStatus(text, live) {
    els.dataStatus.textContent = text;
    els.dataStatus.classList.toggle("is-live", Boolean(live));
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function humanDate(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return "Unknown";
    }
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  function dateOnly(value) {
    if (!value) {
      return "";
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
  }

  function shortIdentity(value) {
    const text = String(value || "");
    if (text.length <= 16) {
      return text || "-";
    }
    return `${text.slice(0, 8)}...${text.slice(-6)}`;
  }

  function weekKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    const day = firstThursday.getUTCDay() || 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() + 4 - day);
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const targetDay = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - targetDay);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
    return `${target.getUTCFullYear()}-${String(week).padStart(2, "0")}`;
  }

  function weekDistance(a, b) {
    const [ay, aw] = a.split("-").map(Number);
    const [by, bw] = b.split("-").map(Number);
    return (ay * 53 + aw) - (by * 53 + bw);
  }

  function cryptoRandomId() {
    if (window.crypto?.getRandomValues) {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return `contributor-${buffer[0].toString(16)}`;
    }
    return `contributor-${Math.random().toString(16).slice(2)}`;
  }

  els.contributorSelect.addEventListener("change", (event) => {
    state.selectedId = event.target.value;
    render();
  });

  els.walletSearch.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    if (!query) {
      return;
    }
    const match = state.contributors.find((contributor) => (
      contributor.wallet.toLowerCase().includes(query) ||
      contributor.display_name.toLowerCase().includes(query)
    ));
    if (match) {
      state.selectedId = match.id;
      els.contributorSelect.value = match.id;
      render();
    }
  });

  els.refreshButton.addEventListener("click", () => {
    loadData().catch((error) => {
      setStatus(`Refresh failed: ${error.message}`, false);
    });
  });

  loadData().catch((error) => {
    setStatus(`Load failed: ${error.message}`, false);
  });
}());
