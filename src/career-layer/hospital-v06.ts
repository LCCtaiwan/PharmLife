import type { AssignmentId, HospitalAssignment, V06Episode, V06Preference } from './v06-types'

export const V06_ASSIGNMENTS: Record<AssignmentId, HospitalAssignment> = {
  outpatient: {
    id: 'outpatient', name: '門診調劑', roster: '日班／晚班輪調',
    description: '在大量處方與候藥壓力中完成評估、調配、覆核及用藥指導。',
  },
  inpatient: {
    id: 'inpatient', name: '住院調劑', roster: '日班／假日輪值',
    description: '處理單一劑量、出院帶藥、劑量評估，以及與病房確認用藥問題。',
  },
  emergency: {
    id: 'emergency', name: '急診夜間藥事', roster: '小夜／大夜支援',
    description: '在有限人力與不完整資訊下處理急件、交班及優先順序。',
  },
  drug_supply: {
    id: 'drug_supply', name: '藥品供應與管理', roster: '日班',
    description: '處理驗收、儲存、缺藥、回收及管制藥品紀錄。',
  },
}

export const V06_PEOPLE = {
  senior_lin: { name: '林學姊', role: '門診帶教藥師' },
  peer_huang: { name: '黃子維', role: '同期藥師' },
  leader_wu: { name: '吳組長', role: '住院藥局組長' },
  zhou_yian: { name: '周以安', role: '醫檢師' },
} as const

export const V06_PREFERENCES: V06Preference[] = [
  { id: 'request_outpatient_depth', label: '申請留在門診深化' },
  { id: 'request_inpatient_rotation', label: '申請住院調劑輪調' },
  { id: 'apply_emergency_training', label: '申請急診夜間訓練', minCareerYear: 2, requiredQualifications: ['outpatient_supervised', 'inpatient_supervised'] },
  { id: 'request_supply_rotation', label: '申請藥品管理輪調', minCareerYear: 2 },
  { id: 'protect_recovery', label: '申請暫緩輪調，調整班別' },
]

