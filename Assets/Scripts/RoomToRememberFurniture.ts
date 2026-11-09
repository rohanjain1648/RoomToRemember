// RoomToRememberFurniture — makes each authored stand-in furniture piece pinchable.
// Owns: one "<Piece>_Hitbox" child per furniture piece (box collider sized from the piece's
//       own box visuals + SIK Interactable), and the hover highlight.
//       Reports pinches as onPinch(furnitureIndex).
// Expects: every child of `furnitureRoot` is one piece; each piece has a child named "Slot"
//          (authored anchor on its top surface where the memory object sits).
// Must not: decide what a pinch means (Main does).

import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"

export class RoomToRememberFurniture {
  readonly pieces: SceneObject[] = []
  readonly slots: SceneObject[] = []
  readonly interactables: Interactable[] = []
  private materials: (Material | null)[] = []
  private readonly onPinchEvent = new Event<number>()
  readonly onPinch = this.onPinchEvent.publicApi()

  constructor(furnitureRoot: SceneObject, private baseColor: vec4, private hoverColor: vec4, debugColliders: boolean) {
    for (let i = 0; i < furnitureRoot.getChildrenCount(); i++) {
      const piece = furnitureRoot.getChild(i)
      this.pieces.push(piece)
      this.slots.push(this.findChild(piece, "Slot") ?? piece)

      const rmvs: RenderMeshVisual[] = []
      this.collectVisuals(piece, rmvs)
      // One material clone per piece so the hover highlight tints only this piece.
      let mat: Material | null = null
      if (rmvs.length > 0) {
        mat = rmvs[0].mainMaterial.clone()
        mat.mainPass.baseColor = baseColor
        rmvs.forEach((r) => (r.mainMaterial = mat))
      }
      this.materials.push(mat)

      const b = this.localBounds(rmvs, piece)
      const hit = global.scene.createSceneObject(`${piece.name}_Hitbox`)
      hit.setParent(piece)
      hit.getTransform().setLocalPosition(b.min.add(b.max).uniformScale(0.5))
      const collider = hit.createComponent("Physics.ColliderComponent") as ColliderComponent
      const shape = Shape.createBoxShape()
      shape.size = b.max.sub(b.min)
      collider.shape = shape
      collider.debugDrawEnabled = debugColliders
      const it = hit.createComponent(Interactable.getTypeName()) as Interactable
      it.targetingMode = 3   // direct + indirect: pinch up close or from a few metres away
      this.interactables.push(it)
    }
  }

  /** Subscribe SIK events — Main calls this inside OnStartEvent. */
  bindEvents(): void {
    this.interactables.forEach((it, i) => {
      it.onTriggerEnd.add(() => this.onPinchEvent.invoke(i))
      it.onHoverEnter.add(() => this.setTint(i, this.hoverColor))
      it.onHoverExit.add(() => this.setTint(i, this.baseColor))
    })
  }

  /** Test/debug entry point: same path as a real pinch. */
  simulatePinch(i: number): void { this.onPinchEvent.invoke(i) }

  indexOfName(name: string): number {
    return this.pieces.findIndex((p) => p.name === name)
  }

  private setTint(i: number, c: vec4): void {
    const m = this.materials[i]
    if (m) m.mainPass.baseColor = c
  }

  /** Piece-local bounds of all child box visuals. */
  private localBounds(rmvs: RenderMeshVisual[], piece: SceneObject): { min: vec3; max: vec3 } {
    if (rmvs.length === 0) return { min: new vec3(-30, 0, -30), max: new vec3(30, 60, 30) }
    let min = new vec3(1e9, 1e9, 1e9)
    let max = new vec3(-1e9, -1e9, -1e9)
    const pieceInv = piece.getTransform().getInvertedWorldTransform()
    for (const r of rmvs) {
      const lmin = r.localAabbMin()
      const lmax = r.localAabbMax()
      const toPiece = pieceInv.mult(r.getTransform().getWorldTransform())
      for (let k = 0; k < 8; k++) {
        const c = new vec3(k & 1 ? lmax.x : lmin.x, k & 2 ? lmax.y : lmin.y, k & 4 ? lmax.z : lmin.z)
        const p = toPiece.multiplyPoint(c)
        min = new vec3(Math.min(min.x, p.x), Math.min(min.y, p.y), Math.min(min.z, p.z))
        max = new vec3(Math.max(max.x, p.x), Math.max(max.y, p.y), Math.max(max.z, p.z))
      }
    }
    return { min, max }
  }

  private collectVisuals(obj: SceneObject, out: RenderMeshVisual[]): void {
    const r = obj.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
    if (r) out.push(r)
    for (let i = 0; i < obj.getChildrenCount(); i++) this.collectVisuals(obj.getChild(i), out)
  }

  private findChild(obj: SceneObject, name: string): SceneObject | null {
    for (let i = 0; i < obj.getChildrenCount(); i++) if (obj.getChild(i).name === name) return obj.getChild(i)
    return null
  }
}
