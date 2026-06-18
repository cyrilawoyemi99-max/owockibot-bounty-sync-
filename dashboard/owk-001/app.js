const DEFAULT_DATA_URL = './data/sample-reputation.json';

const state = {
  data: { updatedAt: null, contributors: [] },
  selectedId: null,
  query: '',
  category: 'all',
  sort: 'score',
};

const elements = {
  dataStatus: document.getElementById('dataStatus'),
  lastUpdated: document.getElementById('lastUpdated'),
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  sortSelect: document.getElementById('sortSelect'),
  metricContributors: document.getElementById('metricContributors'),
  metricBounties: document.getElementById('metricBounties'),
  metricEarned: document.getElementById('metricEarned'),
  metricProof: document.getElementById('metricProof'),
  resultCount: document.getElementById('resultCount'),
  contributorList: document.getElementById('contributorList'),
  emptyState: document.getElementById('emptyState'),
  profileView: document.getElementById('profileView'),
  profileName: document.getElementById('profileName'),
  profileMeta: document.getElementById('profileMeta'),
  profileScore: document.getElementById('profileScore'),
  profileCompleted: document.getElementById('profileCompleted'),
  profileEarned: document.getElementById('profileEarned'),
  profileStreak: document.getElementById('profileStreak'),
  profilePrimary: document.getElementById('profilePrimary'),
  categoryNote: document.getElementById('categoryNote'),
  expertiseChart: document.getElementById('expertiseChart'),
  timeline: document.getElementById('timeline'),
  receiptDialog: document.getElementById('receiptDialog'),
  receiptBody: document.getElementById('receiptBody'),
};

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function shortWallet(wallet = '') {
  return wallet.length > 13 ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : wallet;
}

function daysBetween(a, b) {
  const day = 24 * 60 * 60 * 1000;
  const left = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const right = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((right - left) / day);
}

function weekKey(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-${String(week).padStart(2, '0')}`;
}

function computeContributor(contributor) {
  const completed = [...(contributor.completedBounties || [])]
    .filter(item => item.status === 'verified')
    .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
  const earned = completed.reduce((sum, item) => sum + Number(item.reward || 0), 0);
  const proofed = completed.filter(item => item.txHash && item.sourceUrl).length;
  const categories = completed.reduce((acc, item) => {
    const bucket = acc[item.category] || { category: item.category, count: 0, earned: 0, proofed: 0 };
    bucket.count += 1;
    bucket.earned += Number(item.reward || 0);
    if (item.txHash && item.sourceUrl) bucket.proofed += 1;
    acc[item.category] = bucket;
    return acc;
  }, {});
  const categoryList = Object.values(categories).sort((a, b) => b.earned - a.earned || b.count - a.count);
  const currentStreak = computeStreakWeeks(completed);
  const mostRecent = completed[0]?.completedAt || null;
  const recencyBoost = mostRecent ? Math.max(0, 30 - daysBetween(new Date(`${mostRecent}T00:00:00Z`), new Date())) : 0;
  const score = Math.min(100, Math.round(
    completed.length * 9 +
    Math.min(earned / 40, 34) +
    currentStreak * 7 +
    categoryList.length * 5 +
    proofed * 4 +
    recencyBoost * 0.4
  ));

  return {
    ...contributor,
    completed,
    earned,
    proofed,
    proofCoverage: completed.length ? Math.round((proofed / completed.length) * 100) : 0,
    categories: categoryList,
    currentStreak,
    mostRecent,
    score,
    primaryCategory: categoryList[0]?.category || contributor.skills?.[0] || 'Unclassified',
  };
}

function computeStreakWeeks(completed) {
  if (!completed.length) return 0;
  const weeks = [...new Set(completed.map(item => weekKey(item.completedAt)))].sort().reverse();
  let streak = 1;
  let cursor = weeks[0];
  for (let index = 1; index < weeks.length; index += 1) {
    const expected = previousWeekKey(cursor);
    if (weeks[index] !== expected) break;
    streak += 1;
    cursor = weeks[index];
  }
  return streak;
}

function previousWeekKey(key) {
  const [year, week] = key.split('-').map(Number);
  if (week > 1) return `${year}-${String(week - 1).padStart(2, '0')}`;
  const dec28 = new Date(Date.UTC(year - 1, 11, 28));
  return weekKey(dec28.toISOString().slice(0, 10));
}

function normaliseData(raw) {
  const contributors = Array.isArray(raw?.contributors) ? raw.contributors : [];
  return {
    isSample: Boolean(raw?.isSample),
    notice: raw?.notice || '',
    updatedAt: raw?.updatedAt || new Date().toISOString(),
    contributors: contributors.map(computeContributor),
  };
}

async function loadData() {
  try {
    const injected = window.OWOCKIBOT_REPUTATION_DATA;
    if (injected) {
      elements.dataStatus.textContent = 'Loaded injected reputation payload';
      return normaliseData(injected);
    }

    const params = new URLSearchParams(window.location.search);
    const url = params.get('data') || DEFAULT_DATA_URL;
    assertAllowedDataUrl(url);
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Data request failed with ${response.status}`);
    const payload = normaliseData(await response.json());
    if (payload.isSample) {
      elements.dataStatus.textContent = payload.notice || 'Loaded bundled synthetic sample data';
    } else {
      elements.dataStatus.textContent = url === DEFAULT_DATA_URL ? 'Loaded bundled reputation data' : `Loaded ${url}`;
    }
    return payload;
  } catch (error) {
    elements.dataStatus.textContent = 'Unable to load reputation data';
    showError(error);
    return normaliseData({ contributors: [] });
  }
}

