// RoomToRememberRevealLabelUI — the small "I · Olfactory · smell" label above a revealed object.
// Owns: its plate + text, billboarding. Passive view.
// API: showAt(worldPos, text), hide(), isShown(), getText().
// Must not: hold game state.

import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import { FlexAlign, FlexDirection } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import { Billboard } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import { addText, applyTextRole, CONTENT_Z, flexBox, obj } from "./RoomToRememberSharedUI"

@component
export class RoomToRememberRevealLabelUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RoomToRememberRevealLabelUI – label above the revealed object</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input @hint("Text height (cm, em-square)") @widget(new SliderWidget(2, 10, 0.5))
  textHeightCm: number = 5
  @input("vec4", "{1, 0.95, 0.55, 1}") @hint("Label colour") @widget(new ColorWidget())
  labelColor: vec4 = new vec4(1, 0.95, 0.55, 1)
  @ui.group_end

  private label!: Text
  private wantShown = false

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate
    plate.style = "dark"
    const content = obj(this.sceneObject, "Content", new vec3(0, 0, CONTENT_Z))
    const w = 70
    const h = this.textHeightCm * 1.4
    const box = flexBox(content, "RevealBox", FlexDirection.Column, w, h + 2, 0, 1.0, FlexAlign.Center)
    box.flex.onLayoutComplete.add((r) => { plate.size = new vec2(r.containerWidth, r.containerHeight) })
    this.label = addText(box.so, "RevealText", "III · Oculomotor · eye movement", "Body", w - 2, h, 110, this.labelColor)
    applyTextRole(this.label, "Body")
    this.label.size = this.textHeightCm * 43.886   // em-square cm = size / 43.886
    const bb = this.sceneObject.createComponent(Billboard.getTypeName()) as Billboard
    bb.xAxisEnabled = false
    this.createEvent("OnStartEvent").bind(() => { if (!this.wantShown) this.sceneObject.enabled = false })
  }

  showAt(worldPos: vec3, text: string): void {
    this.wantShown = true
    this.label.text = text
    this.sceneObject.getTransform().setWorldPosition(worldPos)
    this.sceneObject.enabled = true
  }

  hide(): void { this.wantShown = false; this.sceneObject.enabled = false }
  isShown(): boolean { return this.sceneObject.enabled }
  getText(): string { return this.label ? this.label.text : "" }
}
