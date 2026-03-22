/* ═══════════════════════════════════════════════
   LUMINARY — script.js
   All application logic
═══════════════════════════════════════════════ */

'use strict';

// ════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════
let pages = [];
let tasks = [];
let currentPageId = null;
let historyStack = [];
let historyIndex = -1;
let slashRange = null;
let slashSelectedIndex = 0;
let slashItems = [];
let slashVisible = false;
let currentView = 'editor';
let calendarDate = new Date();
let shortcutsOpen = false;
let saveTimer = null;
let colorIndex = 0;

const COLORS = ['#a399ff','#5aabf0','#5cc896','#f0b850','#f07070','#c26aff','#f0eeea'];

// Preset gradients for cover
const GRADIENTS = [
  'linear-gradient(135deg,#0e0e18,#18102e,#0c0c18)',
  'linear-gradient(135deg,#0e1820,#102840,#081020)',
  'linear-gradient(135deg,#180e0e,#2e1010,#180808)',
  'linear-gradient(135deg,#0e180e,#102e10,#081008)',
  'linear-gradient(135deg,#18100e,#2e1c08,#180c04)',
  'linear-gradient(135deg,#100e18,#1c1030,#0c0816)',
  'linear-gradient(135deg,#0e1818,#082828,#040e0e)',
  'linear-gradient(135deg,#181018,#2e0e2e,#0e080e)',
];
const SOLID_COLORS = [
  '#0c0c0e','#0e1020','#100e1a','#0a1808','#180e08',
  '#181008','#08100a','#1a0808','#080808','#0e0e20','#0a1a0a','#1a0a0a',
];

// ════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════
window.addEventListener('load', () => {
  loadData();
  renderSidebar();
  openPage(pages[0]?.id);
  setupEditor();
  setupKeyboardShortcuts();
  renderEmojiGrid();
  setupClickOutside();
  initCoverTabContent('gradients');
});

