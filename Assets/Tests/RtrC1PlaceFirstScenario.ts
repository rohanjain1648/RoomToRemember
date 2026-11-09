// Room to Remember LEAF scenario — needs a fresh Lens (reset the preview first).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { RoomToRememberLeafInteractor } from "./RoomToRememberLeafInteractor"

/** C1 — Start shows "1 of 6 · Olfactory"; pinching the couch drops the nose there with its
 *  sniff from that spot; the card moves on to "2 of 6 · Optic". */
@component
export class RtrC1PlaceFirstScenario extends Scenario {
  async run(): Promise<void> {
    const it = new RoomToRememberLeafInteractor()
    const m = await it.waitReady()
    it.requireFresh(m)
    expect(m.startPanel.isShown(), "Start panel visible at the doorway").toBe(true)
    await it.tapButton("StartButton")
    expect(m.startPanel.isShown(), "Start panel hides when pinched").toBe(false)
    expect(m.placingCard.isShown(), "placing card shows").toBe(true)
    expect(m.placingCard.getItemText()).toBe("1 of 6 · Olfactory")

    await it.pinchFurniture("Couch")
    expect(m.state.furnitureOfItem[0], "nose placed on furniture #0 (Couch)").toBe(0)
    const spot = m.memory.getSpot(0)
    expect(spot !== null && spot.getParent().getParent().name === "Couch", "nose sits on the couch's Slot").toBe(true)
    expect(m.memory.isModelVisible(0), "giant nose visible on the couch").toBe(true)
    expect(m.audio.lastPlayed, "sniff sound played").toBe("Sniff")
    expect(m.audio.lastPlayedSpot, "sniff comes from the nose's spot").toBe(0)
    expect(m.placingCard.getItemText()).toBe("2 of 6 · Optic")

    // Each piece holds one object: pinching the couch again does nothing.
    await it.pinchFurniture("Couch")
    expect(m.state.placeIndex, "second pinch on an occupied piece is ignored").toBe(1)
  }
}
