// Earthquake Spell (Dark Spell)
// Value = fraction of target's max HP dealt on the first cast (Lv 1-8).
// Index = level - 1. Update this array on balance patches.
export const EQ_PCT: readonly number[] = [
  0.14, 0.17, 0.21, 0.25, 0.29, 0.29, 0.29, 0.29,
]

export const EQ_MAX_LV = EQ_PCT.length
