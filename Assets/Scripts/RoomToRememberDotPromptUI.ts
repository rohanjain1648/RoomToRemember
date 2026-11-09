// RoomToRememberDotPromptUI — the "1 of 6" label and the two big buttons beside the next dot.
// Owns: step label, the Hint/Reveal pair and the Got it/Missed pair (only one pair visible),
//       billboarding toward the user. Passive view.
// API: showAt(worldPos), hide(), isShown(), setStep(text), getStep(), setMode("recall"|"grade"),
//      getMode(), setHintAvailable(bool), isHintAvailable().
// Events: onHint, onReveal, onGotIt, onMissed.
// Must not: hold game state or decide what a press means.

import { Button } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import { FlexAlign, FlexDirection } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import { Billboard } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import Event, { PublicApi } from "SpectaclesInteractionKit.lspkg/Utils/Event"
import { addIconButton, addText, flexBox, obj, roleSize } from "./RoomToRememberSharedUI"

const ICON_HINT = requireAsset("../Icons/lightbulb.png") as Texture
const ICON_REVEAL = requireAsset("../Icons/visibility.png") as Texture
const ICON_GOT = requireAsset("../Icons/check.png") as Texture
const ICON_MISSED = requireAsset("../Icons/close.png") as Texture

export type PromptMode = "recall" | "grade"

@component
export class RoomToRememberDotPromptUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RoomToRememberDotPromptUI – step label + Hint/Reveal, Got it/Missed</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input @hint("Button width (cm)") @widget(new SliderWidget(8, 20, 0.5))
  buttonWidthCm: number = 12
  @input @hint("Button height (cm)") @widget(new SliderWidget(4, 10, 0.5))
  buttonHeightCm: number = 6
  @input @hint("Sideways offset of the button column from the dot (cm)") @widget(new SliderWidget(10, 50, 1))
  buttonSideOffsetCm: number = 26
  @input @hint("How far the buttons float toward the user from the dot (cm)") @widget(new SliderWidget(0, 40, 1))
  buttonTowardUserCm: number = 20
  @input @hint("Height of the '1 of 6' label above the dot (cm)") @widget(new SliderWidget(4, 30, 1))
  labelHeightCm: number = 11
  @input @hint("Viewing distance the text is sized for (cm)") @widget(new SliderWidget(80, 250, 5))
  viewingDistanceCm: number = 150
  @ui.group_end

  private stepText!: Text
  private recallPair!: SceneObject
  private gradePair!: SceneObject
  private hintBtn!: Button
  private mode: PromptMode = "recall"
  private hintAvailable = true

  private readonly _onHint = new Event<void>()
  private readonly _onReveal = new Event<void>()
  private readonly _onGotIt = new Event<void>()
  private readonly _onMissed = new Event<void>()
  get onHint(): PublicApi<void> { return this._onHint.publicApi() }
  get onReveal(): PublicApi<void> { return this._onReveal.publicApi() }
  get onGotIt(): PublicApi<void> { return this._onGotIt.publicApi() }
  get onMissed(): PublicApi<void> { return this._onMissed.publicApi() }

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    const d = this.viewingDistanceCm
    const ts = roleSize("Headline2", d)

    // "1 of 6" just above the dot.
    const labelBox = flexBox(this.sceneObject, "StepLabelBox", FlexDirection.Column, 20, 5, 0, 0)
    labelBox.so.getTransform().setLocalPosition(new vec3(0, this.labelHeightCm, 2))
    this.stepText = addText(labelBox.so, "DotStepText", "6 of 6", "HeadlineXL", 20, 5, d, new vec4(1, 1, 1, 1))

    // Button column beside the dot, toward the user.
    const side = new vec3(this.buttonSideOffsetCm, 0, this.buttonTowardUserCm)
    const colH = this.buttonHeightCm * 2 + 2
    const recall = flexBox(this.sceneObject, "RecallButtons", FlexDirection.Column, this.buttonWidthCm, colH, 2, 0, FlexAlign.Center)
    recall.so.getTransform().setLocalPosition(side)
    this.recallPair = recall.so
    this.hintBtn = addIconButton(recall.so, "HintButton", "Hint", ICON_HINT, this.buttonWidthCm, this.buttonHeightCm, ts,
      () => { if (this.hintAvailable) this._onHint.invoke() })
    addIconButton(recall.so, "RevealButton", "Reveal", ICON_REVEAL, this.buttonWidthCm, this.buttonHeightCm, ts,
      () => this._onReveal.invoke())

    const grade = flexBox(this.sceneObject, "GradeButtons", FlexDirection.Column, this.buttonWidthCm, colH, 2, 0, FlexAlign.Center)
    grade.so.getTransform().setLocalPosition(side)
    this.gradePair = grade.so
    addIconButton(grade.so, "GotItButton", "Got it", ICON_GOT, this.buttonWidthCm, this.buttonHeightCm, ts,
      () => this._onGotIt.invoke())
    addIconButton(grade.so, "MissedButton", "Missed", ICON_MISSED, this.buttonWidthCm, this.buttonHeightCm, ts,
      () => this._onMissed.invoke())

    const bb = this.sceneObject.createComponent(Billboard.getTypeName()) as Billboard
    bb.xAxisEnabled = false
    bb.yAxisEnabled = true
    this.applyMode()
    // Starts hidden; Main calls showAt() when the user walks up to the next dot.
    this.createEvent("OnStartEvent").bind(() => { if (!this.wantShown) this.sceneObject.enabled = false })
  }

  private wantShown = false

  showAt(worldPos: vec3): void {
    this.wantShown = true
    this.sceneObject.getTransform().setWorldPosition(worldPos)
    this.sceneObject.enabled = true
  }

  hide(): void {
    this.wantShown = false
    this.sceneObject.enabled = false
  }

  isShown(): boolean { return this.sceneObject.enabled }
  setStep(text: string): void { if (this.stepText) this.stepText.text = text }
  getStep(): string { return this.stepText ? this.stepText.text : "" }
  getMode(): PromptMode { return this.mode }

  setMode(mode: PromptMode): void {
    this.mode = mode
    this.applyMode()
  }

  setHintAvailable(available: boolean): void {
    this.hintAvailable = available
    if (this.hintBtn) this.hintBtn.inactive = !available   // greyed out
  }

  isHintAvailable(): boolean { return this.hintAvailable }

  private applyMode(): void {
    if (this.recallPair) this.recallPair.enabled = this.mode === "recall"
    if (this.gradePair) this.gradePair.enabled = this.mode === "grade"
  }
}
