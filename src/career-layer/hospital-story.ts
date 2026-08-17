import type { AnnualGoal, ColleagueDefinition, GameState, SeedFate, TenYearEnding, WorkplaceEvent } from './types'

export const HOSPITAL_GOALS: AnnualGoal[] = [
  { id: 'safety', label: '守住調劑安全', description: '今年不能讓速度壓過覆核。真正的考驗，是有人叫你別多事時。', preferredChoiceIds: ['clinical_project', 'professional_study'], target: 2, successText: '你守住了安全線，也讓同事開始相信你的判斷。', failureText: '數字過關了，但你知道幾次疑點被忙碌吞了下去。', reward: { reputation: 3, signature: 6 } },
  { id: 'project', label: '完成臨床改善案', description: '把一個問題變成能落地的改善，但資料與人情不一定站在同一邊。', preferredChoiceIds: ['clinical_project', 'administration'], target: 2, successText: '改善案真的動了，不再只是會議裡的一張投影片。', failureText: '專案沒有死，只是又被推回「下次再談」。', reward: { reputation: 4, signature: 8 } },
  { id: 'shortage', label: '撐過缺工排班', description: '人力吃緊時，收入、團隊與健康不可能全部保住。', preferredChoiceIds: ['night_shift', 'mentor'], target: 2, successText: '排班撐過去了，而且沒有人被單獨丟在最黑的夜裡。', failureText: '班表填滿了，代價卻被留在每個人的身體裡。', reward: { reputation: 2, stress: -3 } },
  { id: 'junior', label: '帶出能獨立值班的新人', description: '許新人需要的不是答案，而是有人願意陪他承擔第一次。', preferredChoiceIds: ['mentor', 'professional_study'], target: 2, successText: '許新人第一次獨立值班，你終於可以放心把背後交給他。', failureText: '他會做事了，卻還不敢在出問題時開口。', reward: { reputation: 3 } },
  { id: 'promotion', label: '爭取下一個升遷名額', description: '主管要看見成果，同事也會看見你如何取得成果。', preferredChoiceIds: ['administration', 'clinical_project'], target: 2, successText: '你的名字真的進了升遷討論，不再只是口頭鼓勵。', failureText: '你做了很多事，但位置依然沒有空出來。', reward: { reputation: 5 } },
  { id: 'boundaries', label: '守住生活界線', description: '今年的成功不是多做，而是知道哪些代價不能再付。', preferredChoiceIds: ['leave_on_time', 'mentor'], target: 2, successText: '你沒有離開專業，也沒有把整個人交給工作。', failureText: '你又答應了「只多撐這一次」。', reward: { health: 2, stress: -6 } },
]

export const HOSPITAL_COLLEAGUES: ColleagueDefinition[] = [
  { id: 'director_chen', name: '陳主任', role: '藥劑部主任', description: '重視穩定，也會記得誰真正解決過問題。' },
  { id: 'senior_lin', name: '林學姊', role: '資深藥師', description: '專業標準很高，最討厭漂亮但不誠實的捷徑。' },
  { id: 'junior_xu', name: '許新人', role: '新人藥師', description: '還在學會承擔錯誤，也在觀察你會不會站在他身邊。' },
]

export const SEED_FATE_LABELS: Record<SeedFate, { label: string; reveal: string }> = {
  clinical_eye: { label: '臨床之眼', reveal: '你總比別人早一秒看見處方裡的不對勁。' },
  staffing_storm: { label: '缺工風暴', reveal: '這十年的班表，註定比別人的更難填滿。' },
  mentor_bond: { label: '師徒之緣', reveal: '你和許新人之間，會成為彼此職涯的重要轉折。' },
  political_headwind: { label: '逆風升遷', reveal: '你不缺能力，缺的是一個願意空出來的位置。' },
  quiet_years: { label: '安靜歲月', reveal: '沒有大風大浪，也代表沒有人替你製造舞台。' },
}

