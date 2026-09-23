/* app.js — hash-router single page app for the knowledge base shell */

let EKB_DATA = null;

async function ekbInit() {
  document.documentElement.setAttribute("data-theme", EKBStorage.getTheme());
  try {
    const res = await fetch("data/notes.json");
    EKB_DATA = await res.json();
  } catch (e) {
    document.getElementById("app").innerHTML =
      `<div class="empty-state"><div class="glyph">⚠</div>
        Could not load data/notes.json.<br>
        If you opened this file directly (file://), your browser may block local fetches.<br>
        Run a local server instead — see README.md — or host it on GitHub Pages / Netlify.
      </div>`;
    return;
  }

  document.title = EKB_DATA.siteTitle;
  document.getElementById("brand-name").textContent = EKB_DATA.siteTitle;
  document.getElementById("brand-sub").textContent = EKB_DATA.siteSubtitle;

  renderSidebar();
  wireHeader();
  window.addEventListener("hashchange", ekbRoute);
  ekbRoute();
}

/* ---------------------------------------------------------------- header */
function wireHeader() {
  const input = document.getElementById("search-input");
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input.value.trim()) {
      location.hash = "#/search?q=" + encodeURIComponent(input.value.trim());
    }
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const cur = EKBStorage.getTheme();
    const next = cur === "dark" ? "light" : "dark";
    EKBStorage.setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.getElementById("theme-toggle").textContent = next === "dark" ? "☾ Dark" : "☀ Light";
  });
  document.getElementById("theme-toggle").textContent =
    EKBStorage.getTheme() === "dark" ? "☾ Dark" : "☀ Light";

  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("sidebar-scrim");
  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("open"); scrim.classList.add("open");
  });
  scrim.addEventListener("click", () => {
    sidebar.classList.remove("open"); scrim.classList.remove("open");
  });
}

/* --------------------------------------------------------------- sidebar */
function renderSidebar() {
  const nav = document.getElementById("sidebar-nav");
  let html = `
    <a class="nav-link" href="#/" data-route="home">🏠 Home</a>
    <a class="nav-link" href="#/favorites" data-route="favorites">⭐ Favorites</a>
    <a class="nav-link" href="#/recent" data-route="recent">🕒 Recently Viewed</a>
  `;
  for (const cat of EKB_DATA.categories) {
    const count = EKB_DATA.notes.filter(n => n.category === cat.id).length;
    html += `<div class="nav-group">
      <a class="group-head nav-link" href="#/category/${cat.id}" data-route="cat-${cat.id}">
        ${cat.icon} ${escapeHtml(cat.name)} <span class="badge">${count}</span>
      </a>`;
    for (const sub of cat.subcategories) {
      html += `<a class="sub-link" href="#/category/${cat.id}/${sub.id}" data-route="sub-${cat.id}-${sub.id}">${escapeHtml(sub.name)}</a>`;
    }
    html += `</div>`;
  }
  nav.innerHTML = html;
}

function setActiveNav(routeKey) {
  document.querySelectorAll("#sidebar-nav [data-route]").forEach(el => {
    el.classList.toggle("active", el.dataset.route === routeKey);
  });
  // close mobile sidebar on navigation
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-scrim").classList.remove("open");
}

/* ----------------------------------------------------------------- router*/
function ekbRoute() {
  if (!EKB_DATA) return;
  const hash = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = hash.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(qs || "");

  if (parts.length === 0) { setActiveNav("home"); return renderHome(); }
  if (parts[0] === "category" && parts[1] && !parts[2]) {
    setActiveNav("cat-" + parts[1]);
    return renderCategory(parts[1]);
  }
  if (parts[0] === "category" && parts[1] && parts[2]) {
    setActiveNav("sub-" + parts[1] + "-" + parts[2]);
    return renderSubcategory(parts[1], parts[2]);
  }
  if (parts[0] === "search") {
    setActiveNav("");
    document.getElementById("search-input").value = params.get("q") || "";
    return renderSearch(params.get("q") || "");
  }
  if (parts[0] === "favorites") { setActiveNav("favorites"); return renderFavorites(); }
  if (parts[0] === "recent") { setActiveNav("recent"); return renderRecent(); }

  renderNotFound();
}

