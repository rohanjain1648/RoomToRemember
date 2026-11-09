# 🧠 Room to Remember

**A memory palace for Snap Spectacles.** Walk your own living room, drop weird, giant, cartoonish objects onto real furniture, then walk the route again and recall them in order. This version teaches the **first six cranial nerves (I–VI)**, a classic ordered list medical students have to memorize.

Built with [Lens Studio](https://ar.snap.com/lens-studio) 5.23 for **SPECS**, using the Spectacles Interaction Kit (SIK), Spectacles UI Kit and the LEAF testing framework. Planned with the Devpost Learn `plan-lens` skill and built by an AI coding agent through **CLAD** and the **Lens Studio MCP**. Created for [Learn AR with SPECS](https://learn-specs.devpost.com/).

▶️ **Demo video:** _add your YouTube link here_  
📐 **Design brief:** [`devpost/design-brief.md`](devpost/design-brief.md)  
✅ **Tests:** 5 of 5 LEAF scenarios pass in the Lens Studio preview

---

## 👩‍⚕️ Who it's for

**Medical and nursing students** who have to memorize long, ordered lists: cranial nerves, drug classes, the brachial plexus. Flashcards drill the words. A memory palace ties them to *places*, and the order you walk becomes the order you remember. The same approach works for anyone memorizing an ordered list, such as vocabulary, the key points of a speech, or exam facts.

## 🕶️ Why it needs glasses

The memory palace (the *method of loci*) is the technique memory champions rely on. It works because your brain is very good at remembering *where* things are in places you already know. In a 2017 study in *Neuron* (Dresler et al.), six weeks of method-of-loci training took ordinary people from recalling 26–30 words to recalling about 35 more on average, and they still kept a gain of over 20 words four months later.

The catch is that you have to imagine the objects yourself. Room to Remember puts them in your room for you:

| Glasses strength | How Room to Remember uses it |
|---|---|
| **Draws in the world** | Each memory object sits *on* a real piece of your furniture, at real size, not on a floating panel. |
| **Leaves your body free** | You physically walk your own route with your hands free and your eyes up. The walking *is* the memorizing. |
| **Shares your view** | The dots respond to where you go: they stay silent from the doorway and only open when you walk up to them. |

A phone puts a screen between you and the room. VR puts you in an unfamiliar room, which defeats a technique built on familiar places. Glasses are the only medium where the palace is your actual home.

## 🎨 Design decisions

These follow the AR-for-glasses habits from the Learn AR with SPECS concept video:

- **Show only what's needed now.** From the doorway you see six small dots and nothing else. A dot shows `N of 6` only when you're within about 1.5 m, the answer appears only when you ask for it, and there are no walls of text.
- **Guide without leading.** Hints escalate gently: first a sound from the object's exact spot, then a faint outline, then the full reveal.
- **A few big targets.** At most two big buttons are on screen at a time (Hint / Reveal, then Got it / Missed). Placing an object means pinching the furniture itself, the biggest target in the room.
- **Out of view gets a sound, not a panel.** After grading, a soft chime plays from the next dot's direction.
- **Forget it, and it gets weirder.** Distinctive things are easier to remember, so a missed object returns 1.5× bigger and wobbling, then 2× with sparkles.
- **The Lens makes itself unnecessary.** Once you get all six right, everything disappears. On exam day you won't have the glasses, so the last lap trains you to walk the palace from memory.
- **Built for an additive display.** The stand-in furniture is light grey and the memory objects are bright and cartoonish, because black renders as transparent on SPECS.

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
   git clone https://github.com/rohanjain1648/RoomToRemember.git
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

## 🤖 How it was built

1. **Plan with the Devpost Learn skill pack.** The `plan-lens` skill interviewed me in seven questions about the idea, the one spatial moment, the stand-in for the preview, where things live, hands, when things show, and the done criteria. Its answers became [`devpost/design-brief.md`](devpost/design-brief.md).
2. **Build with CLAD.** In a fresh Claude Code session inside this project, CLAD read the brief and built the Lens through the Lens Studio MCP. It laid out the stand-in room, generated the six 3D memory objects and twelve sound effects, built the world-space UI with SIK and UI Kit, and wrote the TypeScript state machine.
3. **Test with LEAF.** CLAD wrote one LEAF scenario per done criterion and ran them in the preview: 5 of 5 pass. To make sure "pass" meant something, it also ran a scenario with a deliberately false check, which correctly failed.
4. **Judge it.** I walked the full flow in Interactive Preview (WASD to walk, click to pinch) to check placement, readability and pacing from where a user would stand.

### How the skill pack helped

The interview turned a rough idea into specific design decisions:

- It asked me to picture the **one moment** the Lens is at its best. That became the doorway with six silent dots.
- It asked **how I'd say "I remember this one"**. That became reveal-then-grade instead of trusting a button press.
- It flagged that the preview **can't see my real couch**. That produced the grey stand-in room, marked as preview-only.
- It made me write **done criteria I could check by walking and clicking**. Those became the five LEAF tests.

### What I learned

- **Designing for glasses is subtraction.** Most of the design work was deciding what *not* to show, and when.
- **A good brief is the real product spec.** The agent built almost exactly what the interview made me decide, including the defaults I hadn't thought about, which the brief marked `(default)` so I could review them.
- **Tests make an agent's "done" trustworthy.** "All five LEAF tests pass" means something because each test maps to a sentence in the brief.
- **Separate "logic proven" from "feel unproven".** The preview proves the flow works. Only real glasses can prove comfort, trigger distance and hand-tracking feel.

Local agent state, MCP configs (`.mcp.json`, `.cursor/`, `.vscode/`, `.codex/`) and the SPECS debug key are git-ignored on purpose, because they can contain tokens or private keys.

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

