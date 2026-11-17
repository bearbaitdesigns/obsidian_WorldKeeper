/* =====================================================================
   type dashboards
   ===================================================================== */
function renderTypeDash(id, st, { compact = false } = {}) {
  const t = T()[id], s = ST();
  const root = h('div', { class: 'wk cs-root cd-root', style: s.accentColor ? { '--cs-accent': s.accentColor } : {} });
  const all = S.notesOf(id); const q = st.q.toLowerCase(); const hdr = t.links.find((l) => l.placement === 'header' && l.chain);
  const list = all.filter((f) => {
    const fm = S.fm(f);
    if (q && !(f.basename.toLowerCase().includes(q) || t.text.some((x) => arr(fm[x.key]).some((a) => String(a).toLowerCase().includes(q))))) return false;
    for (const [k, v] of Object.entries(st.filters)) if (v && !arr(fm[k]).map(String).includes(v)) return false;
    if (st.region) {
      const chain = []; if (hdr) for (const o of S.linkFiles(f, hdr.key)) chain.push(o.path, ...S.ancestors(o).map((a) => a.path));
      if (GEO.includes(id)) chain.push(...S.ancestors(f).map((a) => a.path));
      if (!chain.includes(st.region)) return false;
    }
    return true;
  });
  const sd = t.domain.find((d) => d.key === st.sort);
  list.sort((a, b) => {
    if (st.sort === 'name') return a.basename.localeCompare(b.basename);
    const A = display(linkName(arr(S.fm(a)[st.sort])[0] ?? '')), B = display(linkName(arr(S.fm(b)[st.sort])[0] ?? ''));
    if (sd) { const ia = sd.values.indexOf(A), ib = sd.values.indexOf(B); return ((ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)) || a.basename.localeCompare(b.basename); }
    return (A || '~').localeCompare(B || '~');
  });
  const rerender = () => st._rerender && st._rerender();
  ap(root, h('div', { class: 'cd-top' }, h('div', { class: 'cd-h1' }, `${t.icon} ${t.plural}`), h('span', { class: 'cd-count' }, `${list.length} of ${all.length}`), h('span', { class: 'cd-spacer' }),
    ...[['cards', '▦ Cards'], ['table', '☰ Table']].map(([m, l]) => h('button', { class: 'cd-btn' + (st.mode === m ? ' is-active' : ''), onclick: () => { st.mode = m; rerender(); } }, l)),
    h('button', { class: 'cd-btn', onclick: () => openConverter([]) }, '⇪ Convert'),
    h('button', { class: 'mod-cta cd-new', onclick: () => prompt2(`New ${t.label.toLowerCase()}`, `${t.label} name`, (v) => createNote(id, v)) }, '+ New ' + t.label.toLowerCase())));
  const search = h('input', { type: 'search', placeholder: `Search ${t.plural.toLowerCase()}…`, value: st.q });
  search.addEventListener('input', () => { st.q = search.value; const p = search.selectionStart; rerender(); const i = st._root && st._root.querySelector('.cd-filters input'); if (i) { i.focus(); i.setSelectionRange(p, p); } });
  const fb = h('div', { class: 'cd-filters' }, search);
  for (const d of t.domain) { const sel = h('select', { class: 'dropdown' }, h('option', { value: '' }, `All ${d.label.toLowerCase()}`), ...d.values.map((v) => h('option', { value: v, selected: st.filters[d.key] === v }, v))); sel.addEventListener('change', () => { st.filters[d.key] = sel.value; rerender(); }); ap(fb, sel); }
  const lim = GEO.includes(id) ? GEO.indexOf(id) : 99;
  const regionOpts = GEO.filter((g) => GEO.indexOf(g) < lim).flatMap((g) => S.notesOf(g));
  if (regionOpts.length && (hdr || GEO.includes(id))) { const sel = h('select', { class: 'dropdown' }, h('option', { value: '' }, 'Anywhere'), ...regionOpts.map((r) => h('option', { value: r.path, selected: st.region === r.path }, `${typeIcon(r)} ${r.basename}`))); sel.addEventListener('change', () => { st.region = sel.value; rerender(); }); ap(fb, sel); }
  const sortSel = h('select', { class: 'dropdown' }, ...[['name', 'Sort: name'], ...t.domain.map((d) => [d.key, 'Sort: ' + d.label.toLowerCase()])].map(([v, l]) => h('option', { value: v, selected: st.sort === v }, l)));
  sortSel.addEventListener('change', () => { st.sort = sortSel.value; rerender(); }); ap(fb, sortSel);
  ap(root, fb);
  if (!list.length) { ap(root, empty(all.length ? 'Nothing matches these filters.' : `No ${t.plural.toLowerCase()} yet. Create one, or convert existing notes.`)); return root; }
  const stat = (f) => {
    if (GEO.includes(id) && id !== 'hub') { const d = S.descendants(f); const ps = new Set([f.path, ...d.map((x) => x.path)]); const ch = S.notesOf('character').filter((c) => S.linkFiles(c, 'location').some((l) => ps.has(l.path))); return `${d.length} inside · ${ch.length} characters`; }
    if (id === 'pantheon') return `${arr(S.fm(f).gods).length} gods · ${worshipOf(f).length} followers`;
    if (id === 'demon') { const k = S.refsOf(f, { from: 'character', via: 'species' }).length; return `${k} demon${k === 1 ? '' : 's'}`; }
    const m = t.modules.find((x) => typeof x === 'object' && x.ref); if (m) return `${S.refsOf(f, m).length} ${m.ref.toLowerCase()}`;
    if (id === 'character') return arr(S.fm(f)[s.relationshipKey]).length + ' relationships';
    return S.backlinks(f).length + ' links here';
  };
  const sub = (f) => { if (GEO.includes(id)) return S.ancestors(f).map((a) => a.basename).join(' › ') || '—'; if (hdr) return names(S.fm(f)[hdr.key]).map(display).join(', ') || '—'; return ''; };
  const meta = (f) => { const fm = S.fm(f); return [...t.domain.filter((d) => !d.when).slice(1, 3).map((d) => arr(fm[d.key]).join(', ')), ...t.links.filter((l) => l.placement === 'tile').slice(0, 1).map((l) => display(names(fm[l.key])[0] || ''))].filter(Boolean).join(' · '); };
  if (st.mode === 'cards') {
    ap(root, h('div', { class: 'cd-grid' }, ...list.map((f) => {
      const fm = S.fm(f); const im = S.imageSrc(fm[s.imageKey], f.path) || S.imageSrc(fm[s.bannerKey], f.path); const b = t.domain.find((d) => !d.multi && !d.when);
      const card = h('div', { class: 'cd-card' },
        h('div', { class: 'cd-img' + (im ? '' : ' is-empty'), style: im ? { 'background-image': `url("${im}")` } : { '--cd-hue': String(hashHue(f.basename)) } }, im ? null : h('div', { class: 'cd-init' + (id === 'character' ? '' : ' is-icon') }, id === 'character' ? initials(f.basename) : t.icon), b && fm[b.key] ? h('span', { class: 'cd-role' }, String(arr(fm[b.key])[0])) : null, h('div', { class: 'cd-name' }, f.basename)),
        h('div', { class: 'cd-body' }, meta(f) ? h('div', { class: 'cd-meta' }, meta(f)) : null, sub(f) ? h('div', { class: 'cd-loc' }, sub(f)) : null, h('div', { class: 'cd-stat' }, stat(f))));
      card.addEventListener('click', (e) => openFile(f, e)); hover(card, f.path, '', card); return card;
    })));
  } else {
    const cols = [['name', 'Name'], ...t.domain.map((d) => [d.key, d.label]), ...t.links.filter((l) => l.placement !== 'tab').map((l) => [l.key, l.label])];
    const table = h('table', { class: 'cd-table' }, h('thead', {}, h('tr', {}, ...cols.map(([k, l]) => h('th', { onclick: () => { if (k === 'name' || t.domain.some((d) => d.key === k)) { st.sort = k; rerender(); } } }, l + (st.sort === k ? ' ▾' : ''))))));
    const tb = h('tbody', {});
    for (const f of list) {
      const tr = h('tr', {}, ...cols.map(([k]) => k === 'name' ? h('td', {}, h('span', { class: 'cd-av is-empty', style: { '--cd-hue': String(hashHue(f.basename)) } }, id === 'character' ? f.basename[0] : t.icon), f.basename) : ((v) => h('td', { class: v ? '' : 'cd-dim' }, v || '—'))(arr(S.fm(f)[k]).map((x) => display(linkName(x))).join(', '))));
      tr.addEventListener('click', (e) => openFile(f, e)); ap(tb, tr);
    }
    ap(table, tb); ap(root, h('div', { class: 'cd-table-wrap' }, table));
  }
  if (!compact) ap(root, h('details', { class: 'wk-embed' }, h('summary', {}, 'Embed this dashboard in a note'), h('pre', {}, `\`\`\`worldkeeper-dashboard\ntype: ${id}\nview: ${st.mode}\nsort: ${st.sort}\n\`\`\``)));
  return root;
}
function newDashState(opts = {}) { return { q: '', filters: {}, mode: opts.view === 'table' ? 'table' : 'cards', sort: opts.sort || 'name', region: '' }; }

