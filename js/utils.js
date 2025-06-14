// utils.js

/**
 * Formate une date ISO full.
 */
export function formatDateISO(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formate de façon relative ("Aujourd'hui", "Hier", etc.).
 */
export function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const diffDays = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays>1?'s':''}`;
  if (diffDays < 30) {
    const w = Math.floor(diffDays / 7);
    return `Il y a ${w} semaine${w>1?'s':''}`;
  }
  return formatDateISO(dateString);
}

/**
 * Vérifie qu’une chaîne est une URL valide.
 */
export function isValidUrl(s) {
  try { new URL(s); return true; } catch { return false; }
}

/**
 * Affiche une notification éphémère en haut de page.
 */
export function showNotification(message, type = 'success') {
  // Nettoyage
  document.querySelectorAll('.notification').forEach(el => el.remove());
  const n = document.createElement('div');
  n.className = `notification ${type}`;
  n.innerHTML = `<i class="fas fa-${type==='success'?'check':'exclamation-triangle'}"></i> ${message}`;
  document.body.append(n);
  setTimeout(() => n.classList.add('show'), 100);
  setTimeout(() => {
    n.classList.remove('show');
    setTimeout(() => n.remove(), 300);
  }, 4000);
}
