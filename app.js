const LOG_KEY           = 'shikdan_log';
const BLACKLIST_KEY     = 'shikdan_blacklist';
const BLACKLIST_CAT_KEY = 'shikdan_blacklist_cat';
const BLACKLIST_KW_KEY  = 'shikdan_blacklist_kw';

let currentDate  = toDateStr(new Date());
let activeFilter = 'all';  // 'all' | 'meal:아침'
let selectedFood = null;

// ── 날짜 유틸 ─────────────────────────────
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
function getLog()          { return JSON.parse(localStorage.getItem(LOG_KEY)       || '[]'); }
function saveLog(l)        { localStorage.setItem(LOG_KEY, JSON.stringify(l)); }
function getBlacklist()       { return JSON.parse(localStorage.getItem(BLACKLIST_KEY)     || '[]'); }
function saveBlacklist(bl)    { localStorage.setItem(BLACKLIST_KEY, JSON.stringify(bl)); }
function getCatBlacklist()    { return JSON.parse(localStorage.getItem(BLACKLIST_CAT_KEY) || '[]'); }
function saveCatBlacklist(bl) { localStorage.setItem(BLACKLIST_CAT_KEY, JSON.stringify(bl)); }
function getKwBlacklist()     { return JSON.parse(localStorage.getItem(BLACKLIST_KW_KEY)  || '[]'); }
function saveKwBlacklist(bl)  { localStorage.setItem(BLACKLIST_KW_KEY,  JSON.stringify(bl)); }
function isBlacklisted(id) {
  if (getBlacklist().includes(id)) return true;
  const food = FOODS_DB.find(f => f.id === id);
  if (!food) return false;
  if (getCatBlacklist().includes(food.category)) return true;
  const name = food.name.toLowerCase();
  return getKwBlacklist().some(kw => name.includes(kw.toLowerCase()));
}
function toggleBlacklist(id) {
  let bl = getBlacklist();
  if (bl.includes(id)) bl = bl.filter(x => x !== id);
  else bl.push(id);
  saveBlacklist(bl);
}
function toggleCatBlacklist(cat) {
  let bl = getCatBlacklist();
  if (bl.includes(cat)) bl = bl.filter(x => x !== cat);
  else bl.push(cat);
  saveCatBlacklist(bl);
}
function addKwBlacklist(kw) {
  kw = kw.trim();
  if (!kw) return;
  let bl = getKwBlacklist();
  if (!bl.includes(kw)) { bl.push(kw); saveKwBlacklist(bl); }
}
function removeKwBlacklist(kw) {
  saveKwBlacklist(getKwBlacklist().filter(x => x !== kw));
}

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
    return getChosung(name).startsWith(q);
  }
  return name.includes(q) || cat.includes(q);
}

