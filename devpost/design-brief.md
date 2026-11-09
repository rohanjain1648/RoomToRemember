---
status: draft
---

# Design brief: Room to Remember

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

A memory palace for medical students who have to memorize ordered lists. This version teaches the first six cranial nerves, in order.

## The one spatial moment
I'm standing in the doorway of my living room on the recall lap. All I see are six small glowing dots along my route: the couch, the coffee table, the TV, and so on. I walk up to the first dot on the couch. At about 1.5 m it grows a little and shows "1 of 6" with two big buttons, Hint and Reveal. I try to remember what's there, and when I pinch Reveal the giant nose pops up on the couch, sniffing, labelled "I · Olfactory · smell". I grade myself with Got it or Missed, the object shrinks back into its dot, and a soft chime from the next dot's direction tells me where to walk next.

## Why it belongs on glasses
- Uses: **draws in the world** (each memory object sits on a real piece of my furniture, at real size) and **leaves your body free** (I walk my own route with my hands free and my eyes up).
- Why it's better than the phone or laptop version: a memory palace works because the list is tied to real places you physically walk past. On glasses the objects sit on my actual furniture and I walk the actual route; on a phone I'd be looking at a screen instead of the room. And the Lens is designed to make itself unnecessary: on exam day I won't have the glasses, so once I get all six right it hides everything and I walk it from memory.