class DashboardsView extends ItemView {
  constructor(leaf) { super(leaf); this.type = 'character'; this.states = {}; }
  getViewType() { return VIEW_DASH; }
  getDisplayText() { return 'Worldkeeper dashboards'; }
  getIcon() { return 'layout-dashboard'; }
  async onOpen() { this.body = this.contentEl.appendChild(h('div', { class: 'wk wk-view' })); this.run = liveRender(this, this.body, () => this.render()); this.run(); }
  setType(id) { if (T()[id]) { this.type = id; this.run && this.run(); } }
  render() {
    const nav = h('div', { class: 'anav' }, h('button', { onclick: () => P.openHome() }, '🏠 Home'));
    const btn = (t) => h('button', { class: this.type === t ? 'is-on' : '', onclick: () => this.setType(t) }, h('span', {}, T()[t].icon), T()[t].plural, h('span', { class: 'c' }, String(S.notesOf(t).length)));
    ap(nav, h('div', { class: 'sep' }, 'Story'), btn('character'), h('div', { class: 'sep' }, 'Geography'), ...GEO.map(btn), h('div', { class: 'sep' }, 'Shared'), ...CROSS.map(btn), h('div', { class: 'sep' }, 'Divine & infernal'), ...DIVINE.map(btn), h('div', { class: 'sep' }, 'Things'), btn('item'),
      ...Object.keys(T()).filter((k) => !TYPE_ORDER.includes(k)).map(btn), h('div', { class: 'sep' }, 'Reference'), h('button', { onclick: () => P.openEncyclopedia() }, h('span', {}, '📚'), 'Encyclopedia', h('span', { class: 'c' }, String(S.entries().length))));
    const st = (this.states[this.type] ??= newDashState());
    const main = h('div', { class: 'atlas-main' });
    st._rerender = () => this.run(); st._root = main;
    ap(main, renderTypeDash(this.type, st));
    this.body.replaceChildren(h('div', { class: 'atlas' }, nav, main));
  }
}

