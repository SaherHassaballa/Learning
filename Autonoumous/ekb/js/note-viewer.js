/* note-viewer.js — chrome logic for the individual note reading page */
(async function () {
  document.documentElement.setAttribute("data-theme", EKBStorage.getTheme());

  const params = new URLSearchParams(location.search);
  const noteId = params.get("id");

  let data;
  try {
    const res = await fetch("data/notes.json");
    data = await res.json();
  } catch (e) {
    document.getElementById("note-title").textContent = "Could not load data/notes.json";
    return;
  }

  const note = data.notes.find(n => n.id === noteId);
  if (!note) {
    document.getElementById("note-title").textContent = "Note not found";
    return;
  }

  const cat = data.categories.find(c => c.id === note.category);
  const sub = cat && cat.subcategories.find(s => s.id === note.subcategory);

  document.title = note.title + " — Engineering Knowledge Base";
  document.getElementById("note-title").textContent = note.title;
  document.getElementById("note-level").textContent = note.level;
  document.getElementById("note-level").classList.add("level-" + note.level);

  document.getElementById("back-cat").textContent = "← Back to " + (cat ? cat.name : "category");
  document.getElementById("back-cat").href = cat ? "index.html#/category/" + cat.id : "index.html";

  document.getElementById("back-sub").textContent = "← Back to " + (sub ? sub.name : "list");
  document.getElementById("back-sub").href = (cat && sub)
    ? "index.html#/category/" + cat.id + "/" + sub.id
    : "index.html";

  // Load the original HTML note into the iframe, completely unmodified.
  document.getElementById("note-frame").src = note.file;

  // Track as recently viewed.
  EKBStorage.pushRecent(note.id);

  // Progress control.
  const progressSelect = document.getElementById("progress-select");
  progressSelect.value = EKBStorage.getProgress(note.id);
  progressSelect.addEventListener("change", () => {
    EKBStorage.setProgress(note.id, progressSelect.value);
  });

  // Favorite control.
  const favBtn = document.getElementById("fav-toggle");
  const syncFav = () => {
    const isFav = EKBStorage.isFavorite(note.id);
    favBtn.textContent = isFav ? "★" : "☆";
    favBtn.classList.toggle("active", isFav);
  };
  syncFav();
  favBtn.addEventListener("click", () => {
    EKBStorage.toggleFavorite(note.id);
    syncFav();
  });
})();
