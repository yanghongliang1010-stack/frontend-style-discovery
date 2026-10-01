# Decision record

Keep a short editable record next to the manifests and artifacts. Scripts export evidence; the agent and user determine its meaning.

```json
{
  "project_id": "commonplace-demo",
  "stage": "compose",
  "brief": {
    "product": "Fictional inspiration library",
    "task": "Save and revisit ideas",
    "scope": "Concept first"
  },
  "rounds": [
    {
      "round": 1,
      "manifest": "round-1/references.json",
      "selected_ids": [3, 10],
      "rejected_ids": [1],
      "feedback": "Readable collection layout plus tactile 3D; not an issue tracker",
      "next_search": "collection and canvas layouts"
    }
  ],
  "preferences": {
    "layout": {
      "keep": ["clear collection reading order"],
      "reject": ["issue-tracker density"],
      "unresolved": ["masonry or canvas"]
    },
    "material": { "keep": ["tactile glass"], "evidence_ids": [10] }
  },
  "composition": {
    "layout": [3],
    "material": [10],
    "conflicts": "3D is confined to selected artwork so collection browsing remains direct"
  },
  "variants": [
    {
      "id": "editorial-v1",
      "artifact": "concepts/editorial.png",
      "status": "proposed",
      "feedback": null
    }
  ],
  "acceptance": null,
  "implementation_authorization": null,
  "verification": []
}
```

Record exact feedback, negative findings, artifact versions and unresolved axes. Do not turn optional preferences into functional requirements. For an accepted artifact, fill acceptance with the real user instruction and version; do not use the synthetic demonstration text as a real user's approval.

Handoff requirements, states, tokens and responsive rules are in [handoff-template.md](handoff-template.md). Keep a visual ledger during development, not just a “done” checkbox.
