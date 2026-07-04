const LOG_KEY     = 'shikdan_log';
const FOLDERS_KEY = 'shikdan_folders2';

let currentDate   = toDateStr(new Date());
let activeFilter  = 'all';   // 'all' | 'meal:아침' | 'folder:id'
let selectedFood  = null;    // FOODS_DB item
let movingLogId   = null;

// ── 날짜 유틸 ─────────────────────────────
function toDateStr(d) {
  return d.toFullYear
    ? d.toFullYear()
    : d.toISOString().slice(0, 10);
}
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function formatDateKo(str) {
  const d = new Date(str + 'T00:00:00');
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}
function changeDate(delta) {
  const d = new Date(currentDate + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  currentDate = toDateStr(d);
  renderAll();
}

// ── 스토리지 ──────────────────────────────
function getLog()     { return JSON.parse(localStorage.getItem(LOG_KEY)     || '[]'); }
function saveLog(l)   { localStorage.setItem(LOG_KEY,     JSON.stringify(l)); }
function getFolders() { return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]'); }
function saveFolders(f){ localStorage.setItem(FOLDERS_KEY, JSON.stringify(f)); }

// ── 영양 계산 ─────────────────────────────
function calcNutrients(food, grams) {
  const ratio = grams / 100;
  const result = {};
  for (const key of Object.keys(food.nutrients)) {
    result[key] = Math.round(food.nutrients[key] * ratio * 10) / 10;
  }
  return result;
}

function sumNutrients(entries) {
  const total = {};
  for (const e of entries) {
    const n = calcNutrients(e.food, e.grams);
    for (const [k, v] of Object.entries(n)) {
      total[k] = (total[k] || 0) + v;
    }
  }
  for (const k of Object.keys(total)) {
    total[k] = Math.round(total[k] * 10) / 10;
  }
  return total;
}

// ── 초성 검색 ─────────────────────────────
const CHOSUNGS = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function getChosung(str) {
  return [...str].map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return ch;
    return CHOSUNGS[Math.floor(code / 588)];
  }).join('');
}

function isChosungOnly(str) {
  return [...str].every(ch => CHOSUNGS.includes(ch));
}

function matchesQuery(food, q) {
  const name = food.name.toLowerCase();
  const cat  = food.category.toLowerCase();
  if (isChosungOnly(q)) {
    return getChosung(name).includes(q) || getChosung(cat).includes(q);
  }
  return name.includes(q) || cat.includes(q);
}

// ── 검색 ──────────────────────────────────
function onSearchInput() {
  const q = document.getElementById('food-search').value.trim().toLowerCase();
  const dd = document.getElementById('search-dropdown');
  if (!q) { dd.style.display = 'none'; return; }

  const results = FOODS_DB.filter(f => matchesQuery(f, q)).slice(0, 10);

  if (!results.length) { dd.style.display = 'none'; return; }

  dd.innerHTML = results.map(f => `
    <div class="dropdown-item" onclick="selectFood(${f.id})">
      <span class="food-emoji">${f.emoji}</span>
      <span class="food-name">${f.name}</span>
      <span class="food-cat">${f.category}</span>
      <span class="food-cal">${f.nutrients.cal}kcal</span>
    </div>
  `).join('');
  dd.style.display = 'block';
}

function selectFood(id) {
  selectedFood = FOODS_DB.find(f => f.id === id);
  document.getElementById('food-search').value = '';
  document.getElementById('search-dropdown').style.display = 'none';
  document.getElementById('preview-name').textContent = selectedFood.emoji + ' ' + selectedFood.name;
  document.getElementById('selected-food-preview').style.display = 'flex';
  document.getElementById('food-amount').value = 100;
  document.getElementById('food-amount').focus();
}

function cancelSelect() {
  selectedFood = null;
  document.getElementById('selected-food-preview').style.display = 'none';
  document.getElementById('food-search').value = '';
}

// ── 음식 추가 / 삭제 ─────────────────────
function addFood() {
  if (!selectedFood) return;
  const grams  = parseFloat(document.getElementById('food-amount').value) || 100;
  const meal   = document.getElementById('food-meal').value;
  const folder = document.getElementById('food-folder-sel').value;

  const log = getLog();
  log.unshift({
    id:       Date.now(),
    date:     currentDate,
    food:     selectedFood,
    grams,
    meal,
    folderId: folder ? Number(folder) : null,
  });
  saveLog(log);
  cancelSelect();
  renderAll();
}

function deleteLogEntry(id) {
  saveLog(getLog().filter(e => e.id !== id));
  renderAll();
}

// ── 사이드바 렌더 ─────────────────────────
const MEAL_ICONS = { 아침:'🌅', 점심:'☀️', 저녁:'🌙', 간식:'🍪' };

