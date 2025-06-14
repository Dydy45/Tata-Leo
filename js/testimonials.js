// testimonials.js
import { supabaseClient, CACHE_DURATION } from './config.js';
import { formatRelativeDate, showNotification } from './utils.js';

const container = document.querySelector('#temoignages-list');
const template = document.querySelector('#testimonial-template');
let cacheTemoign = { data: null, time: 0 };

/** Initialise la section témoignages. */
export function initTestimonials() {
  loadTestimonials();
  
  supabaseClient
    .channel('realtime_testimonials')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'temoignages' },
      ({ new: t }) => prependTestimonial(t))
    .subscribe();
}

/** Charge et rend les témoignages (cache respecté). */
export async function loadTestimonials(force = false) {
  if (!force && cacheTemoign.data && Date.now() - cacheTemoign.time < CACHE_DURATION) {
    return renderTestimonials(cacheTemoign.data);
  }
  const { data, error } = await supabaseClient
    .from('temoignages').select('*').order('date_creation', { ascending: false });
  if (error) return showNotification('Erreur chargement témoignages', 'error');
  cacheTemoign = { data, time: Date.now() };
  renderTestimonials(data);
}

/** Rend la liste des témoignages via le <template>. */
function renderTestimonials(list) {
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  list.forEach(t => {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.testimonial-card').dataset.testimonialId = t.id;
    clone.querySelector('h4').textContent = t.nom;
    clone.querySelector('.client-rating').innerHTML = generateStars(t.note);
    clone.querySelector('.testimonial-content').textContent = t.avis;
    clone.querySelector('.testimonial-date').textContent = formatRelativeDate(t.date_creation);
    frag.appendChild(clone);
  });
  container.appendChild(frag);
}

/** Préfixe un nouveau témoignage. */
function prependTestimonial(t) {
  cacheTemoign.data.unshift(t);
  loadTestimonials(true);
}

/** Génère des étoiles ★/☆ selon la note. */
function generateStars(rating) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += `<span class="star${i<=rating?'':' empty'}">★</span>`;
  }
  return s;
}

/**
 * Bascule l’affichage du formulaire admin témoignages.
 */
export function toggleTestimonialAdmin() {
  const form = document.getElementById('temoignage-form');
  const button = document.querySelector('.testimonial-admin-toggle');
  if (!form || !button) return console.error('Formulaire témoignage introuvable');
  form.classList.toggle('active');
  button.innerHTML = form.classList.contains('active') ?
    '<i class="fas fa-times"></i> Fermer' :
    '<i class="fas fa-plus"></i> Ajouter un témoignage';
}