function assertAllowedDataUrl(url) {
  const parsed = new URL(url, window.location.href);
  if (parsed.origin !== window.location.origin && parsed.protocol !== 'https:') {
    throw new Error('Data URL must be same-origin or HTTPS.');
  }
}

function showError(error) {
  elements.contributorList.replaceChildren();
  const panel = document.createElement('div');
  panel.className = 'error-panel';
  panel.textContent = error.message || 'Unknown dashboard error';
  elements.contributorList.append(panel);
}

function contributorsForView() {
  const query = state.query.trim().toLowerCase();
  const filtered = state.data.contributors.filter(contributor => {
    const haystack = [
      contributor.handle,
      contributor.displayName,
      contributor.wallet,
      ...(contributor.skills || []),
      ...contributor.completed.map(item => item.category),
      ...contributor.completed.map(item => item.id),
    ].join(' ').toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesCategory = state.category === 'all' || contributor.completed.some(item => item.category === state.category);
    return matchesQuery && matchesCategory;
  });

  const sorters = {
    score: (a, b) => b.score - a.score,
    earned: (a, b) => b.earned - a.earned,
    streak: (a, b) => b.currentStreak - a.currentStreak,
    recent: (a, b) => String(b.mostRecent || '').localeCompare(String(a.mostRecent || '')),
  };

  return filtered.sort(sorters[state.sort] || sorters.score);
}

