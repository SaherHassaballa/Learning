/* search.js — searches note titles, descriptions, categories, subcategories, tags */
const EKBSearch = {
  /**
   * @param {Array} notes  full note list (data.notes)
   * @param {Object} data  full dataset (for category/subcategory name lookup)
   * @param {string} query
   * @returns {Array} matching notes, best matches first
   */
  run(notes, data, query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];

    const catName = id => (data.categories.find(c => c.id === id) || {}).name || "";
    const subName = (catId, subId) => {
      const cat = data.categories.find(c => c.id === catId);
      if (!cat) return "";
      return (cat.subcategories.find(s => s.id === subId) || {}).name || "";
    };

    const scored = [];
    for (const note of notes) {
      let score = 0;
      const title = note.title.toLowerCase();
      const desc = (note.description || "").toLowerCase();
      const cat = catName(note.category).toLowerCase();
      const sub = subName(note.category, note.subcategory).toLowerCase();
      const tags = (note.tags || []).map(t => t.toLowerCase());

      if (title === q) score += 100;
      else if (title.startsWith(q)) score += 60;
      else if (title.includes(q)) score += 40;

      if (tags.some(t => t === q)) score += 50;
      else if (tags.some(t => t.includes(q))) score += 25;

      if (cat.includes(q)) score += 15;
      if (sub.includes(q)) score += 20;
      if (desc.includes(q)) score += 10;

      if (score > 0) scored.push({ note, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.note);
  }
};
