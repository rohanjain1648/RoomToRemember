// Room to Remember LEAF scenario — needs a fresh Lens (reset the preview first).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findInteractablesByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { ROUTE, RoomToRememberLeafInteractor } from "./RoomToRememberLeafInteractor"

/** C3 — from the doorway the dots show nothing else; within ~1.5 m of the next dot it shows
 *  "1 of 6" with Hint and Reveal. */
@component
export class RtrC3ApproachScenario extends Scenario {
  async run(): Promise<void> {
    const it = new RoomToRememberLeafInteractor()
    const m = await it.waitReady()
    it.requireFresh(m)
    await it.placeAll(m)

    await it.walkToDoorway(m)
    expect(m.dotPrompt.isShown(), "no prompt from the doorway").toBe(false)
    expect(m.revealLabel.isShown(), "no labels from the doorway").toBe(false)
    for (let i = 0; i < ROUTE.length; i++) expect(m.memory.getDotSizeCm(i)).toBeCloseTo(6, 1)

    await it.walkToDot(m, 0)
    expect(m.dotPrompt.isShown(), "prompt shows within 1.5 m").toBe(true)
    expect(m.dotPrompt.getStep()).toBe("1 of 6")
    expect(m.dotPrompt.getMode()).toBe("recall")
    expect(findInteractablesByName("HintButton", undefined, true).length > 0, "Hint button visible").toBe(true)
    expect(findInteractablesByName("RevealButton", undefined, true).length > 0, "Reveal button visible").toBe(true)
    expect(m.memory.getDotSizeCm(0), "dot grows when near").toBeGreaterThan(9)

    // Only the next dot responds: standing at dot 2 shows nothing.
    await it.walkToDot(m, 2)
    expect(m.dotPrompt.isShown(), "non-next dots stay plain").toBe(false)
    await it.walkToDoorway(m)
    expect(m.dotPrompt.isShown(), "prompt hides when walking away").toBe(false)
    m.setViewerOverride(null)
  }
}
