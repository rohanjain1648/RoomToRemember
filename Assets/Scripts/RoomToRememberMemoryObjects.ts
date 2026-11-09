// RoomToRememberMemoryObjects — the visual side of each memory item.
// Owns: per-item runtime spot (created on placement, under the furniture's authored Slot),
//       the generated GLB model, its faint "ghost" outline copy, the glowing dot, and every
//       animation on them (pop-in, shrink-to-dot, reveal, wobble, sparkle burst, dot pulse).
// Expects: Main passes in prefabs + materials + tunables; Main decides WHEN, this decides HOW.
// Must not: hold game state, play audio, or touch UI.

import animate, { CancelFunction } from "SpectaclesInteractionKit.lspkg/Utils/animate"

export interface MemoryVisualConfig {
  dotSizeCm: number          // dot diameter when idle
  dotNearSizeCm: number      // dot diameter when the user is close
  dotLiftCm: number          // how far above the furniture surface the dot floats
  colorIdle: vec4
  colorGot: vec4
  colorMissed: vec4
  colorSoft: vec4            // previous-lap "got it" glow
  miniModelScale: number     // placing-card preview size relative to the full model
}

class ItemVisual {
  spot: SceneObject
  modelRoot: SceneObject
  ghostRoot: SceneObject
  dot: SceneObject
  dotMat: Material
  wobbleCancel: CancelFunction | null = null
  pulseCancel: CancelFunction | null = null
  scaleCancel: CancelFunction | null = null
  dotCancel: CancelFunction | null = null
  currentScale = 0
}

export class RoomToRememberMemoryObjects {
  private items: (ItemVisual | null)[] = []
  private miniModel: SceneObject | null = null
  private sparklePool: SceneObject[] = []

  constructor(
    private prefabs: { [key: string]: ObjectPrefab },
    private sphereMesh: RenderMesh,
    private dotMaterial: Material,
    private ghostMaterial: Material,
    private cfg: MemoryVisualConfig,
  ) {}

  // ── Placement ───────────────────────────────────────────────────────────────
  /** Builds the item's spot on top of `slot` and pops the model in. */
  place(index: number, meshKey: string, slot: SceneObject): SceneObject {
    const v = new ItemVisual()
    v.spot = this.child(slot, `Spot_${index}`)
    v.modelRoot = this.child(v.spot, `Model_${index}`)
    this.instantiate(meshKey, v.modelRoot)
    v.ghostRoot = this.child(v.spot, `Ghost_${index}`)
    const ghostModel = this.instantiate(meshKey, v.ghostRoot)
    if (ghostModel) this.applyMaterialRecursive(ghostModel, this.ghostMaterial)
    v.ghostRoot.getTransform().setLocalScale(new vec3(1.04, 1.04, 1.04))
    v.ghostRoot.enabled = false

    v.dot = this.child(v.spot, `Dot_${index}`)
    v.dot.getTransform().setLocalPosition(new vec3(0, this.cfg.dotLiftCm, 0))
    const rmv = v.dot.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    rmv.mesh = this.sphereMesh
    v.dotMat = this.dotMaterial.clone()
    v.dotMat.mainPass.baseColor = this.cfg.colorIdle
    rmv.mainMaterial = v.dotMat
    this.setDotSize(v, this.cfg.dotSizeCm, false)
    v.dot.enabled = false

    this.items[index] = v
    this.animateModelScale(v, 0, 1, 0.35, "ease-out-back")
    return v.spot
  }

  getSpot(index: number): SceneObject | null {
    const v = this.items[index]
    return v ? v.spot : null
  }

  getDot(index: number): SceneObject | null {
    const v = this.items[index]
    return v ? v.dot : null
  }

  getModelRoot(index: number): SceneObject | null {
    const v = this.items[index]
    return v ? v.modelRoot : null
  }

  getDotWorldPosition(index: number): vec3 | null {
    const v = this.items[index]
    return v ? v.dot.getTransform().getWorldPosition() : null
  }

  // ── Model show / hide ──────────────────────────────────────────────────────
  /** All placed objects shrink into their dots. */
  shrinkAllToDots(duration: number, done?: () => void): void {
    let pending = 0
    this.items.forEach((v) => {
      if (!v) return
      pending++
      this.stopWobble(v)
      this.animateModelScale(v, v.currentScale, 0, duration, "ease-in-quad", () => {
        v.modelRoot.enabled = false
        v.dot.enabled = true
        if (--pending === 0 && done) done()
      })
    })
    if (pending === 0 && done) done()
  }