// ════════════════════════════════════════════
// DATA — LOAD / SAVE (localStorage)
// ════════════════════════════════════════════
function loadData() {
  pages = JSON.parse(localStorage.getItem('lum_pages') || 'null') || defaultPages();
  tasks = JSON.parse(localStorage.getItem('lum_tasks') || 'null') || defaultTasks();
  if (!tasks || tasks.length === 0) {
    tasks = defaultTasks();
  }
}
function saveData() {
  localStorage.setItem('lum_pages', JSON.stringify(pages));
  localStorage.setItem('lum_tasks', JSON.stringify(tasks));
}
function defaultPages() {
  return [
    {
      id: 'home',
      title: 'Welcome to Luminary',
      icon: '✦',
      content: '<h2>Your workspace, your rules.</h2><p>Press <code>/</code> to insert blocks, or just start writing. Everything saves automatically.</p><h3>✨ What you can do</h3><ul><li>Create unlimited pages from the sidebar</li><li>Switch between <strong>Board</strong>, <strong>Database</strong>, and <strong>Calendar</strong> views</li><li>Export your full workspace as a <code>.lmn</code> backup file</li><li>Import it back anytime — zero data loss</li><li>Add a custom cover image to any page</li></ul><blockquote>Start with a thought. End with a system.</blockquote>',
      cover: null,
      created: today(),
      favorite: false,
    },
    {
      id: 'ideas',
      title: 'Ideas & Goals',
      icon: '💡',
      content: '<h2>Ideas & Goals</h2><p>This is your thinking space. No filter, no judgment.</p><ul><li>Big goal #1</li><li>Side project idea</li><li>Things to explore</li></ul>',
      cover: GRADIENTS[1],
      created: today(),
      favorite: true,
    },
    {
      id: 'journal',
      title: 'Daily Journal',
      icon: '📔',
      content: '<h2>Daily Journal</h2><blockquote>Start each day with intention.</blockquote><p>Write about today…</p>',
      cover: null,
      created: today(),
      favorite: false,
    },
  ];
}
function defaultTasks() {
  const base = new Date(); base.setDate(base.getDate() + 5);
  const fmt = d => d.toISOString().split('T')[0];
  return [
    { id: 1, name: 'Design landing page',   status: 'done',     priority: 'high', due: fmt(addDays(-10)), notes: '' },
    { id: 2, name: 'Build editor MVP',       status: 'progress', priority: 'high', due: fmt(addDays(3)),   notes: '' },
    { id: 3, name: 'Write documentation',    status: 'todo',     priority: 'med',  due: fmt(addDays(8)),   notes: '' },
    { id: 4, name: 'User testing rounds',    status: 'todo',     priority: 'low',  due: fmt(addDays(14)),  notes: '' },
    { id: 5, name: 'Performance audit',      status: 'blocked',  priority: 'med',  due: fmt(addDays(2)),   notes: 'Waiting on API' },
  ];
}
function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function today() { return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

// ════════════════════════════════════════════
// EXPORT (as .lmn JSON database) & IMPORT
// ════════════════════════════════════════════
function exportData() {
  const db = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'Luminary',
    pages,
    tasks,
  };
  const json = JSON.stringify(db, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `luminary-backup-${new Date().toISOString().split('T')[0]}.lmn`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exported as .lmn file 💾');
}

function triggerImport() {
  document.getElementById('import-file').click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.name.endsWith('.lmn')) {
    showToast('Please select a valid .lmn backup file');
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const db = JSON.parse(e.target.result);
      if (!db.appName || db.appName !== 'Luminary' || !db.pages || !db.tasks) {
        showToast('Invalid backup file — not a Luminary export');
        return;
      }
      if (!confirm(`Import ${db.pages.length} pages and ${db.tasks.length} tasks?\n\nThis will replace your current workspace.`)) return;
      pages = db.pages;
      tasks = db.tasks;
      saveData();
      renderSidebar();
      openPage(pages[0]?.id);
      showToast(`Imported ${pages.length} pages & ${tasks.length} tasks ✅`);
    } catch {
      showToast('Failed to parse backup file');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ════════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════════
function renderSidebar(filter = '') {
  const list = document.getElementById('pages-list');
  list.innerHTML = '';
  pages
    .filter(p => p.title.toLowerCase().includes(filter.toLowerCase()))
    .forEach(p => {
      const div = document.createElement('div');
      div.className = 'page-item' + (p.id === currentPageId ? ' active' : '');
      div.innerHTML = `
        <span class="page-emoji">${p.icon || '📝'}</span>
        <span class="page-name">${p.title || 'Untitled'}</span>
        ${p.favorite ? '<i class="fa fa-star fav-star"></i>' : ''}
        <span class="page-actions">
          <button onclick="event.stopPropagation();duplicatePage('${p.id}')" title="Duplicate"><i class="fa fa-copy"></i></button>
          <button onclick="event.stopPropagation();deletePage('${p.id}')" title="Delete"><i class="fa fa-trash"></i></button>
        </span>
      `;
      div.onclick = () => openPage(p.id);
      list.appendChild(div);
    });
}
function filterPages(val) { renderSidebar(val); }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('collapsed'); }

// ════════════════════════════════════════════
// PAGE MANAGEMENT
// ════════════════════════════════════════════
function openPage(id) {
  saveCurrentPage();
  currentPageId = id;
  const p = pages.find(x => x.id === id);
  if (!p) return;

  showEditorView();
  applyCoverToUI(p.cover);
  document.getElementById('page-icon').textContent = p.icon || '📝';
  const titleEl = document.getElementById('page-title');
  titleEl.value = p.title || '';
  autoResizeTitle(titleEl);
  document.getElementById('editor').innerHTML = p.content || '';
  document.getElementById('bc-current').textContent = p.title || 'Untitled';
  document.getElementById('meta-created').textContent = p.created || today();
  document.getElementById('meta-modified').textContent = 'just now';
  const favBtn = document.getElementById('fav-btn');
  favBtn.classList.toggle('favorited', !!p.favorite);

  // history
  if (historyStack[historyIndex] !== id) {
    historyStack.splice(historyIndex + 1);
    historyStack.push(id);
    historyIndex = historyStack.length - 1;
  }
  updateWordCount();
  renderSidebar();
}

function saveCurrentPage() {
  if (!currentPageId) return;
  const p = pages.find(x => x.id === currentPageId);
  if (!p) return;
  p.title = document.getElementById('page-title').value;
  p.content = document.getElementById('editor').innerHTML;
  p.icon = document.getElementById('page-icon').textContent;
  saveData();
}

function createNewPage() {
  document.getElementById('np-title').value = '';
  document.getElementById('np-icon').value = '';
  showModal('new-page-modal');
  setTimeout(() => document.getElementById('np-title').focus(), 100);
}

function confirmNewPage() {
  const title = document.getElementById('np-title').value.trim() || 'Untitled';
  const icon = document.getElementById('np-icon').value.trim() || '📝';
  const tpl = document.getElementById('np-template').value;
  const p = {
    id: 'p_' + Date.now(),
    title, icon,
    content: getTemplate(tpl, title),
    cover: null,
    created: today(),
    favorite: false,
  };
  pages.push(p);
  saveData();
  closeModal('new-page-modal');
  openPage(p.id);
  showToast('Page created ✨');
}

function getTemplate(tpl, title) {
  const d = new Date().toDateString();
  const map = {
    blank: '',
    meeting: `<h2>${title}</h2><p><strong>Date:</strong> ${d}</p><h3>Agenda</h3><ul><li>Item 1</li><li>Item 2</li></ul><h3>Notes</h3><p></p><h3>Action Items</h3><ul class="todo-list"><li class="todo-item"><input type="checkbox" class="todo-check" /><span class="todo-text" contenteditable="true">Task</span></li></ul>`,
    todo: `<h2>${title}</h2><ul class="todo-list"><li class="todo-item"><input type="checkbox" class="todo-check" /><span class="todo-text" contenteditable="true">Task 1</span></li><li class="todo-item"><input type="checkbox" class="todo-check" /><span class="todo-text" contenteditable="true">Task 2</span></li><li class="todo-item"><input type="checkbox" class="todo-check" /><span class="todo-text" contenteditable="true">Task 3</span></li></ul>`,
    journal: `<h2>${title}</h2><p><strong>${d}</strong></p><blockquote>Today's intention…</blockquote><h3>Highlights</h3><p></p><h3>Gratitude</h3><ul><li></li></ul>`,
    project: `<h2>${title}</h2><h3>Overview</h3><p>Describe the project…</p><h3>Goals</h3><ul><li>Goal 1</li></ul><h3>Timeline</h3><p>Start → End</p><h3>Resources</h3><p></p>`,
    braindump: `<h2>${title}</h2><p>Just write. No rules. Dump everything here.</p><p></p>`,
  };
  return map[tpl] || '';
}

function deletePage(id) {
  if (pages.length <= 1) { showToast('Cannot delete the last page'); return; }
  if (!confirm('Delete this page permanently?')) return;
  pages = pages.filter(p => p.id !== id);
  saveData();
  if (currentPageId === id) openPage(pages[0].id);
  else renderSidebar();
  showToast('Page deleted');
}

function duplicatePage(id) {
  const p = pages.find(x => x.id === id);
  if (!p) return;
  const copy = { ...p, id: 'p_' + Date.now(), title: p.title + ' (Copy)', created: today() };
  pages.push(copy);
  saveData();
  renderSidebar();
  showToast('Page duplicated');
}

function toggleFavorite() {
  const p = pages.find(x => x.id === currentPageId);
  if (!p) return;
  p.favorite = !p.favorite;
  saveData();
  document.getElementById('fav-btn').classList.toggle('favorited', p.favorite);
  renderSidebar();
  showToast(p.favorite ? '⭐ Favorited' : 'Removed from favorites');
}

// ════════════════════════════════════════════
// COVER — per-page, supports gradient, color, image URL, upload
// ════════════════════════════════════════════
function applyCoverToUI(cover) {
  const el = document.getElementById('page-cover');
  // Remove any existing img
  const existing = el.querySelector('img.cover-img');
  if (existing) existing.remove();

  if (!cover) {
    el.classList.remove('has-cover');
    el.style.background = '';
    return;
  }
  el.classList.add('has-cover');
  if (cover.startsWith('data:') || cover.startsWith('http')) {
    // image
    el.style.background = 'transparent';
    const img = document.createElement('img');
    img.className = 'cover-img';
    img.src = cover;
    el.insertBefore(img, el.firstChild);
  } else {
    el.style.background = cover;
  }
}

function setPageCover(coverValue) {
  const p = pages.find(x => x.id === currentPageId);
  if (!p) return;
  p.cover = coverValue;
  saveData();
  applyCoverToUI(coverValue);
  closeModal('cover-picker');
  showToast('Cover updated 🎨');
}

function removeCover() {
  setPageCover(null);
  showToast('Cover removed');
}

function showCoverPicker() {
  showModal('cover-picker');
}

function switchCoverTab(tab, btn) {
  document.querySelectorAll('.cover-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  initCoverTabContent(tab);
}

function initCoverTabContent(tab) {
  const el = document.getElementById('cover-tab-content');
  if (tab === 'gradients') {
    el.innerHTML = '<div class="gradient-grid" id="gradient-grid"></div>';
    const grid = document.getElementById('gradient-grid');
    GRADIENTS.forEach(g => {
      const s = document.createElement('div');
      s.className = 'gradient-swatch';
      s.style.background = g;
      s.onclick = () => setPageCover(g);
      grid.appendChild(s);
    });
  } else if (tab === 'colors') {
    el.innerHTML = '<div class="color-grid" id="color-grid"></div>';
    const grid = document.getElementById('color-grid');
    SOLID_COLORS.forEach(c => {
      const s = document.createElement('div');
      s.className = 'color-swatch';
      s.style.background = c;
      s.onclick = () => setPageCover(c);
      grid.appendChild(s);
    });
  } else if (tab === 'upload') {
    el.innerHTML = `
      <div class="upload-area" onclick="document.getElementById('cover-upload').click()">
        <i class="fa fa-cloud-upload-alt"></i>
        <span>Click to upload an image</span>
        <small>PNG, JPG, WEBP up to 5MB</small>
      </div>
      <input type="file" id="cover-upload" accept="image/*" style="display:none" onchange="handleCoverUpload(event)">
    `;
  } else if (tab === 'url') {
    el.innerHTML = `
      <label style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:8px;">Image URL</label>
      <div class="url-input-wrap">
        <input type="url" id="cover-url-input" placeholder="https://example.com/image.jpg" style="background:var(--bg4);border:1px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);padding:9px 12px;font-size:13px;font-family:'Syne',sans-serif;outline:none;width:100%;" />
        <button class="btn btn-primary" onclick="applyCoverUrl()">Apply</button>
      </div>
    `;
  }
}

function handleCoverUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Image too large (max 5MB)'); return; }
  const reader = new FileReader();
  reader.onload = (e) => setPageCover(e.target.result);
  reader.readAsDataURL(file);
}

function applyCoverUrl() {
  const url = document.getElementById('cover-url-input').value.trim();
  if (!url) { showToast('Please enter an image URL'); return; }
  setPageCover(url);
}

// ════════════════════════════════════════════
// EDITOR SETUP
// ════════════════════════════════════════════
function setupEditor() {
  const editor = document.getElementById('editor');

  editor.addEventListener('keydown', e => {
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      const sel = window.getSelection();
      if (sel.rangeCount) {
        slashRange = sel.getRangeAt(0).cloneRange();
        showSlashMenu();
      }
    }
    if (slashVisible) {
      if (e.key === 'ArrowDown') { e.preventDefault(); navigateSlash(1); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); navigateSlash(-1); return; }
      if (e.key === 'Enter')     { e.preventDefault(); executeSlash(slashSelectedIndex); return; }
      if (e.key === 'Escape')    { hideSlashMenu(); return; }
    }
    if (e.key === 'Enter' && !slashVisible) hideSlashMenu();
  });

  editor.addEventListener('input', () => {
    updateWordCount();
    scheduleSave();
    if (slashVisible) filterSlashMenu();
  });

  editor.addEventListener('mouseup', showFloatToolbar);
  editor.addEventListener('keyup', e => {
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
    showFloatToolbar();
  });

  // ── TODO CHECKBOX HANDLER ──
  // Use click on the editor and delegate to .todo-check checkboxes
  editor.addEventListener('click', e => {
    const checkbox = e.target.closest('.todo-check');
    if (!checkbox) return;
    const textEl = checkbox.closest('.todo-item')?.querySelector('.todo-text');
    if (!textEl) return;
    if (checkbox.checked) {
      textEl.style.textDecoration = 'line-through';
      textEl.style.opacity = '0.45';
    } else {
      textEl.style.textDecoration = 'none';
      textEl.style.opacity = '1';
    }
    scheduleSave();
  });
}

