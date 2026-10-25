# PharmaWallah Virtual Labs — the owner's standard (verbatim, 2026-10-25)

> Kept word for word so a later session can see what was asked. Where it meets the code, `SKILL.md`
> §"Where the standard meets the code" says what exists, what is missing and what wins. **Read that first.**
> The frontmatter below was the brief's own; the live frontmatter is the one in `SKILL.md`.

---

```
name: pharmawallah-virtual-labs
description: Build, upgrade, test, and maintain PharmaWallah's existing Babylon.js virtual pharmacy laboratory environments and their interactive educational experiments. Use whenever working on virtual labs, experiment procedures, 3D apparatus, the robotic tutor, course-to-lab mapping, or laboratory simulations.
```

PharmaWallah Virtual Labs Skill

1. Project mission

Develop realistic, interactive, scientifically responsible virtual pharmacy laboratories inside the existing PharmaWallah application.

The project has exactly four existing laboratory environments:

- "pharmaceutics"
- "pharmaceutical-chemistry"
- "pharmacognosy"
- "pharmacology"

Adapt these identifiers to existing repository conventions where needed, but preserve the four-lab architecture.

Never create a separate room for an individual course, semester, subject, or experiment. Course names organize the experiment catalogue; experiments execute inside their assigned existing lab.

Examples:

- Physical Pharmacy experiments execute inside Pharmaceutics.
- Organic compound identification executes inside Pharmaceutical Chemistry.
- Plant microscopy executes inside Pharmacognosy.
- Hematology and cardiovascular physiology simulations execute inside the existing Pharmacology environment, as specified for the current project.

Do not add new experiments beyond the project's approved shortlist unless the user explicitly authorizes expansion.

2. Mandatory repository workflow

Before editing:

1. Inspect the repository structure, "package.json", framework version, routing, existing lab scenes, rendering engine, assets, experiment data, shared components, and tests.
2. Identify which features already work and must be preserved.
3. Read the project's existing instructions, including "CLAUDE.md" and relevant nested instructions.
4. Locate the existing four lab routes and establish how experiments currently launch.
5. Check whether Babylon.js is already present and whether existing scenes use Three.js.
6. Identify the files owned by the task and any shared files that require coordination.

Do not guess file paths, replace working features without justification, or rewrite the application from scratch.

Implement changes in small, verifiable stages. After each major stage, run the relevant tests and inspect the result.

3. Engine and architecture

Use Babylon.js as the target engine for the four virtual lab environments.

Official documentation: https://doc.babylonjs.com/

Audit before migrating. Reuse an existing Babylon.js implementation if it already meets the requirements. If migration from Three.js is necessary, migrate incrementally and verify each route before removing old scene code.

The shared architecture should provide:

- A reusable client-side lab scene and lifecycle.
- Camera and desktop/touch controls.
- Object selection, highlighting, and equipment interaction.
- Scene loading and recoverable error states.
- Responsive resizing and optional fullscreen.
- Low-, medium-, and high-quality rendering settings.
- Cleanup of event handlers, observers, animation loops, and rendering resources.
- A shared experiment registry and validated course-to-lab assignment.
- A common tutor interface that reads the active experiment state.
- Reusable calculation, assessment, and results interfaces.

Do not initialize duplicate rendering engines or multiple render loops for the same scene.

Keep the 3D experience usable on low-end Android phones. Lazy-load heavy modules, optimize geometry and textures, limit unnecessary real-time lights and shadows, and avoid expensive effects that do not materially improve learning.

4. Experiment registration rules

Every experiment must have:

- A stable unique ID.
- A title and course/category label.
- Exactly one assigned existing lab ID.
- Learning objectives and prerequisites.
- Required apparatus, consumables, and simulated reagents.
- Step-by-step procedure with validated preconditions.
- Required inputs, units, formulas, and calculations.
- Expected observations and result interpretation.
- Progressive hints and explanations.
- Safety and simulated waste-disposal rules.
- Assessment criteria.
- References, assumptions, and verification status.