// ── 검색 ──────────────────────────────────
function onSearchInput() {
  const q = document.getElementById('food-search').value.trim().toLowerCase();
  const dd = document.getElementById('search-dropdown');
  if (!q) { dd.style.display = 'none'; return; }

  const bl = getBlacklist();
  const results = FOODS_DB.filter(f => !bl.includes(f.id) && matchesQuery(f, q)).slice(0, 10);

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
  const grams = parseFloat(document.getElementById('food-amount').value) || 100;
  const meal  = document.getElementById('food-meal').value;

  const log = getLog();
  log.unshift({
    id:   Date.now(),
    date: currentDate,
    food: selectedFood,
    grams,
    meal,
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
  const log   = getLog().filter(e => e.date === currentDate);
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
}

function setFilter(f) {
  activeFilter = f;
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
        ['열량',    (total.cal    ||0).toFixed(0)+'kcal'],
        ['탄수화물',(total.carbs  ||0).toFixed(1)+'g'],
        ['단백질',  (total.protein||0).toFixed(1)+'g'],
        ['지방',    (total.fat    ||0).toFixed(1)+'g'],
        ['나트륨',  (total.sodium ||0).toFixed(0)+'mg'],
      ].map(([l,v]) => `<div class="summary-chip"><strong>${v}</strong>${l}</div>`).join('');
}

// ── 음식 로그 렌더 ───────────────────────
function renderLog() {
  let entries = getLog().filter(e => e.date === currentDate);

  if (activeFilter.startsWith('meal:')) {
    const m = activeFilter.slice(5);
    entries = entries.filter(e => e.meal === m);
  }

  const container = document.getElementById('food-log');
  if (!entries.length) {
    container.innerHTML = '<div class="empty-log">🍽️ 아직 기록된 음식이 없어요.<br>위 검색창에서 음식을 추가해보세요!</div>';
    return;
  }

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
              <span class="macro-pill pill-sodium">나트륨 ${n.sodium}mg</span>
            </div>
            <button class="recipe-btn" onclick="event.stopPropagation();openRecipeModal('${esc(e.food.name)}')" title="레시피 보기">📖</button>
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

// ── 전체 음식 목록 모달 ───────────────────
function openFoodListModal() {
  const catSel = document.getElementById('foodlist-cat');
  const cats = [...new Set(FOODS_DB.map(f => f.category))].sort();
  catSel.innerHTML = '<option value="">전체 카테고리</option>' +
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById('foodlist-search').value = '';
  renderFoodList();
  document.getElementById('foodlist-modal').style.display = 'flex';
}

function closeFoodListModal(e) {
  if (!e || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
    document.getElementById('foodlist-modal').style.display = 'none';
  }
}

function renderFoodList() {
  const q   = document.getElementById('foodlist-search').value.trim().toLowerCase();
  const cat = document.getElementById('foodlist-cat').value;
  const bl  = getBlacklist();

  let list = FOODS_DB;
  if (cat) list = list.filter(f => f.category === cat);
  if (q)   list = list.filter(f => matchesQuery(f, q));

  document.getElementById('foodlist-count').textContent = `총 ${list.length}개`;

  document.getElementById('foodlist-body').innerHTML = list.length === 0
    ? '<div style="text-align:center;padding:40px;color:#a0aec0">검색 결과가 없습니다</div>'
    : list.map(f => {
        const blocked = bl.includes(f.id);
        return `
          <div class="foodlist-row ${blocked ? 'blocked' : ''}">
            <span class="foodlist-emoji">${f.emoji}</span>
            <div class="foodlist-info" onclick="${blocked ? '' : `pickFromList(${f.id})`}" style="cursor:${blocked?'default':'pointer'};flex:1">
              <span class="foodlist-name">${esc(f.name)}</span>
              <span class="foodlist-cat">${f.category}</span>
            </div>
            <span class="foodlist-cal">${f.nutrients.cal}kcal</span>
            <button class="bl-btn ${blocked ? 'bl-on' : ''}" onclick="toggleBlacklist(${f.id});renderFoodList()" title="${blocked ? '블랙리스트 해제' : '블랙리스트 추가'}">
              🚫
            </button>
          </div>`;
      }).join('');
}

let blTab = 'food'; // 'food' | 'category' | 'keyword'
let blCatFilter = ''; // 개별 음식 탭 카테고리 필터

function openBlacklistModal() {
  renderBlacklist();
  document.getElementById('blacklist-modal').style.display = 'flex';
}
function closeBlacklistModal(e) {
  if (!e || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
    document.getElementById('blacklist-modal').style.display = 'none';
  }
}
function switchBlTab(tab) {
  blTab = tab;
  renderBlacklist();
}
function renderBlacklist() {
  const body = document.getElementById('blacklist-body');
  const tabHtml = `
    <div class="bl-tabs">
      <button class="bl-tab${blTab==='food'?' active':''}" onclick="switchBlTab('food')">개별 음식</button>
      <button class="bl-tab${blTab==='category'?' active':''}" onclick="switchBlTab('category')">카테고리</button>
      <button class="bl-tab${blTab==='keyword'?' active':''}" onclick="switchBlTab('keyword')">키워드</button>
    </div>`;

  if (blTab === 'food') {
    const bl = getBlacklist();
    let foods = bl.map(id => FOODS_DB.find(f => f.id === id)).filter(Boolean);
    const allCats = [...new Set(foods.map(f => f.category))].sort();
    const catOptions = ['<option value="">전체 카테고리</option>',
      ...allCats.map(c => `<option value="${esc(c)}"${blCatFilter===c?' selected':''}>${esc(c)}</option>`)
    ].join('');
    const filterHtml = `<select class="bl-cat-filter" onchange="blCatFilter=this.value;renderBlacklist()">${catOptions}</select>`;
    if (blCatFilter) foods = foods.filter(f => f.category === blCatFilter);
    const listHtml = foods.length
      ? foods.map(f => `
          <div class="foodlist-row blocked">
            <span class="foodlist-emoji">${f.emoji}</span>
            <div class="foodlist-info" style="flex:1">
              <span class="foodlist-name">${esc(f.name)}</span>
              <span class="foodlist-cat">${f.category}</span>
            </div>
            <button class="bl-btn bl-on" onclick="toggleBlacklist(${f.id});renderBlacklist()" title="해제">🚫</button>
          </div>`).join('')
      : '<div style="text-align:center;padding:32px;color:#a0aec0">차단된 음식이 없습니다</div>';
    body.innerHTML = tabHtml + filterHtml + listHtml;
  } else if (blTab === 'category') {
    const cats = [...new Set(FOODS_DB.map(f => f.category))].sort();
    const catBl = getCatBlacklist();
    const listHtml = cats.map(cat => {
      const blocked = catBl.includes(cat);
      const count = FOODS_DB.filter(f => f.category === cat).length;
      return `
        <div class="foodlist-row${blocked?' blocked':''}">
          <div class="foodlist-info" style="flex:1">
            <span class="foodlist-name">${esc(cat)}</span>
            <span class="foodlist-cat">${count}개 음식</span>
          </div>
          <button class="bl-btn${blocked?' bl-on':''}" onclick="toggleCatBlacklist('${esc(cat)}');renderBlacklist()" title="${blocked?'해제':'차단'}">🚫</button>
        </div>`;
    }).join('');
    body.innerHTML = tabHtml + '<div style="font-size:0.78rem;color:#a0aec0;padding:6px 2px 10px">카테고리 차단 시 해당 카테고리의 모든 음식이 검색에서 제외됩니다.</div>' + listHtml;
  } else if (blTab === 'keyword') {
    const kwBl = getKwBlacklist();
    const kwListHtml = kwBl.length
      ? kwBl.map(kw => {
          const count = FOODS_DB.filter(f => f.name.toLowerCase().includes(kw.toLowerCase())).length;
          return `
            <div class="foodlist-row blocked">
              <div class="foodlist-info" style="flex:1">
                <span class="foodlist-name">"${esc(kw)}"</span>
                <span class="foodlist-cat">${count}개 음식 해당</span>
              </div>
              <button class="bl-btn bl-on" onclick="removeKwBlacklist('${esc(kw)}');renderBlacklist()" title="해제">🚫</button>
            </div>`;
        }).join('')
      : '<div style="text-align:center;padding:24px;color:#a0aec0">차단된 키워드가 없습니다</div>';
    body.innerHTML = tabHtml +
      `<div style="font-size:0.78rem;color:#a0aec0;padding:6px 2px 8px">이름에 키워드가 포함된 모든 음식이 검색에서 제외됩니다.</div>
       <div class="bl-kw-input-row">
         <input id="bl-kw-input" class="bl-kw-input" type="text" placeholder="키워드 입력 (예: 튀김, 라면...)"
           onkeydown="if(event.key==='Enter'){addKwBlacklist(this.value);this.value='';renderBlacklist()}" />
         <button class="bl-kw-add-btn" onclick="addKwBlacklist(document.getElementById('bl-kw-input').value);document.getElementById('bl-kw-input').value='';renderBlacklist()">추가</button>
       </div>` + kwListHtml;
  }
}

// ── 자동 식단 생성 ───────────────────────
const MEAL_CAT = {
  '아침': ['곡류','빵','빵·과자','유제품','달걀·콩','과일','간식'],
  '점심': ['한식','중식','일식','양식','분식','육류','해산물','반찬','곡류'],
  '저녁': ['한식','중식','일식','양식','육류','해산물','반찬','곡류'],
  '간식': ['과일','간식','빵·과자','과자','유제품','음료'],
};
const MEAL_RATIO = { '아침': 0.25, '점심': 0.35, '저녁': 0.30, '간식': 0.10 };

let apPlan = []; // [{ meal, food, grams }, ...]

function openAutoPlanModal() {
  document.getElementById('autoplan-result').style.display = 'none';
  document.getElementById('autoplan-settings').style.display = 'block';
  document.getElementById('autoplan-modal').style.display = 'flex';
}
function closeAutoPlanModal(e) {
  if (!e || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
    document.getElementById('autoplan-modal').style.display = 'none';
  }
}

function pickFood(meal, excludeIds) {
  const cats = MEAL_CAT[meal];
  const available = FOODS_DB.filter(f =>
    !isBlacklisted(f.id) &&
    !excludeIds.includes(f.id) &&
    cats.includes(f.category) &&
    f.nutrients.cal > 0
  );
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function gramsForCal(food, targetCal) {
  const calPer100 = food.nutrients.cal;
  if (!calPer100) return 100;
  return Math.min(500, Math.max(50, Math.round(targetCal / calPer100 * 100 / 10) * 10));
}

function generateAutoPlan() {
  const totalCal = parseInt(document.getElementById('ap-cal').value) || 2000;
  const meals = ['아침','점심','저녁','간식'].filter(m =>
    document.getElementById('ap-' + {아침:'breakfast',점심:'lunch',저녁:'dinner',간식:'snack'}[m]).checked
  );
  if (!meals.length) { alert('식사 시간을 하나 이상 선택하세요.'); return; }

  apPlan = [];
  const usedIds = [];
  for (const meal of meals) {
    const targetCal = Math.round(totalCal * MEAL_RATIO[meal]);
    // 주식 + 부식(칼로리가 낮은 식사엔 1개만)
    const mainFood = pickFood(meal, usedIds);
    if (!mainFood) continue;
    usedIds.push(mainFood.id);
    const mainGrams = gramsForCal(mainFood, targetCal * 0.7);
    apPlan.push({ meal, food: mainFood, grams: mainGrams });

    if (targetCal >= 300 && ['아침','점심','저녁'].includes(meal)) {
      const sideFood = pickFood(meal, usedIds);
      if (sideFood) {
        usedIds.push(sideFood.id);
        const sideGrams = gramsForCal(sideFood, targetCal * 0.3);
        apPlan.push({ meal, food: sideFood, grams: sideGrams });
      }
    }
  }
  renderAutoPlan();
}

function regenItem(idx) {
  const item = apPlan[idx];
  const usedIds = apPlan.filter((_, i) => i !== idx).map(p => p.food.id);
  const newFood = pickFood(item.meal, usedIds);
  if (!newFood) return;
  const totalCal = parseInt(document.getElementById('ap-cal').value) || 2000;
  const targetCal = Math.round(totalCal * MEAL_RATIO[item.meal]) * (apPlan.filter(p=>p.meal===item.meal).length > 1 ? 0.4 : 0.7);
  apPlan[idx] = { meal: item.meal, food: newFood, grams: gramsForCal(newFood, targetCal) };
  renderAutoPlan();
}

function renderAutoPlan() {
  const totalCal = apPlan.reduce((s, p) => s + Math.round(calcNutrients(p.food, p.grams).cal), 0);
  const meals = [...new Set(apPlan.map(p => p.meal))];
  const mealEmoji = { '아침':'🌅','점심':'☀️','저녁':'🌙','간식':'🍪' };

  const html = meals.map(meal => {
    const items = apPlan.filter(p => p.meal === meal);
    const mealCal = items.reduce((s, p) => s + Math.round(calcNutrients(p.food, p.grams).cal), 0);
    const rows = items.map((p, _) => {
      const idx = apPlan.indexOf(p);
      const cal = Math.round(calcNutrients(p.food, p.grams).cal);
      return `
        <div class="ap-item">
          <span class="ap-item-emoji">${p.food.emoji}</span>
          <div class="ap-item-info">
            <span class="ap-item-name">${esc(p.food.name)}</span>
            <span class="ap-item-meta">${p.grams}g · ${cal}kcal</span>
          </div>
          <button class="ap-regen-btn" onclick="regenItem(${idx})" title="다시 추천">🔄</button>
        </div>`;
    }).join('');
    return `
      <div class="ap-meal-group">
        <div class="ap-meal-header">${mealEmoji[meal]} ${meal} <span class="ap-meal-cal">${mealCal}kcal</span></div>
        ${rows}
      </div>`;
  }).join('');

  document.getElementById('ap-result-list').innerHTML = html;
  document.getElementById('ap-total-cal').textContent = `총 ${totalCal}kcal`;
  document.getElementById('autoplan-settings').style.display = 'none';
  document.getElementById('autoplan-result').style.display = 'flex';
}

function applyAutoPlan() {
  const log = getLog();
  for (const p of apPlan) {
    log.push({ date: currentDate, meal: p.meal, foodId: p.food.id, grams: p.grams });
  }
  saveLog(log);
  document.getElementById('autoplan-modal').style.display = 'none';
  renderAll();
}

// ── 레시피 모달 ──────────────────────────
function openRecipeModal(foodName) {
  const recipe = RECIPES[foodName];
  const modal  = document.getElementById('recipe-modal');

  if (!recipe) {
    const searchUrl = 'https://www.10000recipe.com/recipe/list.html?q=' + encodeURIComponent(foodName);
    document.getElementById('recipe-content').innerHTML = `
      <div class="recipe-header">
        <div class="recipe-food-name">${esc(foodName)}</div>
      </div>
      <div class="recipe-no-data">
        <p>등록된 레시피가 없습니다.</p>
        <a href="${searchUrl}" target="_blank" class="recipe-link-btn">🔍 만개의레시피에서 검색하기</a>
      </div>`;
  } else {
    const ingHtml = recipe.ingredients.map(i => `<li>${i}</li>`).join('');
    const stepHtml = recipe.steps.map((s, i) => `
      <div class="recipe-step">
        <span class="step-num">${i + 1}</span>
        <span class="step-text">${s}</span>
      </div>`).join('');
    document.getElementById('recipe-content').innerHTML = `
      <div class="recipe-header">
        <div class="recipe-food-name">${esc(foodName)}</div>
      </div>
      <div class="recipe-section-title">🥬 재료</div>
      <ul class="recipe-ingredients">${ingHtml}</ul>
      <div class="recipe-section-title">👨‍🍳 조리 순서</div>
      <div class="recipe-steps">${stepHtml}</div>
      <a href="${recipe.source.url}" target="_blank" class="recipe-link-btn">🔗 ${recipe.source.name}에서 원본 레시피 보기</a>`;
  }

  modal.style.display = 'flex';
}

function closeRecipeModal(e) {
  if (!e || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
    document.getElementById('recipe-modal').style.display = 'none';
  }
}

function pickFromList(id) {
  document.getElementById('foodlist-modal').style.display = 'none';
  selectFood(id);
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
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) {
      document.getElementById('search-dropdown').style.display = 'none';
    }
  });

  document.getElementById('food-amount').addEventListener('keydown', e => {
    if (e.key === 'Enter') addFood();
  });

  renderAll();
});
