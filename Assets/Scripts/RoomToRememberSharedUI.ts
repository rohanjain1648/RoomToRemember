// RoomToRememberSharedUI — shared UIKit composition helpers for the Room to Remember UI modules.
// Owns: the type scale (applyTextRole), raw-Text factory for FlexLayout cells, and the
//       icon + label UIKit Button factory. Imported only by *UI.ts modules.
// Must not: hold state or be imported by Main/controllers.

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import { FlexItem } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import { FlexAlign, FlexDirection, FlexJustify } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import { Button } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import { ElementContent } from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"

// ── Type scale — single source of truth (patterns.md → Typography) ───────────────
export const FONT_SIZE_SCALE = 1.0
export type TextRole =
  | "Title1" | "Title2" | "HeadlineXL" | "Headline1" | "Headline2"
  | "Subheadline" | "Button" | "Callout" | "Body" | "Caption"
const TYPE_SCALE: Record<TextRole, { size: number; weight: number }> = {
  Title1: { size: 105, weight: 700 }, Title2: { size: 93, weight: 700 },
  HeadlineXL: { size: 62, weight: 700 }, Headline1: { size: 54, weight: 700 },
  Headline2: { size: 48, weight: 700 }, Subheadline: { size: 41, weight: 700 },
  Button: { size: 39, weight: 500 }, Callout: { size: 39, weight: 700 },
  Body: { size: 39, weight: 500 }, Caption: { size: 38, weight: 500 },
}
export function roleSize(role: TextRole, distanceCm: number = 110): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}
export function applyTextRole(t: Text, role: TextRole, distanceCm: number = 110): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & { weight?: number }).weight = TYPE_SCALE[role].weight
}

export const BUTTON_LABEL_Z = 0.08
export const CONTENT_Z = 0.6

export function obj(parent: SceneObject, name: string, pos?: vec3): SceneObject {
  const o = global.scene.createSceneObject(name)
  o.setParent(parent)
  if (pos) o.getTransform().setLocalPosition(pos)
  return o
}

/** A FlexLayout container on its own SceneObject (configured inside onInitialized). */
export function flexBox(parent: SceneObject, name: string, dir: FlexDirection, w: number, h: number,
                        gap: number, pad: number, align: FlexAlign = FlexAlign.Center): { so: SceneObject; flex: FlexLayout } {
  const so = obj(parent, name)
  const flex = so.createComponent(FlexLayout.getTypeName()) as FlexLayout
  flex.onInitialized.add(() => {
    flex.width = w
    flex.height = h
    flex.direction = dir
    if (dir === FlexDirection.Row) flex.columnGap = gap
    else flex.rowGap = gap
    flex.paddingTop = pad; flex.paddingBottom = pad
    flex.paddingLeft = pad; flex.paddingRight = pad
    flex.justifyContent = FlexJustify.Center
    flex.alignItems = align
  })
  return { so, flex }
}

/** Raw Text cell for a FlexLayout, sized for its longest expected string. */
export function addText(parent: SceneObject, name: string, text: string, role: TextRole, widthCm: number,
                        heightCm: number, distanceCm: number, color: vec4): Text {
  const so = obj(parent, name)
  const t = so.createComponent("Component.Text") as Text
  t.text = text
  t.depthTest = true
  applyTextRole(t, role, distanceCm)
  t.textFill.color = color
  t.horizontalAlignment = HorizontalAlignment.Center
  t.verticalAlignment = VerticalAlignment.Center
  t.horizontalOverflow = HorizontalOverflow.Overflow
  t.verticalOverflow = VerticalOverflow.Overflow
  t.layoutRect = Rect.create(-widthCm / 2, widthCm / 2, -heightCm / 2, heightCm / 2)
  const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
  item.overrideWidth = widthCm
  item.overrideHeight = heightCm
  registerItem(parent, item)
  return t
}

/** UIKit Button whose whole face is one ElementContent (icon + label, sole child → no collapse). */
export function addIconButton(parent: SceneObject, name: string, label: string, icon: Texture | null,
                              w: number, h: number, textSize: number, onClick: () => void): Button {
  const so = obj(parent, name)
  const btn = so.createComponent(Button.getTypeName()) as Button
  btn.size = new vec3(w, h, 1)   // BEFORE init
  const ec = so.createComponent(ElementContent.getTypeName()) as ElementContent
  ec.text = label
  ec.textSize = textSize
  if (icon) {
    ec.leadingIcon = icon
    ec.spacing = 0.8
  }
  const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
  item.overrideWidth = w
  item.overrideHeight = h
  registerItem(parent, item)
  btn.onTriggerUp.add(onClick)
  return btn
}

/**
 * Every panel here is built in onAwake, before its FlexLayouts initialize, so the layouts'
 * default autoDiscoverItemsOnStart picks the FlexItem children up on start. Calling addItems
 * pre-init throws ("Cannot add items while autoDiscoverItemsOnStart is enabled…"), so this is
 * intentionally a no-op kept as the single place to change if a panel is ever built lazily.
 */
export function registerItem(_parent: SceneObject, _item: FlexItem): void {}

export function setTextAlpha(t: Text, a: number): void {
  const c = t.textFill.color
  t.textFill.color = new vec4(c.x, c.y, c.z, a)
}
