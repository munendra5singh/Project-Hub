/**
 * UI Renderer & DOM Event Handler Helper
 */

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export function evaluatePasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, text: 'Empty', color: '#8a99ad' };
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
    case 2:
      return { score: 25, text: 'Weak', color: '#ef4444' };
    case 3:
      return { score: 50, text: 'Medium', color: '#f59e0b' };
    case 4:
      return { score: 75, text: 'Strong', color: '#10b981' };
    case 5:
      return { score: 100, text: 'Very Strong', color: '#059669' };
    default:
      return { score: 10, text: 'Very Weak', color: '#ef4444' };
  }
}

export function renderAccountCard(acc, options) {
  const { onShow, onCopy, onEdit, onDelete } = options;

  const card = document.createElement('div');
  card.className = 'account-card';
  card.dataset.id = acc.id;

  card.innerHTML = `
    <div class="card-header">
      <div class="card-title-group">
        <h4>${escapeHTML(acc.website)}</h4>
        <span>${escapeHTML(acc.category)}</span>
      </div>
      ${acc.url ? `<a href="${escapeHTML(acc.url)}" target="_blank" rel="noopener" class="text-muted">🌐</a>` : ''}
    </div>
    ${acc.name ? `<div class="card-field"><span class="label">Name</span><span class="value">${escapeHTML(acc.name)}</span></div>` : ''}
    ${acc.username ? `<div class="card-field"><span class="label">User</span><span class="value">${escapeHTML(acc.username)}</span></div>` : ''}
    ${acc.email ? `<div class="card-field"><span class="label">Email</span><span class="value">${escapeHTML(acc.email)}</span></div>` : ''}
    <div class="card-field">
      <span class="label">Pass</span>
      <span class="value font-mono" id="pass-val-${acc.id}">••••••••••••</span>
    </div>
    <div class="card-actions">
      <button class="btn btn-secondary btn-show" data-id="${acc.id}">👁 Show</button>
      <button class="btn btn-secondary btn-copy" data-id="${acc.id}">📋 Copy</button>
      <button class="btn btn-secondary btn-edit" data-id="${acc.id}">✏️ Edit</button>
      <button class="btn btn-danger btn-delete" data-id="${acc.id}">🗑️</button>
    </div>
  `;

  card.querySelector('.btn-show').addEventListener('click', () => onShow(acc.id));
  card.querySelector('.btn-copy').addEventListener('click', () => onCopy(acc.id));
  card.querySelector('.btn-edit').addEventListener('click', () => onEdit(acc));
  card.querySelector('.btn-delete').addEventListener('click', () => onDelete(acc.id));

  return card;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}