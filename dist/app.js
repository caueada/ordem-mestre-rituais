const state = { rituals: [], rules: [], selectedId: null, lastTrigger: null };

const $ = (id) => document.getElementById(id);
const els = {
  ritualView: $('ritual-view'),
  rulesView: $('rules-view'),
  ritualTab: $('ritual-tab'),
  conjurationTab: $('conjuration-tab'),
  search: $('ritual-search'),
  circle: $('circle-filter'),
  element: $('element-filter'),
  clear: $('clear-filters'),
  results: $('ritual-results'),
  resultCount: $('result-count'),
  detail: $('ritual-detail'),
  detailContent: $('detail-content'),
  closeDetail: $('close-detail'),
  rulesContent: $('rules-content'),
  ritualCount: $('ritual-count'),
  ruleCount: $('rule-count'),
  tabRitualCount: $('tab-ritual-count'),
  tabRuleCount: $('tab-rule-count'),
};

const ELEMENT_CLASS = {
  Sangue: 'sangue',
  Morte: 'morte',
  Conhecimento: 'conhecimento',
  Energia: 'energia',
  Medo: 'medo',
};

function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined && content !== null) element.textContent = String(content);
  return element;
}

function safeUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function firstElement(ritual) {
  return ritual.elementos?.[0]?.elemento || 'Medo';
}

function elementClass(name) {
  return ELEMENT_CLASS[name] || 'medo';
}

function ritualSearchText(ritual) {
  return normalize([
    ritual.nome,
    ritual.efeito_base,
    ritual.execucao,
    ritual.alcance,
    ritual.alvo,
    ritual.duracao,
    ritual.resistencia,
    ritual.elementos?.map((item) => item.elemento).join(' '),
  ].join(' '));
}

