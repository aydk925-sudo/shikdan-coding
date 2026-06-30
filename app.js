const NOTES_KEY = 'shikdan_notes';
const FOLDERS_KEY = 'shikdan_folders';

let activeFolder = null; // null = 전체
let movingNoteId = null;

function getNotes() {
  return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
}
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
function getFolders() {
  return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
}
function saveFolders(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

// ── 폴더 ──────────────────────────────────────
function openFolderModal() {
  document.getElementById('folder-name-input').value = '';
  document.getElementById('folder-modal').style.display = 'flex';
  document.getElementById('folder-name-input').focus();
}
function closeFolderModal() {
  document.getElementById('folder-modal').style.display = 'none';
}

function createFolder() {
  const name = document.getElementById('folder-name-input').value.trim();
  if (!name) return;
  const folders = getFolders();
  if (folders.find(f => f.name === name)) {
    alert('같은 이름의 폴더가 이미 있습니다.');
    return;
  }
  folders.push({ id: Date.now(), name });
  saveFolders(folders);
  closeFolderModal();
  renderFolders();
}

function deleteFolder(id) {
  if (!confirm('폴더를 삭제할까요? (메모는 삭제되지 않습니다)')) return;
  const folders = getFolders().filter(f => f.id !== id);
  saveFolders(folders);
  // 해당 폴더의 메모는 폴더 없음으로 초기화
  const notes = getNotes().map(n => n.folderId === id ? { ...n, folderId: null } : n);
  saveNotes(notes);
  if (activeFolder === id) activeFolder = null;
  renderFolders();
  renderNotes();
}

function selectFolder(id) {
  activeFolder = id;
  renderFolders();
  renderNotes();
}

function renderFolders() {
  const folders = getFolders();
  const notes = getNotes();
  const list = document.getElementById('folder-list');

  // 폴더 선택 드롭다운 업데이트
  const selects = ['note-folder', 'move-folder-select'];
  selects.forEach(sid => {
    const sel = document.getElementById(sid);
    const prev = sel.value;
    sel.innerHTML = '<option value="">폴더 없음</option>' +
      folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    sel.value = prev;
  });

  const allCount = notes.length;
  const noneCount = notes.filter(n => !n.folderId).length;

  list.innerHTML = `
    <li class="${activeFolder === null ? 'active' : ''}" onclick="selectFolder(null)">
      📋 전체 메모 <span class="folder-count">${allCount}</span>
    </li>
    <li class="${activeFolder === 'none' ? 'active' : ''}" onclick="selectFolder('none')">
      📄 폴더 없음 <span class="folder-count">${noneCount}</span>
    </li>
    ${folders.map(f => {
      const cnt = notes.filter(n => n.folderId === f.id).length;
      return `
        <li class="${activeFolder === f.id ? 'active' : ''}" onclick="selectFolder(${f.id})">
          📁 ${escapeHtml(f.name)}
          <span class="folder-count">${cnt}</span>
          <span class="folder-del" onclick="event.stopPropagation(); deleteFolder(${f.id})">✕</span>
        </li>`;
    }).join('')}
  `;
}

// ── 메모 이동 ─────────────────────────────────
function openMoveModal(noteId) {
  movingNoteId = noteId;
  const note = getNotes().find(n => n.id === noteId);
  document.getElementById('move-folder-select').value = note.folderId || '';
  document.getElementById('move-modal').style.display = 'flex';
}
function closeMoveModal() {
  document.getElementById('move-modal').style.display = 'none';
  movingNoteId = null;
}
function confirmMove() {
  const folderId = document.getElementById('move-folder-select').value;
  const notes = getNotes().map(n =>
    n.id === movingNoteId ? { ...n, folderId: folderId ? Number(folderId) : null } : n
  );
  saveNotes(notes);
  closeMoveModal();
  renderFolders();
  renderNotes();
}

// ── 메모 ──────────────────────────────────────
function addNote() {
  const title = document.getElementById('note-title').value.trim();
  const content = document.getElementById('note-content').value.trim();
  const category = document.getElementById('note-category').value;
  const folderVal = document.getElementById('note-folder').value;
  const folderId = folderVal ? Number(folderVal) : null;

  if (!content) {
    document.getElementById('note-content').focus();
    return;
  }

  const notes = getNotes();
  notes.unshift({
    id: Date.now(),
    title,
    content,
    category,
    folderId,
    date: new Date().toLocaleString('ko-KR'),
  });
  saveNotes(notes);

  document.getElementById('note-title').value = '';
  document.getElementById('note-content').value = '';
  document.getElementById('note-category').value = '일반';

  renderFolders();
  renderNotes();
}

function deleteNote(id) {
  saveNotes(getNotes().filter(n => n.id !== id));
  renderFolders();
  renderNotes();
}

function clearAll() {
  if (!confirm('현재 보기의 메모를 모두 삭제할까요?')) return;
  let notes = getNotes();
  if (activeFolder === null) {
    notes = [];
  } else if (activeFolder === 'none') {
    notes = notes.filter(n => n.folderId);
  } else {
    notes = notes.filter(n => n.folderId !== activeFolder);
  }
  saveNotes(notes);
  renderFolders();
  renderNotes();
}

function renderNotes() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const folders = getFolders();
  const container = document.getElementById('notes-container');

  let notes = getNotes();

  // 폴더 필터
  if (activeFolder === 'none') {
    notes = notes.filter(n => !n.folderId);
  } else if (activeFolder !== null) {
    notes = notes.filter(n => n.folderId === activeFolder);
  }

  // 검색 필터
  if (query) {
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.category.includes(query)
    );
  }

  if (notes.length === 0) {
    container.innerHTML = '<p class="empty-msg">메모가 없습니다.</p>';
    return;
  }

  container.innerHTML = notes.map(n => {
    const folder = folders.find(f => f.id === n.folderId);
    return `
      <div class="note-card ${n.category}">
        <div class="note-header">
          <span class="note-title">${escapeHtml(n.title || '(제목 없음)')}</span>
          <span class="note-category">${n.category}</span>
          ${folder ? `<span class="note-folder-tag">📁 ${escapeHtml(folder.name)}</span>` : ''}
        </div>
        <div class="note-content">${escapeHtml(n.content)}</div>
        <div class="note-footer">
          <span class="note-date">${n.date}</span>
          <div class="note-actions">
            <button class="move-btn" onclick="openMoveModal(${n.id})">폴더 이동</button>
            <button class="delete-btn" onclick="deleteNote(${n.id})">✕</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('note-content').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  });
  document.getElementById('folder-name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') createFolder();
    if (e.key === 'Escape') closeFolderModal();
  });
  renderFolders();
  renderNotes();
});
