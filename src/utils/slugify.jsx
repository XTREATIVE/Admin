// utils/slugify.js
export function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')       // spaces → hyphens
<<<<<<< HEAD
      .replace(/[^\w-]+/g, '')   // remove non-word chars
      .replace(/--+/g, '-');    // collapse multiple hyphens
  }
  
=======
      .replace(/[^\w-]+/g, '')    // remove non‑word chars (hyphen kept)
      .replace(/-{2,}/g, '-');    // collapse multiple hyphens
  }
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