// ════════════════════════════════════════════
// CLICK OUTSIDE — FIX #1: shortcuts panel closes on outside click
// ════════════════════════════════════════════
function setupClickOutside() {
  document.addEventListener('mousedown', e => {
    // Float toolbar
    if (!e.target.closest('#float-toolbar')) hideFloatToolbar();

    // Slash menu
    if (!e.target.closest('#slash-menu') && !e.target.closest('#editor')) {
      if (slashVisible) hideSlashMenu();
    }

    // Emoji picker
    if (!e.target.closest('#emoji-picker') && !e.target.closest('#page-icon')) hideEmojiPicker();

    // Shortcuts panel — FIX #1: close when clicking anywhere outside the panel & its toggle button
    if (shortcutsOpen) {
      const panel = document.getElementById('shortcuts-panel');
      const toggle = document.getElementById('shortcuts-toggle');
      if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        closeShortcuts();
      }
    }

    // Modals — close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(mo => {
      if (e.target === mo) closeModal(mo.id);
    });
  });
}

// ════════════════════════════════════════════
// AUTO SAVE
// ════════════════════════════════════════════
function scheduleSave() {
  clearTimeout(saveTimer);
  const status = document.getElementById('save-status');
  status.textContent = 'Saving…';
  saveTimer = setTimeout(() => {
    saveCurrentPage();
    status.textContent = 'Saved';
  }, 1800);
}

