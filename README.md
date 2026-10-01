# Frontend Style Discovery

**Choose references. Express preferences. Combine a direction. Build the selected frontend.**

[中文说明](README.zh-CN.md) · [Full workflow](docs/WORKFLOW.zh-CN.md) · [Watch the 32-second film](media/frontend-style-discovery.mp4)

![Original warm spatial design concept](examples/media/concept-warm.png)

A Codex skill for people who know what they like when they see it, but cannot describe it in design vocabulary. Instead of repeatedly guessing a style, the agent curates real examples, gives them stable IDs, asks what appealed, and refines the unresolved parts over multiple rounds.

It can combine a scene from one reference, floating tools from another, and a user's color feedback into one original interface. Once the user selects the concept, the workflow continues into implementation and browser verification.

## What you get

- A reusable skill with exploration, composition, revision and implementation stages.
- A dependency-free Python gallery builder: local previews, source links, filters, likes/dislikes, notes, enlargement, comparison and JSON export/import.
- A resumable decision record that preserves liked, rejected and unresolved properties.
- Original light/dark spatial concepts and a real interactive Three.js scene.
- A promotional video, original sound and deterministic rendering scripts.

The skill is general purpose. The spatial workspace is an example, not a mandatory visual style.

## Install the skill

```sh
git clone https://github.com/yanghongliang1010-stack/frontend-style-discovery.git
cd frontend-style-discovery
python3 scripts/install-local.py
```

The installer copies only `skills/frontend-style-discovery` into `${CODEX_HOME:-~/.codex}/skills` and refuses to overwrite an existing installation. It needs Python 3.10+. The skill will be available on the next turn in Codex.

Invoke it:

```text
Use $frontend-style-discovery to redesign my app.
I can't describe the style. Find 10–20 real interfaces for me to choose from.
Design first; connect the existing functions after I select a concept.
```

Continue with concrete selections:

```text
I like 13, 17 and 18 for their 3D scenes and materials.
None of the dashboard layouts work for me.
```

```text
Keep this spatial layout, make it brighter with stronger warm color contrast.
Use the dark and warm variants as switchable themes, then implement them.
```

## Run the gallery without Node

```sh
python3 skills/frontend-style-discovery/scripts/build_gallery.py examples/demo.json --output out/gallery
python3 -m http.server 8780 --bind 127.0.0.1 --directory out/gallery
```

Open <http://127.0.0.1:8780/>. The bundled concepts are original examples; creator references in `examples/selected-references.json` are link-only. Bring local authorized previews for your own research. Nothing is automatically scraped, uploaded or sent to a model.

## Run the 3D showcase

```sh
npm ci
npm run gallery
npm run demo
```

Open <http://127.0.0.1:8782/demo/>. Drag to rotate, switch lighting/material themes, or open the gallery. Node 20+ is needed only for the 3D demo/video, not for the skill or gallery.

## Reproduce the film

Install Chromium using `npx playwright install chromium` and provide an FFmpeg executable on your PATH or in `FFMPEG_PATH`:

```sh
python3 scripts/make-sound.py
npm run video
```

The renderer produces a deterministic 32-second film at 1280×720, 24 fps, with original WebGL geometry and sound; software rendering captures at 8 fps and interpolates the output. `CHROMIUM_PATH` can select an existing Chromium executable. See [video notes](docs/VIDEO.md) for the storyboard and production details.

## Boundaries and license

The gallery makes selection easy; the agent still researches real sources and interprets feedback. Static concepts and the 3D showcase are not backend-connected applications. Actual frontend delivery requires implementation and verification in the user's project.

MIT for this repository's code, documentation and original demo assets. Third-party references retain their creators' rights; their screenshots/footage are not bundled. See [licensing and credits](THIRD_PARTY_NOTICES.md).