## Product or overlay
- Type: **overlay.** The memory objects sit on my real furniture.
- What the real version would sense: the surfaces of my real furniture, so a pinch drops the object onto my actual couch, table, and so on.
- Stand-in for the preview: the Lens builds a simple **stand-in living room** at real size, in plain grey (light grey so it shows on the additive display (default)), so it reads as "your real furniture" and the memory objects stand out. On real glasses this furniture wouldn't exist, because my own furniture takes its place. Six pieces along a loop starting from the doorway, spaced so I walk a natural circle:
  - Couch: about 200 cm wide (about 90 cm deep, 85 cm tall (default))
  - Coffee table: 100 × 60 cm, 45 cm high
  - TV on a low stand (TV about 110 cm wide, stand about 50 cm high (default))
  - Floor lamp: 160 cm tall
  - Bookshelf: 180 cm tall (about 80 cm wide (default))
  - Armchair (about 80 cm wide, 85 cm tall (default))
  - Room about 5 × 5 m, with neighbouring pieces about 2 m apart and the doorway (the user's start position) at one end of the loop (default).

## The six items
Bright and cartoonish, because weird and funny is easier to remember, and bright colours show up on the glasses. Each object is about 30 to 60 cm, so it sits clearly on the furniture without hiding it.

| # | Item | Object | Sound (first hint) | Label after Reveal |
|---|---|---|---|---|
| I | Olfactory | A giant nose that sniffs | A big, loud sniff | I · Olfactory · smell |
| II | Optic | A giant eyeball that blinks and looks around | A camera shutter click | II · Optic · sight |
| III | Oculomotor | An eyeball on little wheels, driving in circles | A tiny engine going "vroom" | III · Oculomotor · eye movement (default) |
| IV | Trochlear | A pulley with a rope (trochlea means pulley) | A creaky rope squeak | IV · Trochlear · eye down and in (default) |
| V | Trigeminal | A friendly cartoon creature with three heads, for its three branches | Three quick notes, one per head | V · Trigeminal · face feeling (default) |
| VI | Abducens | A little UFO beaming an eyeball up and out to the side (it pulls the eye outward) | A sci-fi "woo-oo" beam | VI · Abducens · eye outward |

## Where things live
- Where the user is looking during the main task: at the piece of furniture they're walking up to, from about 1.5 m away.
- Start button: at the doorway, about 1 m in front of the user, a little below eye level, about 15 cm wide (default).
- Placing card: floats a little below eye level and lazily follows me, about 60 cm away and 20 cm below eye level, about 20 × 12 cm (default). Shows what I'm placing now, e.g. "1 of 6 · Olfactory", with a tiny model of the object.
- Memory objects: on top of the piece of furniture I pinched, 30 to 60 cm in size.
- Glowing dots: where each object was, on its piece of furniture, about 6 cm across (default). From the doorway they're just dots, with no labels and no answers.
- "1 of 6" label and buttons: when I'm within about 1.5 m, the dot grows a little (to about 10 cm (default)) and shows "1 of 6" just above it, with two big buttons beside it (about 12 × 6 cm each, facing me (default)): Hint and Reveal, later Got it and Missed.
- Reveal label: small, just above the object (text about 5 cm tall (default)).
- End-of-lap score and Walk again button: just below eye level, about 1 m in front of me (default).
- "Now walk it from memory" message: just below eye level, about 1 m in front of me (default).

## Hands and input
- Start the placing lap: pinch the big Start button.
- Place an object: walk up to any piece of furniture and pinch it. The current object drops onto it with a pop and its sound. Each piece holds one object; pinching a piece that already has one does nothing (default).
- Ask for a hint: pinch Hint. First pinch plays the object's sound from its exact spot; second pinch shows a faint outline of the object. After that, Hint greys out and only Reveal is left (default).
- See the answer: pinch Reveal.
- Grade myself honestly: pinch Got it or Missed.
- Start the next lap: pinch Walk again.
- Check an object after the Lens has hidden everything: pinch a piece of furniture to reveal its object; it hides again after about 3 seconds (default).
- Targets are big and highlight when aimed at.
- Voice: none.

## When things show
- Start button: shows at the start, hides when pinched.
- Placing card: shows during the placing lap, moves on to the next item after each placement, hides after the sixth.
- Placed objects: show on their furniture during the placing lap. After the sixth one there's a chime, all the objects shrink into glowing dots, and the recall lap starts automatically.
- Dots: show during every recall lap. Only the next dot on the route responds when I walk up; the others stay as plain dots (default).
- "1 of 6" + Hint/Reveal: show when I'm within about 1.5 m of the next dot; hide when I walk away (default).
- Hint sound: plays once from the object's spot per pinch. Outline: shows after the second Hint and stays until Reveal (default).
- Object + label: shows on Reveal, and the buttons change to Got it and Missed. After grading, the object shrinks back into its dot (after about 1 second (default)).
- Dot colour after grading: Got it turns it green; Missed turns it orange.
- Chime: after grading, a soft chime plays from the next dot's direction to tell me where to walk next.
- End of lap: when I finish the last dot, a small score pops in, e.g. "5 of 6", stays about 3 seconds and fades. Next to it one big Walk again button appears and stays until pinched.
- Next lap: the whole route again in the same order, because the order is part of what I'm memorizing. Dots I got right glow softly; dots I missed pulse orange so I notice them.
- Bigger and weirder:
  - Missed once: the object comes back 1.5 times bigger, wobbling, with a louder version of its sound.
  - Missed twice: twice the size, and when revealed it bursts into sparkles. It stays at this level if missed again (default).
  - Getting it right sends it back to normal size.
- All six right in one lap: the dots disappear completely and a small message says "Now walk it from memory" (fades after about 4 seconds (default)). Nothing shows any more, but pinching a piece of furniture still reveals its object if I want to check. The Lens makes itself unnecessary.
- If something needs attention out of view: the chime from the next dot's direction.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Pinching Start shows the floating card "1 of 6 · Olfactory". Pinching the couch drops the giant nose onto it with its sniff sound, and the card moves on to "2 of 6 · Optic".
2. After all six are placed, every object shrinks into a numbered glowing dot and the recall lap starts.
3. From the doorway, the dots show nothing else. Walking within about 1.5 m of a dot shows "1 of 6" with the Hint and Reveal buttons.
4. Pinching Hint plays the object's sound from its spot, and pinching Hint again shows a faint outline. Pinching Reveal shows the object with its label, the buttons change to Got it and Missed, and the dot turns green or orange.
5. At the end of a lap, a score shows for about 3 seconds with a Walk again button, and a missed object comes back 1.5 times bigger on the next lap. Getting all six right in one lap hides every dot and shows "Now walk it from memory".

## Out of scope
- Recognizing or attaching to real furniture. The preview uses the grey stand-in living room.
- Saving the route or progress between sessions. Each session starts with a fresh placing lap.
- The other six cranial nerves, or other lists.
- Voice commands, custom or two-hand gestures.
- Other people or sharing a palace.

## Risks and open questions
- Feel unproven: whether 1.5 m is the right distance in a real, cluttered room; how comfortable walking several laps is; how well real hand tracking handles pinching furniture.
- On real glasses, dropping objects onto real furniture would need surface detection, which the preview can't show. The stand-in room carries the demo.
- The generated 3D models (especially the three-headed creature and the UFO with the eyeball) may not come out as clear as described. Check each one reads at a glance from 1.5 m.
- This is one moment, but it has several states (placing, recall, hints, grading, two miss levels, the final "from memory" mode). Build the basic place → recall → reveal → grade loop first, then add hint levels, miss levels, and the final mode.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