// ════════════════════════════════════════════
// RICH TEXT FORMATTING
// ════════════════════════════════════════════
function fmt(cmd) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  const range = sel.getRangeAt(0);
  const editor = document.getElementById('editor');
  
  if (cmd === 'bold') {
    wrapSelection('strong');
  } else if (cmd === 'italic') {
    wrapSelection('em');
  } else if (cmd === 'underline') {
    wrapSelection('u');
  } else if (cmd === 'strikeThrough') {
    wrapSelection('s');
  } else if (cmd === 'insertUnorderedList') {
    createList('ul');
  } else if (cmd === 'insertOrderedList') {
    createList('ol');
  } else {
    // Fallback for other commands
    document.execCommand(cmd, false, null);
  }
}

function wrapSelection(tagName) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  const range = sel.getRangeAt(0);
  const element = document.createElement(tagName);
  
  try {
    range.surroundContents(element);
    sel.removeAllRanges();
    sel.addRange(document.createRange());
    const newRange = document.createRange();
    newRange.selectNodeContents(element);
    newRange.collapse(false);
    sel.addRange(newRange);
  } catch (e) {
    // If surroundContents fails, use a different approach
    const contents = range.extractContents();
    element.appendChild(contents);
    range.insertNode(element);
    
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(element);
    newRange.collapse(false);
    sel.addRange(newRange);
  }
}

function createList(tagName) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  const range = sel.getRangeAt(0);
  const list = document.createElement(tagName);
  const li = document.createElement('li');
  
  const contents = range.extractContents();
  li.appendChild(contents);
  list.appendChild(li);
  
  range.insertNode(list);
  
  sel.removeAllRanges();
  const newRange = document.createRange();
  newRange.setStart(li, li.childNodes.length);
  newRange.collapse(true);
  sel.addRange(newRange);
}

function fmtBlock(tag) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const el = document.createElement(tag === 'blockquote' ? 'blockquote' : tag);
  const range = sel.getRangeAt(0);
  const block = findBlock(range.commonAncestorContainer);
  const editor = document.getElementById('editor');
  if (block && block !== editor) {
    el.innerHTML = block.innerHTML || '<br>';
    block.replaceWith(el);
  } else {
    el.innerHTML = sel.toString() || '<br>';
    range.deleteContents();
    range.insertNode(el);
  }
  const nr = document.createRange();
  nr.selectNodeContents(el);
  nr.collapse(false);
  sel.removeAllRanges(); sel.addRange(nr);
}

function findBlock(node) {
  const BLOCKS = ['P','H1','H2','H3','BLOCKQUOTE','LI','DIV'];
  while (node && node.nodeType !== 1) node = node.parentNode;
  while (node && !BLOCKS.includes(node.tagName) && node.id !== 'editor') node = node.parentNode;
  return node;
}

function insertCode() {
  const sel = window.getSelection();
  const text = sel.toString() || 'code here';
  insertBlock(`<pre><code>${text}</code></pre>`);
}

function promptLink() {
  const url = prompt('Enter URL:');
  if (url) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    
    const range = sel.getRangeAt(0);
    const link = document.createElement('a');
    link.href = url;
    link.textContent = sel.toString() || url;
    
    range.deleteContents();
    range.insertNode(link);
    
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStartAfter(link);
    newRange.collapse(true);
    sel.addRange(newRange);
  }
}