/* ----------------------------------------------------------------- views */
function renderHome() {
  const notes = EKB_DATA.notes;
  const recent = EKBStorage.getRecent().slice(0, 5)
    .map(r => notes.find(n => n.id === r.id)).filter(Boolean);
  const recentAdded = [...notes].sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || "")).slice(0, 5);

  const app = document.getElementById("app");
  app.innerHTML = `
    ${breadcrumbs([{ label: "Home" }])}
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">Your personal library of engineering study notes.</p>

    <div class="stat-row">
      <div class="stat-card"><div class="num">${notes.length}</div><div class="label">Total Notes</div></div>
      <div class="stat-card"><div class="num">${EKB_DATA.categories.length}</div><div class="label">Categories</div></div>
      <div class="stat-card"><div class="num">${EKBStorage.getFavorites().length}</div><div class="label">Favorites</div></div>
      <div class="stat-card"><div class="num">${countCompleted()}</div><div class="label">Completed</div></div>
    </div>

    <div class="section-head"><h2>Categories</h2></div>
    <div class="card-grid">${EKB_DATA.categories.map(catCardHtml).join("")}</div>

    <div class="section-head"><h2>Recently Added</h2></div>
    ${recentAdded.length ? `<div class="note-list">${recentAdded.map(noteRowHtml).join("")}</div>`
      : emptyState("No notes yet — add your first HTML note to get started.")}

    <div class="section-head"><h2>Continue Learning</h2></div>
    ${recent.length ? `<div class="note-list">${recent.map(noteRowHtml).join("")}</div>`
      : emptyState("Notes you open will show up here so you can pick up where you left off.")}
  `;
  wireNoteRows(app);
}

function renderCategory(catId) {
  const cat = EKB_DATA.categories.find(c => c.id === catId);
  const app = document.getElementById("app");
  if (!cat) return renderNotFound();

  const subCounts = cat.subcategories.map(sub => ({
    sub, count: EKB_DATA.notes.filter(n => n.category === catId && n.subcategory === sub.id).length
  }));
  const total = EKB_DATA.notes.filter(n => n.category === catId).length;

  app.innerHTML = `
    ${breadcrumbs([{ label: "Home", href: "#/" }, { label: cat.name }])}
    <h1 class="page-title">${cat.icon} ${escapeHtml(cat.name)}</h1>
    <p class="page-subtitle">${total} note${total === 1 ? "" : "s"} across ${cat.subcategories.length} subcategories.</p>

    <div class="section-head"><h2>Subcategories</h2></div>
    <div class="sub-grid">
      ${subCounts.map(({ sub, count }) => `
        <a class="sub-card" href="#/category/${catId}/${sub.id}">
          <div class="title">${escapeHtml(sub.name)}</div>
          <div class="count">${count} Note${count === 1 ? "" : "s"}</div>
        </a>
      `).join("")}
    </div>

    <div class="section-head"><h2>All notes in ${escapeHtml(cat.name)}</h2><span class="count">${total}</span></div>
    ${total ? `<div class="note-list">${EKB_DATA.notes.filter(n => n.category === catId).map(noteRowHtml).join("")}</div>`
      : emptyState("No notes in this category yet.")}
  `;
  wireNoteRows(app);
}

function renderSubcategory(catId, subId) {
  const cat = EKB_DATA.categories.find(c => c.id === catId);
  const sub = cat && cat.subcategories.find(s => s.id === subId);
  const app = document.getElementById("app");
  if (!cat || !sub) return renderNotFound();

  const notes = EKB_DATA.notes.filter(n => n.category === catId && n.subcategory === subId);

  app.innerHTML = `
    ${breadcrumbs([{ label: "Home", href: "#/" }, { label: cat.name, href: "#/category/" + catId }, { label: sub.name }])}
    <h1 class="page-title">${escapeHtml(sub.name)}</h1>
    <p class="page-subtitle">${notes.length} note${notes.length === 1 ? "" : "s"} in ${escapeHtml(cat.name)} → ${escapeHtml(sub.name)}.</p>
    ${notes.length ? `<div class="note-list">${notes.map(noteRowHtml).join("")}</div>`
      : emptyState("No notes here yet. Add one via the Add Note page.")}
  `;
  wireNoteRows(app);
}

function renderSearch(query) {
  const app = document.getElementById("app");
  const results = EKBSearch.run(EKB_DATA.notes, EKB_DATA, query);
  app.innerHTML = `
    ${breadcrumbs([{ label: "Home", href: "#/" }, { label: "Search" }])}
    <h1 class="page-title">Search results</h1>
    <p class="page-subtitle">${results.length} result${results.length === 1 ? "" : "s"} for "${escapeHtml(query)}"</p>
    ${results.length ? `<div class="note-list">${results.map(noteRowHtml).join("")}</div>`
      : emptyState("No notes matched your search.")}
  `;
  wireNoteRows(app);
}

