# 🌍 Worldkeeper

**Worldbuilding sheets, dashboards, an encyclopedia and novel progress tracking for [Obsidian](https://obsidian.md).**
By [bearbaitdesigns](https://github.com/bearbaitdesigns).

Worldkeeper turns ordinary notes into rich, editable sheets for everything in your world: characters, planets, continents, kingdoms, places, hubs, cultures, languages, magic systems, organizations, species, pantheons, demon species and items. It also gives you dashboards for each type, a home page that tracks your novel, and an encyclopedia for worldbuilding notes. Everything is stored as plain frontmatter in your own Markdown files, so your notes stay portable.

---

## Third-party plugins

Worldkeeper has **no hard dependencies**: every feature below works with Obsidian alone. These plugins are needed only for the parts noted:

| Plugin | Needed? | What it's for |
|---|---|---|
| [**BRAT**](https://github.com/TfTHacker/obsidian42-brat) (Obsidian42 - BRAT, by TfTHacker) | **Required to install** while Worldkeeper is in beta | Installs and updates Worldkeeper from this GitHub repository. |
| [**Plot Weaver**](https://github.com/bearbaitdesigns/obsidian_PlotWeaver) (bearbaitdesigns) | Optional | Powers the Home dashboard's writing stats: word count, scenes by status, chapters, scenes per POV, plotlines, cause → effect links and off-screen events. Without it, you enter your word count by hand. |
| [**Tasks**](https://github.com/obsidian-tasks-group/obsidian-tasks) (obsidian-tasks-group) | Optional | The Home to-do list is saved as Markdown tasks in `Worldkeeper/To-do.md`, using Tasks' `📅` due-date format, so Tasks can query them. Worldkeeper reads and writes the list without it. |

Plugins like Dataview and Templater are **not** needed. A custom template file can contain Templater code if you use it, and Worldkeeper leaves that code alone.

---

## Install with BRAT

1. In Obsidian, open **Settings → Community plugins**, turn off **Restricted mode** if it's on, then **Browse** and install **BRAT** (Obsidian42 - BRAT). Enable it.
2. Open **Settings → BRAT → Add Beta plugin** (or run the command *BRAT: Add a beta plugin for testing*).
3. Paste `bearbaitdesigns/obsidian_WorldKeeper` and choose **Add Plugin**.
4. Go back to **Settings → Community plugins** and enable **Worldkeeper**.

BRAT checks for new releases and updates Worldkeeper for you.

<details>
<summary>Manual install</summary>

Download `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/bearbaitdesigns/obsidian_WorldKeeper/releases/latest). Put them in `<your vault>/.obsidian/plugins/worldkeeper/`, then enable Worldkeeper under Community plugins.
</details>

---

## Getting started

- Click the 🌍 **globe** ribbon icon (or run *Worldkeeper: Open home*) to open the Home dashboard.
- Run **Worldkeeper: Create new…** to make a character, place, magic system and so on. Each type also has its own command, such as *Create new character*.
- Already have notes? Run **Worldkeeper: Convert notes to a template…**, or right-click a note and choose **Convert with Worldkeeper…**.

### The sheet

A note shows its sheet wherever it contains this block:

````markdown
```worldkeeper
```
````

New and converted notes get the block automatically. Each sheet has:

- **Banner**: the name, a badge, aliases, and links shown as a breadcrumb (e.g. 📍 Thalassar › Varos › The Northmarch › Saltgate). You can upload or choose a banner image, drag an image onto the banner, set its vertical focus, and switch between clear and blurred.
- **Portrait or emblem**: click it to upload an image or choose one from your vault.
- **Tiles**: dropdowns and checklists for value-list fields, and link pickers for linked notes, all in one row.
- **Tabs**: one for each body heading (Notes, Backstory, History…), Details, Relationships, linked notes, and type-specific modules.
- **Gallery**: add, remove and reorder images (drag or ◀ ▶), view them in a lightbox, and set any of them as the image or banner.

### Templates and the hierarchy

| Type | Highlights |
|---|---|
| 👤 Character | Location, occupation, species, culture, magic, relationships. Demon characters also get a Demon status tile. |
| 🪐 Planet › 🗺️ Continent › 👑 Kingdom › 📍 Place › 🏛️ Hub | Each one is placed inside the level above. A **Contains** tab lists everything inside it, the characters there (including sub-locations) and what's found there. |
| 🎭 Culture · 🗣️ Language · ✨ Magic · 🛡️ Organization · 🧬 Species | Can belong to any level of geography. |
| 🗣️ Language | A **Conlang** builder: phonology, a word generator, a lexicon, affixes and grammar, and a word-by-word translator that can make up new words for ones it doesn't know. |
| ✨ Magic | God patron, an infernal patron, a soft ↔ hard slider, Rules / Limitations / Costs / Taboos, a magic list with who knows each spell, and practitioners. |
| ⛩️ Pantheon | Gods (character notes with role Deity) with rank, domains and symbol. Its **Worship** tab is filled in automatically from cultures, magic, kingdoms and organizations linked to those gods. |
| 😈 Demon species | Individual demons are characters whose species is a demon species. |
| 🗡️ Item | Origin, owner and magic. |

Every field, list, label, icon, tab and tab order can be changed in **Settings → Worldkeeper → Templates & fields**. **Write template files** saves a template note for each type to your Templates folder.

### Dashboards

- **Home** (🌍): a novel banner with a goal ring (upload, drag in, set focus, clear or blurred, like any note banner), word-count stats, the book's logline and summary, a to-do list, Plot Weaver stats, a writing-activity chart, a *Needs attention* list, recently edited notes, a world tree, and pills that open each type's dashboard.
- **Dashboards** (▦): one dashboard per type, shown as cards or a table, with search, filters, an "anywhere in [region]" filter and sorting.
- **Encyclopedia** (📚): worldbuilding entries sorted into categories. Each entry has tags, linked elements, See also, and related entries worked out from shared links. Linked notes show the entry under their **Linked here** tab.

You can embed these in any note:

````markdown
```worldkeeper-home
```

```worldkeeper-dashboard
type: place
view: cards
sort: size
in: "[[The Northmarch]]"
```
````

### Folders

**Settings → Folders** sets where each type's notes live, using tokens: `{root}`, `{path}` (the note's place in the hierarchy) and `{type}`. You can keep a flat folder per type, or nest notes by geography (`World/Thalassar/Varos/The Northmarch/Saltgate.md`). **Reorganize vault…** moves existing notes to match these settings, and Obsidian updates links to them automatically.

### Plot Weaver

When Plot Weaver is installed, Worldkeeper reads its outline directly. It uses the live plugin when Plot Weaver is enabled, and its saved data when it isn't.

- **Cards and linked notes.** Each card's scene note (the note you created or linked from the card) supplies status and word count. Worldkeeper reads them with **Plot Weaver's own field settings**, such as `status` and `words, wordcount, word-count, word_count`, and maps them through Plot Weaver's status definitions and colours. You never set field names twice.
- **The same counting rules as Plot Weaver's stats strip.** Scenes are cards on the board in a chapter, prologue, interlude or epilogue. Planning sections, part summaries, off-screen events, parked or archived cards, and archived plotlines are left out.
- **On Home**, the Plot Weaver card shows scenes by status, scenes with notes, plotlines, cause → effect links, off-screen events, words per chapter (coloured by the least-progressed scene) and scenes per POV. Click **Open board** to jump into Plot Weaver. If Plot Weaver has more than one novel, choose which one to track.
- **On sheets**, a 🧵 **Scenes** tab appears on any character who is a card's POV, and on any note that a scene note links to (characters, places, items, magic…).
- **POV names** link to character notes by exact name or alias, or by first name when only one character has it ("Cassius" → Cassius Venn).

The writing-activity chart comes from a snapshot of your total word count, which Worldkeeper saves once a day.

---

## Commands

Open home · Open dashboards · Open encyclopedia · Create new… · Create new *type* · Create new encyclopedia entry · Convert notes to a template… · Convert current note to a template… · Insert sheet block · Reorganize vault to match folder settings · Write template files · Add to-do

---

## For developers

`main.js` is generated. Edit the files in `src/`, then build:

```bash
node scripts/build.mjs   # concatenates src/*.js → main.js (no dependencies)
```

`styles.css` is hand-written. Every rule is scoped under `.wk`, so nothing leaks into Obsidian's own interface.

### Releasing

1. Bump the version with `npm version patch` (or `minor` / `major`). This updates `package.json`, `manifest.json` and `versions.json` and creates a git tag.
2. Push the commit and the tag: `git push && git push --tags`.
3. The **Release** GitHub Action builds `main.js`, checks that the tag matches `manifest.json`, and publishes a release with `main.js`, `manifest.json` and `styles.css` attached. BRAT picks it up from there.

You can also run the action by hand from the Actions tab (*Release → Run workflow*) with an existing tag.

---

MIT © bearbaitdesigns
