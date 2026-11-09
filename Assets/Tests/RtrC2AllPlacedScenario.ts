// Room to Remember LEAF scenario — needs a fresh Lens (reset the preview first).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { ROUTE, RoomToRememberLeafInteractor } from "./RoomToRememberLeafInteractor"

/** C2 — after all six are placed, every object shrinks into a glowing dot and recall starts. */
@component
export class RtrC2AllPlacedScenario extends Scenario {
  async run(): Promise<void> {
    const it = new RoomToRememberLeafInteractor()
    const m = await it.waitReady()
    it.requireFresh(m)
    await it.placeAll(m)
    await it.walkToDoorway(m)   // don't depend on where the preview camera was left
    expect(m.state.phase).toBe("recall")
    expect(m.state.lapNumber).toBe(1)
    expect(m.placingCard.isShown(), "placing card hidden after the sixth").toBe(false)
    for (let i = 0; i < ROUTE.length; i++) {
      expect(m.memory.isModelVisible(i), `object ${i} shrunk away`).toBe(false)
      const dot = m.memory.getDot(i)
      expect(dot !== null && dot.enabled, `dot ${i} glowing`).toBe(true)
      expect(dot !== null && dot.name === `Dot_${i}`, `dot ${i} numbered in route order`).toBe(true)
      expect(m.memory.getDotSizeCm(i)).toBeCloseTo(6, 1)
    }
    m.setViewerOverride(null)
  }
}