function cycleColor() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.style.color = COLORS[colorIndex % COLORS.length];
  span.textContent = sel.toString();
  
  range.deleteContents();
  range.insertNode(span);
  
  sel.removeAllRanges();
  const newRange = document.createRange();
  newRange.setStartAfter(span);
  newRange.collapse(true);
  sel.addRange(newRange);
  
  colorIndex++;
}

function showFloatToolbar() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.toString().trim()) { hideFloatToolbar(); return; }
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  const tb = document.getElementById('float-toolbar');
  tb.style.display = 'flex';
  tb.style.top = Math.max(4, rect.top - 46) + 'px';
  tb.style.left = Math.max(8, rect.left + rect.width / 2 - 200) + 'px';
}
function hideFloatToolbar() { document.getElementById('float-toolbar').style.display = 'none'; }

function updateWordCount() {
  const text = document.getElementById('editor').innerText || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById('word-count').textContent = words;
  document.getElementById('read-time').textContent = Math.max(1, Math.ceil(words / 200)) + ' min read';
}

function autoResizeTitle(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
function onTitleInput(el) {
  autoResizeTitle(el);
  document.getElementById('bc-current').textContent = el.value || 'Untitled';
  scheduleSave();
}
function titleKeydown(e) {
  if (e.key === 'Enter' || e.key === 'ArrowDown') {
    e.preventDefault();
    document.getElementById('editor').focus();
  }
}

function insertBlock(html) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  const range = sel.getRangeAt(0);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const fragment = document.createDocumentFragment();
  
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  
  range.deleteContents();
  range.insertNode(fragment);
  
  // Move cursor to end of inserted content
  sel.removeAllRanges();
  const newRange = document.createRange();
  const lastNode = fragment.lastChild;
  if (lastNode.nodeType === Node.TEXT_NODE) {
    newRange.setStart(lastNode, lastNode.length);
  } else {
    newRange.setStartAfter(lastNode);
  }
  newRange.collapse(true);
  sel.addRange(newRange);
}
function insertTable() {
  insertBlock(`<table><tr><th>Column A</th><th>Column B</th><th>Column C</th></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr></table>`);
}

// ════════════════════════════════════════════
// SLASH COMMAND MENU
// ════════════════════════════════════════════
const SLASH_COMMANDS = [
  { group: 'Text', items: [
    { icon: '¶',    name: 'Paragraph',    desc: 'Plain text block',       cmd: () => insertBlock('<p><br></p>') },
    { icon: 'H1',   name: 'Heading 1',    desc: 'Large header',           cmd: () => fmtBlock('h1') },
    { icon: 'H2',   name: 'Heading 2',    desc: 'Medium header',          cmd: () => fmtBlock('h2') },
    { icon: 'H3',   name: 'Heading 3',    desc: 'Small header',           cmd: () => fmtBlock('h3') },
    { icon: '❝',    name: 'Blockquote',   desc: 'Highlighted callout',    cmd: () => fmtBlock('blockquote') },
  ]},
  { group: 'Lists', items: [
    { icon: '•',    name: 'Bullet List',  desc: 'Unordered list',         cmd: () => fmt('insertUnorderedList') },
    { icon: '1.',   name: 'Numbered',     desc: 'Ordered list',           cmd: () => fmt('insertOrderedList') },
    { icon: '☑',    name: 'Todo',         desc: 'Checklist items',        cmd: () => insertBlock('<ul class="todo-list"><li class="todo-item"><input type="checkbox" class="todo-check" /><span class="todo-text" contenteditable="true">To-do item</span></li></ul>') },
  ]},
  { group: 'Media & Code', items: [
    { icon: '</>',  name: 'Code Block',   desc: 'Code snippet',           cmd: () => insertBlock('<pre><code>// your code here</code></pre>') },
    { icon: '—',    name: 'Divider',      desc: 'Horizontal rule',        cmd: () => insertBlock('<hr>') },
    { icon: '⊞',    name: 'Table',        desc: '3×2 table',              cmd: () => insertTable() },
  ]},
  { group: 'Views', items: [
    { icon: '☷',    name: 'Board View',   desc: 'Kanban task board',      cmd: () => { hideSlashMenu(); openView('kanban'); } },
    { icon: '⊟',    name: 'Database',     desc: 'Spreadsheet table view', cmd: () => { hideSlashMenu(); openView('table'); } },
    { icon: '📅',   name: 'Calendar',     desc: 'Calendar view',          cmd: () => { hideSlashMenu(); openView('calendar'); } },
  ]},
];

let slashFilter = '';