  /** Reveal the object at `scale` (1, 1.5, 2); optional wobble for missed items. */
  reveal(index: number, scale: number, wobble: boolean): void {
    const v = this.items[index]
    if (!v) return
    v.ghostRoot.enabled = false
    v.modelRoot.enabled = true
    this.animateModelScale(v, 0, scale, 0.4, "ease-out-back")
    this.stopWobble(v)
    if (wobble) {
      const t0 = getTime()
      v.wobbleCancel = animate({
        duration: "continuous",
        update: () => {
          const t = getTime() - t0
          const a = Math.sin(t * 9) * 0.16
          v.modelRoot.getTransform().setLocalRotation(quat.fromEulerAngles(0, 0, a))
        },
      })
    }
  }

  /** Shrink the revealed object back into its dot. */
  hideToDot(index: number, duration: number, done?: () => void): void {
    const v = this.items[index]
    if (!v) return
    this.stopWobble(v)
    this.animateModelScale(v, v.currentScale, 0, duration, "ease-in-quad", () => {
      v.modelRoot.enabled = false
      if (done) done()
    })
  }

  isModelVisible(index: number): boolean {
    const v = this.items[index]
    return !!v && v.modelRoot.enabled && v.currentScale > 0.01
  }

  getModelScale(index: number): number {
    const v = this.items[index]
    return v ? v.currentScale : 0
  }

  showGhost(index: number, scale: number): void {
    const v = this.items[index]
    if (!v) return
    v.ghostRoot.getTransform().setLocalScale(vec3.one().uniformScale(scale * 1.04))
    v.ghostRoot.enabled = true
  }

  hideGhost(index: number): void {
    const v = this.items[index]
    if (v) v.ghostRoot.enabled = false
  }

  isGhostVisible(index: number): boolean {
    const v = this.items[index]
    return !!v && v.ghostRoot.enabled
  }

  // ── Dots ─────────────────────────────────────────────────────────────────
  setDotVisible(index: number, visible: boolean): void {
    const v = this.items[index]
    if (v) v.dot.enabled = visible
  }

  setAllDotsVisible(visible: boolean): void {
    this.items.forEach((v, i) => { if (v) this.setDotVisible(i, visible) })
  }

  setDotColor(index: number, color: vec4): void {
    const v = this.items[index]
    if (v) v.dotMat.mainPass.baseColor = color
  }

  getDotColor(index: number): vec4 | null {
    const v = this.items[index]
    return v ? v.dotMat.mainPass.baseColor : null
  }

  setDotNear(index: number, near: boolean): void {
    const v = this.items[index]
    if (!v) return
    this.setDotSize(v, near ? this.cfg.dotNearSizeCm : this.cfg.dotSizeCm, true)
  }

  getDotSizeCm(index: number): number {
    const v = this.items[index]
    return v ? v.dot.getTransform().getLocalScale().x : 0
  }

  /** Orange pulse for dots missed on the previous lap. */
  setDotPulse(index: number, on: boolean): void {
    const v = this.items[index]
    if (!v) return
    if (v.pulseCancel) { v.pulseCancel(); v.pulseCancel = null }
    if (!on) return
    const t0 = getTime()
    const base = this.cfg.colorMissed
    v.pulseCancel = animate({
      duration: "continuous",
      update: () => {
        const k = 0.55 + 0.45 * Math.sin((getTime() - t0) * 5)
        v.dotMat.mainPass.baseColor = new vec4(base.x * k, base.y * k, base.z * k, base.w)
      },
    })
  }

