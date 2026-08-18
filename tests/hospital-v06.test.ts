import { describe, expect, it } from 'vitest'
import { chooseV06Episode, chooseV06Preference, continueAfterV06Outcome, createHospitalV06Game, fastForwardV06, proficiencyLabel, simulateV06, startV06Assignment, v06EpisodeById } from '../src/career-layer/engine-v06'

describe('Hospital Career v0.6 newcomer slice', () => {
  it('starts with an assigned unit instead of optional duty actions', () => {
    const state = createHospitalV06Game({ seed: 'V06-ASSIGNMENT' })
    expect(state.schemaVersion).toBe('hospital-v0.6')
    expect(state.stage).toBe('assignment')
    expect(state.assignmentId).toBe('outpatient')
    expect(state.episodeQueue).toHaveLength(2)
    expect(state.qualifications).toContain('pgy_enrolled')
    expect(state.availablePreferenceIds).toEqual([])
  })

  it('keeps competence, assignment proficiency, qualification and condition separate', () => {
    let state = createHospitalV06Game({ seed: 'V06-GROWTH' })
    const competencyBefore = state.competencies.dispensing_verification
    state = startV06Assignment(state)
    const episode = v06EpisodeById(state.pendingEpisodeId)!
    state = chooseV06Episode(state, episode.choices[0].id)
    expect(state.competencies.dispensing_verification).toBeGreaterThanOrEqual(competencyBefore)
    expect(state.assignmentExperience.outpatient).toBe(1)
    expect(proficiencyLabel(state.assignmentExperience.outpatient)).toBe('見習')
    expect(state.qualifications).not.toContain('outpatient_supervised')
    expect(state.condition.fatigue).toBeGreaterThanOrEqual(0)
  })

  it('reveals check causes only after the choice resolves', () => {
    let state = startV06Assignment(createHospitalV06Game({ seed: 'V06-CHECK' }))
    const episode = v06EpisodeById(state.pendingEpisodeId)!
    const checkedChoice = episode.choices.find((choice) => choice.check)!
    state = chooseV06Episode(state, checkedChoice.id)
    expect(state.stage).toBe('outcome')
    expect(state.pendingOutcome?.check?.factors).toContain('單位熟練 見習')
    expect(state.pendingOutcome?.check?.difficulty).toBeGreaterThan(0)
  })

  it('earns supervised clearance through actual unit experience', () => {
    let state = startV06Assignment(createHospitalV06Game({ seed: 'V06-CLEARANCE' }))
    let episode = v06EpisodeById(state.pendingEpisodeId)!
    state = chooseV06Episode(state, episode.choices[0].id)
    state = continueAfterV06Outcome(state)
    episode = v06EpisodeById(state.pendingEpisodeId)!
    state = chooseV06Episode(state, episode.choices[0].id)
    expect(state.assignmentExperience.outpatient).toBe(2)
    expect(state.qualifications).toContain('outpatient_supervised')
    expect(state.yearDraft.qualificationsEarned).toContain('outpatient_supervised')
  })

  it('does not offer emergency training before both prerequisite rotations', () => {
    let state = createHospitalV06Game({ seed: 'V06-GATE' })
    state = startV06Assignment(state)
    for (let index = 0; index < 2; index += 1) {
      const episode = v06EpisodeById(state.pendingEpisodeId)!
      state = chooseV06Episode(state, episode.choices[0].id)
      state = continueAfterV06Outcome(state)
    }
    if (state.stage === 'life') {
      const life = v06EpisodeById(state.pendingEpisodeId)!
      state = chooseV06Episode(state, life.choices[0].id)
      state = continueAfterV06Outcome(state)
    }
    expect(state.stage).toBe('preference')
    expect(state.qualifications).toContain('outpatient_supervised')
    expect(state.availablePreferenceIds).not.toContain('apply_emergency_training')
  })

  it('keeps professional trust, closeness and friction as independent axes', () => {
    let state = startV06Assignment(createHospitalV06Game({ seed: 'V06-RELATIONSHIP' }))
    state = { ...state, pendingEpisodeId: 'opd_counseling' }
    state = chooseV06Episode(state, 'move_consult')
    expect(state.colleagues.peer_huang.professionalTrust).toBe(2)
    expect(state.colleagues.peer_huang.personalCloseness).toBe(4)
    expect(state.colleagues.peer_huang.friction).toBe(2)
    expect(state.colleagues.peer_huang.sharedHistory).toContain('代守門診窗口')
  })

  it('lets friends-only players complete five years without romance or penalty', () => {
    const result = fastForwardV06(createHospitalV06Game({ seed: 'V06-SINGLE', relationshipPreference: 'friends_only' }), 5)
    expect(result.stage).toBe('chapter')
    expect(result.reports).toHaveLength(5)
    expect(['single', 'acquaintance', 'friends']).toContain(result.romanceStates.zhou_yian.stage)
    expect(result.age).toBe(30)
    expect(result.money).toBeGreaterThan(20)
  })

  it('replays the same five-year career with the same seed and choices', () => {
    const first = fastForwardV06(createHospitalV06Game({ seed: 'V06-REPLAY' }), 5)
    const second = fastForwardV06(createHospitalV06Game({ seed: 'V06-REPLAY' }), 5)
    expect(first).toEqual(second)
    expect(first.timeline.some((entry) => entry.type === 'relationship')).toBe(true)
  })

  it('supports deterministic multi-run debug simulation', () => {
    expect(simulateV06(20, 'V06-SIM')).toEqual(simulateV06(20, 'V06-SIM'))
    expect(simulateV06(20, 'V06-SIM').runs).toBe(20)
  })

  it('resolves a submitted preference through an explicit hospital decision', () => {
    let state = fastForwardV06(createHospitalV06Game({ seed: 'V06-PREF' }), 0)
    state = startV06Assignment(state)
    while (state.stage !== 'preference') {
      if (state.stage === 'episode' || state.stage === 'life') {
        const episode = v06EpisodeById(state.pendingEpisodeId)!
        state = chooseV06Episode(state, episode.choices[0].id)
      } else if (state.stage === 'outcome') state = continueAfterV06Outcome(state)
    }
    state = chooseV06Preference(state, 'request_inpatient_rotation')
    expect(state.stage).toBe('report')
    expect(state.lastReport?.preferenceDecision).toContain('院方')
    expect(state.lastReport?.preferenceLabel).toBe('申請住院調劑輪調')
  })
})
