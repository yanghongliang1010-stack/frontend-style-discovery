# Gallery workflow and manifest

Research the actual product surface. An immersive portfolio can supply material and motion, but does not define a chat workbench's layout. Group references by useful properties rather than forcing a universal taxonomy.

Inspect creator sources and obtain usable previews when authorized. Record screenshots and interaction verification separately. If a browser is unavailable, public previews and metadata remain useful with that limit stated. Do not bypass authentication or access controls.

Pin selected references across rounds and keep their numbered IDs. When the user likes scenes but rejects application examples, search for a scene-centered application next. Ask specific questions about the selected properties rather than repeatedly asking “what style?”

```json
{
  "schema_version": 1,
  "project_id": "my-app",
  "title": "Spatial workspaces",
  "subtitle": "Select examples and say what you like.",
  "round": 2,
  "references": [
    {
      "id": 21,
      "title": "Smart Home · 3D Interface",
      "creator": "Nixtio",
      "kind": "spatial concept",
      "source_url": "https://dribbble.com/shots/26678790-Smart-Home-Control-Dashboard-3D-Interface",
      "image": "media/21.png",
      "tags": ["3D scene", "warm light", "floating tools"],
      "note": "Scene-centered navigation.",
      "verification": "creator preview inspected; interaction not verified",
      "license": "creator copyright; local reference only",
      "pinned": true
    }
  ]
}
```

`image` is optional and must name a local PNG/JPEG/WebP/GIF within the manifest directory. The builder does not hotlink or download remote images. Missing previews are explicitly labeled as source-only cards. `source_url` accepts HTTP(S) URLs without credentials. IDs are unique positive integers. Generated data is escaped and user notes render as text.

```sh
python3 skills/frontend-style-discovery/scripts/build_gallery.py references.json --output out/gallery
python3 -m http.server 8780 --bind 127.0.0.1 --directory out/gallery
```

Open <http://127.0.0.1:8780/>. Filter, mark likes/dislikes, write notes, enlarge, compare and export decisions. Import that JSON into a later gallery to keep decisions for matched IDs. Notes stay in browser storage and are not automatically transmitted. Another browser/origin requires export/import.

Publish reusable code, source links and original/licensed examples. Do not publish a whole working directory or unlicensed preview collection. Review exported notes before sharing because users can type private information.