function updateFilters() {
  const circles = [...new Set(state.rituals.map((ritual) => ritual.circulo))].sort((a, b) => a - b);
  for (const circle of circles) {
    const option = node('option', '', `${circle}º círculo`);
    option.value = String(circle);
    els.circle.append(option);
  }
  const elements = [...new Set(state.rituals.flatMap((ritual) => (ritual.elementos || []).map((item) => item.elemento)))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  for (const element of elements) {
    const option = node('option', '', element);
    option.value = element;
    els.element.append(option);
  }
}

function filteredRituals() {
  const query = normalize(els.search.value);
  const circle = els.circle.value;
  const element = els.element.value;
  return state.rituals
    .filter((ritual) => !query || ritualSearchText(ritual).includes(query))
    .filter((ritual) => circle === 'all' || String(ritual.circulo) === circle)
    .filter((ritual) => element === 'all' || (ritual.elementos || []).some((item) => item.elemento === element))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

function appendImage(parent, source, alt, className) {
  if (!source) return;
  const image = document.createElement('img');
  image.className = className || '';
  image.src = source;
  image.alt = alt || '';
  image.loading = 'lazy';
  image.addEventListener('error', () => image.remove());
  parent.append(image);
}

function renderResults() {
  const rituals = filteredRituals();
  els.results.replaceChildren();
  els.results.setAttribute('aria-busy', 'false');
  els.resultCount.textContent = `${rituals.length} ${rituals.length === 1 ? 'resultado' : 'resultados'}`;
  if (!rituals.length) {
    els.results.append(node('p', 'empty-state', 'Nenhum ritual corresponde a esta busca. Tente outro nome, círculo ou elemento.'));
    return;
  }
  for (const ritual of rituals) {
    const first = firstElement(ritual);
    const button = node('button', `ritual-row ${elementClass(first)}`);
    button.type = 'button';
    button.setAttribute('role', 'listitem');
    button.dataset.ritualId = ritual.id;
    const symbol = node('span', 'ritual-row-symbol');
    appendImage(symbol, ritual.simbolos_ritual?.[0]?.processed, `Símbolo de ${ritual.nome}`);
    const main = node('span', 'ritual-row-main');
    main.append(node('strong', 'ritual-row-name', ritual.nome));
    const meta = node('span', 'ritual-row-meta');
    meta.append(node('span', 'ritual-row-circle', `${ritual.circulo}º círculo`));
    meta.append(node('span', '', (ritual.elementos || []).map((item) => item.elemento).join(' · ')));
    meta.append(node('span', '', ritual.execucao || 'Execução não informada'));
    main.append(meta);
    button.append(symbol, main, node('span', 'ritual-row-arrow', '›'));
    button.addEventListener('click', () => openRitual(ritual.id, button));
    els.results.append(button);
  }
}

function addMeta(parent, label, value) {
  const item = node('div', 'meta-item');
  item.append(node('span', '', label), node('strong', '', value || '—'));
  parent.append(item);
}

function renderDetail(ritual) {
  const first = firstElement(ritual);
  els.detailContent.replaceChildren();
  const header = node('div', 'detail-header');
  const heading = node('div');
  heading.append(node('p', 'detail-kicker', `${ritual.circulo}º círculo · ${ritual.execucao || 'ritual'}`), node('h2', 'detail-title', ritual.nome));
  const tags = node('div', 'detail-elements');
  for (const item of ritual.elementos || []) tags.append(node('span', `element-tag ${elementClass(item.elemento)}`, item.elemento));
  heading.append(tags);
  const sigil = node('div', 'detail-sigil');
  appendImage(sigil, ritual.simbolos_ritual?.[0]?.processed, `Símbolo de ${ritual.nome}`);
  header.append(heading, sigil);
  els.detailContent.append(header);

  const meta = node('div', 'detail-meta');
  addMeta(meta, 'Execução', ritual.execucao);
  addMeta(meta, 'Alcance', ritual.alcance);
  addMeta(meta, 'Alvo', ritual.alvo);
  addMeta(meta, 'Área', ritual.area);
  addMeta(meta, 'Duração', ritual.duracao);
  addMeta(meta, 'Resistência', ritual.resistencia);
  els.detailContent.append(meta);

  const effect = node('section', 'detail-section');
  effect.append(node('h3', '', 'Efeito')); effect.append(node('p', '', ritual.efeito_base || 'Descrição não informada.'));
  els.detailContent.append(effect);

  if (ritual.aprimoramentos?.length) {
    const upgrades = node('section', 'detail-section');
    upgrades.append(node('h3', '', 'Aprimoramentos'));
    ritual.aprimoramentos.forEach((upgrade) => {
      const item = node('div', 'upgrade');
      const title = node('strong', '', upgrade.nome);
      title.append(node('span', '', ` · +${upgrade.custo_pe_adicional || 0} PE`));
      item.append(title, node('p', '', [upgrade.efeito, ...(upgrade.pre_requisitos || [])].filter(Boolean).join(' ')));
      upgrades.append(item);
    });
    els.detailContent.append(upgrades);
  }

  const fullText = node('details', 'detail-disclosure');
  fullText.append(node('summary', '', 'Ver texto integral'));
  fullText.append(node('p', 'detail-full-text', ritual.texto_integral || 'Texto integral não informado.'));
  els.detailContent.append(fullText);

  const source = node('details', 'detail-disclosure');
  source.append(node('summary', '', 'Fonte e créditos'));
  const sourceText = [`${ritual.fonte?.obra || ritual.fonte_regras || 'Fonte do compêndio'} · versão ${ritual.fonte?.versao || '1.0'}`];
  if (ritual.fonte?.pagina_impressa) sourceText.push(`p. ${ritual.fonte.pagina_impressa}`);
  const credit = ritual.arte_creditos;
  if (credit?.artista) sourceText.push(`Artista: ${credit.artista}`);
  source.append(node('p', 'credit-copy', sourceText.join(' · ')));
  const wiki = safeUrl(ritual.referencia_wiki?.url);
  if (wiki) {
    const link = node('a', '', 'Abrir referência externa ↗');
    link.href = wiki; link.target = '_blank'; link.rel = 'noopener noreferrer';
    const linkRow = node('p', 'credit-copy');
    linkRow.append(link);
    source.append(linkRow);
  }
  els.detailContent.append(source);
  els.detail.className = `detail-panel ${elementClass(first)}`;
}

function openRitual(id, trigger) {
  const ritual = state.rituals.find((item) => item.id === id);
  if (!ritual) return;
  state.selectedId = id;
  state.lastTrigger = trigger || document.querySelector(`[data-ritual-id="${CSS.escape(id)}"]`);
  renderDetail(ritual);
  els.detail.hidden = false;
  history.replaceState(null, '', `#ritual=${encodeURIComponent(id)}`);
  els.closeDetail.focus();
}

function closeDetail() {
  els.detail.hidden = true;
  state.selectedId = null;
  history.replaceState(null, '', window.location.pathname + window.location.search);
  state.lastTrigger?.focus();
  state.lastTrigger = null;
}

function renderCostCard() {
  const card = node('article', 'cost-card');
  const copy = node('div');
  copy.append(node('h3', '', 'Custo base de PE'), node('p', '', 'O círculo define o custo antes de aprimoramentos ou efeitos que alterem a conjuração.'));
  const table = node('table', 'cost-table');
  const head = node('tr'); head.append(node('th', '', 'Círculo'), node('th', '', 'Custo')); table.append(node('thead')); table.querySelector('thead').append(head);
  const body = node('tbody');
  [[1, 1], [2, 3], [3, 6], [4, 10]].forEach(([circle, cost]) => { const row = node('tr'); row.append(node('td', '', `${circle}º`), node('td', '', `${cost} PE`)); body.append(row); });
  table.append(body); card.append(copy, table); return card;
}

function renderRules() {
  els.rulesContent.replaceChildren(renderCostCard());
  const list = node('div', 'rule-list');
  for (const rule of state.rules) {
    const card = node('article', 'rule-card');
    card.append(node('h3', '', rule.titulo), node('p', 'rule-summary', rule.resumo || rule.explicacao || ''));
    const details = node('details'); details.append(node('summary', '', 'Abrir orientação'));
    for (const [label, value] of [['Orientação', rule.orientacao], ['Exemplo', rule.exemplo_original], ['Atenção', rule.atencao]]) {
      if (value) { const paragraph = node('p'); paragraph.append(node('strong', '', `${label}: `), node('span', '', value)); details.append(paragraph); }
    }
    card.append(details);
    if (rule.pagina_livro || rule.pagina_pdf) card.append(node('p', 'rule-reference', `Livro p. ${rule.pagina_livro || '—'} · PDF p. ${rule.pagina_pdf || '—'}`));
    list.append(card);
  }
  els.rulesContent.append(list);
}

function setTab(tab) {
  const rituals = tab === 'rituais';
  els.ritualView.hidden = !rituals;
  els.rulesView.hidden = rituals;
  els.ritualTab.classList.toggle('is-active', rituals);
  els.conjurationTab.classList.toggle('is-active', !rituals);
  els.ritualTab.setAttribute('aria-selected', String(rituals));
  els.conjurationTab.setAttribute('aria-selected', String(!rituals));
  if (!rituals) closeDetail();
}

function readHash() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get('ritual');
}

async function load() {
  try {
    const [ritualResponse, ruleResponse] = await Promise.all([fetch('data/rituais.json'), fetch('data/regras.json')]);
    if (!ritualResponse.ok || !ruleResponse.ok) throw new Error('Não foi possível abrir os dados públicos.');
    state.rituals = await ritualResponse.json();
    state.rules = await ruleResponse.json();
    els.ritualCount.textContent = state.rituals.length;
    els.ruleCount.textContent = state.rules.length;
    els.tabRitualCount.textContent = state.rituals.length;
    els.tabRuleCount.textContent = state.rules.length;
    updateFilters(); renderResults(); renderRules();
    const selected = readHash(); if (selected) openRitual(selected);
  } catch (error) {
    els.results.replaceChildren(node('p', 'empty-state', error.message));
    els.resultCount.textContent = 'Erro ao carregar';
  }
}

els.search.addEventListener('input', renderResults);
els.circle.addEventListener('change', renderResults);
els.element.addEventListener('change', renderResults);
els.clear.addEventListener('click', () => { els.search.value = ''; els.circle.value = 'all'; els.element.value = 'all'; renderResults(); els.search.focus(); });
els.closeDetail.addEventListener('click', closeDetail);
els.ritualTab.addEventListener('click', () => setTab('rituais'));
els.conjurationTab.addEventListener('click', () => setTab('conjuracao'));
window.addEventListener('hashchange', () => { const id = readHash(); if (id) openRitual(id); else if (!els.detail.hidden) closeDetail(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !els.detail.hidden) closeDetail(); });

load();