export const V06_WORK_EPISODES: V06Episode[] = [
  {
    id: 'opd_first_peak', kind: 'work', assignmentIds: ['outpatient'], careerYears: [1], title: '第一個門診尖峰', speakerId: 'senior_lin',
    scene: '上午診剛結束，處方像潮水一樣進來。林學姊把覆核位置讓給你，自己站在半步之外：「先照流程，不要被後面的人推著跑。」',
    choices: [
      {
        id: 'follow_checklist', label: '逐項照核對表完成', check: { competency: 'dispensing_verification', difficulty: 42, supportColleagueId: 'senior_lin' },
        successOutcome: '你速度不快，但整批處方清楚完成。林學姊只點了一下頭，沒有把位置收回去。',
        failureOutcome: '你在劑型上停得太久，林學姊接回幾張處方，事後陪你重新走過一次流程。',
        effects: { competencies: { dispensing_verification: 1 }, assignmentExperience: 1 },
        successEffects: { relationships: { senior_lin: { professionalTrust: 5, sharedHistory: ['第一次門診尖峰'] } } },
        failureEffects: { fatigue: 3, relationships: { senior_lin: { professionalTrust: 2, personalCloseness: 1, sharedHistory: ['第一次門診尖峰'] } } },
      },
      {
        id: 'ask_to_split', label: '請林學姊先拆分高風險處方',
        outcome: '你沒有假裝自己全都會。林學姊把高風險處方另外放，讓你先守住能確實完成的部分。',
        effects: { competencies: { situational_response: 1 }, fatigue: -1, assignmentExperience: 1, relationships: { senior_lin: { professionalTrust: 4, personalCloseness: 2, sharedHistory: ['第一次門診尖峰'] } } },
      },
    ],
  },
  {
    id: 'opd_lookalike', kind: 'work', assignmentIds: ['outpatient'], title: '差一個字的藥名', speakerId: 'peer_huang',
    scene: '黃子維把藥盒放到你面前。兩個品項外觀幾乎一樣，藥名只差一個字。他小聲說：「我剛剛是不是拿錯了？」窗口還在叫號。',
    choices: [
      {
        id: 'stop_batch', label: '暫停這一批，重新核對', check: { competency: 'medication_safety', difficulty: 48, supportColleagueId: 'peer_huang' },
        successOutcome: '你們找出另一盒被放錯位置的藥，這次沒有流到病人手上。',
        failureOutcome: '你們沒有再找到錯誤，但停下來的時間讓隊伍塞住。林學姊仍要求留下 Near miss 紀錄。',
        effects: { competencies: { medication_safety: 1 }, stress: 2, assignmentExperience: 1, flags: ['lookalike_reviewed'] },
        successEffects: { relationships: { peer_huang: { professionalTrust: 6, personalCloseness: 2, sharedHistory: ['一起攔下相似藥品錯置'] } } },
        failureEffects: { fatigue: 2, relationships: { peer_huang: { professionalTrust: 3, friction: 1, sharedHistory: ['一起重查相似藥品'] } } },
      },
      {
        id: 'call_senior', label: '保留現場，請帶教藥師處理',
        outcome: '林學姊接手確認並完成通報。你沒有獨自處理，但也沒有讓現場證據消失。',
        effects: { competencies: { medication_safety: 1 }, assignmentExperience: 1, relationships: { senior_lin: { professionalTrust: 4 }, peer_huang: { personalCloseness: 3, sharedHistory: ['相似藥品事件'] } } },
      },
    ],
  },
  {
    id: 'opd_counseling', kind: 'work', assignmentIds: ['outpatient'], title: '叫號之後，他沒有離開',
    scene: '一位長者領完藥仍站在窗口，反覆問同一顆藥到底何時吃。後面的人開始探頭，系統顯示平均候藥時間正在上升。',
    choices: [
      {
        id: 'teach_back', label: '請他用自己的話說一次', check: { competency: 'communication', difficulty: 50 },
        successOutcome: '他終於把服藥時間說對，還把藥袋上的記號重新描了一遍。',
        failureOutcome: '你換了幾種說法仍沒有完全說清楚，只好請另一位藥師協助，窗口更塞了。',
        effects: { competencies: { communication: 1 }, assignmentExperience: 1 },
        failureEffects: { stress: 3, fatigue: 2 },
      },
      {
        id: 'move_consult', label: '請同事代窗口，帶他到諮詢區',
        outcome: '黃子維接過你的窗口。你在安靜的位置重新說明，代價是他替你吞下了一段尖峰。',
        effects: { competencies: { communication: 1 }, stress: 1, assignmentExperience: 1, relationships: { peer_huang: { professionalTrust: 2, personalCloseness: 2, friction: 2, sharedHistory: ['代守門診窗口'] } } },
      },
    ], repeatable: true,
  },
  {
    id: 'ipd_renal_dose', kind: 'work', assignmentIds: ['inpatient'], title: '腎功能改變後的劑量', speakerId: 'leader_wu',
    scene: '病人的腎功能今天明顯下降，但藥囑仍沿用昨天的劑量。吳組長問你：「你看到哪裡不對？先說你的判斷。」',
    choices: [
      {
        id: 'review_and_call', label: '整理數據後聯絡醫療團隊', check: { competency: 'prescription_judgment', difficulty: 57, supportColleagueId: 'leader_wu' },
        successOutcome: '你把腎功能、原劑量與建議範圍說清楚，醫療團隊修改了藥囑。',
        failureOutcome: '你抓到方向，但沒有把依據組織完整。吳組長補上關鍵資料，再讓你完成聯絡。',
        effects: { competencies: { prescription_judgment: 2, communication: 1 }, assignmentExperience: 1 },
        successEffects: { relationships: { leader_wu: { professionalTrust: 7, sharedHistory: ['腎功能劑量調整'] } }, flags: ['renal_dose_resolved'] },
        failureEffects: { stress: 3, relationships: { leader_wu: { professionalTrust: 3, sharedHistory: ['腎功能劑量教學'] } } },
      },
      {
        id: 'ask_leader_first', label: '先請吳組長共同評估',
        outcome: '吳組長沒有替你直接回答，而是帶你把數據逐項排好，再由你打出那通電話。',
        effects: { competencies: { prescription_judgment: 1, drug_knowledge: 1 }, assignmentExperience: 1, relationships: { leader_wu: { professionalTrust: 4, personalCloseness: 1, sharedHistory: ['腎功能劑量教學'] } } },
      },
    ],
  },
  {
    id: 'ipd_discharge_mismatch', kind: 'work', assignmentIds: ['inpatient'], title: '出院藥袋裡少了一顆', speakerId: 'peer_huang',
    scene: '病人準備離院，護理站來電說家屬認為出院藥與住院期間不同。黃子維已經把兩份清單攤開，但找不到差異從哪一版開始。',
    choices: [
      {
        id: 'reconcile_versions', label: '逐版重建用藥清單', check: { competency: 'prescription_judgment', difficulty: 54, supportColleagueId: 'peer_huang' },
        successOutcome: '你找到一次轉床時未帶入的新藥，醫師確認後補上出院處方。',
        failureOutcome: '版本太多，你們花了很久才在護理紀錄裡找到答案。病人晚了一個多小時離院。',
        effects: { competencies: { prescription_judgment: 1, situational_response: 1 }, assignmentExperience: 1 },
        successEffects: { relationships: { peer_huang: { professionalTrust: 6, sharedHistory: ['共同完成用藥整合'] } } },
        failureEffects: { stress: 4, fatigue: 2, relationships: { peer_huang: { personalCloseness: 2, sharedHistory: ['一起追出院藥版本'] } } },
      },
      {
        id: 'escalate_ward', label: '請病房共同確認最後醫囑',
        outcome: '你把問題交回團隊共同確認，沒有讓藥局獨自猜答案。最後差異在出院前被補正。',
        effects: { competencies: { communication: 1 }, assignmentExperience: 1, relationships: { peer_huang: { professionalTrust: 3 } } },
      },
    ], repeatable: true,
  },
  {
    id: 'er_handover', kind: 'work', assignmentIds: ['emergency'], title: '交班只寫了「待確認」', speakerId: 'leader_wu',
    scene: '小夜留下的急件只有一句「待確認」，醫師電話一直佔線。吳組長正在處理另一張急救處方，現場只剩你能先把資訊拼起來。',
    choices: [
      {
        id: 'trace_record', label: '從病歷與前次用藥追查', check: { competency: 'situational_response', difficulty: 62, supportColleagueId: 'leader_wu' },
        successOutcome: '你找到前一次停藥原因，成功在給藥前完成確認。',
        failureOutcome: '資訊仍然不足，你決定維持暫停並等待醫師回覆。速度慢了，但沒有猜測。',
        effects: { competencies: { situational_response: 2 }, fatigue: 3, stress: 2, assignmentExperience: 1 },
        successEffects: { relationships: { leader_wu: { professionalTrust: 7, sharedHistory: ['夜班交接追查'] } } },
        failureEffects: { relationships: { leader_wu: { professionalTrust: 4, sharedHistory: ['夜班維持暫停'] } } },
      },
      {
        id: 'hold_and_escalate', label: '維持暫停，請值班主管介入',
        outcome: '你沒有在資料不足時猜答案。吳組長處理完急救處方後接手聯絡，並要求隔天檢討交班格式。',
        effects: { competencies: { medication_safety: 1 }, stress: 1, assignmentExperience: 1, relationships: { leader_wu: { professionalTrust: 5 } }, flags: ['handover_review'] },
      },
    ], repeatable: true,
  },
  {
    id: 'supply_recall', kind: 'work', assignmentIds: ['drug_supply'], title: '批號就在院內', speakerId: 'leader_wu',
    scene: '下午收到緊急回收通知，系統顯示該批號仍分散在三個單位。吳組長把清單交給你，要你先決定怎麼追。',
    choices: [
      {
        id: 'trace_batch', label: '依批號與流向逐筆追蹤', check: { competency: 'medication_safety', difficulty: 56, supportColleagueId: 'leader_wu' },
        successOutcome: '最後一盒在病房備藥櫃被找到，所有數量與紀錄吻合。',
        failureOutcome: '帳面與現場差一盒。你擴大搜尋並通報，直到晚間才確認是跨單位借用未登錄。',
        effects: { competencies: { medication_safety: 2 }, assignmentExperience: 1 },
        successEffects: { relationships: { leader_wu: { professionalTrust: 6, sharedHistory: ['完成緊急回收'] } } },
        failureEffects: { fatigue: 4, stress: 4, relationships: { leader_wu: { professionalTrust: 3, friction: 1, sharedHistory: ['追查回收批號差異'] } } },
      },
      {
        id: 'split_trace', label: '分派清單並建立回報節點',
        outcome: '你把三個單位拆開追蹤，固定每二十分鐘回報。速度不算快，但沒有人重複查同一處。',
        effects: { competencies: { situational_response: 1, communication: 1 }, assignmentExperience: 1, relationships: { leader_wu: { professionalTrust: 4 } } },
      },
    ], repeatable: true,
  },
]

