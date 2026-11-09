// RoomToRememberLeafInteractor — shared LEAF helpers for the Room to Remember scenarios.
// Drives the Lens only through SIK interactables (buttons, furniture hitboxes) plus the Lens's
// one documented test hook, RoomToRememberMain.setViewerOverride(), which stands in for walking
// (LEAF cannot move the preview camera).
// Every scenario expects a FRESH Lens (preview reset) — it starts at the doorway Start panel.

import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import { findInteractablesByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { RoomToRememberMain } from "../Scripts/RoomToRememberMain"

export const ROUTE = ["Couch", "CoffeeTable", "TV", "FloorLamp", "Bookshelf", "Armchair"]

export class RoomToRememberLeafInteractor extends DefaultLeafInteractor {
  main(): RoomToRememberMain {
    const so = findSceneObjectByName("RoomToRemember")
    if (!so) throw new Error("SceneObject 'RoomToRemember' not found")
    const m = so.getComponent(RoomToRememberMain.getTypeName()) as RoomToRememberMain
    if (!m) throw new Error("RoomToRememberMain component not found")
    return m
  }

  async waitReady(): Promise<RoomToRememberMain> {
    for (let i = 0; i < 50; i++) {
      const m = this.main()
      if (m.isReady()) return m
      await sleep(100)
    }
    throw new Error("Lens never became ready")
  }

  requireFresh(m: RoomToRememberMain): void {
    if (m.state.phase !== "start") {
      throw new Error(`Scenario needs a fresh Lens (phase is '${m.state.phase}'). Reset the preview and re-run.`)
    }
  }

  async tapButton(name: string): Promise<void> {
    const b = findInteractablesByName(name, undefined, true)[0]
    if (!b) throw new Error(`Button "${name}" not found or not enabled`)
    await this.trigger(b)
    await sleep(250)
  }

  async pinchFurniture(name: string): Promise<void> {
    const it = findInteractablesByName(`${name}_Hitbox`, undefined, true)[0]
    if (!it) throw new Error(`Furniture hitbox "${name}_Hitbox" not found`)
    await this.trigger(it)
    await sleep(350)
  }

  /** Start, place all six objects along the route, wait for the recall lap to begin. */
  async placeAll(m: RoomToRememberMain): Promise<void> {
    await this.tapButton("StartButton")
    for (const f of ROUTE) await this.pinchFurniture(f)
    for (let i = 0; i < 40 && m.state.phase !== "recall"; i++) await sleep(100)
    if (m.state.phase !== "recall") throw new Error(`Recall lap did not start (phase '${m.state.phase}')`)
  }

  /** "Walk" to 1 m from dot i, on the room-centre side. */
  async walkToDot(m: RoomToRememberMain, i: number): Promise<void> {
    const dot = m.memory.getDotWorldPosition(i)
    if (!dot) throw new Error(`No dot for item ${i}`)
    const centre = new vec3(0, 0, -330)
    const flat = new vec3(centre.x - dot.x, 0, centre.z - dot.z).normalize()
    m.setViewerOverride(new vec3(dot.x + flat.x * 100, 0, dot.z + flat.z * 100))
    await sleep(500)
  }

  async walkToDoorway(m: RoomToRememberMain): Promise<void> {
    m.setViewerOverride(new vec3(0, 0, 0))
    await sleep(400)
  }

  /** Reveal + grade the current dot, then wait until the lap advances. */
  async revealAndGrade(m: RoomToRememberMain, i: number, gotIt: boolean): Promise<void> {
    await this.walkToDot(m, i)
    await this.tapButton("RevealButton")
    await sleep(450)
    await this.tapButton(gotIt ? "GotItButton" : "MissedButton")
    for (let k = 0; k < 40 && m.state.recallStage === "graded"; k++) await sleep(100)
  }
}
