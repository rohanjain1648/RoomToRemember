// RoomToRememberLapUI — end-of-lap score, the Walk again button, and the final
// "Now walk it from memory" message.
// Owns: three surfaces (ScoreCard, WalkAgainButton, MemoryCard) and their timed fades.
// API: placeAt(worldPos), showScore(correct, total), isScoreShown(), getScoreText(),
//      showWalkAgain(), hideWalkAgain(), isWalkAgainShown(), showFromMemory(), isFromMemoryShown(),
//      hideAll(). Event: onWalkAgain.
// Must not: hold game state.

import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import { FlexAlign, FlexDirection } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import { Billboard } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import Event, { PublicApi } from "SpectaclesInteractionKit.lspkg/Utils/Event"
import animate, { CancelFunction } from "SpectaclesInteractionKit.lspkg/Utils/animate"
import { addIconButton, addText, CONTENT_Z, flexBox, obj, roleSize, setTextAlpha } from "./RoomToRememberSharedUI"

const ICON_REPLAY = requireAsset("../Icons/replay.png") as Texture

@component
export class RoomToRememberLapUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RoomToRememberLapUI – lap score, Walk again, final message</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input @hint("Seconds the score stays before fading") @widget(new SliderWidget(1, 10, 0.5))
  scoreSeconds: number = 3
  @input @hint("Seconds the final message stays before fading") @widget(new SliderWidget(1, 10, 0.5))
  messageSeconds: number = 4
  @input @hint("Final message text")
  fromMemoryText: string = "Now walk it from memory"
  @input @hint("Walk again button width (cm)") @widget(new SliderWidget(10, 25, 0.5))
  walkAgainWidthCm: number = 16
  @ui.group_end

  private scoreCard!: SceneObject
  private scoreText!: Text
  private walkAgain!: SceneObject
  private memoryCard!: SceneObject
  private memoryText!: Text
  private scoreFade: CancelFunction | null = null
  private memoryFade: CancelFunction | null = null
  private readonly _onWalkAgain = new Event<void>()
  get onWalkAgain(): PublicApi<void> { return this._onWalkAgain.publicApi() }

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")

    // Score card (left).
    this.scoreCard = obj(this.sceneObject, "ScoreCard", new vec3(-9, 0, 0))
    const sPlate = this.scoreCard.createComponent(BackPlate.getTypeName()) as BackPlate
    const sContent = obj(this.scoreCard, "Content", new vec3(0, 0, CONTENT_Z))
    const sBox = flexBox(sContent, "ScoreBox", FlexDirection.Column, 14, -1, 0.4, 1.4, FlexAlign.Center)
    sBox.flex.onLayoutComplete.add((r) => { sPlate.size = new vec2(r.containerWidth, r.containerHeight) })
    addText(sBox.so, "ScoreCaption", "Lap score", "Caption", 12, 2.2, 100, new vec4(1, 1, 1, 0.7))
    this.scoreText = addText(sBox.so, "ScoreText", "6 of 6", "HeadlineXL", 12, 4.4, 100, new vec4(0.55, 1, 0.65, 1))

    // Walk again button (right, next to the score).
    const wa = flexBox(this.sceneObject, "WalkAgainBox", FlexDirection.Column, this.walkAgainWidthCm, 8, 0, 0)
    wa.so.getTransform().setLocalPosition(new vec3(10, 0, 0))
    this.walkAgain = wa.so
    addIconButton(wa.so, "WalkAgainButton", "Walk again", ICON_REPLAY, this.walkAgainWidthCm, 7,
      roleSize("Headline2", 100), () => this._onWalkAgain.invoke())

    // Final message (centred).
    this.memoryCard = obj(this.sceneObject, "MemoryCard", new vec3(0, 0, 0))
    const mPlate = this.memoryCard.createComponent(BackPlate.getTypeName()) as BackPlate
    const mContent = obj(this.memoryCard, "Content", new vec3(0, 0, CONTENT_Z))
    const mBox = flexBox(mContent, "MemoryBox", FlexDirection.Column, 34, -1, 0, 1.6, FlexAlign.Center)
    mBox.flex.onLayoutComplete.add((r) => { mPlate.size = new vec2(r.containerWidth, r.containerHeight) })
    this.memoryText = addText(mBox.so, "FromMemoryText", this.fromMemoryText, "Headline1", 32, 4, 100, new vec4(1, 1, 1, 1))

    const bb = this.sceneObject.createComponent(Billboard.getTypeName()) as Billboard
    bb.xAxisEnabled = false

    this.createEvent("OnStartEvent").bind(() => {
      if (!this.scoreWanted) this.scoreCard.enabled = false
      if (!this.walkWanted) this.walkAgain.enabled = false
      if (!this.memoryWanted) this.memoryCard.enabled = false
    })
  }

  private scoreWanted = false
  private walkWanted = false
  private memoryWanted = false

  placeAt(worldPos: vec3): void { this.sceneObject.getTransform().setWorldPosition(worldPos) }

  showScore(correct: number, total: number): void {
    this.scoreWanted = true
    this.scoreText.text = `${correct} of ${total}`
    setTextAlpha(this.scoreText, 1)
    this.scoreCard.enabled = true
    if (this.scoreFade) this.scoreFade()
    this.scoreFade = this.fadeAfter(this.scoreText, this.scoreSeconds, () => {
      this.scoreWanted = false
      this.scoreCard.enabled = false
    })
  }

  isScoreShown(): boolean { return this.scoreCard.enabled }
  getScoreText(): string { return this.scoreText ? this.scoreText.text : "" }

  showWalkAgain(): void { this.walkWanted = true; this.walkAgain.enabled = true }
  hideWalkAgain(): void { this.walkWanted = false; this.walkAgain.enabled = false }
  isWalkAgainShown(): boolean { return this.walkAgain.enabled }

  showFromMemory(): void {
    this.memoryWanted = true
    setTextAlpha(this.memoryText, 1)
    this.memoryCard.enabled = true
    if (this.memoryFade) this.memoryFade()
    this.memoryFade = this.fadeAfter(this.memoryText, this.messageSeconds, () => {
      this.memoryWanted = false
      this.memoryCard.enabled = false
    })
  }

  isFromMemoryShown(): boolean { return this.memoryCard.enabled }

  hideAll(): void {
    if (this.scoreFade) this.scoreFade()
    if (this.memoryFade) this.memoryFade()
    this.scoreWanted = this.walkWanted = this.memoryWanted = false
    this.scoreCard.enabled = false
    this.walkAgain.enabled = false
    this.memoryCard.enabled = false
  }

  /** Hold for `seconds` (last 0.6 s fades the text out), then call done. */
  private fadeAfter(t: Text, seconds: number, done: () => void): CancelFunction {
    const fade = 0.6
    const hold = Math.max(0, seconds - fade)
    return animate({
      duration: seconds,
      update: (k: number) => {
        const el = k * seconds
        setTextAlpha(t, el < hold ? 1 : Math.max(0, 1 - (el - hold) / fade))
      },
      ended: done,
    })
  }
}