export const HOSPITAL_EVENTS: WorkplaceEvent[] = [
  {
    id: 'safety_dose_question', chainId: 'safety', chapter: 1, title: '多出來的那一個零', speakerId: 'senior_lin', weight: 12,
    fateWeight: { clinical_eye: 24 },
    scene: '你在高峰時段看見一張劑量高得不合理的處方。醫師正在催，窗口後面已排了十幾個人。林學姊只問：「你相信自己的判斷嗎？」',
    choices: [
      { id: 'stop_and_call', label: '先停藥，直接打給醫師', hint: '安全優先，可能正面衝突', outcome: '醫師很不耐煩，重新核對後卻沉默了。那個零確實不該存在。', effects: { abilities: { KNOW: 1 }, stress: 7, reputation: 5, signature: 10, goalProgress: 1, colleagues: { senior_lin: { trust: 7, respect: 8 }, director_chen: { respect: 3 } }, chainAdvance: 1 }, setsFlags: ['safety_challenged'] },
      { id: 'quiet_double_check', label: '請林學姊共同覆核再聯絡', hint: '降低衝突，但功勞不一定屬於你', outcome: '你們一起攔下錯誤。沒有掌聲，只有兩個人同時鬆了一口氣。', effects: { abilities: { DISP: 1 }, stress: 4, reputation: 2, signature: 8, goalProgress: 1, colleagues: { senior_lin: { trust: 9, respect: 4 } }, chainAdvance: 1 }, setsFlags: ['safety_shared'] },
      { id: 'let_it_move', label: '照流程放行，避免塞住窗口', hint: '眼前更順，疑點會留下來', outcome: '隊伍往前了。你卻整晚記得那張處方的號碼。', effects: { stress: -2, performance: 3, reputation: -5, colleagues: { senior_lin: { trust: -8, strain: 8 } }, chainAdvance: 1 }, setsFlags: ['safety_silent'] },
    ],
  },
  {
    id: 'safety_physician_pressure', chainId: 'safety', chapter: 2, title: '「以前都這樣開」', speakerId: 'director_chen', weight: 18,
    conditions: [{ minRunYear: 2, requiredFlags: ['safety_challenged'] }],
    scene: '那位醫師在跨部門會議提起你：「最近藥局是不是太愛擋單？」陳主任沒有替你回答，只把麥克風推了過來。',
    choices: [
      { id: 'show_evidence', label: '把案例與依據完整攤開', hint: '專業可見，也可能讓關係更僵', outcome: '會議安靜了幾秒。你沒有讓醫師難堪，但每個人都看懂了風險。', effects: { abilities: { COMM: 1, KNOW: 1 }, stress: 6, reputation: 7, goalProgress: 1, colleagues: { director_chen: { respect: 8 }, senior_lin: { respect: 6 } }, chainAdvance: 1 }, setsFlags: ['safety_documented'] },
      { id: 'soften_record', label: '私下溝通，不留正式紀錄', hint: '維持關係，制度不一定改變', outcome: '醫師接受了提醒，會議也平順結束。但下一個人未必知道曾經發生什麼。', effects: { stress: 2, reputation: 2, colleagues: { director_chen: { trust: 5 }, senior_lin: { trust: -3 } }, chainAdvance: 1 }, setsFlags: ['safety_private'] },
    ],
  },
  {
    id: 'safety_review_lead', chainId: 'safety', chapter: 3, title: '安全檢討會的位置', speakerId: 'director_chen', weight: 24,
    conditions: [{ minRunYear: 4, requiredFlags: ['safety_documented'] }],
    scene: '院方要成立用藥安全檢討小組。陳主任說：「你可以坐在裡面，但坐進去之後，就不能只當指出問題的人。」',
    choices: [
      { id: 'lead_review', label: '接下小組召集', hint: '影響制度，也承擔政治與工作量', outcome: '你第一次發現，改一條流程比攔一張處方更慢，卻可能保護更多人。', effects: { abilities: { MGT: 2 }, stress: 9, reputation: 10, signature: 18, goalProgress: 1, colleagues: { director_chen: { trust: 8, respect: 8 }, senior_lin: { respect: 6 } }, chainAdvance: 1 }, setsFlags: ['safety_culture'] },
      { id: 'technical_advisor', label: '只擔任技術顧問', hint: '保留專業影響，減少行政消耗', outcome: '你沒有坐主位，但每個結論都先來問你的意見。', effects: { abilities: { KNOW: 1 }, stress: 4, reputation: 6, signature: 12, colleagues: { senior_lin: { trust: 6 } }, chainAdvance: 1 }, setsFlags: ['safety_advisor'] },
    ],
  },
  {
    id: 'shortage_emergency_call', chainId: 'shortage', chapter: 1, title: '凌晨兩點的電話', speakerId: 'director_chen', weight: 11,
    fateWeight: { staffing_storm: 28, quiet_years: -5 },
    scene: '同事發燒，今晚的大夜突然沒人。陳主任在電話裡停了一下：「我知道你明天有事，但現在真的找不到人。」',
    choices: [
      { id: 'take_whole_shift', label: '整班接下來', hint: '收入與團隊信任上升，身體會記帳', outcome: '你撐完大夜，也拿到加給。天亮時，連自己的名字都寫得有點歪。', effects: { stress: 13, health: -2, money: 10, goalProgress: 1, colleagues: { director_chen: { trust: 8 }, senior_lin: { trust: 4 } }, chainAdvance: 1 }, setsFlags: ['shortage_took_shift'] },
      { id: 'split_shift', label: '找林學姊協調拆班', hint: '共同承擔，需要消耗關係與協調', outcome: '你們一人撐半夜。誰都沒睡好，但也沒有人獨自被留下。', effects: { stress: 7, money: 4, goalProgress: 1, colleagues: { senior_lin: { trust: 8, strain: 3 }, director_chen: { respect: 5 } }, chainAdvance: 1 }, setsFlags: ['shortage_shared'] },
      { id: 'refuse_shift', label: '拒絕，守住已排定的休息', hint: '健康優先，團隊會有自己的解讀', outcome: '你第一次沒有說「好」。班最後還是有人接了，只是群組安靜得不太自然。', effects: { stress: -5, health: 2, colleagues: { director_chen: { trust: -5 }, senior_lin: { respect: 3 } }, chainAdvance: 1 }, setsFlags: ['shortage_refused'] },
    ],
  },
  {
    id: 'shortage_becomes_policy', chainId: 'shortage', chapter: 2, title: '臨時變成了常態', speakerId: 'senior_lin', weight: 20,
    conditions: [{ minRunYear: 3 }],
    scene: '三個月過去，臨時加班已經排進每週。林學姊把班表放到你桌上：「我們再補洞，醫院就永遠不會補人。」',
    choices: [
      { id: 'collect_overtime_data', label: '整理數據，正式要求補人', hint: '可能改善制度，也可能得罪主管', outcome: '你把每個人失去的休息變成一張不能忽視的圖。人資終於同意開缺。', effects: { abilities: { EFF: 1, COMM: 1 }, stress: 6, reputation: 7, goalProgress: 1, colleagues: { senior_lin: { trust: 8, respect: 7 }, director_chen: { strain: 5, respect: 4 } }, chainAdvance: 1 }, setsFlags: ['staffing_opened'] },
      { id: 'keep_covering', label: '繼續靠現有人力撐住', hint: '眼前穩定，長期風險上升', outcome: '這個月沒有爆炸。下個月的班表卻比現在更薄。', effects: { stress: 11, health: -2, money: 6, colleagues: { senior_lin: { trust: -6, strain: 8 }, director_chen: { trust: 5 } }, chainAdvance: 1 }, setsFlags: ['chronic_shortage'] },
    ],
  },
  {
    id: 'junior_first_error', chainId: 'junior', chapter: 1, title: '許新人的第一個錯', speakerId: 'junior_xu', weight: 12,
    fateWeight: { mentor_bond: 26 },
    scene: '許新人把兩個外觀相似的藥放錯位置，幸好在最後覆核被發現。他臉色發白：「如果主任知道，我是不是就完了？」',
    choices: [
      { id: 'coach_and_report', label: '一起通報，陪他做完整檢討', hint: '誠實且耗時，建立長期信任', outcome: '許新人沒有被保護在真相之外。他也第一次知道，犯錯後可以怎麼站回來。', effects: { stress: 6, reputation: 3, goalProgress: 1, colleagues: { junior_xu: { trust: 12, respect: 8, strain: -3 }, senior_lin: { respect: 5 } }, chainAdvance: 1 }, setsFlags: ['junior_coached'] },
      { id: 'take_blame', label: '把責任先扛在自己身上', hint: '保護新人，但可能讓他沒有學會承擔', outcome: '主任只提醒了你。許新人很感激，卻更害怕下一次沒有你。', effects: { stress: 8, reputation: -2, colleagues: { junior_xu: { trust: 14, respect: -2, strain: -4 }, director_chen: { trust: -3 } }, chainAdvance: 1 }, setsFlags: ['junior_shielded'] },
      { id: 'separate_responsibility', label: '要求他自己向主任說明', hint: '責任清楚，關係可能受傷', outcome: '許新人完成了說明，從主任辦公室出來後只對你點了一下頭。', effects: { stress: 2, performance: 3, colleagues: { junior_xu: { trust: -8, respect: 4, strain: 9 }, director_chen: { respect: 3 } }, chainAdvance: 1 }, setsFlags: ['junior_alone'] },
    ],
  },
  {
    id: 'junior_independent_shift', chainId: 'junior', chapter: 2, title: '第一次獨立值班', speakerId: 'junior_xu', weight: 19,
    conditions: [{ minRunYear: 3 }],
    scene: '許新人即將第一次獨立值班。他問你：「如果我半夜打給你，你真的會接嗎？」這不是一道專業題。',
    choices: [
      { id: 'promise_backup', label: '答應當他的備援', hint: '犧牲休息，換來真正的安全感', outcome: '電話真的在凌晨響了。問題不大，但他從此敢在不確定時開口。', effects: { stress: 7, goalProgress: 1, colleagues: { junior_xu: { trust: 12, respect: 7, strain: -5 } }, chainAdvance: 1 }, setsFlags: ['junior_independent'] },
      { id: 'set_boundaries', label: '給他明確流程，但不承諾隨時在線', hint: '建立界線，要求他真正獨立', outcome: '那一夜他沒有打來。隔天，他帶著自己整理好的問題清單找你。', effects: { health: 1, goalProgress: 1, colleagues: { junior_xu: { trust: 3, respect: 10 } }, chainAdvance: 1 }, setsFlags: ['junior_independent'] },
    ],
  },
  {
    id: 'junior_stay_or_leave', chainId: 'junior', chapter: 3, title: '他收到另一家醫院的邀請', speakerId: 'junior_xu', weight: 23,
    conditions: [{ minRunYear: 6, colleague: { id: 'junior_xu', minTrust: 20 } }],
    scene: '許新人把 offer 放到你面前：「留下來，我會變成像你一樣的人嗎？」你聽不出那是期待，還是警告。',
    choices: [
      { id: 'support_choice', label: '誠實分析，讓他自己選', hint: '尊重他的職涯，不保證他留下', outcome: '他最後選擇留下兩年，把你教他的東西整理成新人手冊。', effects: { reputation: 5, colleagues: { junior_xu: { trust: 12, respect: 12 } }, chainAdvance: 1 }, setsFlags: ['junior_partner'] },
      { id: 'ask_to_stay', label: '告訴他團隊真的需要他', hint: '關係更近，也可能成為情緒負擔', outcome: '他留下了，但你開始提醒自己：需要一個人，不能成為綁住他的理由。', effects: { colleagues: { junior_xu: { trust: 8, strain: 5 }, director_chen: { trust: 4 } }, chainAdvance: 1 }, setsFlags: ['junior_stayed'] },
    ],
  },
  {
    id: 'project_pitch', chainId: 'project', chapter: 1, title: '一張沒人想看的改善案', speakerId: 'director_chen', weight: 11,
    scene: '你提出縮短高風險藥品覆核時間的方案。陳主任翻了兩頁：「方向很好，但今年沒有資源。」',
    choices: [
      { id: 'small_pilot', label: '自己找一個病房做小規模試行', hint: '慢，但成果屬於真實現場', outcome: '你用最小的範圍證明它不是紙上談兵。林學姊開始主動幫你記錄資料。', effects: { abilities: { RES: 1 }, stress: 7, goalProgress: 1, signature: 8, colleagues: { senior_lin: { trust: 7 }, director_chen: { respect: 4 } }, chainAdvance: 1 }, setsFlags: ['project_pilot'] },
      { id: 'seek_visibility', label: '先做漂亮簡報爭取院級支持', hint: '資源可能更快，承諾也會更大', outcome: '簡報得到掌聲。你同時得到一個三個月內必須交成果的期限。', effects: { abilities: { COMM: 1 }, stress: 9, reputation: 6, goalProgress: 1, colleagues: { director_chen: { trust: 6 }, senior_lin: { respect: -2 } }, chainAdvance: 1 }, setsFlags: ['project_visible'] },
    ],
  },
  {
    id: 'project_bad_data', chainId: 'project', chapter: 2, title: '數據沒有你想的漂亮', speakerId: 'senior_lin', weight: 19,
    conditions: [{ minRunYear: 3 }],
    scene: '初步結果只改善了一點點，甚至有一項指標變差。林學姊說：「這才是資料。現在看你想要真相，還是成果。」',
    choices: [
      { id: 'revise_honestly', label: '承認問題，重新設計流程', hint: '延後成果，保住可信度', outcome: '專案慢了半年，卻找到了真正的瓶頸。之後沒有人再懷疑你的資料。', effects: { abilities: { RES: 2 }, stress: 6, reputation: 5, goalProgress: 1, colleagues: { senior_lin: { trust: 10, respect: 10 }, director_chen: { respect: 5 } }, chainAdvance: 1 }, setsFlags: ['project_honest'] },
      { id: 'package_result', label: '挑最好看的指標先報告', hint: '短期可見度上升，後續可能反噬', outcome: '報告順利過關。林學姊沒有拆穿你，只是不再主動碰那份資料。', effects: { stress: 3, reputation: 8, performance: 7, colleagues: { senior_lin: { trust: -12, respect: -8 }, director_chen: { trust: 6 } }, chainAdvance: 1 }, setsFlags: ['project_packaged'] },
    ],
  },
  {
    id: 'project_credit', chainId: 'project', chapter: 3, title: '成果發表只放了一個名字', speakerId: 'director_chen', weight: 22,
    conditions: [{ minRunYear: 5 }],
    scene: '院級發表前，陳主任問你要不要當唯一報告人。「一個名字比較容易被記住。」但林學姊與許新人都做了很多。',
    choices: [
      { id: 'share_credit', label: '把團隊名字全部放回去', hint: '個人光環變小，關係與長期信任上升', outcome: '聚光燈沒有只照在你身上。散會後，團隊卻第一次像真的團隊。', effects: { reputation: 7, goalProgress: 1, colleagues: { senior_lin: { trust: 10, respect: 8 }, junior_xu: { trust: 8, respect: 8 }, director_chen: { respect: 5 } }, chainAdvance: 1 }, setsFlags: ['project_shared_credit'] },
      { id: 'take_spotlight', label: '接受唯一報告人的位置', hint: '升遷可見度最高，關係會記得', outcome: '你的名字被院長記住了。回到藥局，沒有人說你不配，只是掌聲很短。', effects: { reputation: 14, performance: 10, goalProgress: 1, colleagues: { senior_lin: { trust: -10, strain: 7 }, junior_xu: { trust: -7 }, director_chen: { trust: 9, respect: 7 } }, chainAdvance: 1 }, setsFlags: ['project_solo_credit'] },
    ],
  },
  {
    id: 'common_patient_wait', chainId: 'common_wait', chapter: 1, title: '窗口前的怒氣', weight: 7, repeatable: true,
    fateWeight: { quiet_years: 12 },
    scene: '一位家屬已經等了四十分鐘，開始拍攝窗口並質問：「你們只是在拿藥，為什麼這麼慢？」後面的人全看著你。',
    choices: [
      { id: 'explain_process', label: '走到窗口，解釋正在確認的風險', hint: '耗費時間，可能換來理解', outcome: '家屬沒有立刻消氣，但收起了手機。後面有人小聲說：「原來不是只在數藥。」', effects: { abilities: { COMM: 1 }, stress: 5, reputation: 4, goalProgress: 1 } },
      { id: 'speed_queue', label: '先集中火力把隊伍消化掉', hint: '效率上升，安全壓力變大', outcome: '隊伍很快縮短。你卻在下班前發現一張差點漏掉的交互作用。', effects: { abilities: { EFF: 1 }, stress: 8, performance: 5, signature: 3 } },
    ],
  },
  {
    id: 'common_director_opening', chainId: 'common_opening', chapter: 1, title: '主任辦公室的五分鐘', speakerId: 'director_chen', weight: 7, repeatable: true,
    fateWeight: { political_headwind: 18 },
    conditions: [{ minRunYear: 4 }],
    scene: '陳主任臨時把你叫進辦公室：「明年可能有一個位置，但我需要知道你想成為哪種資深藥師。」',
    choices: [
      { id: 'answer_clinical', label: '我想讓專業判斷真正改變流程', hint: '專業路線，升遷不是唯一回報', outcome: '主任點點頭：「那你要學會讓別人願意跟。」', effects: { reputation: 4, goalProgress: 1, colleagues: { director_chen: { respect: 7 }, senior_lin: { respect: 4 } } }, setsFlags: ['identity_clinical'] },
      { id: 'answer_manager', label: '我想進管理，讓資源真的動起來', hint: '管理路線，可見度與政治壓力上升', outcome: '主任第一次跟你談到真正的職缺，而不是鼓勵。', effects: { stress: 4, performance: 6, goalProgress: 1, colleagues: { director_chen: { trust: 8 } } }, setsFlags: ['identity_manager'] },
      { id: 'answer_boundaries', label: '我想做得長久，不想只往上走', hint: '生活界線清楚，可能降低升遷速度', outcome: '主任沉默了一下：「這也是答案。只是你要承受別人替你定義企圖心。」', effects: { health: 2, stress: -4, colleagues: { director_chen: { respect: 4 } } }, setsFlags: ['identity_boundaries'] },
    ],
  },
]

