// RoomToRememberPlacingCardUI — the lazily-following "what am I placing" card.
// Owns: card BackPlate + layout ("1 of 6 · Olfactory", instruction line, a model anchor cell
//       Main drops a tiny copy of the object into), and its own lazy follow of the camera.
// API: show(), hide(), setItem(text), getItemText(), getModelAnchor(), snapToView(); no events.
// Must not: hold game state.

import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import { FlexItem } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import { FlexAlign, FlexDirection } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import { addText, CONTENT_Z, flexBox, obj, registerItem } from "./RoomToRememberSharedUI"

@component
export class RoomToRememberPlacingCardUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RoomToRememberPlacingCardUI – lazy-follow placing card</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input @hint("Distance in front of the user (cm)") @widget(new SliderWidget(40, 100, 1))
  followDistanceCm: number = 60
  // Brief default was 20 cm; at 60 cm away that is ~18° down, the bottom edge of the Specs view.
  @input @hint("How far below eye level the card floats (cm)") @widget(new SliderWidget(0, 40, 1))
  dropBelowEyeCm: number = 10
  @input @hint("Follow lag: higher = snappier") @widget(new SliderWidget(0.5, 8, 0.1))
  followSpeed: number = 2.0
  @input @hint("Instruction line under the item name")
  instruction: string = "Pinch a piece of furniture to place it"
  @ui.group_end

  private itemText!: Text
  private modelAnchor!: SceneObject
  private camTr: Transform | null = null

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate
    const content = obj(this.sceneObject, "Content", new vec3(0, 0, CONTENT_Z))
    const row = flexBox(content, "CardRow", FlexDirection.Row, 20, 12, 0.8, 1.0, FlexAlign.Center)
    row.flex.onLayoutComplete.add((r) => { plate.size = new vec2(r.containerWidth, r.containerHeight) })

    // Left cell: anchor for a tiny copy of the current object.
    const cell = obj(row.so, "ModelCell")
    const ci = cell.createComponent(FlexItem.getTypeName()) as FlexItem
    ci.overrideWidth = 6
    ci.overrideHeight = 8
    registerItem(row.so, ci)
    this.modelAnchor = obj(cell, "ModelAnchor", new vec3(0, -3, 2))

    // Right cell: item name + instruction.
    const col = flexBox(row.so, "CardText", FlexDirection.Column, 11, 8, 0.4, 0, FlexAlign.Center)
    const colItem = col.so.createComponent(FlexItem.getTypeName()) as FlexItem
    colItem.overrideWidth = 11
    colItem.overrideHeight = 8
    registerItem(row.so, colItem)
    this.itemText = addText(col.so, "PlacingItemText", "6 of 6 · Oculomotor", "HeadlineXL", 11, 3, 60, new vec4(1, 1, 1, 1))
    addText(col.so, "PlacingInstruction", this.instruction, "Body", 11, 3, 60, new vec4(1, 1, 1, 0.7))

    this.createEvent("OnStartEvent").bind(() => {
      this.camTr = WorldCameraFinderProvider.getInstance().getTransform()
      this.snapToView()
    })
    this.createEvent("UpdateEvent").bind(() => this.follow(getDeltaTime()))
  }

  show(): void { this.sceneObject.enabled = true; this.snapToView() }
  hide(): void { this.sceneObject.enabled = false }
  isShown(): boolean { return this.sceneObject.enabled }
  setItem(text: string): void { if (this.itemText) this.itemText.text = text }
  getItemText(): string { return this.itemText ? this.itemText.text : "" }
  getModelAnchor(): SceneObject { return this.modelAnchor }

  snapToView(): void {
    const t = this.target()
    if (!t) return
    this.sceneObject.getTransform().setWorldPosition(t)
    this.faceCamera()
  }

  private target(): vec3 | null {
    if (!this.camTr) return null
    const pos = this.camTr.getWorldPosition()
    const f = this.camTr.forward   // Transform.forward is local +Z; the camera looks down -forward
    const fwd = new vec3(-f.x, 0, -f.z)
    const flat = fwd.length > 0.001 ? fwd.normalize() : new vec3(0, 0, -1)
    return pos.add(flat.uniformScale(this.followDistanceCm)).add(new vec3(0, -this.dropBelowEyeCm, 0))
  }

  private follow(dt: number): void {
    if (!this.sceneObject.enabled) return
    const t = this.target()
    if (!t) return
    const tr = this.sceneObject.getTransform()
    const k = Math.min(1, dt * this.followSpeed)
    tr.setWorldPosition(vec3.lerp(tr.getWorldPosition(), t, k))
    this.faceCamera()
  }

  private faceCamera(): void {
    if (!this.camTr) return
    const tr = this.sceneObject.getTransform()
    const d = this.camTr.getWorldPosition().sub(tr.getWorldPosition())
    const yaw = Math.atan2(d.x, d.z)
    tr.setWorldRotation(quat.fromEulerAngles(0, yaw, 0))
  }
}
