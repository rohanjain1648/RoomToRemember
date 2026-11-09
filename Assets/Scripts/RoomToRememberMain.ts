// RoomToRememberMain — orchestrates the Room to Remember memory palace.
// Owns: lifecycle + event wiring, the place → recall → reveal → grade → lap loop, proximity to
//       the next dot, and pushing state into the UI views. Game state itself lives in
//       RoomToRememberState; visuals in RoomToRememberMemoryObjects; sound in RoomToRememberAudio;
//       furniture pinching in RoomToRememberFurniture.
// Expects (@input, wired by the scene bootstrap): the five UI modules, the authored Furniture
//       root (one child per piece, each with a "Slot"), the dot sphere mesh + materials.
// Must not: create UI text or UIKit components (UI modules do that).
// Test hook: setViewerOverride(pos) lets LEAF scenarios "walk" without moving the camera.

import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import { ITEMS, placingLabel, revealLabel, stepLabel } from "./RoomToRememberData"
import { RoomToRememberState } from "./RoomToRememberState"
import { RoomToRememberFurniture } from "./RoomToRememberFurniture"
import { RoomToRememberMemoryObjects } from "./RoomToRememberMemoryObjects"
import { RoomToRememberAudio } from "./RoomToRememberAudio"
import { RoomToRememberStartUI } from "./RoomToRememberStartUI"
import { RoomToRememberPlacingCardUI } from "./RoomToRememberPlacingCardUI"
import { RoomToRememberDotPromptUI } from "./RoomToRememberDotPromptUI"
import { RoomToRememberRevealLabelUI } from "./RoomToRememberRevealLabelUI"
import { RoomToRememberLapUI } from "./RoomToRememberLapUI"

const PREFABS: { [key: string]: ObjectPrefab } = {
  Nose: requireAsset("../GeneratedMeshes/Nose.glb") as ObjectPrefab,
  Eyeball: requireAsset("../GeneratedMeshes/Eyeball.glb") as ObjectPrefab,
  WheelEyeball: requireAsset("../GeneratedMeshes/WheelEyeball.glb") as ObjectPrefab,
  Pulley: requireAsset("../GeneratedMeshes/Pulley.glb") as ObjectPrefab,
  Creature: requireAsset("../GeneratedMeshes/Creature.glb") as ObjectPrefab,
  Ufo: requireAsset("../GeneratedMeshes/Ufo.glb") as ObjectPrefab,
}

const MAX_HINTS = 2                    // 1 = sound, 2 = faint outline
const DOT_SIZE_CM = 6
const DOT_NEAR_SIZE_CM = 10
const OBJECT_HEIGHT_CM = 48            // tallest generated object (normalized at import)
const COLOR_IDLE = new vec4(1, 1, 1, 1)
const COLOR_GOT = new vec4(0.35, 1, 0.45, 1)
const COLOR_MISSED = new vec4(1, 0.55, 0.1, 1)
const COLOR_SOFT = new vec4(0.55, 0.9, 0.6, 0.55)
const FURNITURE_GREY = new vec4(0.8, 0.8, 0.82, 1)
const FURNITURE_HOVER = new vec4(0.95, 0.97, 1, 1)