export const V06_LIFE_EPISODES: V06Episode[] = [
  {
    id: 'life_cafeteria', kind: 'life', careerYears: [1], title: '打烊前的員工餐廳', speakerId: 'zhou_yian',
    scene: '你在餐廳最後一排找到空位。醫檢師周以安指著你胸前的新識別證：「你也是今年剛進來的？看起來我們都錯過正常吃飯時間了。」',
    choices: [
      { id: 'sit_and_talk', label: '坐下來聊一會', outcome: '你們從難吃的宵夜聊到各自第一週的狼狽。離開時，周以安把聯絡方式留給了你。', effects: { romance: { stage: 'acquaintance', closeness: 8, flags: ['met_at_cafeteria'] }, stress: -2 } },
      { id: 'go_home', label: '打聲招呼，先回家休息', outcome: '你們禮貌道別。那晚你終於在午夜前躺上床。', effects: { fatigue: -5, stress: -2, romance: { stage: 'friends', closeness: 1, flags: ['brief_cafeteria_meeting'] } } },
    ],
  },
  {
    id: 'life_coffee', kind: 'life', careerYears: [2], title: '排班表之外的邀請', speakerId: 'zhou_yian',
    scene: '周以安傳來訊息，問你休假那天要不要一起喝咖啡。你盯著訊息時，才發現自己已經很久沒有安排與工作無關的事。',
    choices: [
      { id: 'accept_date', label: '答應邀請', outcome: '你們第一次在沒有穿制服的情況下見面。對話比預期自然，也比預期更難只當普通同事。', effects: { romance: { stage: 'dating', closeness: 12, commitment: 4, flags: ['first_date'] }, stress: -3 } },
      { id: 'keep_friendship', label: '說明只想維持朋友', outcome: '周以安接受得很平靜。你們仍會交換值班後的牢騷，只是不再猜測另一種可能。', effects: { romance: { stage: 'friends', closeness: 6, flags: ['friendship_chosen'] } } },
      { id: 'decline_tired', label: '婉拒，留在家裡休息', outcome: '你關掉鬧鐘睡了很久。訊息沒有變冷，但話題慢慢回到偶爾的問候。', effects: { fatigue: -6, romance: { closeness: -1, flags: ['date_declined'] } } },
    ], romancePreference: 'open',
  },
  {
    id: 'life_friend_checkin', kind: 'life', careerYears: [2, 3, 4, 5], title: '下班後的一碗麵', speakerId: 'zhou_yian',
    scene: '周以安問你要不要下班後吃碗麵。不是約會，也沒有需要回答的人生問題，只是兩個輪班工作者終於同時有空。',
    choices: [
      { id: 'eat_together', label: '一起吃完再回家', outcome: '你們交換近況，也承認最近都過得有點勉強。有人理解班表本身，就是一種難得的輕鬆。', effects: { stress: -3, romance: { stage: 'friends', closeness: 5, flags: ['friend_checkin'] } } },
      { id: 'rest_alone', label: '改天再約，今晚先休息', outcome: '周以安回了一句「好好睡」。你回家後沒有再打開工作群組。', effects: { fatigue: -5, stress: -2 } },
    ], romancePreference: 'friends_only', repeatable: true,
  },
  {
    id: 'life_shift_conflict', kind: 'life', careerYears: [3], title: '取消第二次的晚餐', speakerId: 'zhou_yian', requiredFlags: ['romance_dating'],
    scene: '你臨時被要求支援晚班，這已是第二次取消約定。周以安沒有生氣，只問：「下次你能不能早一點告訴我，我該等還是不等？」',
    choices: [
      { id: 'talk_schedule', label: '把接下來的班表一起攤開', outcome: '你們沒有保證不再取消，而是說清楚哪些時間真的能留下。關係第一次有了共同安排。', effects: { romance: { stage: 'partner', closeness: 7, commitment: 9, conflict: -2, sharedDecisions: ['共同安排輪班生活'], flags: ['schedule_shared'] } } },
      { id: 'promise_vaguely', label: '先答應下次一定補回來', outcome: '這句話暫時讓晚上過去，但沒有解決下一張班表。', effects: { romance: { closeness: 1, conflict: 6, flags: ['vague_promise'] } } },
      { id: 'step_back', label: '承認目前無法維持這段關係', outcome: '你們沒有大吵，只是把期待放回各自手上。往後見面仍會打招呼。', effects: { romance: { stage: 'separated', commitment: -6, conflict: 1, flags: ['separated_over_schedule'] } } },
    ], romancePreference: 'open',
  },
  {
    id: 'life_future', kind: 'life', careerYears: [4, 5], title: '下一張班表之外', speakerId: 'zhou_yian', requiredFlags: ['romance_partner'],
    scene: '周以安問你，是否要開始把彼此放進更長期的生活安排。不是要求婚，而是討論住得近一點、怎麼面對輪班，以及哪些工作機會值得一起調整。',
    choices: [
      { id: 'plan_together', label: '開始共同規劃生活', outcome: '你們沒有替未來寫保證書，只先把真實限制與想要的生活放在同一張紙上。', effects: { romance: { stage: 'partner', closeness: 6, commitment: 12, sharedDecisions: ['開始共同生活規劃'], flags: ['future_planned'] } } },
      { id: 'keep_separate', label: '維持各自生活安排', outcome: '你們決定暫時不把所有選擇綁在一起。關係仍在，但彼此對承諾的理解留下了一點距離。', effects: { romance: { commitment: 2, conflict: 3, sharedDecisions: ['維持各自生活安排'] } } },
    ], romancePreference: 'open', repeatable: false,
  },
]
