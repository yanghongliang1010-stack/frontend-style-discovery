# COMMONPLACE — example implementation handoff

This is a filled **illustrative specification**, not a user's approved design or a finished application. It demonstrates what a developer needs after preference discovery.

## Task and composition

Personal inspiration library: save an idea, browse collections, filter/search, inspect an item and move it to a collection. No account/backend requirements are assumed in this example.

Use concept 17 for reading order: navigation → filters → collection grid → selected-item inspector. Use concept 18 for the glass/resin material in artwork previews and an optional canvas view. Collection browsing remains directly accessible without WebGL. Rich motion must not obscure text or delay a save action.

The simulated first-round feedback preferred a collection model and tactile materials and rejected a dense issue tracker. It left the final structure unresolved; these concepts are alternatives, not automatic approval.

## Tokens and layout

- Background `#f5f0e8`; surface `#fffcf6`; text `#201d1b`; muted `#6c625b`; accent coral `#ff6b50`; artwork cobalt `#1747df`. Error/success use separate semantic tokens.
- Editorial headings: system serif, 64/68 desktop, 40/44 small screen. Body/control text: system sans, 15/22; metadata 13/18.
- Spacing: 4, 8, 12, 16, 24, 32, 48. Thin warm borders; radius 10 for controls, 16 for artwork frames, 0 for editorial content rows.
- At 1440px: 216px navigation, flexible 2-column collection, 280px inspector; 24px gaps. Text and inspector are code-native, even if the artwork is a generated image.
- At 820px: 72px collapsed navigation, 2-column collection; selected-item inspector becomes an accessible dialog.
- At 390px: compact top navigation, one-column collection, wrapping filters; inspector opens as a sheet/dialog with close action and focus restoration. Save remains visible without horizontal scrolling.

## Controls and states

| Action                | Result                                                | Empty/loading/error                                                     | Persistence and access                                             |
| --------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Search/filter         | Filter visible ideas; show count                      | Empty result offers clear filters                                       | Keyboard-accessible; preserve query when closing inspector         |
| Select artwork        | Open item metadata and save/move controls             | Missing artwork shows a labeled fallback                                | Same content through card button and direct list navigation        |
| Save to collection    | Select target, confirm save and announce result       | Pending prevents duplicates; failure retains selection and offers retry | Adapter decides local or API storage; do not invent server success |
| Switch Library/Canvas | Same collection, different browsing view              | Renderer failure returns to library with direct item access             | Persist view only if product scope requests it                     |
| Close inspector       | Return to previous reading position and trigger focus | Escape closes dialog                                                    | Trap focus while modal; native controls                            |

## Interaction and motion

Short 160–220ms opacity/position transitions for panel changes. Canvas orbit is user-driven; no continuous idle camera movement. Reduced-motion removes decorative transitions. Generated artwork does not implement a manipulable 3D mesh; actual orbit requires geometry and a renderer.

## Implementation and acceptance

Use the target app's framework and existing component/state/API conventions. Inventory real contracts before implementation. Do not replace an existing backend merely to follow this example.

Acceptance remains unset until a real user selects an artifact/version and authorizes the next scope. If selected, record the exact instruction and adapt this brief to actual content, devices, routes and services.

## Validation to collect

Compare screenshots with the selected concept at 1440/820/390 widths. Verify search → inspect → save → revisit, no overflow, keyboard focus, empty/failure/retry and reduced-motion. Separate local storage/demo checks from real service checks. Record visual differences, especially generated artwork versus reconstructed 3D.