function renderSidebar() {
  const log     = getLog().filter(e => e.date === currentDate);
  const folders = getFolders();

  // 식사 시간 탭
  const meals = ['아침','점심','저녁','간식'];
  document.getElementById('folder-list').innerHTML =
    `<li class="${activeFilter==='all'?'active':''}" onclick="setFilter('all')">
       📋 전체 <span class="cnt">${log.length}</span>
     </li>` +
    meals.map(m => {
      const cnt = log.filter(e => e.meal === m).length;
      return `<li class="${activeFilter==='meal:'+m?'active':''}" onclick="setFilter('meal:${m}')">
        ${MEAL_ICONS[m]} ${m} <span class="cnt">${cnt}</span>
      </li>`;
    }).join('');

  // 커스텀 폴더
  const folderSel = document.getElementById('food-folder-sel');
  const prev = folderSel.value;
  folderSel.innerHTML = '<option value="">폴더 없음</option>' +
    folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  folderSel.value = prev;

  document.getElementById('custom-folder-list').innerHTML =
    folders.map(f => {
      const cnt = log.filter(e => e.folderId === f.id).length;
      return `<li class="${activeFilter==='folder:'+f.id?'active':''}" onclick="setFilter('folder:${f.id}')">
        📁 ${esc(f.name)} <span class="cnt">${cnt}</span>
        <span class="folder-del" onclick="event.stopPropagation();deleteFolder(${f.id})">✕</span>
      </li>`;
    }).join('');
}

function setFilter(f) {
  activeFilter = f;
  renderAll();
}