/* =====================================================================
   to-do (stored as Markdown tasks in a note)
   ===================================================================== */
async function readTodos() {
  const f = app().vault.getAbstractFileByPath(normalizePath(ST().todoFile)); if (!(f instanceof TFile)) return [];
  const out = [];
  for (const line of (await app().vault.read(f)).split('\n')) { const m = line.match(/^\s*[-*+] \[(.)\] (.*)$/); if (m) out.push({ done: m[1] !== ' ', ...parseTaskText(m[2]) }); }
  return out;
}
async function writeTodos(list) {
  const path = normalizePath(ST().todoFile); const body = '# To-do\n\n' + list.map((t) => `- [${t.done ? 'x' : ' '}] ${t.text}${t.tag ? ' #' + t.tag.toLowerCase().replace(/\s+/g, '-') : ''}${t.due ? ' 📅 ' + t.due : ''}`).join('\n') + '\n';
  const f = app().vault.getAbstractFileByPath(path);
  if (f instanceof TFile) await app().vault.modify(f, body); else { await S.ensureFolder(path.split('/').slice(0, -1).join('/')); await app().vault.create(path, body); }
}

/* =====================================================================
   home
   ===================================================================== */
function attention() {
  const out = [];
  S.notesOf('magic').forEach((n) => { if (!names(S.fm(n).patron).length) out.push([n, 'no god patron']); });
  GEO.slice(1).forEach((t) => S.notesOf(t).forEach((n) => { if (!S.parentOf(n)) out.push([n, 'not placed in the hierarchy']); }));
  S.notesOf('character').forEach((n) => { if (!names(S.fm(n).location).length) out.push([n, 'no location']); });
  S.notesOf('language').forEach((n) => { const k = arr(S.fm(n).lexicon).length; if (k < 5) out.push([n, `only ${k} words`]); });
  S.notesOf('magic').forEach((n) => { if (!arr(S.fm(n).rules).length) out.push([n, 'no rules or limits']); });
  CROSS.forEach((t) => S.notesOf(t).forEach((n) => { if (!names(S.fm(n).regions).length) out.push([n, 'not linked to any region']); }));
  S.notesOf('pantheon').forEach((n) => { if (!arr(S.fm(n).gods).length) out.push([n, 'no gods yet']); });
  S.notesOf('demon').forEach((n) => { if (!S.refsOf(n, { from: 'character', via: 'species' }).length) out.push([n, 'no individual demons yet']); });
  return out;
}
function worldTree() {
  const wrap = h('div', { class: 'wk-tree' });
  const node = (f, depth) => {
    const kids = S.childrenOf(f); const a = h('a', { class: 'wk-link' }, f.basename); a.addEventListener('click', (e) => { e.preventDefault(); openFile(f, e); });
    if (!kids.length) { const l = h('div', { class: 'wk-leaf' }, typeIcon(f) + ' ', a); return l; }
    return h('details', { open: depth < 2 }, h('summary', {}, h('span', { class: 'caret' }, '▸'), h('span', {}, typeIcon(f)), a, h('span', { class: 'c' }, S.descendants(f).length + ' inside')), ...kids.map((k) => node(k, depth + 1)));
  };
  S.notesOf('planet').forEach((p) => ap(wrap, node(p, 0)));
  const orphans = GEO.slice(1).flatMap((t) => S.notesOf(t).filter((n) => !S.parentOf(n)));
  if (orphans.length) ap(wrap, h('details', {}, h('summary', {}, h('span', { class: 'caret' }, '▸'), '❔ Unplaced', h('span', { class: 'c' }, String(orphans.length))), ...orphans.map((o) => node(o, 9))));
  if (!wrap.children.length) ap(wrap, empty('Create a Planet to start your world tree.'));
  return wrap;
}
function linkify(text) {
  const all = [...S.ix().type.keys()].map((p) => app().vault.getAbstractFileByPath(p)).filter(Boolean).sort((a, b) => b.basename.length - a.basename.length);
  const out = []; let rest = text;
  while (rest) {
    let best = null; for (const f of all) { const i = rest.indexOf(f.basename); if (i >= 0 && (best === null || i < best[0])) best = [i, f]; }
    if (!best) { out.push(rest); break; }
    const a = h('a', { class: 'wk-link' }, best[1].basename); const bf = best[1]; a.addEventListener('click', (e) => openFile(bf, e)); hover(a, bf.path, '', a);
    out.push(rest.slice(0, best[0]), a); rest = rest.slice(best[0] + best[1].basename.length);
  }
  return out;
}
async function renderHome(state) {
  const s = ST(), nv = s.novel; const pwc = s.plotweaver;
  const pwx = await pwLoad(); const novelPW = pwNovel(pwx); const pw = pwStats(pwx, novelPW); const usePW = pwc.enabled && pwx.installed && !!pwx.data;
  const words = usePW ? pw.words : Number(nv.manualWords) || 0;
  // daily snapshot for the activity chart
  const today = todayISO(); if (s.history[today] !== words) { s.history[today] = words; P.saveSettingsQuiet(); }
  const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const histKeys = Object.keys(s.history).sort();
  const prevTotal = (k) => { const i = histKeys.findIndex((x) => x >= k); const j = (i < 0 ? histKeys.length : i) - 1; return j >= 0 ? s.history[histKeys[j]] : null; };
  const activity = days.map((d) => { const k = iso(d); const v = s.history[k]; const p = prevTotal(k); return v == null || p == null ? 0 : Math.max(0, v - p); });
  const goal = Number(nv.goal) || 1; const pct = Math.min(100, Math.round((words / goal) * 100));
  const dl = nv.deadline ? new Date(nv.deadline + 'T00:00:00') : null; const daysLeft = dl ? Math.max(0, Math.ceil((dl - new Date(today + 'T00:00:00')) / 864e5)) : null;
  const remain = Math.max(0, goal - words);
  let streak = 0; for (let i = activity.length - 1; i >= 0 && activity[i] > 0; i--) streak++;
  const root = h('div', { class: 'wk cs-root wk-home', style: s.accentColor ? { '--cs-accent': s.accentColor } : {} });

  /* hero (banner customizable like note banners) */
  const bnSrc = S.imageSrc(nv.banner, '');
  const bY = nv.bannerPosition ?? 60; const bStyle = nv.bannerStyle || 'clear';
  const setBanner = async (img) => { nv.banner = S.link(img); if (nv.bannerPosition == null) nv.bannerPosition = 60; await P.saveSettings(); };
  const changeBanner = h('button', {}, bnSrc ? '🖼 Change banner' : '🖼 Add banner');
  changeBanner.addEventListener('click', async (e) => { const [img] = await chooseImages(e, null); if (img) setBanner(img); });
  const tools = h('div', { class: 'cs-banner-tools hd-tools', 'data-key': '__home' }, pencilToggle(), changeBanner);
  if (bnSrc) {
    const range = h('input', { type: 'range', min: 0, max: 100, value: bY });
    range.addEventListener('input', () => hero.style.setProperty('--y', range.value + '%'));
    range.addEventListener('change', async () => { nv.bannerPosition = +range.value; await P.saveSettingsQuiet(); });
    ap(tools, h('label', { class: 'cs-banner-pos', title: 'Vertical focus' }, '↕', range),
      h('button', { onclick: async () => { nv.bannerStyle = bStyle === 'blurred' ? 'clear' : 'blurred'; await P.saveSettings(); } }, bStyle === 'blurred' ? '◐ Blurred' : '◑ Clear'),
      h('button', { title: 'Remove banner', onclick: async () => { nv.banner = ''; await P.saveSettings(); } }, '✕'));
  }
  const enc = h('button', { class: 'apill is-enc hd-enc', onclick: () => P.openEncyclopedia() }, h('span', {}, '📚'), 'Encyclopedia', h('b', {}, String(S.entries().length)));
  const hero = h('div', { class: 'hd-hero' + (bnSrc ? ' is-' + bStyle : ' is-empty'), style: bnSrc ? { '--img': `url("${bnSrc}")`, '--y': bY + '%' } : { '--cd-hue': String(hashHue(nv.title || 'x')) } }, h('div', { class: 'bg' }), tools,
    h('div', {}, nv.series ? h('div', { class: 'hd-series' }, nv.series) : null, h('h1', {}, nv.title || 'Untitled novel'),
      h('div', { class: 'sub' }, h('span', { class: 'cs-badge' }, nv.stage || 'Drafting'), dl ? h('span', {}, `Due ${dl.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`) : h('span', {}, 'No deadline set'), daysLeft != null ? h('span', {}, '·') : null, daysLeft != null ? h('span', {}, `${daysLeft} days left`) : null)),
    h('div', { class: 'hd-side' }, h('div', { class: 'wk-ring', style: { '--p': String(pct) } }, h('div', {}, h('b', {}, pct + '%'), h('small', {}, 'of goal'))), enc));
  dropImages(hero, null, ([img]) => setBanner(img));
  ap(root, hero);

  /* KPIs */
  const avg = Math.round(activity.reduce((a, b) => a + b, 0) / activity.length);
  ap(root, h('div', { class: 'wk-kpis' },
    h('div', { class: 'wk-kpi' }, h('span', {}, 'Words'), h('b', {}, fmtN(words)), h('small', {}, `of ${fmtN(goal)} · ${usePW ? 'from Plot Weaver' : 'manual'}`)),
    h('div', { class: 'wk-kpi' }, h('span', {}, 'Remaining'), h('b', {}, fmtN(remain)), h('small', {}, `${100 - pct}% to go`)),
    h('div', { class: 'wk-kpi' }, h('span', {}, 'Needed per day'), h('b', {}, daysLeft ? fmtN(Math.ceil(remain / Math.max(1, daysLeft))) : '—'), h('small', {}, dl ? 'to hit your deadline' : 'set a deadline in settings')),
    h('div', { class: 'wk-kpi' }, h('span', {}, 'Today'), h('b', {}, fmtN(activity[activity.length - 1])), h('small', {}, `avg ${fmtN(avg)}/day (14d)`)),
    h('div', { class: 'wk-kpi' }, h('span', {}, 'Streak'), h('b', {}, streak + ' days'), h('small', {}, 'days with new words'))));

  /* atlas pills */
  ap(root, h('div', { class: 'atlas-pills' }, ...Object.keys(T()).sort((a, b) => (TYPE_ORDER.indexOf(a) + 1 || 99) - (TYPE_ORDER.indexOf(b) + 1 || 99)).map((t) => h('button', { class: 'apill', onclick: () => P.openDashboards(t) }, h('span', {}, T()[t].icon), T()[t].plural, h('b', {}, String(S.notesOf(t).length))))));

  /* summary + todo */
  const colL = h('div', { class: 'hd-col' }), colR = h('div', { class: 'hd-col' });
  ap(root, h('div', { class: 'hd-twocol' }, colL, colR));
  ap(colL, renderSummary(state)); ap(colR, await renderTodos(state));

  /* plot weaver + activity */
  const pwCard = h('div', { class: 'wk-card' });
  if (usePW) {
    const tot = Math.max(1, pw.scenes);
    const novelSel = h('select', { class: 'dropdown wk-sm' }, ...pwx.data.novels.map((n) => h('option', { value: n.title, selected: novelPW && n.id === novelPW.id }, n.title)));
    novelSel.addEventListener('change', async () => { pwc.novel = novelSel.value; await P.saveSettings(); });
    const openBoard = () => { if (!app().commands?.executeCommandById?.(`${PW_ID}:open-board`)) toast('Enable Plot Weaver to open its board'); };
    ap(pwCard, h('div', { class: 'card-h' }, h('h3', {}, '🧵 Plot Weaver'), h('span', { class: 'wk-pill ' + (pwx.enabled ? 'ok' : 'warn') }, (pwx.enabled ? 'connected' : 'saved data · plugin disabled') + (pwx.version ? ' · v' + pwx.version : '')), h('span', { class: 'sp' }), pwx.data.novels.length > 1 ? novelSel : null,
      h('button', { class: 'wk-sm', onclick: openBoard }, 'Open board ↗')),
    pw.scenes ? [
      h('div', { class: 'pw-status' }, ...pw.buckets.map((x) => h('i', { style: { width: (x.count / tot) * 100 + '%', background: x.color }, title: `${x.label}: ${x.count} scenes` }))),
      h('div', { class: 'pw-legend' }, ...pw.buckets.map((x) => h('span', {}, h('i', { style: { background: x.color } }), `${x.label} · ${x.count}`))),
      h('div', { class: 'pw-mini' }, h('div', {}, h('b', {}, String(pw.scenes)), `scenes · ${pw.withNote} with notes`), h('div', {}, h('b', {}, String(pw.plotlines)), 'plotlines'), h('div', {}, h('b', {}, String(pw.influences)), 'cause → effect links'), h('div', {}, h('b', {}, String(pw.offscreen)), 'off-screen events')),
    ] : empty(novelPW ? `“${novelPW.title}” has no scenes on the board yet.` : 'No novels in Plot Weaver yet.'),
    h('div', { class: 'cs-hint cs-mt' }, `Read from Plot Weaver’s cards. Status and words come from each card’s linked note, using Plot Weaver’s fields: “${pwx.settings.statusField}” and “${pwx.settings.wordsField}”.`));
  } else {
    const manual = h('input', { type: 'number', value: nv.manualWords || 0, class: 'wk-num' }); manual.addEventListener('change', async () => { nv.manualWords = +manual.value; await P.saveSettings(); });
    ap(pwCard, h('div', { class: 'card-h' }, h('h3', {}, '🧵 Plot Weaver'), h('span', { class: 'wk-pill warn' }, !pwx.installed ? 'not installed' : !pwc.enabled ? 'turned off in settings' : 'no outline saved yet')),
      h('p', { class: 'cs-hint' }, !pwx.installed ? 'Install Plot Weaver to pull chapter, scene and POV stats in here. Until then, track words by hand:' : !pwc.enabled ? 'Turn on the integration in Worldkeeper settings → Novel & Plot Weaver.' : 'Open Plot Weaver and add some cards; stats appear here once it has saved an outline. Meanwhile, track words by hand:'),
      h('div', { class: 'wk-row' }, manual, h('span', { class: 'cs-hint' }, 'words written')));
  }
  const max = Math.max(1, ...activity);
  const actCard = h('div', { class: 'wk-card' }, h('div', { class: 'card-h' }, h('h3', {}, '✍️ Writing activity'), h('span', { class: 'sp' }), h('span', { class: 'wk-pill' }, 'last 14 days')),
    h('div', { class: 'wk-act' }, ...activity.map((v, i) => h('div', { style: { height: Math.max(2, (v / max) * 100) + '%', opacity: v ? '.85' : '.25' } }, h('span', {}, `${days[i].toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}: ${fmtN(v)}`)))),
    h('div', { class: 'act-x' }, ...days.map((d, i) => h('span', {}, i % 2 ? '' : String(d.getDate())))),
    h('div', { class: 'cs-hint cs-mt' }, 'Worldkeeper saves your total word count once a day to draw this.'),
    groupTitle('🧭 Needs attention'), h('ul', { class: 'att' }, ...attention().slice(0, 7).map(([n, why]) => { const a = h('a', { class: 'wk-link' }, n.basename); a.addEventListener('click', (e) => openFile(n, e)); return h('li', {}, h('span', {}, typeIcon(n)), a, h('span', { class: 'why' }, why)); })),
    groupTitle('🕑 Recently edited'), h('ul', { class: 'att' }, ...[...S.ix().type.keys()].map((p) => app().vault.getAbstractFileByPath(p)).filter(Boolean).sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, 6).map((n) => { const a = h('a', { class: 'wk-link' }, n.basename); a.addEventListener('click', (e) => openFile(n, e)); return h('li', {}, h('span', {}, typeIcon(n)), a, h('span', { class: 'why' }, new Date(n.stat.mtime).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))); })));
  ap(colL, pwCard); ap(colR, actCard);

  /* tree + shared */
  ap(colL, h('div', { class: 'wk-card' }, h('div', { class: 'card-h' }, h('h3', {}, '🗺️ World tree'), h('span', { class: 'sp' }), h('span', { class: 'cs-hint' }, 'Planet › Continent › Kingdom › Place › Hub')), worldTree()));
  ap(colR, h('div', { class: 'wk-card' }, h('div', { class: 'card-h' }, h('h3', {}, '🌐 Shared across the world')), ...[...CROSS, ...DIVINE].map((t) => h('div', { class: 'cs-mb' }, groupTitle(`${T()[t].icon} ${T()[t].plural}`, S.notesOf(t).length),
      h('div', { class: 'cs-tile-body' }, ...S.notesOf(t).map((n) => chip(n.path, '', { file: n, label: n.basename })))))));
  return root;
}
function renderSummary(state) {
  const nv = ST().novel; const card = h('div', { class: 'wk-card sm-card' });
  ap(card, h('div', { class: 'card-h' }, h('h3', {}, '📘 About the book'), h('span', { class: 'sp' }), h('button', { class: 'wk-sm', onclick: () => { state.summaryEdit = !state.summaryEdit; state.rerender(); } }, state.summaryEdit ? '✓ Done' : '✎ Edit')));
  if (state.summaryEdit) {
    const f = (label, el) => h('div', { class: 'cl-row' }, h('label', {}, label), el);
    const ta = (k, rows) => { const e = h('textarea', { class: 'sm-in', rows }, nv[k] || ''); e.addEventListener('change', () => { nv[k] = e.value; P.saveSettingsQuiet(); }); return e; };
    const ti = (k, v) => { const e = h('input', { type: 'text', value: v }); e.addEventListener('change', () => { nv[k] = k === 'genre' ? e.value.split(',').map((x) => x.trim()).filter(Boolean) : e.value; P.saveSettingsQuiet(); }); return e; };
    ap(card, f('Logline (one sentence)', ta('logline', 2)), f('Summary', ta('synopsis', 9)),
      h('div', { class: 'wk-row wk-wrap' }, f('Genre (comma-separated)', ti('genre', arr(nv.genre).join(', '))), f('POV', ti('pov', nv.pov || '')), f('Audience', ti('audience', nv.audience || ''))));
    return card;
  }
  const tags = [...arr(nv.genre), nv.pov, nv.audience].filter(Boolean);
  if (!nv.logline && !nv.synopsis) { ap(card, empty('Add a logline and summary of your book. Click Edit.')); return card; }
  ap(card, tags.length ? h('div', { class: 'sm-tags' }, ...tags.map((g) => h('span', { class: 'wk-pill' }, g))) : null, nv.logline ? h('blockquote', { class: 'sm-log' }, nv.logline) : null,
    ...String(nv.synopsis || '').split(/\n\n+/).filter(Boolean).map((p) => h('p', { class: 'sm-p' }, ...linkify(p))), h('div', { class: 'cs-hint' }, 'Names of notes in your world are linked automatically.'));
  return card;
}
/** parse one task line's text into {text, due, tag} */
function parseTaskText(raw) {
  let text = raw; let due = ''; let tag = '';
  const dm = text.match(/📅\s*(\d{4}-\d{2}-\d{2})/); if (dm) { due = dm[1]; text = text.replace(dm[0], ''); }
  const tm = text.match(/(^|\s)#([\w/-]+)/); if (tm) { tag = ST().todoTags.find((t) => t.toLowerCase().replace(/\s+/g, '-') === tm[2].toLowerCase()) || tm[2]; text = text.replace(tm[0], ' '); }
  return { text: text.replace(/\s+/g, ' ').trim(), due, tag };
}
/** tasks written in other notes (checkbox list items), found through the metadata cache */
async function readNoteTasks() {
  const scope = ST().todoScope || 'all'; if (scope === 'off') return [];
  const todo = normalizePath(ST().todoFile); const out = [];
  for (const f of S.files()) {
    if (f.path === todo) continue; if (scope === 'worldkeeper' && !S.managed(f) && !S.isEntry(f)) continue;
    // frontmatter tasks: a To-Do property holding one task or a list of them ("[x] " prefix = done)
    const fm = S.fm(f); const wanted = String(ST().todoFields || 'To-Do').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
    for (const key of Object.keys(fm)) {
      if (!wanted.includes(key.toLowerCase())) continue;
      arr(fm[key]).forEach((v, index) => {
        if (v == null || v === '') return;
        let raw = typeof v === 'object' ? String(v.task ?? v.text ?? '') : String(v); let isDone = typeof v === 'object' ? !!v.done : false;
        const pm = raw.match(/^\s*\[(.)\]\s*/); if (pm) { isDone = pm[1] !== ' '; raw = raw.slice(pm[0].length); }
        if (raw.trim()) out.push({ ...parseTaskText(raw), done: isDone, file: f, kind: 'fm', key, index, raw });
      });
    }
    const items = ((app().metadataCache.getFileCache(f) || {}).listItems || []).filter((li) => li.task !== undefined);
    if (!items.length) continue;
    const ls = (await app().vault.cachedRead(f)).split('\n');
    for (const li of items) {
      const line = li.position.start.line; const m = (ls[line] || '').match(/^((?:\s*>)*\s*(?:[-*+]|\d+[.)])\s+\[)(.)(\]\s?)(.*)$/); if (!m) continue;
      out.push({ ...parseTaskText(m[4]), done: m[2] !== ' ', file: f, line, raw: m[4] });
    }
  }
  return out;
}
async function setNoteTask(t, { done, text } = {}) {
  if (t.kind === 'fm') {
    await S.write(t.file, (fm) => {
      const isArr = Array.isArray(fm[t.key]); const list = arr(fm[t.key]).slice(); const cur = list[t.index]; if (cur === undefined) return;
      const keep = [...(t.raw.match(/(^|\s)#[\w/-]+/g) || []), ...(t.raw.match(/📅\s*\d{4}-\d{2}-\d{2}/g) || [])].map((x) => x.trim()).join(' ');
      const body = text !== undefined ? text + (keep ? ' ' + keep : '') : t.raw; const d = done === undefined ? t.done : done;
      if (cur && typeof cur === 'object') list[t.index] = { ...cur, [('task' in cur) ? 'task' : 'text']: body, done: d };
      else list[t.index] = (d ? '[x] ' : '') + body;
      fm[t.key] = isArr ? list : list[0];
    });
    return;
  }
  await app().vault.process(t.file, (txt) => {
    const ls = txt.split('\n'); const m = (ls[t.line] || '').match(/^((?:\s*>)*\s*(?:[-*+]|\d+[.)])\s+\[)(.)(\]\s?)(.*)$/); if (!m) return txt;
    const mark = done === undefined ? m[2] : done ? 'x' : ' ';
    let body = m[4];
    if (text !== undefined) { const keep = [...(body.match(/(^|\s)#[\w/-]+/g) || []), ...(body.match(/📅\s*\d{4}-\d{2}-\d{2}/g) || [])].map((x) => x.trim()).join(' '); body = text + (keep ? ' ' + keep : ''); }
    ls[t.line] = m[1] + mark + m[3] + body; return ls.join('\n');
  });
}
async function renderTodos(state) {
  const s = ST(); const today = todayISO(); const st = state.todo ??= { filter: 'open', tag: '', source: 'all' };
  const list = await readTodos(); const noteTasks = await readNoteTasks();
  const save = async () => { await writeTodos(list); state.rerender(); };
  const all = [...list.map((t) => ({ ...t, own: t })), ...noteTasks];
  const open = all.filter((t) => !t.done), done = all.filter((t) => t.done); const overdue = open.filter((t) => t.due && t.due < today).length;
  const card = h('div', { class: 'wk-card td-card' });
  ap(card, h('div', { class: 'card-h' }, h('h3', {}, '☑️ To-do'), h('span', { class: 'wk-pill' }, `${open.length} open`), overdue ? h('span', { class: 'wk-pill warn' }, `${overdue} overdue`) : null, h('span', { class: 'sp' }),
    h('button', { class: 'wk-sm', title: 'Turn Needs attention items into tasks', onclick: async () => { const have = new Set(list.map((t) => t.text)); let k = 0; for (const [n, why] of attention().slice(0, 5)) { const text = `[[${n.basename}]]: ${why}`; if (!have.has(text)) { list.push({ done: false, text, due: '', tag: 'Worldbuilding' }); k++; } } toast(k ? `Added ${k} tasks` : 'Nothing new to add'); if (k) await save(); } }, '+ From Needs attention')));
  const inp = h('input', { type: 'text', class: 'td-in', placeholder: 'Add a task… type [[ to link a note' });
  const tag = h('select', { class: 'dropdown' }, ...s.todoTags.map((t) => h('option', {}, t))); const due = h('input', { type: 'date' });
  const add = async () => { const v = inp.value.trim(); if (!v) return; list.unshift({ done: false, text: v, due: due.value, tag: tag.value }); await save(); };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
  inp.addEventListener('input', () => { if (inp.value.slice(0, inp.selectionStart).endsWith('[[')) { const pos = inp.selectionStart; suggest({ items: S.files().filter((f) => S.managed(f) || S.isEntry(f)).sort(byName).map((f) => ({ label: f.basename, sub: typeLabel(f), value: f.basename })), placeholder: 'Link a note…', onPick: (n) => { inp.value = inp.value.slice(0, pos) + n + ']] ' + inp.value.slice(pos); inp.focus(); } }); } });
  ap(card, h('div', { class: 'td-add' }, inp, tag, due, h('button', { class: 'mod-cta', onclick: add }, 'Add')));
  const tagSel = h('select', { class: 'dropdown wk-sm' }, h('option', { value: '' }, 'All tags'), ...s.todoTags.map((t) => h('option', { selected: st.tag === t }, t))); tagSel.addEventListener('change', () => { st.tag = tagSel.value; state.rerender(); });
  const srcSel = h('select', { class: 'dropdown wk-sm' }, ...[['all', 'All sources'], ['list', 'To-do list'], ['notes', `From notes · ${noteTasks.length}`]].map(([v, l]) => h('option', { value: v, selected: st.source === v }, l))); srcSel.addEventListener('change', () => { st.source = srcSel.value; state.rerender(); });
  ap(card, h('div', { class: 'td-filters' }, ...[['open', `Open · ${open.length}`], ['done', `Done · ${done.length}`], ['all', 'All']].map(([k, l]) => h('button', { class: st.filter === k ? 'is-on' : '', onclick: () => { st.filter = k; state.rerender(); } }, l)), h('span', { class: 'sp' }), noteTasks.length ? srcSel : null, tagSel));
  const shown = all.filter((t) => (st.filter === 'all' || (st.filter === 'done') === t.done) && (!st.tag || t.tag === st.tag) && (st.source === 'all' || (st.source === 'list') === !!t.own));
  const rich = (t) => t.split(/(\[\[[^\]]+\]\])/).map((part) => { const m = part.match(/^\[\[([^\]]+)\]\]$/); if (!m) return part; const a = h('a', { class: 'wk-link' }, display(linkName(part))); a.addEventListener('click', (e) => { e.stopPropagation(); openName(m[1], '', e); }); hover(a, m[1], '', a); return a; });
  const ul = h('ul', { class: 'td-list' }); let drag = null;
  for (const t of shown) {
    const over = !t.done && t.due && t.due < today; const own = t.own;
    const cb = h('input', { type: 'checkbox', checked: t.done });
    cb.addEventListener('change', async () => { if (own) { own.done = cb.checked; await save(); } else { await setNoteTask(t, { done: cb.checked }); setTimeout(() => state.rerender(), 120); } });
    const txt = h('span', { class: 'td-text' }, ...rich(t.text));
    txt.addEventListener('dblclick', () => { const ed = h('input', { type: 'text', value: t.text, class: 'td-edit' }); ed.addEventListener('keydown', (e) => { if (e.key === 'Enter') ed.blur(); }); ed.addEventListener('blur', async () => { const v = ed.value.trim() || t.text; if (own) { own.text = v; await save(); } else { await setNoteTask(t, { text: v }); setTimeout(() => state.rerender(), 120); } }); txt.replaceWith(ed); ed.focus(); });
    const srcChip = own ? null : (() => { const c = h('span', { class: 'td-src', title: `${t.file.path}, line ${t.line + 1}` }, typeIcon(t.file) + ' ' + t.file.basename); c.addEventListener('click', (e) => app().workspace.getLeaf(Keymap.isModEvent(e) ? 'tab' : false).openFile(t.file, { eState: { line: t.line } })); hover(c, t.file.path, '', c); return c; })();
    const li = h('li', { class: 'td-item' + (t.done ? ' is-done' : '') + (own ? '' : ' is-note'), draggable: own ? 'true' : 'false' }, h('span', { class: 'td-grip', title: own ? 'Drag to reorder' : '' }, own ? '⋮⋮' : ''), cb, txt,
      h('span', { class: 'td-meta' }, srcChip, t.due ? h('span', { class: 'td-due' + (over ? ' is-over' : '') }, (over ? '⚠ ' : '📅 ') + new Date(t.due + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })) : null, t.tag ? h('span', { class: 'wk-pill' }, t.tag) : null,
        own ? h('span', { class: 'cs-x', title: 'Delete', onclick: async () => { list.splice(list.indexOf(own), 1); await save(); } }, '✕') : null));
    if (own) {
      li.addEventListener('dragstart', () => { drag = own; li.classList.add('is-dragging'); }); li.addEventListener('dragend', () => li.classList.remove('is-dragging'));
      li.addEventListener('dragover', (e) => { if (drag) { e.preventDefault(); li.classList.add('is-drop'); } }); li.addEventListener('dragleave', () => li.classList.remove('is-drop'));
      li.addEventListener('drop', async (e) => { e.preventDefault(); li.classList.remove('is-drop'); if (!drag || drag === own) return; list.splice(list.indexOf(drag), 1); list.splice(list.indexOf(own), 0, drag); drag = null; await save(); });
    }
    ul.append(li);
  }
  ap(card, shown.length ? ul : empty(st.filter === 'done' ? 'Nothing finished yet.' : 'All clear 🎉'));
  ap(card, h('div', { class: 'td-foot' }, h('span', { class: 'cs-hint' }, `Your list is saved in ${s.todoFile}${s.todoScope === 'off' ? '' : `; checkbox tasks and “${String(s.todoFields || 'To-Do').split(',')[0].trim()}” properties in other notes appear here too`}. Double-click a task to edit it.`),
    list.some((t) => t.done) ? h('button', { class: 'wk-sm', onclick: async () => { for (let i = list.length - 1; i >= 0; i--) if (list[i].done) list.splice(i, 1); await save(); } }, 'Clear done') : null,
    h('button', { class: 'wk-sm', onclick: () => { const f = app().vault.getAbstractFileByPath(normalizePath(s.todoFile)); if (f) openFile(f); else toast('Add a task first'); } }, 'Open file')));
  return card;
}
class HomeView extends ItemView {
  constructor(leaf) { super(leaf); this.state = {}; }
  getViewType() { return VIEW_HOME; }
  getDisplayText() { return 'Worldkeeper home'; }
  getIcon() { return 'globe'; }
  async onOpen() { this.body = this.contentEl.appendChild(h('div', { class: 'wk wk-view' })); this.state.rerender = () => this.run(); this.run = liveRender(this, this.body, async () => this.body.replaceChildren(await renderHome(this.state))); this.run(); }
}
