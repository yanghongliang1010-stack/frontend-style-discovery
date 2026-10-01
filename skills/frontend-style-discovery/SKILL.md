---
name: frontend-style-discovery
description: Discover a frontend's visual direction through real reference galleries, user selections, and iterative style composition, then implement the selected design. Use for new interfaces or redesigns when the user cannot describe the style, rejects drafts, wants to choose examples, or wants to combine layout, materials, color, and motion from different references.
---

# Frontend Style Discovery

Help people express visual preferences by choosing concrete examples. Turn their choices into an original, reviewable design and, when requested, a working frontend. Selecting a reference can approve one property without approving its whole layout.

## Find the current stage

- Explore: the user is unsure, rejects drafts, or asks for examples. Curate references before proposing another arbitrary redesign.
- Compose: references or properties are selected. Generate an original, complete concept from those choices.
- Revise: retain liked properties and change rejected axes.
- Build: a concept is selected and implementation is authorized. Preserve it and connect the required functions.

Continue from existing artifacts and decisions. Design-first requests should receive concrete visual deliverables before application implementation. An explicitly authorized interactive exploration may itself be a design artifact. Do not request approval already given.

## Capture the brief

Record product, primary task, audience, required content/navigation, target devices, existing UI, and requested stage. Preserve existing functionality, but do not let an old visual system constrain a radical redesign. Ask one useful question only if missing information affects the next step; continue independent work while waiting. Use [the decision record](references/decision-record.md) to preserve progress.

Do not force a user who lacks design vocabulary to choose adjectives or hex colors. Let examples reveal their preferences.

## Curate real references

Default to 10–20 distinguishable references for a broad first gallery. Narrow subsequent rounds to unresolved dimensions. Use current searches, creator sources, public portfolios and available browser inspection.

- Assign stable numbered IDs; new rounds continue numbering and pin previous choices.
- Include source URL, creator, reference type, useful properties and verification state. Distinguish shipped sites, screenshots, spatial/native concepts and generated concepts.
- Vary layout, density, color, material and interaction meaningfully. Twenty similar dashboards do not reveal preference.
- Inspect previews: a loader, blank canvas, device frame or unrelated image is not evidence of the interface.
- If inspection is blocked, state the limit and provide the original link. Do not invent screenshots or interactions.
- Distinguish brand-site inspiration from usable application layout. Neither replaces the other.
- Third-party previews can support authorized local review; public redistribution requires a license or permission. Attribution alone does not grant that right.

Read [gallery workflow](references/gallery-workflow.md). Use `scripts/build_gallery.py` and `assets/gallery/` to make a local gallery with previews, filters, favorites, per-reference notes, comparison and decision export. Python 3.10+ is sufficient; no Python packages are required.

## Extract selected properties

When needed, ask what appealed: scene/material, layout, color or motion. Record liked, rejected and unresolved axes separately: hierarchy, space/density, typography, color/light, materials/imagery, interaction/motion.

For example, selecting KODE/Lusion/Igloo but rejecting every dashboard selects a potential material/motion direction while leaving workspace layout unresolved. Search spatial product interfaces next, rather than reusing the rejected dashboards.

## Compose and revise

Give each reference a role, then resolve conflicts in one visual system. A composition may use one scene, another window behavior, and the user's later color preference. Do not copy a creator's branding, artwork or scene, or paste unrelated component kits together.

Define palette, typography, spacing, containers, materials, motion, responsive intent and exact product copy before coding. Generate a complete app concept; use separate readable section/state concepts when needed. Use available image generation when appropriate. Its absence should not prevent research or an authorized code-native exploration. Private business content requires authorization before external generation.

Show the actual artifact and explain the composition briefly. Save each variant's prompt/spec and feedback. A brightness/color request usually retains selected structure; a layout rejection calls for structural change. If every draft is rejected, return to diverse references or a different structural hypothesis, rather than repeated cosmetic recoloring.

When multiple variants are selected as themes, combine them in one layout with shared controls and distinct tokens/materials. Do not treat partial praise as acceptance of the whole concept. After an explicit “use this one,” proceed within the authorized scope.

## Implement and verify

Read [implementation guidance](references/implementation.md). Use the existing framework and functional contracts. Keep text, controls, forms and data code-native. Preserve routes, auth, permissions, loading/errors, cancellation, persistence and required actions.

If scene interaction was selected, use real 3D/WebGL or an appropriate renderer. A screenshot may be a reference or fallback; it does not implement orbiting, object selection or material switching. Provide direct navigation and reduced-motion behavior. Do not invent business results or require model credentials for work that does not need them.

Compare the selected concept with live browser screenshots. Use the available browser workflow, or an allowed fallback with the reason stated. Check desktop, intermediate and mobile widths, overflow, keyboard focus, reduced motion, primary workflow and theme persistence. Run relevant build/static checks and meaningful tests.

Keep a short visual ledger: comparison point, concept evidence, rendered evidence, fix or intentional difference. Deliver chosen references, decision record, artifacts, runnable/viewable result, verification and remaining scope. Distinguish concept, local interaction demo, build result, browser validation, backend integration and real-user verification.