function renderFavorites() {
  const app = document.getElementById("app");
  const ids = EKBStorage.getFavorites();
  const notes = EKB_DATA.notes.filter(n => ids.includes(n.id));
  app.innerHTML = `
    ${breadcrumbs([{ label: "Home", href: "#/" }, { label: "Favorites" }])}
    <h1 class="page-title">⭐ Favorites</h1>
    <p class="page-subtitle">${notes.length} note${notes.length === 1 ? "" : "s"} starred for quick access.</p>
    ${notes.length ? `<div class="note-list">${notes.map(noteRowHtml).join("")}</div>`
      : emptyState("Star a note to pin it here.")}
  `;
  wireNoteRows(app);
}

function renderRecent() {
  const app = document.getElementById("app");
  const recent = EKBStorage.getRecent();
  const notes = recent.map(r => EKB_DATA.notes.find(n => n.id === r.id)).filter(Boolean);
  app.innerHTML = `
    ${breadcrumbs([{ label: "Home", href: "#/" }, { label: "Recently Viewed" }])}
    <h1 class="page-title">🕒 Recently Viewed</h1>
    <p class="page-subtitle">${notes.length} note${notes.length === 1 ? "" : "s"} opened recently.</p>
    ${notes.length ? `<div class="note-list">${notes.map(noteRowHtml).join("")}</div>`
      : emptyState("Notes you open will appear here.")}
  `;
  wireNoteRows(app);
}

function renderNotFound() {
  document.getElementById("app").innerHTML = `
    ${breadcrumbs([{ label: "Home", href: "#/" }, { label: "Not found" }])}
    ${emptyState("That page doesn't exist.")}
  `;
}

/* --------------------------------------------------------------- helpers */
function countCompleted() {
  const map = EKBStorage.getProgressMap();
  return Object.values(map).filter(v => v === "completed").length;
}

function catCardHtml(cat) {
  const count = EKB_DATA.notes.filter(n => n.category === cat.id).length;
  const subNames = cat.subcategories.map(s => s.name).join(" • ");
  return `
    <a class="cat-card" href="#/category/${cat.id}">
      <div class="icon">${cat.icon}</div>
      <div class="title">${escapeHtml(cat.name)}</div>
      <div class="count">${count} Note${count === 1 ? "" : "s"}</div>
      <div class="subs">${escapeHtml(subNames)}</div>
    </a>`;
}

function noteRowHtml(note) {
  const cat = EKB_DATA.categories.find(c => c.id === note.category);
  const sub = cat && cat.subcategories.find(s => s.id === note.subcategory);
  const isFav = EKBStorage.isFavorite(note.id);
  const href = `note-viewer.html?id=${encodeURIComponent(note.id)}`;
  return `
    <div class="note-row" data-note-id="${note.id}">
      <div class="file-icon">📄</div>
      <a class="info" href="${href}">
        <div class="title">${escapeHtml(note.title)}</div>
        <div class="desc">${escapeHtml(note.description || "")} ${cat ? "· " + escapeHtml(cat.name) : ""}${sub ? " / " + escapeHtml(sub.name) : ""}</div>
      </a>
      <div class="meta">
        <span class="pill level-${note.level}">${escapeHtml(note.level)}</span>
        <span class="time">${note.readingTime} min</span>
        <button class="fav-btn ${isFav ? "active" : ""}" title="Toggle favorite" data-fav-id="${note.id}">${isFav ? "★" : "☆"}</button>
      </div>
    </div>`;
}

function wireNoteRows(scope) {
  scope.querySelectorAll("[data-fav-id]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const nowFav = EKBStorage.toggleFavorite(btn.dataset.favId);
      btn.textContent = nowFav ? "★" : "☆";
      btn.classList.toggle("active", nowFav);
    });
  });
}

function breadcrumbs(items) {
  const inner = items.map((it, i) => {
    const isLast = i === items.length - 1;
    const crumb = isLast || !it.href
      ? `<span class="current">${escapeHtml(it.label)}</span>`
      : `<a href="${it.href}">${escapeHtml(it.label)}</a>`;
    return i === 0 ? crumb : `<span class="sep">/</span>${crumb}`;
  }).join("");
  return `<div class="breadcrumbs">${inner}</div>`;
}

function emptyState(msg) {
  return `<div class="empty-state"><div class="glyph">◇</div>${escapeHtml(msg)}</div>`;
}

function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

document.addEventListener("DOMContentLoaded", ekbInit);