function showSlashMenu() {
  slashFilter = '';
  slashSelectedIndex = 0;
  slashVisible = true;
  renderSlashMenu();
  positionSlashMenu();
  document.getElementById('slash-menu').style.display = 'block';
}
function hideSlashMenu() {
  slashVisible = false;
  document.getElementById('slash-menu').style.display = 'none';
  slashRange = null;
}
function filterSlashMenu() {
  if (!slashVisible || !slashRange) return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const cur = sel.getRangeAt(0).cloneRange();
  try {
    cur.setStart(slashRange.startContainer, slashRange.startOffset);
    slashFilter = cur.toString().replace(/^\//, '').toLowerCase();
  } catch { slashFilter = ''; }
  slashSelectedIndex = 0;
  renderSlashMenu();
}
function renderSlashMenu() {
  const menu = document.getElementById('slash-menu');
  menu.innerHTML = '';
  slashItems = [];
  SLASH_COMMANDS.forEach(group => {
    const visible = group.items.filter(i =>
      !slashFilter ||
      i.name.toLowerCase().includes(slashFilter) ||
      i.desc.toLowerCase().includes(slashFilter)
    );
    if (!visible.length) return;
    const gl = document.createElement('div');
    gl.className = 'slash-group';
    gl.textContent = group.group;
    menu.appendChild(gl);
    visible.forEach(item => {
      const idx = slashItems.length;
      const div = document.createElement('div');
      div.className = 'slash-item' + (idx === slashSelectedIndex ? ' selected' : '');
      div.innerHTML = `
        <div class="slash-icon">${item.icon}</div>
        <div><div class="slash-name">${item.name}</div><div class="slash-desc">${item.desc}</div></div>
      `;
      div.onmousedown = (e) => { e.preventDefault(); executeSlash(idx); };
      slashItems.push(item);
      menu.appendChild(div);
    });
  });
}
function printPage() {
  window.print();
}
function positionSlashMenu() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  const menu = document.getElementById('slash-menu');
  const spaceBelow = window.innerHeight - rect.bottom;
  menu.style.top = spaceBelow > 360
    ? (rect.bottom + 4) + 'px'
    : (rect.top - menu.offsetHeight - 4) + 'px';
  menu.style.left = Math.max(8, rect.left) + 'px';
}
function navigateSlash(dir) {
  slashSelectedIndex = Math.max(0, Math.min(slashItems.length - 1, slashSelectedIndex + dir));
  document.querySelectorAll('#slash-menu .slash-item').forEach((el, i) =>
    el.classList.toggle('selected', i === slashSelectedIndex)
  );
}
function executeSlash(idx) {
  if (!slashItems[idx]) return;
  if (slashRange) {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      try {
        const r = document.createRange();
        r.setStart(slashRange.startContainer, slashRange.startOffset);
        r.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
        r.deleteContents();
        sel.removeAllRanges(); sel.addRange(r);
      } catch {}
    }
  }
  hideSlashMenu();
  slashItems[idx].cmd();
}

// ════════════════════════════════════════════
// EMOJI PICKER
// ════════════════════════════════════════════
const EMOJIS = ['📝','🏠','💡','📔','🚀','⭐','🎯','🔥','💎','🌟','📊','🎨','🧠','📚','⚡','🌙','🔮','🌈','🎵','🏆','🦋','🌿','💻','🎭','🔑','🌺','🦁','🐉','🌊','☀️','🎪','🏔️','🎸','🌸','🦄','🔬','🎓','💬','🌍','🏛️','✦','◈','⬡','⬢','◉'];

function renderEmojiGrid() {
  const grid = document.getElementById('emoji-grid');
  EMOJIS.forEach(e => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = e;
    btn.onclick = () => {
      document.getElementById('page-icon').textContent = e;
      hideEmojiPicker();
      scheduleSave();
    };
    grid.appendChild(btn);
  });
}
function showEmojiPicker(event) {
  const picker = document.getElementById('emoji-picker');
  picker.style.display = 'block';
  const x = Math.min(event.clientX, window.innerWidth - 290);
  const y = Math.min(event.clientY + 10, window.innerHeight - 300);
  picker.style.left = x + 'px';
  picker.style.top = y + 'px';
}
function hideEmojiPicker() { document.getElementById('emoji-picker').style.display = 'none'; }

// ════════════════════════════════════════════
// VIEWS
// ════════════════════════════════════════════
function openView(type) {
  saveCurrentPage();
  currentView = type;
  document.getElementById('content').style.display = 'none';
  const vp = document.getElementById('view-panel');
  vp.style.display = 'flex';

  const titles = { kanban: 'Board', table: 'Database', calendar: 'Calendar' };
  document.getElementById('view-title').textContent = titles[type] || type;

  const TABS = [
    { label: '☷  Board',    view: 'kanban' },
    { label: '⊟  Table',    view: 'table' },
    { label: '📅 Calendar', view: 'calendar' },
    { label: '← Editor',   view: 'back' },
  ];
  const tabsEl = document.getElementById('view-tabs');
  tabsEl.innerHTML = '';
  TABS.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'view-tab' + (t.view === type ? ' active' : '');
    btn.textContent = t.label;
    btn.onclick = () => t.view === 'back' ? showEditorView() : openView(t.view);
    tabsEl.appendChild(btn);
  });

  if (type === 'kanban')   renderKanban();
  else if (type === 'table')    renderTable();
  else if (type === 'calendar') renderCalendar();

  // Update nav active
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.textContent.trim().toLowerCase().startsWith(type === 'kanban' ? 'board' : type)) el.classList.add('active');
  });
}

function showEditorView() {
  currentView = 'editor';
  document.getElementById('content').style.display = 'block';
  document.getElementById('view-panel').style.display = 'none';
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  renderSidebar();
}

// ── KANBAN ──
const STATUS_COLS = [
  { id: 'todo',     label: 'To Do',       color: '#55545d' },
  { id: 'progress', label: 'In Progress',  color: '#5aabf0' },
  { id: 'done',     label: 'Done',         color: '#5cc896' },
  { id: 'blocked',  label: 'Blocked',      color: '#f07070' },
];

