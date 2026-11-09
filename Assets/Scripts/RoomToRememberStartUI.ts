// RoomToRememberStartUI — the doorway Start panel (title + big Start button).
// Owns: its BackPlate panel, layout, and the Start button. Passive view.
// API: show(), hide(), isShown(); event onStart.
// Must not: hold game state.

import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import { FlexAlign, FlexDirection } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import { Billboard } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import Event, { PublicApi } from "SpectaclesInteractionKit.lspkg/Utils/Event"
import { addIconButton, addText, CONTENT_Z, flexBox, obj, roleSize } from "./RoomToRememberSharedUI"

const ICON_PLAY = requireAsset("../Icons/play_arrow.png") as Texture

@component
export class RoomToRememberStartUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RoomToRememberStartUI – doorway Start panel</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input @hint("Title shown above the Start button")
  title: string = "Room to Remember"
  @input @hint("One-line instruction under the title")
  subtitle: string = "Cranial nerves I–VI · place six objects on your furniture"
  @input @hint("Start button width (cm)") @widget(new SliderWidget(10, 25, 0.5))
  buttonWidthCm: number = 15
  @input @hint("Start button height (cm)") @widget(new SliderWidget(4, 10, 0.5))
  buttonHeightCm: number = 6
  @ui.group_end

  private readonly _onStart = new Event<void>()
  get onStart(): PublicApi<void> { return this._onStart.publicApi() }

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate
    const content = obj(this.sceneObject, "Content", new vec3(0, 0, CONTENT_Z))
    const col = flexBox(content, "StartColumn", FlexDirection.Column, 32, -1, 1.2, 2.0, FlexAlign.Center)
    col.flex.onLayoutComplete.add((r) => { plate.size = new vec2(r.containerWidth, r.containerHeight) })
    addText(col.so, "StartTitle", this.title, "Headline1", 28, 3.6, 100, new vec4(1, 1, 1, 1))
    addText(col.so, "StartSubtitle", this.subtitle, "Caption", 28, 2.4, 100, new vec4(1, 1, 1, 0.7))
    addIconButton(col.so, "StartButton", "Start", ICON_PLAY, this.buttonWidthCm, this.buttonHeightCm,
      roleSize("Headline2", 100), () => this._onStart.invoke())
    this.sceneObject.createComponent(Billboard.getTypeName())
  }

  show(): void { this.sceneObject.enabled = true }
  hide(): void { this.sceneObject.enabled = false }
  isShown(): boolean { return this.sceneObject.enabled }
}