Use a typed schema and validate entries. Detect duplicate IDs, missing steps, unknown lab IDs, invalid formulas, and missing safety metadata.

Adding an experiment must not require creating a new room, engine, or route. It should be registered in the appropriate existing lab and load the necessary equipment and experiment-specific state.

5. Robotic tutor requirements

Use one shared PharmaWallah robotic companion across all four labs.

The robot must:

- Introduce the experiment and its learning objectives.
- Explain the current step and why it matters.
- Highlight the actual apparatus or control being discussed.
- Help students locate equipment in the room.
- Read the actual experiment state rather than relying on a separate, unsynchronized step counter.
- Provide progressive hints and calculation explanations.
- Explain incorrect actions and common mistakes.
- Give appropriate safety reminders.
- Summarize results and provide post-experiment questions.

Use reviewed, deterministic procedural content as the authority. If an AI service exists, it may explain approved content but must not invent procedures, reagent quantities, scientific observations, or safety instructions.

Guided Learning may reveal worked solutions. Practical Assessment should encourage independent attempts before revealing the answer.

6. Real equipment, not decorative props

When apparatus is part of an experiment, it must have meaningful interactions.

Examples include selecting, positioning, weighing, measuring, transferring, mixing, focusing, operating controls, recording readings, and completing the correct procedure sequence.

Equipment interactions must update the experiment's actual state. Results, calculations, charts, and visual changes must derive from that state.

Do not build a scene where the student only clicks a "Next" button through static instruction cards.

Show justified changes such as liquid levels, measured quantities, instrument displays, specimen appearance, microscope views, simulated physiological readings, and results.

Use compact, collapsible guidance panels. Do not cover the main apparatus or important observations with oversized cards.

7. Scientific integrity

Use credible references, appropriate course manuals, and verified teaching methods.

For Pakistani Pharm-D curriculum alignment, consult the HEC Pharmacy Curriculum 2025 and available official university practical manuals. Do not claim an experiment is officially prescribed by the University of Karachi unless verified.

For each procedure, distinguish:

- Verified procedure.
- Referenced educational simulation.
- Proposed procedure awaiting instructor confirmation.

Record assumptions, formulas, units, parameter sources, and limitations. Synthetic teaching data must be labelled as simulated. Do not present it as real experimental or patient data.

For hazardous operations, implement safety gates and simulated waste routes. Never instruct students to dispose of hazardous waste into a sink. Do not imply that a virtual simulation authorizes unsupervised real-world chemical or biological work.

8. Assets and licensing

Prefer existing usable assets or lightweight custom Babylon.js models. Blender may be used for custom models.

External assets must have individually verified licenses. CC0 assets may be sourced from https://polyhaven.com/, but verify each asset's actual license and maintain an attribution/license manifest.

Do not use copyrighted models, figures, or images without permission. Label schematic scientific illustrations honestly.

9. Testing and completion criteria

Test:

- Existing routes and the four-lab navigation.
- Course-to-lab assignment and experiment registration.
- Scientific formulas and unit conversions.
- Experiment state transitions.
- Tutor synchronization.
- Equipment interactions and result updates.
- Safety gates and waste routing.
- Desktop and touch controls.
- Resource cleanup and rendering performance.
- Existing functionality that the changes could affect.

Run the available lint, typecheck, unit tests, integration tests, and production build where practical. Report actual results. Never claim that a test passed if it was not run.

10. Scope discipline

For the current approved shortlist, implement exactly three shortlisted experiments per lab. Do not quietly add extra experiments or expand the deliverable.

Before finishing, report:

1. Files changed.
2. Experiments implemented.
3. Verification sources and assumptions.
4. Tests run and their actual results.
5. Remaining limitations.

A visual mockup does not count as a completed experiment. A practical is complete only when its procedure, interactions, state transitions, calculations, feedback, and results work end to end.
