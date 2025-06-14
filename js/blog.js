import { supabaseClient, OVERLAY_COLORS, CACHE_DURATION } from './config.js';
import { formatDateISO, showNotification }          from './utils.js';
import { showArticleInPanel }                       from './panel.js';

const container = document.querySelector('#blog-container');
const template  = document.querySelector('#article-template');
let cache = { data: null, time: 0 };

export function initBlog() {
  loadArticles();
  supabaseClient
    .channel('realtime_articles')
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'articles' },
        ({ new: art }) => prependArticle(art))
    .subscribe();

  container.addEventListener('click', async e => {
    // Lire la suite
    const btn = e.target.closest('.card__read-more');
    if (btn) {
      const card = btn.closest('.card');
      const id   = Number(card.dataset.articleId);
      if (!isNaN(id)) {
        let article = cache.data.find(a => a.id === id)
                   || (await fetchArticleById(id));
        if (article) showArticleInPanel(article);
      }
      return;
    }

    // Partage depuis la carte
    const shareBtn = e.target.closest('.card-share-btn');
    if (shareBtn) {
      const card = shareBtn.closest('.card');
      const id   = Number(card.dataset.articleId);
      const article = cache.data.find(a => a.id === id);
      if (!article) return;
      // même logique que dans panel.js, on partage
      const shareUrl = `${location.origin}${location.pathname}?article=${id}`;
      if (navigator.share) {
        navigator.share({ title: article.titre, url: shareUrl })
          .catch(console.error);
      } else {
        navigator.clipboard.writeText(shareUrl)
          .then(() => alert('Lien copié'))
          .catch(console.error);
      }
      return;
    }
  });
}

async function fetchArticleById(id) {
  const { data, error } = await supabaseClient
    .from('articles').select('*').eq('id', id).single();
  if (error) {
    showNotification('Erreur fetch article','error');
    return null;
  }
  return data;
}

export async function loadArticles(force = false) {
  if (!force && cache.data && Date.now() - cache.time < CACHE_DURATION) {
    return renderArticles(cache.data);
  }
  const { data, error } = await supabaseClient
    .from('articles')
    .select('*')
    .order('date_publication', { ascending: false });
  if (error) return showNotification('Erreur chargement articles','error');
  cache = { data, time: Date.now() };
  renderArticles(data);
}

function renderArticles(list) {
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  list.forEach((art, i) => {
    const clone = template.content.cloneNode(true);

    const card = clone.querySelector('.card');
    card.dataset.articleId = art.id;

    // Image
    const img = clone.querySelector('img');
    img.src = art.image_url || `https://picsum.photos/400/300?random=${art.id}`;

    // Overlay color
    const ov = clone.querySelector('.card__overlay');
    ov.classList.replace(
      'card__overlay--INDICATOR',
      `card__overlay--${OVERLAY_COLORS[i % OVERLAY_COLORS.length]}`
    );

    // Métadonnées catégorie & date
    const meta1 = clone.querySelectorAll('.card__meta li:nth-child(1) a')[0];
    const meta2 = clone.querySelectorAll('.card__meta li:nth-child(2) a')[0];
    meta1.innerHTML = `<i class="fa fa-tag"></i> ${art.categorie}`;
    meta2.innerHTML = `<i class="fa fa-clock-o"></i> ${formatDateISO(art.date_publication)}`;

    // Titre & excerpt
    clone.querySelector('.card__title').textContent   = art.titre;
    clone.querySelector('.card__excerpt').textContent = art.contenu.length > 150
      ? art.contenu.slice(0,150).trim() + '…'
      : art.contenu;

    // Auteur & partage
    const authorLink = clone.querySelectorAll('.card__meta--last li:nth-child(1) a')[0];
    authorLink.innerHTML = `<i class="fa fa-user"></i> ${art.auteur}`;
    // le bouton partage reste vide, le listener `.card-share-btn` s’en charge

    frag.appendChild(clone);
  });
  container.appendChild(frag);
}

function prependArticle(art) {
  cache.data.unshift(art);
  loadArticles(true);
}
