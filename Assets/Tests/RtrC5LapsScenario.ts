// Room to Remember LEAF scenario — needs a fresh Lens (reset the preview first).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep } from "Leaf.lspkg/Utils/common/Utils"
import { ROUTE, RoomToRememberLeafInteractor } from "./RoomToRememberLeafInteractor"

/** C5 — end of lap: score for ~3 s + Walk again; a missed object returns 1.5× bigger; six right
 *  in one lap hides every dot and shows "Now walk it from memory". */
@component
export class RtrC5LapsScenario extends Scenario {
  async run(): Promise<void> {
    const it = new RoomToRememberLeafInteractor()
    const m = await it.waitReady()
    it.requireFresh(m)
    await it.placeAll(m)

    // Lap 1: miss the nose, get the rest.
    for (let i = 0; i < ROUTE.length; i++) await it.revealAndGrade(m, i, i !== 0)
    await sleep(300)
    expect(m.state.phase).toBe("lapEnd")
    expect(m.lapPanel.isScoreShown(), "score pops in").toBe(true)
    expect(m.lapPanel.getScoreText()).toBe("5 of 6")
    expect(m.lapPanel.isWalkAgainShown(), "Walk again appears").toBe(true)
    await sleep(3400)
    expect(m.lapPanel.isScoreShown(), "score fades after ~3 s").toBe(false)
    expect(m.lapPanel.isWalkAgainShown(), "Walk again stays").toBe(true)

    // Lap 2: the missed nose comes back 1.5x bigger.
    await it.tapButton("WalkAgainButton")
    expect(m.state.lapNumber).toBe(2)
    await it.walkToDot(m, 0)
    await it.tapButton("RevealButton")
    await sleep(600)
    expect(m.memory.getModelScale(0)).toBeCloseTo(1.5, 1)
    await it.tapButton("GotItButton")
    for (let k = 0; k < 30 && m.state.currentItem === 0; k++) await sleep(100)
    for (let i = 1; i < ROUTE.length; i++) await it.revealAndGrade(m, i, true)
    await sleep(300)

    // All six right → from memory.
    expect(m.state.phase).toBe("fromMemory")
    for (let i = 0; i < ROUTE.length; i++) {
      const dot = m.memory.getDot(i)
      expect(dot !== null && dot.enabled, `dot ${i} hidden`).toBe(false)
    }
    expect(m.lapPanel.isFromMemoryShown(), "'Now walk it from memory' shows").toBe(true)
    expect(m.lapPanel.isWalkAgainShown(), "no Walk again after a perfect lap").toBe(false)

    // Pinching furniture still reveals its object.
    await it.pinchFurniture("TV")
    await sleep(500)
    expect(m.memory.isModelVisible(2), "pinching the TV reveals its object").toBe(true)
    m.setViewerOverride(null)
  }
}
