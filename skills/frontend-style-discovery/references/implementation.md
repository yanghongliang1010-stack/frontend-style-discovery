# Implementation and verification

Inventory framework, routes, components, state and API boundaries before editing. Preserve auth, permission gating, validation, cancellation, evidence, errors, loading and persistence. Existing user changes are not disposable.

Extract the selected design into shared typography, palette/material tokens, spacing, panels, rows, forms, icons and motion. Implement the functional surface as well as its scene; do not leave a rejected older UI beneath a new illustration.

## Themes and spatial tools

Use one component structure and coordinated theme systems. Change lighting, scene materials, background, surfaces, text and semantic states together. Keep behavior consistent. Persist theme choice, integrate existing account preferences where appropriate, and tolerate disabled browser storage. Verify material changes and refresh persistence.

Use actual scene interaction when selected: orbit, selection, focus or spatial navigation. Keep reading text and controls code-native. Direct navigation must provide equivalent access on keyboard, small screens and renderer failure. Respect reduced motion; dispose resources and observers on unmount.

A generated concept is not a complete mesh. Reconstruct with proper geometry or licensed assets and compare real renders to the selected image. Resolve material/model mismatches rather than passing off a screenshot as the application.

## Evidence

Inspect concept and browser screenshots at comparable dimensions. Compare composition, typography, materials/palette, spacing/containers, visible copy/navigation and the main workflow; include requested theme and responsive states. Record discrepancy, evidence, repair or intentional difference.

Run relevant build/static checks and meaningful tests, then exercise the live UI. Verify loading/error states, focus, reduced motion, overflow, scene controls and persistence. Backend-connected behavior needs separate verification with authorized data. A mock browser run proves the UI path, not the real service.

Report concept, local interaction, build, browser, backend and production/user validation separately. Broaden testing only for new changes or unresolved concerns.