@component
export class RoomToRememberMain extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RoomToRememberMain – memory palace orchestrator</span>')
  @ui.separator
  @ui.group_start("References")
  @input @hint("Doorway Start panel") startPanel!: RoomToRememberStartUI
  @input @hint("Lazy-follow placing card") placingCard!: RoomToRememberPlacingCardUI
  @input @hint("'1 of 6' label + Hint/Reveal/Got it/Missed buttons") dotPrompt!: RoomToRememberDotPromptUI
  @input @hint("Label above a revealed object") revealLabel!: RoomToRememberRevealLabelUI
  @input @hint("Lap score, Walk again, final message") lapPanel!: RoomToRememberLapUI
  @input @hint("Stand-in furniture root: one child per piece, in route order") furnitureRoot!: SceneObject
  @input @hint("Sphere mesh used for the glowing dots") dotMesh!: RenderMesh
  @input @hint("Unlit material cloned per dot") dotMaterial!: Material
  @input @hint("Translucent material for the hint outline") ghostMaterial!: Material
  @ui.group_end
  @ui.separator
  @ui.group_start("Settings")
  @input @hint("Walk within this distance (cm) of the next dot to see its prompt") @widget(new SliderWidget(60, 300, 5))
  approachDistanceCm: number = 150
  @input @hint("Seconds after grading before the object shrinks back into its dot") @widget(new SliderWidget(0.2, 4, 0.1))
  gradeHideDelaySeconds: number = 1.0
  @input @hint("Seconds a pinched-to-check object stays visible in from-memory mode") @widget(new SliderWidget(1, 8, 0.5))
  checkRevealSeconds: number = 3
  @input @hint("Size multiplier after one miss") @widget(new SliderWidget(1, 3, 0.1))
  missedOnceScale: number = 1.5
  @input @hint("Size multiplier after two or more misses") @widget(new SliderWidget(1, 4, 0.1))
  missedTwiceScale: number = 2.0
  @input @hint("Sound effect volume") @widget(new SliderWidget(0, 1, 0.05))
  sfxVolume: number = 0.7
  @ui.group_end
  @ui.separator
  @ui.group_start("Debug")
  @input @hint("Wireframe every furniture collider (takes effect on preview restart)")
  debugColliders: boolean = false
  @ui.group_end

  state!: RoomToRememberState
  furniture!: RoomToRememberFurniture
  memory!: RoomToRememberMemoryObjects
  audio!: RoomToRememberAudio

  private camTr: Transform | null = null
  private viewerOverride: vec3 | null = null
  private promptNear = false
  private checking: boolean[] = ITEMS.map(() => false)
  private ready = false

  onAwake() {
    if (!this.startPanel || !this.placingCard || !this.dotPrompt || !this.revealLabel || !this.lapPanel ||
        !this.furnitureRoot || !this.dotMesh || !this.dotMaterial || !this.ghostMaterial) {
      print("RoomToRememberMain: a required @input is not wired — check the scene bootstrap (Phase B).")
      return
    }
    this.furniture = new RoomToRememberFurniture(this.furnitureRoot, FURNITURE_GREY, FURNITURE_HOVER, this.debugColliders)
    this.state = new RoomToRememberState(this.furniture.pieces.length)
    const ghost = this.ghostMaterial.clone()
    ghost.mainPass.blendMode = BlendMode.Normal
    ghost.mainPass.depthWrite = false
    this.memory = new RoomToRememberMemoryObjects(PREFABS, this.dotMesh, this.dotMaterial, ghost, {
      dotSizeCm: DOT_SIZE_CM, dotNearSizeCm: DOT_NEAR_SIZE_CM, dotLiftCm: 4,
      colorIdle: COLOR_IDLE, colorGot: COLOR_GOT, colorMissed: COLOR_MISSED, colorSoft: COLOR_SOFT,
      miniModelScale: 0.15,
    })
    this.audio = new RoomToRememberAudio(this.sceneObject, this.sfxVolume, 1.0)

    this.createEvent("OnStartEvent").bind(() => this.onStart())
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  // ── Wiring ──────────────────────────────────────────────────────────────
  private onStart(): void {
    this.camTr = WorldCameraFinderProvider.getInstance().getTransform()
    this.furniture.bindEvents()
    this.furniture.onPinch.add((i) => this.onFurniturePinch(i))
    this.startPanel.onStart.add(() => this.beginPlacing())
    this.dotPrompt.onHint.add(() => this.onHint())
    this.dotPrompt.onReveal.add(() => this.onReveal())
    this.dotPrompt.onGotIt.add(() => this.onGrade(true))
    this.dotPrompt.onMissed.add(() => this.onGrade(false))
    this.lapPanel.onWalkAgain.add(() => this.onWalkAgain())

    this.startPanel.show()
    this.placingCard.hide()
    this.dotPrompt.hide()
    this.revealLabel.hide()
    this.lapPanel.hideAll()
    this.ready = true
    print("RoomToRemember: ready — pinch Start at the doorway.")
  }

  // ── Placing lap ─────────────────────────────────────────────────────────
  beginPlacing(): void {
    if (this.state.phase !== "start") return
    this.audio.playUi("ButtonClick")
    this.startPanel.hide()
    this.state.startPlacing()
    this.placingCard.show()
    this.refreshPlacingCard()
    print("RoomToRemember: placing lap started.")
  }

  private refreshPlacingCard(): void {
    const i = this.state.placeIndex
    this.placingCard.setItem(placingLabel(i))
    this.memory.showMiniModel(ITEMS[i].meshKey, this.placingCard.getModelAnchor())
  }

  private onFurniturePinch(f: number): void {
    if (this.state.phase === "placing") this.placeOn(f)
    else if (this.state.phase === "fromMemory") this.checkFromMemory(f)
  }

  private placeOn(f: number): void {
    const item = this.state.place(f)
    if (item < 0) return
    const spot = this.memory.place(item, ITEMS[item].meshKey, this.furniture.slots[f])
    this.audio.attachSpot(item, spot)
    this.audio.playAtSpot(item, "PlacePop")
    this.audio.playItemSound(item, ITEMS[item].soundKey, false)
    print(`RoomToRemember: placed ${ITEMS[item].name} on ${this.furniture.pieces[f].name}.`)
    if (this.state.phase === "placing") {
      this.refreshPlacingCard()
      return
    }
    // All six placed: chime, shrink everything into dots, start the recall lap.
    this.placingCard.hide()
    this.memory.clearMiniModel()
    this.delay(0.9, () => {
      this.audio.playUi("AllPlacedChime")
      this.memory.shrinkAllToDots(0.7, () => this.beginLap())
    })
  }

  // ── Recall lap ──────────────────────────────────────────────────────────
  private beginLap(): void {
    this.state.beginRecallLap()
    this.lapPanel.hideAll()
    this.promptNear = false
    for (let i = 0; i < ITEMS.length; i++) {
      const prev = this.state.lastLapResult[i]
      this.memory.setDotVisible(i, true)
      this.memory.setDotNear(i, false)
      this.memory.setDotPulse(i, false)
      if (prev === true) this.memory.setDotColor(i, COLOR_SOFT)
      else if (prev === false) { this.memory.setDotColor(i, COLOR_MISSED); this.memory.setDotPulse(i, true) }
      else this.memory.setDotColor(i, COLOR_IDLE)
    }
    this.audio.playAtSpot(0, "NextChime")
    print(`RoomToRemember: recall lap ${this.state.lapNumber} started.`)
  }

  private onUpdate(): void {
    if (!this.ready || this.state.phase !== "recall" || this.state.recallStage !== "approach") return
    const i = this.state.currentItem
    const dot = this.memory.getDotWorldPosition(i)
    const viewer = this.getViewerPosition()
    if (!dot || !viewer) return
    const dx = dot.x - viewer.x
    const dz = dot.z - viewer.z
    const near = Math.sqrt(dx * dx + dz * dz) <= this.approachDistanceCm
    if (near === this.promptNear) return
    this.promptNear = near
    this.memory.setDotNear(i, near)
    if (near) {
      this.dotPrompt.setStep(stepLabel(i))
      this.dotPrompt.setMode("recall")
      this.dotPrompt.setHintAvailable(this.state.hintLevel < MAX_HINTS)
      this.dotPrompt.showAt(dot)
    } else {
      this.dotPrompt.hide()
    }
  }

  private onHint(): void {
    const i = this.state.currentItem
    const level = this.state.hint(MAX_HINTS)
    if (level < 0) return
    const missed = this.state.missLevel[i] > 0
    this.audio.playItemSound(i, ITEMS[i].soundKey, missed)
    if (level >= 2) this.memory.showGhost(i, this.scaleFor(i))
    this.dotPrompt.setHintAvailable(level < MAX_HINTS)
  }

  private onReveal(): void {
    const i = this.state.currentItem
    if (!this.state.reveal()) return
    const level = this.state.missLevel[i]
    const scale = this.scaleFor(i)
    this.memory.hideGhost(i)
    this.memory.setDotVisible(i, false)
    this.memory.reveal(i, scale, level > 0)
    this.audio.playItemSound(i, ITEMS[i].soundKey, level > 0)
    if (level >= 2) {
      this.memory.sparkle(i)
      this.audio.playAtSpot(i, "Sparkle")
    }
    const dot = this.memory.getDotWorldPosition(i)
    if (dot) this.revealLabel.showAt(dot.add(new vec3(0, OBJECT_HEIGHT_CM * scale + 6, 0)), revealLabel(i))
    this.dotPrompt.setMode("grade")
  }

  private onGrade(gotIt: boolean): void {
    const i = this.state.currentItem
    if (!this.state.grade(gotIt)) return
    this.audio.playUi("ButtonClick")
    this.memory.setDotPulse(i, false)
    this.memory.setDotColor(i, gotIt ? COLOR_GOT : COLOR_MISSED)
    this.memory.setDotNear(i, false)
    this.dotPrompt.hide()
    this.delay(this.gradeHideDelaySeconds, () => {
      this.revealLabel.hide()
      this.memory.hideToDot(i, 0.4, () => {
        this.memory.setDotVisible(i, true)
        this.nextDot()
      })
    })
  }

  private nextDot(): void {
    const lapEnded = this.state.advance()
    this.promptNear = false
    if (!lapEnded) {
      this.audio.playAtSpot(this.state.currentItem, "NextChime")   // tells the user where to walk
      return
    }
    this.audio.playUi("LapDone")
    this.lapPanel.placeAt(this.inFrontOfViewer(100, 25))
    if (this.state.phase === "fromMemory") {
      this.memory.setAllDotsVisible(false)
      this.lapPanel.showFromMemory()
      print("RoomToRemember: all six right — walk it from memory.")
    } else {
      this.lapPanel.showScore(this.state.lastScore, ITEMS.length)
      this.lapPanel.showWalkAgain()
      print(`RoomToRemember: lap ${this.state.lapNumber} score ${this.state.lastScore} of ${ITEMS.length}.`)
    }
  }

  private onWalkAgain(): void {
    if (this.state.phase !== "lapEnd") return
    this.audio.playUi("ButtonClick")
    this.lapPanel.hideAll()
    this.beginLap()
  }

  // ── From-memory mode ────────────────────────────────────────────────────
  private checkFromMemory(f: number): void {
    const item = this.state.itemOfFurniture[f]
    if (item < 0 || this.checking[item]) return
    this.checking[item] = true
    this.memory.reveal(item, 1, false)
    this.audio.playItemSound(item, ITEMS[item].soundKey, false)
    const dot = this.memory.getDotWorldPosition(item)
    if (dot) this.revealLabel.showAt(dot.add(new vec3(0, OBJECT_HEIGHT_CM + 6, 0)), revealLabel(item))
    this.delay(this.checkRevealSeconds, () => {
      this.revealLabel.hide()
      this.memory.hideToDot(item, 0.4, () => { this.checking[item] = false })
    })
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  private scaleFor(i: number): number {
    const lvl = this.state.missLevel[i]
    return lvl >= 2 ? this.missedTwiceScale : lvl === 1 ? this.missedOnceScale : 1
  }

  /** TEST HOOK — LEAF scenarios set a virtual viewer position instead of walking. null = camera. */
  setViewerOverride(pos: vec3 | null): void {
    this.viewerOverride = pos
    this.promptNear = false
    if (this.state && this.state.phase === "recall" && this.state.recallStage === "approach") {
      this.memory.setDotNear(this.state.currentItem, false)
      this.dotPrompt.hide()
    }
  }

  getViewerPosition(): vec3 | null {
    if (this.viewerOverride) return this.viewerOverride
    return this.camTr ? this.camTr.getWorldPosition() : null
  }

  isReady(): boolean { return this.ready }

  private inFrontOfViewer(distanceCm: number, dropCm: number): vec3 {
    const pos = this.getViewerPosition() ?? vec3.zero()
    let fwd = new vec3(0, 0, -1)
    if (this.camTr && !this.viewerOverride) {
      const f = this.camTr.forward
      const flat = new vec3(-f.x, 0, -f.z)
      if (flat.length > 0.001) fwd = flat.normalize()
    }
    return pos.add(fwd.uniformScale(distanceCm)).add(new vec3(0, -dropCm, 0))
  }

  private delay(seconds: number, fn: () => void): void {
    const ev = this.createEvent("DelayedCallbackEvent")
    ev.bind(() => fn())
    ev.reset(seconds)
  }
}
