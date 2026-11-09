// RoomToRememberState — single owner of the memory-palace game state.
// Owns: phase, which item sits on which furniture, recall-lap progress, hint level,
//       per-item miss level (0 = normal, 1 = missed once, 2 = missed twice+), lap score.
// Must not: touch the scene, audio, or UI. Main reads it and pushes results to the views.

import { ITEMS } from "./RoomToRememberData"

export type Phase = "start" | "placing" | "transition" | "recall" | "lapEnd" | "fromMemory"
export type RecallStage = "approach" | "revealed" | "graded"

export class RoomToRememberState {
  phase: Phase = "start"
  placeIndex = 0
  readonly furnitureOfItem: number[] = ITEMS.map(() => -1)
  itemOfFurniture: number[] = []

  lapNumber = 0
  recallIndex = 0
  recallStage: RecallStage = "approach"
  hintLevel = 0
  readonly missLevel: number[] = ITEMS.map(() => 0)
  readonly lapResult: (boolean | null)[] = ITEMS.map(() => null)
  readonly lastLapResult: (boolean | null)[] = ITEMS.map(() => null)
  lastScore = 0

  constructor(furnitureCount: number) {
    this.itemOfFurniture = new Array(furnitureCount).fill(-1)
  }

  get itemCount(): number { return ITEMS.length }

  startPlacing(): void {
    this.phase = "placing"
    this.placeIndex = 0
  }

  /** Returns the item index placed on this furniture, or -1 if the pinch is ignored. */
  place(furnitureIndex: number): number {
    if (this.phase !== "placing") return -1
    if (furnitureIndex < 0 || furnitureIndex >= this.itemOfFurniture.length) return -1
    if (this.itemOfFurniture[furnitureIndex] !== -1) return -1   // each piece holds one object
    const item = this.placeIndex
    this.itemOfFurniture[furnitureIndex] = item
    this.furnitureOfItem[item] = furnitureIndex
    this.placeIndex++
    if (this.placeIndex >= this.itemCount) this.phase = "transition"
    return item
  }

  beginRecallLap(): void {
    this.phase = "recall"
    this.lapNumber++
    this.recallIndex = 0
    this.recallStage = "approach"
    this.hintLevel = 0
    for (let i = 0; i < this.lapResult.length; i++) this.lapResult[i] = null
  }

  /** Returns the new hint level (1 = sound, 2 = outline) or -1 if no hint is left. */
  hint(maxHints: number): number {
    if (this.phase !== "recall" || this.recallStage !== "approach") return -1
    if (this.hintLevel >= maxHints) return -1
    this.hintLevel++
    return this.hintLevel
  }

  reveal(): boolean {
    if (this.phase !== "recall" || this.recallStage !== "approach") return false
    this.recallStage = "revealed"
    return true
  }

  /** Grades the current item; updates its miss level. Returns false if not allowed now. */
  grade(gotIt: boolean): boolean {
    if (this.phase !== "recall" || this.recallStage !== "revealed") return false
    const i = this.recallIndex
    this.lapResult[i] = gotIt
    this.missLevel[i] = gotIt ? 0 : Math.min(2, this.missLevel[i] + 1)
    this.recallStage = "graded"
    return true
  }

  /** Moves to the next dot. Returns true when the lap just ended. */
  advance(): boolean {
    if (this.phase !== "recall" || this.recallStage !== "graded") return false
    this.recallIndex++
    this.hintLevel = 0
    this.recallStage = "approach"
    if (this.recallIndex < this.itemCount) return false
    this.lastScore = this.lapResult.filter((r) => r === true).length
    for (let i = 0; i < this.lapResult.length; i++) this.lastLapResult[i] = this.lapResult[i]
    this.phase = this.lastScore === this.itemCount ? "fromMemory" : "lapEnd"
    return true
  }

  get currentItem(): number { return this.recallIndex }
}
