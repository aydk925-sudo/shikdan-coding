const STORAGE_KEY = 'shikdan_notes';

function getNotes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function addNote() {
  const title = document.getElementById('note-title').value.trim();
  const content = document.getElementById('note-content').value.trim();
  const category = document.getElementById('note-category').value;

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
    date: new Date().toLocaleString('ko-KR'),
  });
  saveNotes(notes);

  document.getElementById('note-title').value = '';
  document.getElementById('note-content').value = '';
  document.getElementById('note-category').value = '일반';

  renderNotes();
}

function deleteNote(id) {
  const notes = getNotes().filter(n => n.id !== id);
  saveNotes(notes);
  renderNotes();
}

function clearAll() {
  if (!confirm('메모를 모두 삭제할까요?')) return;
  saveNotes([]);
  renderNotes();
}

function renderNotes() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const container = document.getElementById('notes-container');
  const notes = getNotes().filter(n =>
    n.title.toLowerCase().includes(query) ||
    n.content.toLowerCase().includes(query) ||
    n.category.includes(query)
  );

  if (notes.length === 0) {
    container.innerHTML = '<p class="empty-msg">메모가 없습니다.</p>';
    return;
  }

  container.innerHTML = notes.map(n => `
    <div class="note-card ${n.category}">
      <div class="note-header">
        <span class="note-title">${escapeHtml(n.title || '(제목 없음)')}</span>
        <span class="note-category">${n.category}</span>
      </div>
      <div class="note-content">${escapeHtml(n.content)}</div>
      <div class="note-footer">
        <span class="note-date">${n.date}</span>
        <button class="delete-btn" onclick="deleteNote(${n.id})">✕</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Enter 키로 메모 추가 (Shift+Enter는 줄바꿈)
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('note-content').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  });
  renderNotes();
});