export function selectTenYearEnding(state: GameState): TenYearEnding {
  const junior = state.colleagues.junior_xu
  const reasons: string[] = []
  if ((state.burnout.episodes > 0 || state.health < 68) && state.money >= 470) {
    reasons.push(`十年累積 ${Math.round(state.money)} 萬資產`, `健康 ${Math.round(state.health)}，Burnout ${state.burnout.episodes} 次`)
    return { id: 'well_paid_exhausted', title: '白袍換來的數字', description: '你確實比很多人賺得多，也比很多人更早知道疲憊會留在身上。', reasons }
  }
  if (state.level >= 4 || (state.colleagues.director_chen?.trust ?? 0) >= 45 && state.reputation >= 60) {
    reasons.push(`最高職級 Lv.${state.promotion.highestLevel}`, `陳主任信任 ${state.colleagues.director_chen?.trust ?? 0}`)
    return { id: 'young_manager', title: '三十五歲的管理席', description: '你學會的不只是把事做好，而是讓資源、位置與人願意一起移動。', reasons }
  }
  if (state.flags.includes('junior_partner') || junior?.trust >= 55) {
    reasons.push(`許新人信任 ${junior?.trust ?? 0}`, '你留下的不只是自己的成績')
    return { id: 'trusted_senior', title: '有人因你而留下', description: '十年後，最能證明你的不是職稱，而是有人敢把背後交給你。', reasons }
  }
  if (state.flags.includes('safety_culture') || state.signatureValue >= 180 && state.reputation >= 48) {
    reasons.push(`攔截疑義處方 ${Math.round(state.signatureValue)} 件`, `專業聲望 ${Math.round(state.reputation)}`)
    return { id: 'clinical_guardian', title: '守住那一條線', description: '不是每一次攔截都有人知道，但很多人平安離開醫院，因為你沒有嫌麻煩。', reasons }
  }
  if (state.health >= 78 && state.stress <= 58 && state.flags.includes('identity_boundaries')) {
    reasons.push(`健康 ${Math.round(state.health)}`, `壓力 ${Math.round(state.stress)}`)
    return { id: 'life_with_boundaries', title: '沒有把人生全留在醫院', description: '你沒有最快升遷，卻仍然喜歡自己的專業，也還認得下班後的自己。', reasons }
  }
  reasons.push(`最高職級 Lv.${state.promotion.highestLevel}`, '有些問題仍沒有答案')
  return { id: 'stalled_and_searching', title: '十年後的岔路口', description: '你已經不是新人，卻還沒找到願意長久交換的那種人生。', reasons }
}
