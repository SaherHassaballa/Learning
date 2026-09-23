/* add-note.js — client-side helper that produces a ready-to-paste notes.json entry */
(async function () {
  document.documentElement.setAttribute("data-theme", EKBStorage.getTheme());

  let data;
  try {
    const res = await fetch("data/notes.json");
    data = await res.json();
  } catch (e) {
    document.querySelector(".main").innerHTML =
      '<div class="empty-state">Could not load data/notes.json. Run a local server — see README.md.</div>';
    return;
  }

  const catSelect = document.getElementById("f-category");
  const subSelect = document.getElementById("f-subcategory");

  function fillCategories() {
    catSelect.innerHTML = data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    fillSubcategories();
  }
  function fillSubcategories() {
    const cat = data.categories.find(c => c.id === catSelect.value) || data.categories[0];
    subSelect.innerHTML = cat.subcategories.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  }
  catSelect.addEventListener("change", fillSubcategories);
  fillCategories();

  // Suggest a file path automatically when a file is chosen.
  document.getElementById("f-file").addEventListener("change", e => {
    const file = e.target.files[0];
    const pathField = document.getElementById("f-path");
    if (file && !pathField.value) {
      const catId = catSelect.value, subId = subSelect.value;
      const slug = file.name.toLowerCase().replace(/\.html?$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      pathField.value = `notes/${catId}/${subId}/${slug || "note"}.html`;
    }
  });

  function slugify(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  document.getElementById("add-note-form").addEventListener("submit", e => {
    e.preventDefault();

    const title = document.getElementById("f-title").value.trim();
    const category = catSelect.value;
    const subcategory = subSelect.value;
    const level = document.getElementById("f-level").value;
    const readingTime = parseInt(document.getElementById("f-time").value, 10) || 10;
    const description = document.getElementById("f-desc").value.trim();
    const tags = document.getElementById("f-tags").value.split(",").map(t => t.trim()).filter(Boolean);
    const sourceVideo = document.getElementById("f-video").value.trim();
    let filePath = document.getElementById("f-path").value.trim();

    if (!filePath) {
      filePath = `notes/${category}/${subcategory}/${slugify(title) || "note"}.html`;
      document.getElementById("f-path").value = filePath;
    }

    const entry = {
      id: slugify(title) || ("note-" + Date.now()),
      title, category, subcategory,
      file: filePath,
      level, readingTime, tags,
      description,
      dateAdded: new Date().toISOString().slice(0, 10),
      sourceVideo
    };

    document.getElementById("out-path").textContent = filePath;
    const json = JSON.stringify(entry, null, 2);
    document.getElementById("out-json").textContent = json + ",";
    document.getElementById("result").style.display = "block";
    document.getElementById("result").scrollIntoView({ behavior: "smooth", block: "start" });

    document.getElementById("copy-btn").onclick = () => {
      navigator.clipboard.writeText(json + ",").then(() => {
        const btn = document.getElementById("copy-btn");
        const old = btn.textContent;
        btn.textContent = "Copied ✓";
        setTimeout(() => (btn.textContent = old), 1500);
      });
    };
  });
})();