function renderMetrics() {
  const contributors = state.data.contributors;
  const bounties = contributors.flatMap(contributor => contributor.completed);
  const earned = bounties.reduce((sum, bounty) => sum + Number(bounty.reward || 0), 0);
  const proofed = bounties.filter(bounty => bounty.txHash && bounty.sourceUrl).length;
  elements.metricContributors.textContent = contributors.length;
  elements.metricBounties.textContent = bounties.length;
  elements.metricEarned.textContent = currency(earned);
  elements.metricProof.textContent = bounties.length ? `${Math.round((proofed / bounties.length) * 100)}%` : '0%';
  elements.lastUpdated.textContent = new Date(state.data.updatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function renderCategoryFilter() {
  const categories = [...new Set(state.data.contributors.flatMap(contributor => contributor.completed.map(item => item.category)))].sort();
  const current = state.category;
  elements.categoryFilter.replaceChildren(new Option('All categories', 'all'));
  categories.forEach(category => elements.categoryFilter.append(new Option(category, category)));
  elements.categoryFilter.value = categories.includes(current) ? current : 'all';
  state.category = elements.categoryFilter.value;
}

function renderContributorList() {
  const contributors = contributorsForView();
  elements.resultCount.textContent = `${contributors.length} result${contributors.length === 1 ? '' : 's'}`;
  elements.contributorList.replaceChildren();

  contributors.forEach(contributor => {
    const button = document.createElement('button');
    button.className = 'contributor-card';
    button.type = 'button';
    button.setAttribute('aria-selected', String(contributor.id === state.selectedId));
    button.addEventListener('click', () => {
      state.selectedId = contributor.id;
      render();
    });

    const top = document.createElement('div');
    top.className = 'card-row';
    const name = document.createElement('strong');
    name.textContent = contributor.displayName || contributor.handle;
    const score = document.createElement('span');
    score.className = 'mini-score';
    score.textContent = `${contributor.score}`;
    top.append(name, score);

    const handle = document.createElement('div');
    handle.className = 'handle';
    handle.textContent = `@${contributor.handle} - ${shortWallet(contributor.wallet)}`;

    const tags = document.createElement('div');
    tags.className = 'tags';
    [contributor.primaryCategory, `${contributor.completed.length} completed`, currency(contributor.earned)].forEach(label => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = label;
      tags.append(tag);
    });

    button.append(top, handle, tags);
    elements.contributorList.append(button);
  });

  if (!contributors.some(contributor => contributor.id === state.selectedId)) {
    state.selectedId = contributors[0]?.id || null;
  }
}

function renderProfile() {
  const contributor = state.data.contributors.find(item => item.id === state.selectedId);
  elements.emptyState.hidden = Boolean(contributor);
  elements.profileView.hidden = !contributor;
  if (!contributor) return;

  elements.profileName.textContent = contributor.displayName || contributor.handle;
  elements.profileMeta.textContent = `@${contributor.handle} - ${shortWallet(contributor.wallet)} - ${(contributor.skills || []).join(', ')}`;
  elements.profileScore.textContent = contributor.score;
  elements.profileCompleted.textContent = contributor.completed.length;
  elements.profileEarned.textContent = currency(contributor.earned);
  elements.profileStreak.textContent = `${contributor.currentStreak} week${contributor.currentStreak === 1 ? '' : 's'}`;
  elements.profilePrimary.textContent = contributor.primaryCategory;
  elements.categoryNote.textContent = `${contributor.proofCoverage}% proof coverage`;

  renderExpertise(contributor);
  renderTimeline(contributor);
}

function renderExpertise(contributor) {
  elements.expertiseChart.replaceChildren();
  const maxEarned = Math.max(...contributor.categories.map(item => item.earned), 1);
  contributor.categories.forEach(item => {
    const row = document.createElement('div');
    row.className = 'expertise-row';
    const label = document.createElement('strong');
    label.textContent = item.category;
    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${Math.max(8, Math.round((item.earned / maxEarned) * 100))}%`;
    track.append(fill);
    const value = document.createElement('span');
    value.textContent = `${item.count} / ${currency(item.earned)}`;
    row.append(label, track, value);
    elements.expertiseChart.append(row);
  });
}

function renderTimeline(contributor) {
  elements.timeline.replaceChildren();
  contributor.completed.forEach(item => {
    const card = document.createElement('article');
    card.className = 'bounty-card';
    const title = document.createElement('h4');
    title.textContent = `${item.id}: ${item.title}`;
    const summary = document.createElement('p');
    summary.textContent = item.summary || 'No summary provided.';

    const meta = document.createElement('div');
    meta.className = 'bounty-meta';
    [item.category, item.completedAt, currency(item.reward), item.chain || 'Unknown chain'].forEach(label => {
      const span = document.createElement('span');
      span.textContent = label;
      meta.append(span);
    });

    const links = document.createElement('div');
    links.className = 'link-row';
    if (item.sourceUrl) {
      const anchor = document.createElement('a');
      anchor.className = 'link-button';
      anchor.href = item.sourceUrl;
      anchor.rel = 'noopener noreferrer';
      anchor.target = '_blank';
      anchor.textContent = 'Open proof';
      links.append(anchor);
    }
    const receiptButton = document.createElement('button');
    receiptButton.type = 'button';
    receiptButton.className = 'text-button';
    receiptButton.textContent = 'Receipt';
    receiptButton.addEventListener('click', () => openReceipt(contributor, item));
    links.append(receiptButton);

    card.append(title, summary, meta, links);
    elements.timeline.append(card);
  });
}

function openReceipt(contributor, item) {
  elements.receiptBody.replaceChildren();
  const title = document.createElement('h2');
  title.textContent = `${item.id} receipt`;
  const intro = document.createElement('p');
  intro.textContent = `Verified work packet for ${contributor.displayName || contributor.handle}.`;
  const grid = document.createElement('dl');
  grid.className = 'receipt-grid';
  [
    ['Contributor', `@${contributor.handle}`],
    ['Wallet', contributor.wallet],
    ['Bounty', item.title],
    ['Category', item.category],
    ['Reward', `${item.reward} ${item.currency || 'USDC'}`],
    ['Completed', item.completedAt],
    ['Chain', item.chain || 'Unknown'],
    ['Transaction', item.txHash || 'Not provided'],
    ['Source', item.sourceUrl || 'Not provided'],
  ].forEach(([key, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = key;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  });
  elements.receiptBody.append(title, intro, grid);
  elements.receiptDialog.showModal();
}

function bindEvents() {
  elements.searchInput.addEventListener('input', event => {
    state.query = event.target.value;
    render();
  });
  elements.categoryFilter.addEventListener('change', event => {
    state.category = event.target.value;
    render();
  });
  elements.sortSelect.addEventListener('change', event => {
    state.sort = event.target.value;
    render();
  });
}

function render() {
  renderMetrics();
  renderContributorList();
  renderProfile();
}

async function init() {
  bindEvents();
  state.data = await loadData();
  renderCategoryFilter();
  state.selectedId = state.data.contributors[0]?.id || null;
  render();
}

init();