function renderKanban() {
  const board = document.createElement('div');
  board.className = 'kanban-board';
  STATUS_COLS.forEach(col => {
    const colTasks = tasks.filter(t => t.status === col.id);
    const colEl = document.createElement('div');
    colEl.className = 'kanban-col';
    colEl.dataset.col = col.id;
    colEl.innerHTML = `
      <div class="kanban-col-hd">
        <div class="col-label">
          <div class="col-dot" style="background:${col.color}"></div>
          ${col.label}
        </div>
        <div class="col-count">${colTasks.length}</div>
      </div>
      <div class="kanban-cards"></div>
    `;
    const cardsEl = colEl.querySelector('.kanban-cards');
    colTasks.forEach(task => cardsEl.appendChild(makeKanbanCard(task)));

    const addBtn = document.createElement('button');
    addBtn.className = 'add-card';
    addBtn.innerHTML = '<i class="fa fa-plus"></i> Add card';
    addBtn.onclick = () => {
      document.getElementById('task-status').value = col.id;
      showModal('task-modal');
    };
    colEl.appendChild(addBtn);
    setupColDrop(colEl);
    board.appendChild(colEl);
  });
  document.getElementById('view-content').innerHTML = '';
  document.getElementById('view-content').appendChild(board);
}

function makeKanbanCard(task) {
  const div = document.createElement('div');
  div.className = 'kanban-card';
  div.draggable = true;
  div.dataset.id = task.id;
  const tagClass = { high: 'tag-p', med: 'tag-m', low: 'tag-l' };
  div.innerHTML = `
    <div class="card-header">
      <div class="card-title">${task.name}</div>
      <button class="card-delete-btn" title="Delete card" onclick="deleteTask(${task.id}, event)">
        <i class="fa fa-times"></i>
      </button>
    </div>
    <div class="card-tags">
      <span class="card-tag ${tagClass[task.priority] || 'tag-m'}">${(task.priority || 'med').toUpperCase()}</span>
    </div>
    <div class="card-foot">
      <div class="card-due"><i class="fa fa-calendar"></i> ${task.due || '—'}</div>
      <div class="card-av">Y</div>
    </div>
  `;
  const bColors = { high: 'var(--red)', med: 'var(--amber)', low: 'var(--green)' };
  div.style.setProperty('--card-color', bColors[task.priority] || 'var(--accent)');

  div.addEventListener('dragstart', e => {
    e.dataTransfer.setData('taskId', task.id);
    div.classList.add('dragging');
  });
  div.addEventListener('dragend', () => div.classList.remove('dragging'));
  return div;
}

function deleteTask(id, event) {
  event.stopPropagation();
  event.preventDefault();
  tasks = tasks.filter(t => t.id !== id);
  saveData();
  if (currentView === 'kanban')        renderKanban();
  else if (currentView === 'table')    renderTable();
  else if (currentView === 'calendar') renderCalendar();
  showToast('Card deleted');
}

function setupColDrop(colEl) {
  colEl.addEventListener('dragover', e => { e.preventDefault(); colEl.classList.add('drag-over'); });
  colEl.addEventListener('dragleave', () => colEl.classList.remove('drag-over'));
  colEl.addEventListener('drop', e => {
    e.preventDefault();
    colEl.classList.remove('drag-over');
    const id = parseInt(e.dataTransfer.getData('taskId'));
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = colEl.dataset.col;
      saveData();
      renderKanban();
      showToast('Status updated ✓');
    }
  });
}

// ── TABLE VIEW ──
function renderTable() {
  const wrap = document.createElement('div');
  const table = document.createElement('table');
  table.className = 'db-table';
  table.innerHTML = `<thead><tr>
    <th>Task</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Notes</th><th></th>
  </tr></thead>`;
  const tbody = document.createElement('tbody');
  tasks.forEach(t => {
    const tr = document.createElement('tr');
    const sc = { todo:'s-todo', progress:'s-progress', done:'s-done', blocked:'s-blocked' };
    const sl = { todo:'○ To Do', progress:'◑ In Progress', done:'● Done', blocked:'✕ Blocked' };
    const pc = { high:'ph', med:'pm', low:'pl' };
    tr.innerHTML = `
      <td>${t.name}</td>
      <td><span class="status-b ${sc[t.status]}">${sl[t.status]}</span></td>
      <td><span class="prio-b ${pc[t.priority]}">${(t.priority||'med').toUpperCase()}</span></td>
      <td>${t.due || '—'}</td>
      <td style="color:var(--text3);font-style:italic;">${t.notes || '—'}</td>
      <td><button class="row-delete-btn" onclick="deleteTask(${t.id}, event)" title="Delete"><i class="fa fa-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  const addBtn = document.createElement('button');
  addBtn.className = 'add-row';
  addBtn.innerHTML = '<i class="fa fa-plus"></i> New row';
  addBtn.onclick = () => showModal('task-modal');
  wrap.appendChild(addBtn);
  document.getElementById('view-content').innerHTML = '';
  document.getElementById('view-content').appendChild(wrap);
}

// ── CALENDAR VIEW ──
function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date().getDate();
  const todayMonth = new Date().getMonth();
  const todayYear = new Date().getFullYear();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const wrap = document.createElement('div');

  // Nav
  const nav = document.createElement('div');
  nav.className = 'cal-nav';
  nav.innerHTML = `
    <button class="cal-nav-btn" onclick="changeCalMonth(-1)"><i class="fa fa-chevron-left"></i></button>
    <h3>${monthNames[month]} ${year}</h3>
    <button class="cal-nav-btn" onclick="changeCalMonth(1)"><i class="fa fa-chevron-right"></i></button>
    <button class="cal-nav-btn" onclick="calendarDate=new Date();renderCalendar()" style="margin-left:8px">Today</button>
  `;
  wrap.appendChild(nav);

  const grid = document.createElement('div');
  grid.className = 'cal-grid';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    const dn = document.createElement('div');
    dn.className = 'cal-dn'; dn.textContent = d;
    grid.appendChild(dn);
  });

  let dayCount = 1, nextCount = 1;
  for (let i = 0; i < 42; i++) {
    let num, other = false;
    if (i < firstDay) { num = daysInPrev - firstDay + 1 + i; other = true; }
    else if (dayCount <= daysInMonth) { num = dayCount++; }
    else { num = nextCount++; other = true; }

    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (other) cell.classList.add('other');
    if (!other && num === today && month === todayMonth && year === todayYear) cell.classList.add('today');

    const numEl = document.createElement('div');
    numEl.className = 'cal-num'; numEl.textContent = num;
    cell.appendChild(numEl);

    if (!other) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(num).padStart(2,'0')}`;
      tasks.filter(t => t.due === dateStr).forEach(t => {
        const ev = document.createElement('div');
        ev.className = 'cal-ev'; ev.textContent = t.name;
        cell.appendChild(ev);
      });
      cell.onclick = () => {
        document.getElementById('task-due').value = dateStr;
        showModal('task-modal');
      };
    }
    grid.appendChild(cell);
  }
  wrap.appendChild(grid);
  document.getElementById('view-content').innerHTML = '';
  document.getElementById('view-content').appendChild(wrap);
}

