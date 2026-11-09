// RoomToRememberData — the list being memorized (cranial nerves I–VI) and fixed asset contracts.
// Owns: item content (numeral, name, function, sound key, mesh key). Pure data, no scene access.
// Must not: hold runtime state (see RoomToRememberState).

export interface MemoryItem {
  numeral: string      // "I"
  name: string         // "Olfactory"
  meaning: string      // "smell"
  meshKey: string      // matches a prefab loaded in RoomToRememberMemoryObjects
  soundKey: string     // matches a clip loaded in RoomToRememberAudio
}

export const ITEMS: MemoryItem[] = [
  { numeral: "I", name: "Olfactory", meaning: "smell", meshKey: "Nose", soundKey: "Sniff" },
  { numeral: "II", name: "Optic", meaning: "sight", meshKey: "Eyeball", soundKey: "Shutter" },
  { numeral: "III", name: "Oculomotor", meaning: "eye movement", meshKey: "WheelEyeball", soundKey: "Vroom" },
  { numeral: "IV", name: "Trochlear", meaning: "eye down and in", meshKey: "Pulley", soundKey: "RopeSqueak" },
  { numeral: "V", name: "Trigeminal", meaning: "face feeling", meshKey: "Creature", soundKey: "ThreeNotes" },
  { numeral: "VI", name: "Abducens", meaning: "eye outward", meshKey: "Ufo", soundKey: "UfoBeam" },
]

export function stepLabel(index: number): string {
  return `${index + 1} of ${ITEMS.length}`
}

export function placingLabel(index: number): string {
  return `${stepLabel(index)} · ${ITEMS[index].name}`
}

export function revealLabel(index: number): string {
  const it = ITEMS[index]
  return `${it.numeral} · ${it.name} · ${it.meaning}`
}
