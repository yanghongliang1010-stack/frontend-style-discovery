# Decision record

Keep a brief, reference manifest, variants, feedback and verification in the project's design directory. Preserve these distinctions; adapt filenames to existing conventions.

```json
{
  "stage": "build",
  "brief": {
    "product": "AI knowledge workspace",
    "scope": "design first, integrate later"
  },
  "rounds": [
    {
      "round": 1,
      "selected_ids": [13, 17, 18],
      "feedback": "Likes 3D scenes/materials; rejects dashboard layouts",
      "next_search": "spatial workspaces"
    },
    {
      "round": 2,
      "selected_ids": [21, 22, 27, 28],
      "feedback": "Scene-centered tools with floating windows"
    }
  ],
  "composition": {
    "scene": [21, 22],
    "windows": [27, 28],
    "material_motion": [13, 17, 18]
  },
  "variants": [
    {
      "id": "dark",
      "artifact": "concept-dark.png",
      "feedback": "Want brighter warm contrast"
    },
    {
      "id": "warm",
      "artifact": "concept-warm.png",
      "feedback": "Use this design"
    }
  ],
  "acceptance": {
    "instruction": "Use both as switchable themes",
    "variants": ["dark", "warm"],
    "next": "implement"
  }
}
```

Record exact feedback where possible. Keep negative findings to prevent repeated rejected patterns. A preference is not necessarily a functional requirement. Do not freeze this case's palette, reference count or page structure into a universal rule.

For each accepted design retain the artifact, visible copy/navigation, components, material/theme roles, workflow, responsive intent and generation method. Record existing implementation authorization so it is not repeatedly requested.
