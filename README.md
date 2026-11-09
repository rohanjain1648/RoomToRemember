# 🧠 Room to Remember

**A memory palace for Snap Spectacles.** Walk your own living room, drop weird, giant, cartoonish objects onto real furniture, then walk the route again and recall them in order. This version teaches the **first six cranial nerves (I–VI)**, a classic ordered list medical students have to memorize.

Built with [Lens Studio](https://ar.snap.com/lens-studio) 5.23 for **Spectacles**, using the Spectacles Interaction Kit (SIK), Spectacles UI Kit and the LEAF testing framework. Created for the [Learn Specs hackathon](https://learn-specs.devpost.com/).

---

## ✨ The idea

A memory palace works because a list is tied to real places you physically walk past. Glasses keep your hands free and your eyes up, so the objects sit on your actual furniture at real size and you walk the actual route.

The Lens is also designed to **make itself unnecessary**. Once you get all six right in one lap it hides everything and says *"Now walk it from memory"*, because on exam day you won't have the glasses.

## 🎮 How it plays

1. **Start**: pinch the big Start button.
2. **Placing lap**: a floating card shows what to place (e.g. `1 of 6 · Olfactory`). Walk to a piece of furniture and pinch it. The object drops on with a pop and its sound. Repeat for all six.
3. **Transition**: a chime plays and every object shrinks into a numbered glowing dot.
4. **Recall lap**: from the doorway you only see six dots. Walk to within about 1.5 m of the next dot and it grows and shows `1 of 6` with **Hint** and **Reveal** buttons.
   - **Hint 1**: plays the object's sound from its exact spot.
   - **Hint 2**: shows a faint outline of the object.
   - **Reveal**: shows the object and its label (e.g. `I · Olfactory · smell`).
5. **Grade yourself**: pinch **Got it** (dot turns green) or **Missed** (dot turns orange). The object shrinks back into its dot and a soft chime plays from the next dot's direction.
6. **End of lap**: a score appears for about 3 s with a **Walk again** button.
   - Missed items come back **1.5× bigger** and wobbling. Missed twice, they come back 2× with a sparkle burst.
   - Get all six right in one lap and the dots vanish. You can still pinch furniture to peek at an object for about 3 s.

### The six items

| # | Nerve | Meaning | Memory object | Sound |
|---|-------|---------|---------------|-------|
| I | Olfactory | smell | Giant nose | Sniff |
| II | Optic | sight | Eyeball | Camera shutter |
| III | Oculomotor | eye movement | Eyeball on a wheel | Vroom |
| IV | Trochlear | eye down and in | Pulley | Rope squeak |
| V | Trigeminal | face feeling | Three-headed creature | Three notes |
| VI | Abducens | eye outward | UFO with an eyeball | UFO beam |

> **Note:** the preview uses a **stand-in living room** built from plain grey boxes and cylinders in `Assets/Room`. A real-device version would use surface detection to attach objects to your real furniture. That is out of scope here.

---

## 🧱 Project structure

```text
RoomToRemember/
├── RoomToRemember.esproj        # Lens Studio project manifest
├── Assets/
│   ├── Scene.scene              # Main scene
│   ├── Scripts/                 # Lens logic (TypeScript)
│   ├── Tests/                   # LEAF test scenarios
│   ├── Room/                    # Stand-in room meshes, materials, shaders
│   ├── GeneratedMeshes/         # 3D memory objects (.glb)
│   ├── GeneratedSFX/            # Sound effects (.wav)
│   ├── Icons/                   # UI icons
│   └── Render/                  # HDR environment and camera texture
├── Packages/                    # SIK, UI Kit, LEAF, Bitmoji 3D
├── devpost/design-brief.md      # Full design brief and done criteria
├── agent/skills/plan-lens/      # Planning skill used to write the brief
├── AGENTS.md / CLAUDE.md        # AI-agent project guidance (Lens Studio)
└── skills-lock.json
```

### Scripts (`Assets/Scripts`)

| File | Responsibility |
|------|----------------|
| `RoomToRememberMain.ts` | Orchestrator. Wires state, scene, UI and audio together. |
| `RoomToRememberState.ts` | Single owner of game state: phase, placements, lap progress, hint and miss levels, score. No scene access. |
| `RoomToRememberData.ts` | The list being memorized (numeral, name, meaning, mesh and sound keys). Pure data. |
| `RoomToRememberFurniture.ts` | Pinchable stand-in furniture. |
| `RoomToRememberMemoryObjects.ts` | Spawns, scales, shrinks and wobbles the memory objects and dots. |
| `RoomToRememberAudio.ts` | Sound playback, including positional sound from an object's spot. |
| `RoomToRememberStartUI.ts` | Start button. |
| `RoomToRememberPlacingCardUI.ts` | Floating placing card. |
| `RoomToRememberDotPromptUI.ts` | `N of 6` label with Hint, Reveal, Got it and Missed buttons. |
| `RoomToRememberRevealLabelUI.ts` | Label shown after Reveal. |
| `RoomToRememberLapUI.ts` | Score, Walk again and "walk it from memory" messages. |
| `RoomToRememberSharedUI.ts` | Shared UI helpers. |

### Tests (`Assets/Tests`)

One LEAF scenario per design-brief done criterion, registered in `LeafIndex.ts`:

| Scenario | Checks |
|----------|--------|
| `c1-place-first-object` | Start shows the card. Pinching the couch places the nose and advances the card. |
| `c2-all-placed-become-dots` | After six placements, objects become dots and the recall lap starts. |
| `c3-approach-shows-prompt` | Dots show nothing else until you are within about 1.5 m. |
| `c4-hint-reveal-grade` | Hint, second Hint, Reveal, then grading changes the dot colour. |
| `c5-laps-score-and-from-memory` | Score and Walk again, bigger missed objects, and the final "from memory" mode. |

---

## 🚀 Getting started

### Prerequisites

- [Lens Studio **5.23** or newer](https://ar.snap.com/download) (the project was last saved with 5.23.2).
- No Spectacles device needed. Everything runs in Lens Studio's **Interactive Preview**.

### Run it

1. Clone the repo:
   ```bash
   git clone https://github.com/<your-username>/RoomToRemember.git
   ```
2. Open `RoomToRemember.esproj` in Lens Studio. It regenerates `Cache/`, `Support/`, `Workspaces/` and `PluginsUserPreferences/` on first open, which is why they are git-ignored.
3. Open `Assets/Scene.scene` and press **Preview**.
4. Switch to **Interactive Preview** and move around:

| Input | Action |
|-------|--------|
| `W` `A` `S` `D` | Walk |
| `Q` / `E` | Down / up |
| Right-drag, or hold `Shift` | Look around |
| Click | Pinch |

### Run the LEAF tests

Open the LEAF panel in Lens Studio, then run the five scenarios from `LeafIndex` (`c1` to `c5`).

### Push to a real device (optional)

Pair Spectacles with Lens Studio and use **Send to Spectacles**. This is untested on hardware. See the risks below.

---

## ⚠️ Status and known limits

| Area | Status |
|------|--------|
| Place → recall → reveal → grade loop, hints, miss levels, final mode | **Logic proven** in preview and LEAF |
| Comfort of walking several laps, 1.5 m trigger distance in a cluttered room | **Feel unproven** (needs real glasses) |
| Real hand-tracking when pinching furniture | **Feel unproven** |
| Attaching objects to real furniture | **Not implemented.** The grey stand-in room is used. |
| Saving progress between sessions | Not implemented. Each session starts fresh. |
| Other lists, voice commands, sharing a palace | Out of scope |

Generated 3D models may not read perfectly at 1.5 m. The three-headed creature and the UFO are the most likely to be unclear.

## 🔒 Privacy

The Lens does not record, identify or follow people.

## 🤖 Built with AI agents

The design brief in [`devpost/design-brief.md`](devpost/design-brief.md) was produced with the `plan-lens` skill and the build was done with the Lens Studio agent toolkit (CLAD). Local agent state, MCP configs (`.mcp.json`, `.cursor/`, `.vscode/`, `.codex/`) and the Spectacles debug key are git-ignored on purpose, because they can contain tokens or private keys.

## 🛠 Tech stack

- Lens Studio 5.23 (TypeScript, ES2021)
- Spectacles Interaction Kit (`SpectaclesInteractionKit.lspkg`)
- Spectacles UI Kit (`SpectaclesUIKit.lspkg`)
- LEAF testing (`Leaf.lspkg`)
- Bitmoji 3D (`Bitmoji 3D.lsc`)
- AI-generated `.glb` meshes and `.wav` sound effects

## 📄 License

No license has been chosen yet. Add a `LICENSE` file (for example MIT) before making the repo public.

## 🙏 Credits

Built for the Learn Specs hackathon (Snap Spectacles x Devpost).

