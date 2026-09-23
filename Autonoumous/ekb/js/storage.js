/* storage.js — thin wrapper around localStorage for all persisted state */
const EKB_KEYS = {
  theme: "ekb_theme",
  favorites: "ekb_favorites",
  recent: "ekb_recent_views",
  progress: "ekb_progress"
};

const EKBStorage = {
  // ---- theme ----
  getTheme() {
    return localStorage.getItem(EKB_KEYS.theme) || "dark";
  },
  setTheme(theme) {
    localStorage.setItem(EKB_KEYS.theme, theme);
  },

  // ---- favorites: array of note ids ----
  getFavorites() {
    try { return JSON.parse(localStorage.getItem(EKB_KEYS.favorites)) || []; }
    catch (e) { return []; }
  },
  isFavorite(noteId) {
    return this.getFavorites().includes(noteId);
  },
  toggleFavorite(noteId) {
    const favs = this.getFavorites();
    const idx = favs.indexOf(noteId);
    if (idx === -1) favs.push(noteId); else favs.splice(idx, 1);
    localStorage.setItem(EKB_KEYS.favorites, JSON.stringify(favs));
    return favs.includes(noteId);
  },

  // ---- recently viewed: array of {id, ts}, most recent first, capped ----
  getRecent() {
    try { return JSON.parse(localStorage.getItem(EKB_KEYS.recent)) || []; }
    catch (e) { return []; }
  },
  pushRecent(noteId) {
    let recent = this.getRecent().filter(r => r.id !== noteId);
    recent.unshift({ id: noteId, ts: Date.now() });
    recent = recent.slice(0, 20);
    localStorage.setItem(EKB_KEYS.recent, JSON.stringify(recent));
  },

  // ---- progress: map noteId -> "not-started" | "in-progress" | "completed" ----
  getProgressMap() {
    try { return JSON.parse(localStorage.getItem(EKB_KEYS.progress)) || {}; }
    catch (e) { return {}; }
  },
  getProgress(noteId) {
    return this.getProgressMap()[noteId] || "not-started";
  },
  setProgress(noteId, status) {
    const map = this.getProgressMap();
    map[noteId] = status;
    localStorage.setItem(EKB_KEYS.progress, JSON.stringify(map));
  }
};