// ── 폴더 ──────────────────────────────────
function openFolderModal() {
  document.getElementById('folder-name-input').value = '';
  document.getElementById('folder-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('folder-name-input').focus(), 50);
}
function closeFolderModal() { document.getElementById('folder-modal').style.display = 'none'; }
function createFolder() {
  const name = document.getElementById('folder-name-input').value.trim();
  if (!name) return;
  const folders = getFolders();
  if (folders.find(f => f.name === name)) { alert('같은 이름의 폴더가 있습니다.'); return; }
  folders.push({ id: Date.now(), name });
  saveFolders(folders);
  closeFolderModal();
  renderAll();
}
function deleteFolder(id) {
  if (!confirm('폴더를 삭제할까요?')) return;
  saveFolders(getFolders().filter(f => f.id !== id));
  saveLog(getLog().map(e => e.folderId === id ? { ...e, folderId: null } : e));
  if (activeFilter === 'folder:' + id) activeFilter = 'all';
  renderAll();
}

// ── 날짜 헤더 렌더 ────────────────────────
function renderHeader() {
  document.getElementById('date-display').textContent = formatDateKo(currentDate);

  const log   = getLog().filter(e => e.date === currentDate);
  const total = sumNutrients(log);

  document.getElementById('daily-summary').innerHTML = log.length === 0
    ? '<span style="color:#a0aec0;font-size:0.85rem">오늘 기록된 음식이 없습니다</span>'
    : [
        ['열량',    (total.cal  ||0).toFixed(0)+'kcal'],
        ['탄수화물',(total.carbs||0).toFixed(1)+'g'],
        ['단백질',  (total.protein||0).toFixed(1)+'g'],
        ['지방',    (total.fat  ||0).toFixed(1)+'g'],
      ].map(([l,v]) => `<div class="summary-chip"><strong>${v}</strong>${l}</div>`).join('');
}

// ── 음식 로그 렌더 ───────────────────────
function renderLog() {
  let entries = getLog().filter(e => e.date === currentDate);

  if (activeFilter.startsWith('meal:')) {
    const m = activeFilter.slice(5);
    entries = entries.filter(e => e.meal === m);
  } else if (activeFilter.startsWith('folder:')) {
    const fid = Number(activeFilter.slice(7));
    entries = entries.filter(e => e.folderId === fid);
  }

  const container = document.getElementById('food-log');
  if (!entries.length) {
    container.innerHTML = '<div class="empty-log">🍽️ 아직 기록된 음식이 없어요.<br>위 검색창에서 음식을 추가해보세요!</div>';
    return;
  }

  // 식사별 그룹핑
  const groups = {};
  for (const e of entries) {
    if (!groups[e.meal]) groups[e.meal] = [];
    groups[e.meal].push(e);
  }

  const mealOrder = ['아침','점심','저녁','간식'];
  container.innerHTML = mealOrder
    .filter(m => groups[m])
    .map(m => {
      const mEntries = groups[m];
      const mTotal   = sumNutrients(mEntries);
      const cards    = mEntries.map(e => {
        const n = calcNutrients(e.food, e.grams);
        return `
          <div class="food-card" onclick="openNutrientModal(${e.id})">
            <span class="food-emoji">${e.food.emoji}</span>
            <div class="food-info">
              <div class="fname">${esc(e.food.name)}</div>
              <div class="fmeta">${e.grams}g · ${e.food.category}</div>
            </div>
            <div class="macro-pills">
              <span class="macro-pill pill-cal">${n.cal}kcal</span>
              <span class="macro-pill pill-carb">탄 ${n.carbs}g</span>
              <span class="macro-pill pill-prot">단 ${n.protein}g</span>
              <span class="macro-pill pill-fat">지 ${n.fat}g</span>
            </div>
            <button class="del-btn" onclick="event.stopPropagation();deleteLogEntry(${e.id})">✕</button>
          </div>`;
      }).join('');

      return `
        <div class="meal-group">
          <h3>${MEAL_ICONS[m]} ${m} <span class="meal-cal">· ${(mTotal.cal||0).toFixed(0)}kcal</span></h3>
          ${cards}
        </div>`;
    }).join('');
}

// ── 영양소 모달 ──────────────────────────
function openNutrientModal(logId) {
  const entry = getLog().find(e => e.id === logId);
  if (!entry) return;

  const food = entry.food;
  const n    = calcNutrients(food, entry.grams);

  const driPct = v => DRI.cal ? Math.min(Math.round(v / DRI.cal * 100), 999) : 0;

  // 주요 미네랄·비타민
  const detailKeys = [
    'carbs','sugar','fiber','protein','fat','satFat',
    'cholesterol','sodium','calcium','iron',
    'vitA','vitC','vitD','vitB12','potassium','magnesium','zinc'
  ];

  const rows = detailKeys.map(k => {
    const meta = NUTRIENT_META[k];
    const val  = n[k] ?? 0;
    const dri  = DRI[k] || 1;
    const pct  = Math.min((val / dri) * 100, 100);
    return `
      <div class="nutrient-row">
        <span class="n-label">${meta.label}</span>
        <div class="n-bar-wrap">
          <div class="n-bar" style="width:${pct}%;background:${meta.color}"></div>
        </div>
        <span class="n-val">${val}${meta.unit}</span>
        <span class="n-dri">${Math.round(pct)}%</span>
      </div>`;
  }).join('');

  const calDriPct = Math.round((n.cal / DRI.cal) * 100);

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-food-header">
      <span class="big-emoji">${food.emoji}</span>
      <div>
        <h2>${esc(food.name)}</h2>
        <div class="sub">${entry.grams}g 기준 · ${food.category}</div>
      </div>
    </div>

    <div class="cal-banner">
      <div>
        <div class="cal-num">${n.cal}<span style="font-size:1rem;font-weight:400"> kcal</span></div>
        <div class="cal-label">열량</div>
      </div>
      <div class="dri-pct">하루 권장량의 ${calDriPct}%</div>
    </div>

    <div class="macro-row">
      <div class="macro-box">
        <div class="val" style="color:#d69e2e">${n.carbs}g</div>
        <div class="lbl">탄수화물</div>
      </div>
      <div class="macro-box">
        <div class="val" style="color:#4299e1">${n.protein}g</div>
        <div class="lbl">단백질</div>
      </div>
      <div class="macro-box">
        <div class="val" style="color:#ed8936">${n.fat}g</div>
        <div class="lbl">지방</div>
      </div>
    </div>

    <div class="section-title">상세 영양소 (하루 권장량 대비 %)</div>
    <div class="nutrient-grid">${rows}</div>

    <div class="source-note">
      출처: 농촌진흥청 국가표준식품성분표 / 식품의약품안전처 식품영양성분DB<br>
      권장량: 보건복지부 한국인 영양소 섭취기준(성인 기준)
    </div>
  `;

  document.getElementById('nutrient-modal').style.display = 'flex';
}

function closeNutrientModal(e) {
  if (!e || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
    document.getElementById('nutrient-modal').style.display = 'none';
  }
}

// ── 전체 렌더 ─────────────────────────────
function renderAll() {
  renderHeader();
  renderSidebar();
  renderLog();
}

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── 초기화 ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 검색창 외부 클릭 시 드롭다운 닫기
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) {
      document.getElementById('search-dropdown').style.display = 'none';
    }
  });

  // Enter로 음식 추가
  document.getElementById('food-amount').addEventListener('keydown', e => {
    if (e.key === 'Enter') addFood();
  });

  // 폴더 모달 Enter/Esc
  document.getElementById('folder-name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') createFolder();
    if (e.key === 'Escape') closeFolderModal();
  });

  renderAll();
});
