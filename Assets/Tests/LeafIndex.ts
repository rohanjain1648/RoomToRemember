// LeafIndex — registers the Room to Remember LEAF scenarios (one per design-brief done criterion).

import { scenariosIndex } from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import { ScenarioMetadata } from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import { RtrC1PlaceFirstScenario } from "./RtrC1PlaceFirstScenario"
import { RtrC2AllPlacedScenario } from "./RtrC2AllPlacedScenario"
import { RtrC3ApproachScenario } from "./RtrC3ApproachScenario"
import { RtrC4HintRevealGradeScenario } from "./RtrC4HintRevealGradeScenario"
import { RtrC5LapsScenario } from "./RtrC5LapsScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    { id: "c1-place-first-object", typename: RtrC1PlaceFirstScenario.getTypeName() },
    { id: "c2-all-placed-become-dots", typename: RtrC2AllPlacedScenario.getTypeName() },
    { id: "c3-approach-shows-prompt", typename: RtrC3ApproachScenario.getTypeName() },
    { id: "c4-hint-reveal-grade", typename: RtrC4HintRevealGradeScenario.getTypeName() },
    { id: "c5-laps-score-and-from-memory", typename: RtrC5LapsScenario.getTypeName() },
  ]
}
