# Engineering Knowledge Base

A static personal knowledge base for organizing and reading your HTML study notes
(ArduPilot, Mission Planner, PX4, ROS2, Gazebo, embedded systems, control theory, etc.).

Your notes are **standalone HTML files**. This site is just a navigation layer around
them — every note opens in an `<iframe>` and renders with its own original CSS, layout,
images, and scripts completely untouched.

---

## Running it locally

Because the site loads `data/notes.json` and your note files with `fetch()`, opening
`index.html` directly from disk (`file://...`) will be blocked by most browsers. Run a
tiny local server from the project folder instead:

```bash
# Python (already installed on most systems)
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000`.

---

## Adding a new note — the simple version

**STEP 1**
Generate the HTML note (e.g. with Gemini) and save it as a `.html` file.

**STEP 2**
Put the file here, inside the matching category/subcategory folder:

```
notes/drones/ardupilot/calibration.html
```

If the subcategory folder doesn't exist yet, create it.

**STEP 3**
Add its metadata to `data/notes.json`, inside the `"notes"` array:

```json
{
  "id": "ardupilot-calibration",
  "title": "ArduPilot Sensor Calibration",
  "category": "drones",
  "subcategory": "ardupilot",
  "file": "notes/drones/ardupilot/calibration.html",
  "level": "Intermediate",
  "readingTime": 15,
  "tags": ["ArduPilot", "Calibration", "Sensors"],
  "description": "Understanding sensor calibration in ArduPilot.",
  "dateAdded": "2026-09-23",
  "sourceVideo": ""
}
```

**STEP 4**
Refresh the site. Done — the note now shows up in its category, subcategory, search
results, and the dashboard.

### Using the Add Note page instead of typing JSON by hand

Open `add-note.html` in the sidebar. Fill in the form and click **Generate JSON entry** —
it produces the exact object above (with a suggested file path) and a **Copy JSON** button.
This is a **static site**, so the page cannot write the file or edit `notes.json` for you —
it only generates what to paste. That's the practical limit of a browser-only app with no
backend; if you ever want true one-click saving, you'd need a small server (see "Optional:
going beyond static" below).

---

## Adding a new category or subcategory

Both live in `data/notes.json`, at the top under `"categories"`:

```json
{
  "id": "control",
  "name": "Control Systems",
  "icon": "🎛️",
  "subcategories": [
    { "id": "pid", "name": "PID" },
    { "id": "state-space", "name": "State Space" }
  ]
}
```

Add a new object to `"categories"` for a new top-level category, or a new object inside an
existing category's `"subcategories"` array. The `id` is used in URLs and note file paths —
keep it lowercase with hyphens (e.g. `flight-dynamics`).

## Adding tags

Tags are just strings in each note's `"tags"` array — add whatever's useful for search and
filtering. No separate registry to update.

## Changing the website title

Edit `"siteTitle"` and `"siteSubtitle"` at the top of `data/notes.json`.

---

## Project structure

```
engineering-knowledge-base/
├── index.html            Homepage / dashboard (single-page app shell)
├── note-viewer.html       Wrapper page that opens one note in an iframe
├── add-note.html          Form that generates a notes.json entry
├── README.md
│
├── css/
│   └── style.css          All styling (dark/light theme via data-theme attr)
│
├── js/
│   ├── app.js              Hash router + all page rendering
│   ├── search.js            Client-side search over titles/tags/descriptions
│   ├── storage.js           localStorage: theme, favorites, recent, progress
│   ├── note-viewer.js        Logic for note-viewer.html
│   └── add-note.js           Logic for add-note.html
│
├── data/
│   └── notes.json         All categories, subcategories, and note metadata
│
├── notes/                 Your actual HTML study notes, organized by folder
│   ├── drones/ardupilot/...
│   ├── embedded/protocols/...
│   ├── robotics/ros2/...
│   └── control/pid/...
│
└── assets/                 Icons / images (empty by default)
```

Everything is vanilla HTML/CSS/JS with no build step and no external dependencies —
open the folder, run a static server, and it works.

---

## How reading works (why your notes stay untouched)

Clicking a note opens `note-viewer.html?id=<note-id>`, which:

1. Looks up the note's metadata (title, category, file path) in `data/notes.json`.
2. Sets an `<iframe>`'s `src` directly to your original `.html` file.
3. Adds only a thin bar above it: breadcrumbs, back links, a favorite toggle, and a
   progress dropdown (Not Started / In Progress / Completed).

The iframe is a fully separate HTML document — your note's own CSS, fonts, tables, code
blocks, images, and any built-in table of contents render exactly as you made them. The
wrapper never parses, rewrites, or strips anything from the note itself.

---

## Deploying

This is a fully static site — push the folder as-is to:

- **GitHub Pages** — commit to a repo, enable Pages on the `main` branch (root), done.
- **Netlify** — drag-and-drop the folder onto Netlify's deploy screen, or connect the repo.
- **Cloudflare Pages** — connect the repo, build command: none, output directory: `/`.

No environment variables, no database, no server-side code required.

---

## What's stored where (all client-side, via `localStorage`)

- **Theme** (dark/light)
- **Favorites** — starred note IDs
- **Recently viewed** — last 20 notes opened, most recent first
- **Learning progress** — Not Started / In Progress / Completed per note

This data lives only in your browser on the device you're using — it isn't synced or
uploaded anywhere.

---

## Scaling to hundreds of notes

`data/notes.json` is the only thing that grows — the UI doesn't hardcode any list of
notes, categories, or subcategories, so 1,000+ notes work the same way 6 do. If the file
ever gets unwieldy to hand-edit, splitting it into one JSON file per category and merging
them in `app.js`'s `fetch` step is a straightforward next step (not needed yet).

---

## Optional: going beyond static

If you eventually want the Add Note form to actually write files (instead of generating
JSON to paste), that requires a small backend — even a one-file script (Node/Express or
Python/Flask) that accepts the upload and metadata and writes `notes.json` + the HTML
file to disk. Not included here on purpose, to keep the default version deployable
anywhere for free with zero server maintenance.