function changeCalMonth(dir) {
  calendarDate.setMonth(calendarDate.getMonth() + dir);
  renderCalendar();
}

// ════════════════════════════════════════════
// MODALS
// ════════════════════════════════════════════
function showModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function confirmTask() {
  const name = document.getElementById('task-name').value.trim();
  if (!name) { showToast('Please enter a task name'); return; }
  const task = {
    id: Date.now(),
    name,
    status:   document.getElementById('task-status').value,
    priority: document.getElementById('task-priority').value,
    due:      document.getElementById('task-due').value,
    notes:    document.getElementById('task-notes').value,
  };
  tasks.push(task);
  saveData();
  closeModal('task-modal');
  document.getElementById('task-name').value = '';
  document.getElementById('task-notes').value = '';
  document.getElementById('task-due').value = '';
  showToast('Task added ✅');
  if (currentView === 'kanban')        renderKanban();
  else if (currentView === 'table')    renderTable();
  else if (currentView === 'calendar') renderCalendar();
}

function copyShareLink() {
  navigator.clipboard.writeText(document.getElementById('share-link').value).catch(() => {});
  showToast('Link copied 🔗');
  closeModal('share-modal');
}

function saveSettings() {
  closeModal('settings-modal');
  showToast('Settings saved ✓');
}
function changeFont(val) {
  const fonts = { syne: "'Syne', sans-serif", serif: "'Fraunces', serif", mono: "'Fira Code', monospace" };
  document.getElementById('editor').style.fontFamily = fonts[val] || fonts.syne;
}
function toggleFullWidth(val) {
  const ew = document.querySelector('.editor-wrap');
  const ph = document.querySelector('.page-header');
  if (val === 'yes') {
    ew.style.maxWidth = '100%'; ew.style.padding = '8px 40px 100px';
    ph.style.padding = '28px 40px 0';
  } else {
    ew.style.maxWidth = ''; ew.style.padding = '';
    ph.style.padding = '';
  }
}

// ════════════════════════════════════════════
// SHORTCUTS PANEL — FIX #1
// ════════════════════════════════════════════
function toggleShortcuts() {
  shortcutsOpen = !shortcutsOpen;
  document.getElementById('shortcuts-panel').classList.toggle('open', shortcutsOpen);
  document.getElementById('shortcuts-toggle').classList.toggle('active', shortcutsOpen);
}
function closeShortcuts() {
  shortcutsOpen = false;
  document.getElementById('shortcuts-panel').classList.remove('open');
  document.getElementById('shortcuts-toggle').classList.remove('active');
}

// ════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ════════════════════════════════════════════
// NAVIGATION HISTORY
// ════════════════════════════════════════════
function goBack() {
  if (historyIndex > 0) { historyIndex--; openPage(historyStack[historyIndex]); }
}
function goForward() {
  if (historyIndex < historyStack.length - 1) { historyIndex++; openPage(historyStack[historyIndex]); }
}

// ════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════════════════
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key === 's') { e.preventDefault(); saveCurrentPage(); document.getElementById('save-status').textContent = 'Saved'; showToast('Saved ✓'); }
    if (ctrl && e.key === 'k') { e.preventDefault(); document.getElementById('search-input').focus(); }
    if (ctrl && e.key === 'n') { e.preventDefault(); createNewPage(); }
    if (ctrl && e.key === 'e') { e.preventDefault(); exportData(); }
    if (ctrl && e.key === '\\') { e.preventDefault(); toggleSidebar(); }
    if (e.key === 'Escape') {
      closeAllModals();
      hideSlashMenu();
      hideEmojiPicker();
      hideFloatToolbar();
      if (shortcutsOpen) closeShortcuts();
    }
  });
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}
