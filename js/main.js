// main.js
import { initPanel }          from './panel.js';
import { initBlog }           from './blog.js';
import { initTestimonials,
         toggleTestimonialAdmin } from './testimonials.js';

document.addEventListener('DOMContentLoaded', () => {
  initPanel();
  initBlog();
  initTestimonials();

  // Expose global pour le onclick inline
  window.toggleTestimonialAdmin = toggleTestimonialAdmin;
});