  // ── Sparkle burst (missed twice) ──────────────────────────────────────────
  sparkle(index: number): void {
    const v = this.items[index]
    if (!v) return
    const colors = [this.cfg.colorGot, this.cfg.colorMissed, this.cfg.colorIdle, new vec4(1, 0.45, 0.85, 1), new vec4(1, 0.95, 0.3, 1)]
    const count = 14
    for (let k = 0; k < count; k++) {
      const s = this.sparklePool[k] ?? this.makeSparkle(k)
      s.setParent(v.spot)
      s.enabled = true
      const mat = (s.getComponent("Component.RenderMeshVisual") as RenderMeshVisual).mainMaterial
      mat.mainPass.baseColor = colors[k % colors.length]
      const ang = (k / count) * Math.PI * 2
      const dir = new vec3(Math.cos(ang), 0.6 + Math.random() * 0.8, Math.sin(ang)).normalize()
      const start = new vec3(0, 25, 0)
      const dist = 35 + Math.random() * 25
      const tr = s.getTransform()
      animate({
        duration: 0.9 + Math.random() * 0.3,
        easing: "ease-out-quad",
        update: (t: number) => {
          tr.setLocalPosition(start.add(dir.uniformScale(dist * t)))
          const size = 3.2 * (1 - t)
          tr.setLocalScale(new vec3(size, size, size))
        },
        ended: () => { s.enabled = false },
      })
    }
  }

  // ── Placing-card mini model ────────────────────────────────────────────────
  showMiniModel(meshKey: string, anchor: SceneObject): void {
    this.clearMiniModel()
    const root = this.child(anchor, "MiniModel")
    const s = this.cfg.miniModelScale
    root.getTransform().setLocalScale(new vec3(s, s, s))
    this.instantiate(meshKey, root)
    this.miniModel = root
  }

  clearMiniModel(): void {
    if (this.miniModel && !isNull(this.miniModel)) this.miniModel.destroy()
    this.miniModel = null
  }

  // ── Internals ────────────────────────────────────────────────────────────
  private setDotSize(v: ItemVisual, sizeCm: number, animated: boolean): void {
    const tr = v.dot.getTransform()
    if (v.dotCancel) { v.dotCancel(); v.dotCancel = null }
    if (!animated) { tr.setLocalScale(new vec3(sizeCm, sizeCm, sizeCm)); return }
    const from = tr.getLocalScale().x
    v.dotCancel = animate({
      duration: 0.25, easing: "ease-out-quad",
      update: (t: number) => {
        const s = from + (sizeCm - from) * t
        tr.setLocalScale(new vec3(s, s, s))
      },
    })
  }

  private animateModelScale(v: ItemVisual, from: number, to: number, duration: number,
                            easing: "ease-out-back" | "ease-in-quad", done?: () => void): void {
    if (v.scaleCancel) v.scaleCancel()
    const tr = v.modelRoot.getTransform()
    v.currentScale = from
    tr.setLocalScale(vec3.one().uniformScale(Math.max(from, 0.0001)))
    v.scaleCancel = animate({
      duration, easing,
      update: (t: number) => {
        const s = from + (to - from) * t
        v.currentScale = s
        tr.setLocalScale(vec3.one().uniformScale(Math.max(s, 0.0001)))
      },
      ended: () => { v.currentScale = to; v.scaleCancel = null; if (done) done() },
    })
  }

  private stopWobble(v: ItemVisual): void {
    if (v.wobbleCancel) { v.wobbleCancel(); v.wobbleCancel = null }
    v.modelRoot.getTransform().setLocalRotation(quat.quatIdentity())
  }

  private instantiate(meshKey: string, parent: SceneObject): SceneObject | null {
    const prefab = this.prefabs[meshKey]
    if (!prefab) { print(`RoomToRememberMemoryObjects: no prefab for '${meshKey}'`); return null }
    return prefab.instantiate(parent)
  }

  private applyMaterialRecursive(obj: SceneObject, mat: Material): void {
    const rmvs = obj.getComponents("Component.RenderMeshVisual") as RenderMeshVisual[]
    rmvs.forEach((r) => { r.clearMaterials(); r.addMaterial(mat) })
    for (let i = 0; i < obj.getChildrenCount(); i++) this.applyMaterialRecursive(obj.getChild(i), mat)
  }

  private makeSparkle(k: number): SceneObject {
    const s = global.scene.createSceneObject(`Sparkle_${k}`)
    const rmv = s.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    rmv.mesh = this.sphereMesh
    rmv.mainMaterial = this.dotMaterial.clone()
    s.enabled = false
    this.sparklePool[k] = s
    return s
  }

  private child(parent: SceneObject, name: string): SceneObject {
    const o = global.scene.createSceneObject(name)
    o.setParent(parent)
    return o
  }
}
