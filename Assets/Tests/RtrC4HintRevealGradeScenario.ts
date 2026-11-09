// Room to Remember LEAF scenario — needs a fresh Lens (reset the preview first).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findInteractablesByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { sleep } from "Leaf.lspkg/Utils/common/Utils"
import { RoomToRememberLeafInteractor } from "./RoomToRememberLeafInteractor"

/** C4 — Hint plays the sound from its spot, Hint again shows the outline, Reveal shows object +
 *  label and swaps to Got it / Missed, grading turns the dot green or orange. */
@component
export class RtrC4HintRevealGradeScenario extends Scenario {
  async run(): Promise<void> {
    const it = new RoomToRememberLeafInteractor()
    const m = await it.waitReady()
    it.requireFresh(m)
    await it.placeAll(m)
    await it.walkToDot(m, 0)

    m.audio.lastPlayed = ""
    await it.tapButton("HintButton")
    expect(m.audio.lastPlayed, "first hint plays the object's sound").toBe("Sniff")
    expect(m.audio.lastPlayedSpot, "from the object's spot").toBe(0)
    expect(m.memory.isGhostVisible(0), "no outline after first hint").toBe(false)

    await it.tapButton("HintButton")
    expect(m.memory.isGhostVisible(0), "second hint shows the faint outline").toBe(true)
    expect(m.dotPrompt.isHintAvailable(), "Hint greys out after two").toBe(false)

    await it.tapButton("RevealButton")
    await sleep(500)
    expect(m.memory.isModelVisible(0), "object revealed").toBe(true)
    expect(m.memory.isGhostVisible(0), "outline gone on reveal").toBe(false)
    expect(m.revealLabel.isShown()).toBe(true)
    expect(m.revealLabel.getText()).toBe("I · Olfactory · smell")
    expect(m.dotPrompt.getMode()).toBe("grade")
    expect(findInteractablesByName("GotItButton", undefined, true).length > 0, "Got it visible").toBe(true)
    expect(findInteractablesByName("MissedButton", undefined, true).length > 0, "Missed visible").toBe(true)

    await it.tapButton("GotItButton")
    const green = m.memory.getDotColor(0)
    expect(green !== null && green.y > 0.9 && green.x < 0.5, "Got it turns the dot green").toBe(true)
    for (let k = 0; k < 30 && m.state.currentItem === 0; k++) await sleep(100)
    expect(m.memory.isModelVisible(0), "object shrinks back into its dot").toBe(false)

    await it.walkToDot(m, 1)
    await it.tapButton("RevealButton")
    await sleep(450)
    await it.tapButton("MissedButton")
    const orange = m.memory.getDotColor(1)
    expect(orange !== null && orange.x > 0.9 && orange.y > 0.4 && orange.y < 0.7 && orange.z < 0.3,
      "Missed turns the dot orange").toBe(true)
    m.setViewerOverride(null)
  }
}
