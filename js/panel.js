// panel.js
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@2.5.2/dist/purify.es.js';
import { formatDateISO, showNotification } from './utils.js';

const SELECTORS = {
  panel: '#article-panel',
  backdrop: '#panel-backdrop',
  btnClose: '#panel-close',
  img: '#panel-image',
  title: '#panel-title',
  category: '#panel-category',
  date: '#panel-date',
  author: '#panel-author',
  share: '#panel-share',
  body: '#panel-body'
};

let elems;

/**
 * Initialise le panneau : appel après DOMContentLoaded.
 */
export function initPanel() {
  elems = {};
  for (const [k, sel] of Object.entries(SELECTORS)) {
    elems[k] = document.querySelector(sel);
  }
  elems.btnClose.addEventListener('click', closePanel);
  elems.backdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && elems.panel.classList.contains('open')) {
      closePanel();
    }
  });
}

/** Ouvre le panneau latéral. */
export function openPanel() {
  elems.panel.classList.add('open');
  elems.backdrop.classList.add('visible');
}

/** Ferme le panneau latéral. */
export function closePanel() {
  elems.panel.classList.remove('open');
  elems.backdrop.classList.remove('visible');
}

/**
 * Affiche un article complet dans le panneau.
 * @param {object} article
 */
export function showArticleInPanel(article) {
  elems.img.src = article.image_url;
  elems.img.alt = article.titre;
  elems.category.textContent = article.categories;
  elems.date.textContent = formatDateISO(article.date_publication);
  elems.title.textContent = article.titre;
  elems.author.textContent = article.auteur;
  // Sanitisation pour éviter tout XSS
  elems.body.innerHTML = DOMPurify.sanitize(article.contenu);
  
  // Prépare le partage
  elems.share.onclick = () => {
    const shareUrl = `${location.origin}${location.pathname}?article=${article.id}`;
    if (navigator.share) {
      navigator.share({ title: article.titre, url: shareUrl })
        .catch(err => console.error('Share error', err));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => showNotification('Lien copié dans le presse-papiers', 'success'))
        .catch(err => console.error('Clipboard error', err));
    }
  };
  
  openPanel();
  elems.panel.scrollTop = 0;
}
