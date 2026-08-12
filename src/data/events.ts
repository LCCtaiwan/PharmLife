import type { CareerId, EffectSet, GameEvent, StatKey } from '../engine/types'

const studentEvents: GameEvent[] = [
  {
    id: 'student-first-lab', category: 'student', title: '第一件白袍', eyebrow: '藥學系 · 起點', weight: 20, once: true,
    text: '白袍比你想像中厚。陳教授看著全班，只說：「穿上它，不代表你已經準備好了。」', npcId: 'prof_chen',
    choices: [
      { id: 'front', text: '坐到第一排', hint: '主動，但會被教授記住', effects: { stats: { knowledge: 3 }, personality: { ambition: 3, idealism: 2 }, relationships: { prof_chen: { trust: 5 } }, meetNPC: ['prof_chen'], flags: { professor_noticed: true } } },
      { id: 'observe', text: '先觀察大家', hint: '謹慎地理解環境', effects: { stats: { regulation: 2 }, personality: { risk: -3 }, relationships: { prof_chen: { favor: 1 } }, meetNPC: ['prof_chen'] } },
    ],
  },
  {
    id: 'student-midterm', category: 'student', title: '藥理期中考', eyebrow: '藥學系 · 檢定', weight: 14, cooldown: 2,
    text: '題目比考古題多了幾個轉彎。你在最後十分鐘聽見整間教室同時翻頁。',
    choices: [
      { id: 'steady', text: '按自己的節奏寫完', hint: '專業知識檢定', check: { stats: { knowledge: 1 }, difficulty: 48 }, success: { text: '你沒有被教室的焦慮帶走。', effects: { stats: { knowledge: 3 }, status: { reputation: 1 } } }, failure: { text: '成績不好看，但錯題變成最有效的筆記。', effects: { stats: { knowledge: 2 }, status: { stress: 5 }, flags: { failed_midterm: true } } } },
      { id: 'allnight', text: '熬夜再拚一次', hint: '短期有效、長期有代價', effects: { stats: { knowledge: 4 }, status: { energy: -12, stress: 7, burnout: 3 }, personality: { worklife: -3 } } },
    ],
  },
  {
    id: 'student-mei-note', category: 'relationship', title: '借來的筆記', eyebrow: '同學 · 許美真', weight: 12, once: true,
    text: '美真把整理得像出版社講義的筆記推過來：「你上次不是請假？先拿去。」', npcId: 'mei',
    choices: [
      { id: 'accept', text: '收下，考完請她吃飯', hint: '一段長久友情的開始', effects: { stats: { knowledge: 2 }, economy: { cash: -1 }, relationships: { mei: { favor: 8, trust: 5 } }, meetNPC: ['mei'], personality: { empathy: 3 }, flags: { mei_friend: true } } },
      { id: 'decline', text: '自己補完', hint: '靠自己，但錯過一次靠近', effects: { stats: { research: 2 }, status: { energy: -5 }, personality: { idealism: 1, risk: -1 }, meetNPC: ['mei'] } },
    ],
  },
  {
    id: 'student-internship', category: 'student', title: '第一次實習分流', eyebrow: '藥學系 · 岔路', weight: 18, once: true,
    text: '實習志願表只是一張紙，卻像是職涯第一次真的朝你靠近。',
    choices: [
      { id: 'hospital', text: '選醫院', hint: '專業與臨床', effects: { stats: { knowledge: 3, dispensing: 2 }, addOffer: 'hospital', meetNPC: ['lin'], flags: { intern_hospital: true } } },
      { id: 'community', text: '選社區藥局', hint: '病人與商業', effects: { stats: { communication: 3, business: 2 }, addOffer: 'community', meetNPC: ['hao'], flags: { intern_community: true } } },
      { id: 'industry', text: '選產業實習', hint: '研究與法規', effects: { stats: { regulation: 3, research: 2 }, addOffer: 'pharma', meetNPC: ['sophia'], flags: { intern_industry: true } } },
    ],
  },
  {
    id: 'student-professor-project', category: 'student', title: '教授的研究計畫', eyebrow: '事件鏈 · 研究', weight: 8, once: true,
    text: '陳教授把一份計畫書留在桌上：「我需要一個願意把問題追到底的人。」', npcId: 'prof_chen',
    conditions: { requiresFlags: ['professor_noticed'], minStats: { knowledge: 45 } },
    choices: [
      { id: 'join', text: '加入研究室', hint: '開啟學術事件鏈', effects: { stats: { research: 5 }, status: { energy: -8, stress: 4 }, relationships: { prof_chen: { trust: 10, favor: 5 } }, flags: { joined_lab: true }, addOffer: 'academia' } },
      { id: 'decline', text: '把時間留給國考', hint: '務實地集中資源', effects: { stats: { knowledge: 3 }, personality: { idealism: -3, worklife: 2 }, flags: { declined_lab: true } } },
    ],
  },
  {
    id: 'student-white-coat-oath', category: 'student', title: '白袍下的承諾', eyebrow: '畢業前夕', weight: 12, once: true,
    text: '合照結束後，你獨自站在教室。那些背過的學名，突然都變成真實的人。',
    conditions: { minAge: 22 },
    choices: [
      { id: 'patient', text: '我想成為病人會記得的藥師', hint: '人情與理想', effects: { stats: { communication: 3 }, personality: { empathy: 5, idealism: 4 }, flags: { oath_patient: true } } },
      { id: 'expert', text: '我想成為不會被難題打倒的人', hint: '專業與野心', effects: { stats: { knowledge: 4 }, personality: { ambition: 4 }, flags: { oath_expert: true } } },
      { id: 'balance', text: '我想保留工作以外的自己', hint: '生活與健康', effects: { status: { health: 3, family: 3 }, personality: { worklife: 6 }, flags: { oath_balance: true } } },
    ],
  },
]

type CareerScene = { title: string; text: string; skill: StatKey; flag: string }

const careerScenes: Record<CareerId, CareerScene[]> = {
  hospital: [
    { title: '那張不太對的處方', text: '劑量看起來合理，但你心裡有一個小小的警報沒有停。', skill: 'knowledge', flag: 'caught_rx' },
    { title: '夜班只剩兩個人', text: '急診處方不停進來，主管問誰願意多留四小時。', skill: 'efficiency', flag: 'covered_night' },
    { title: '第一次病房訪視', text: '醫師在床邊突然把藥物問題轉向你，全組都在等。', skill: 'communication', flag: 'ward_round' },
    { title: '主任的接班名單', text: '王主任說出你的名字，但也說：「接了，就不是準時下班的工作。」', skill: 'management', flag: 'hospital_successor' },
  ],
  community: [
    { title: '八罐保健食品', text: '常客把袋子整個倒在櫃台，問這些能不能一起吃。', skill: 'knowledge', flag: 'community_consult' },
    { title: '叫得出名字的病人', text: '一位半年沒出現的阿姨走進來，你還記得她上次換了藥。', skill: 'communication', flag: 'community_trust' },
    { title: '隔壁的連鎖招牌', text: '新店開幕折扣打得很低，街坊開始比較每一個價格。', skill: 'business', flag: 'survived_chain' },
    { title: '老闆想談合夥', text: '帳本被推到你面前。這不是加薪，是把風險也分給你。', skill: 'management', flag: 'community_partner' },
  ],
  chain: [
    { title: '這個月的 KPI', text: '總部的紅字很醒目，團隊開始把每次衛教都當成銷售機會。', skill: 'business', flag: 'chain_kpi' },
    { title: '促銷與專業之間', text: '活動商品不是你會主動推薦的東西，但話術已經印好了。', skill: 'regulation', flag: 'ethical_sales' },
    { title: '店員突然離職', text: '下週班表留下三個洞，所有人都看向店長。', skill: 'management', flag: 'staff_crisis' },
    { title: '總部的空位', text: '劉經理邀你離開第一線。沒有病人，但會影響更多門市。', skill: 'management', flag: 'hq_path' },
  ],
  clinic: [
    { title: '醫師的習慣處方', text: '蔡醫師用這個劑量很多年了，你卻找到了新的風險資訊。', skill: 'communication', flag: 'clinic_intervention' },
    { title: '流感季的門口', text: '候診區滿到門外，櫃台說今天不能再慢了。', skill: 'efficiency', flag: 'flu_season' },
    { title: '健保稽核來函', text: '一疊紀錄要在三天內說清楚，院所裡沒有人比你更懂。', skill: 'regulation', flag: 'clinic_audit' },
    { title: '三家診所的邀請', text: '一份顧問合約能增加收入，也會把你的晚上切得更碎。', skill: 'management', flag: 'multi_clinic' },
  ],
  pharma: [
    { title: '產品上市前夜', text: '簡報改到第十二版，跨國主管仍問能不能再多一組資料。', skill: 'research', flag: 'launch_night' },
    { title: '不能說出口的暗示', text: '業務希望你在會議上讓醫師自己「聯想到」仿單外用途。', skill: 'regulation', flag: 'pharma_ethics' },
    { title: '凌晨的全球會議', text: '時區沒有惡意，只是從來不在乎你明天要上班。', skill: 'communication', flag: 'global_team' },
    { title: '競爭公司的電話', text: '對方開出高出四成的數字，也提醒你這個位置一年後要交成績。', skill: 'management', flag: 'industry_offer' },
  ],
  cro: [
    { title: '偏離試驗計畫書', text: '中心漏了一個關鍵時間點。通報會很難看，不通報更危險。', skill: 'regulation', flag: 'protocol_deviation' },
    { title: '永遠延後的收案', text: '時程表變紅，中心說再給一週，客戶說今天就要答案。', skill: 'communication', flag: 'site_delay' },
    { title: '稽核員到場', text: '每一個日期、簽名與版本都可能變成問題。', skill: 'research', flag: 'audit_ready' },
    { title: '第一個跨國專案', text: '專案規模翻倍，出差也翻倍。郭經理問你敢不敢接。', skill: 'management', flag: 'global_trial' },
  ],
  public: [
    { title: '一紙裁量', text: '條文寫得清楚，眼前的個案卻比條文複雜得多。', skill: 'regulation', flag: 'public_discretion' },
    { title: '陳情電話', text: '對方很生氣，也確實被制度漏接了。', skill: 'communication', flag: 'public_complaint' },
    { title: '全國性缺藥', text: '媒體已經在門口，庫存數字每小時都在變。', skill: 'management', flag: 'shortage_response' },
    { title: '政策簡報的最後一頁', text: '何科長要你決定：把代價寫清楚，還是讓方案比較容易通過。', skill: 'research', flag: 'policy_brief' },
  ],
  academia: [
    { title: '計畫再次未通過', text: '審查意見只有兩頁，卻足以推翻你半年的方向。', skill: 'research', flag: 'grant_rejected' },
    { title: 'Reviewer #2', text: '他要求一個幾乎等於重做研究的分析。', skill: 'knowledge', flag: 'reviewer_two' },
    { title: '辦公室外的學生', text: '學生不是來問分數，而是說自己可能不想讀下去了。', skill: 'communication', flag: 'mentored_student' },
    { title: '聘任審查', text: '論文、教學與服務被排成三欄。你知道人生並不會排得這麼整齊。', skill: 'research', flag: 'tenure_review' },
  ],
}

const skillLabel: Record<StatKey, string> = {
  knowledge: '專業', dispensing: '調劑', communication: '溝通', efficiency: '效率', regulation: '法規', research: '研究', management: '管理', business: '商業',
}

const careerEvents = Object.entries(careerScenes).flatMap(([career, scenes]) => scenes.map((scene, index): GameEvent => ({
  id: `${career}-scene-${index + 1}`,
  category: 'career',
  title: scene.title,
  eyebrow: `${career.toUpperCase()} · 職涯事件`,
  text: scene.text,
  weight: index === 3 ? 7 : 12,
  cooldown: 5,
  once: index === 3,
  conditions: { phase: 'career', career: career as CareerId, minRole: index === 3 ? 2 : 0 },
  choices: [
    {
      id: 'step-up', text: '站到前面處理', hint: `${skillLabel[scene.skill]}檢定；成功會被看見`,
      check: { stats: { [scene.skill]: 1 }, difficulty: 51 + index * 5 },
      success: { text: '結果沒有完美，但你讓混亂重新有了順序。', effects: { stats: { [scene.skill]: 2 }, status: { reputation: 4, stress: 4 }, flags: { [scene.flag]: true }, relationships: career === 'hospital' ? { lin: { trust: 3 } } : {} } },
      failure: { text: '事情沒有照計畫走。你記住了這次失手的形狀。', effects: { stats: { [scene.skill]: 2 }, status: { stress: 8, burnout: 3 }, flags: { [`${scene.flag}_failed`]: true } } },
    },
    { id: 'ask', text: '拉一個人一起面對', hint: '關係與團隊優先', effects: { stats: { communication: 2 }, status: { stress: 2, family: 1 }, personality: { empathy: 3 }, flags: { [`${scene.flag}_team`]: true } } },
    { id: 'boundary', text: '先守住界線與程序', hint: '風險較低，但不一定討喜', effects: { stats: { regulation: 1 }, status: { stress: -2, reputation: -1 }, personality: { risk: -3, worklife: 2 }, flags: { [`${scene.flag}_boundary`]: true } } },
  ],
})))

const careerMoments: Record<CareerId, CareerScene[]> = {
  hospital: [
    { title: '抗生素管理會議', text: '培養結果與經驗用藥不完全一致，團隊需要一個人把風險說清楚。', skill: 'knowledge', flag: 'stewardship' },
    { title: '缺藥清單又變長了', text: '替代方案不只是換一個品項，病房、採購與病人都會被影響。', skill: 'management', flag: 'hospital_shortage' },
    { title: '新人跟在你身後', text: '他每隔五分鐘就問一次為什麼。你想起自己也曾經這樣。', skill: 'communication', flag: 'trained_hospital_junior' },
    { title: '連假的班表', text: '每個人都有不能值班的理由，而你握著最後一版表格。', skill: 'management', flag: 'holiday_roster' },
  ],
  community: [
    { title: '到宅整理藥袋', text: '桌上有不同院所開的藥，旁邊還放著三個沒有標籤的罐子。', skill: 'dispensing', flag: 'home_med_review' },
    { title: '那位總是忘記的伯伯', text: '他今天第三次來問同一件事，門外還有其他人在等。', skill: 'communication', flag: 'dementia_care' },
    { title: '疫苗接種日', text: '預約、冷鏈與現場人流同時考驗小小的團隊。', skill: 'efficiency', flag: 'vaccine_day' },
    { title: '社區健康園遊會', text: '沒有立即營收，但整條街的人都會看見你們。', skill: 'business', flag: 'community_fair' },
  ],
  chain: [
    { title: '盤點差異', text: '系統數字與架上庫存對不起來，差異不大，原因卻可能很大。', skill: 'efficiency', flag: 'inventory_gap' },
    { title: '神秘客報告', text: '一張表把門市的一週壓成幾個紅色分數。', skill: 'management', flag: 'mystery_shopper' },
    { title: '新人教育日', text: '總部教材很完整，但你知道現場最難的從來不在投影片裡。', skill: 'communication', flag: 'chain_training' },
    { title: '跨區調任', text: '新的區域意味著更快的升遷，也意味著重新建立所有默契。', skill: 'management', flag: 'region_transfer' },
  ],
  clinic: [
    { title: '藥袋裡的重複成分', text: '病人在兩家院所看診，沒有人完整看過他手上的全部藥物。', skill: 'knowledge', flag: 'clinic_reconciliation' },
    { title: '冰箱溫度紀錄', text: '凌晨有一段異常，你得決定這批藥還能不能使用。', skill: 'regulation', flag: 'cold_chain' },
    { title: '醫師臨時請假', text: '候診名單沒有跟著消失，現場開始需要新的安排。', skill: 'management', flag: 'doctor_absent' },
    { title: '長輩說藥太多了', text: '他不是不配合，只是已經不知道每一顆藥在做什麼。', skill: 'communication', flag: 'deprescribing_talk' },
  ],
  pharma: [
    { title: '專家諮詢會議', text: '不同專家給了完全相反的建議，而團隊明天就要決策。', skill: 'communication', flag: 'advisory_board' },
    { title: '安全性訊號', text: '樣本還不多，但那個趨勢已經不能假裝沒有看見。', skill: 'research', flag: 'safety_signal' },
    { title: '預算突然被砍', text: '目標沒變，資源少了三成。簡報上的箭頭仍然要求向上。', skill: 'management', flag: 'budget_cut' },
    { title: '帶第一位新人', text: '他問的不是流程，而是怎麼在這間公司保留專業判斷。', skill: 'management', flag: 'pharma_mentor' },
  ],
  cro: [
    { title: '少了一頁同意書', text: '受試者已完成訪視，檔案裡卻找不到正確版本的簽名頁。', skill: 'regulation', flag: 'missing_consent' },
    { title: '監測報告截止', text: '每一個待辦都有人名，也都有人等你的結論。', skill: 'efficiency', flag: 'monitoring_report' },
    { title: '航班取消', text: '明早的中心訪視不會因為天氣自動改期。', skill: 'communication', flag: 'travel_disruption' },
    { title: '資料庫鎖定前夜', text: '最後幾筆 query 還沒關閉，全球團隊在線上等。', skill: 'research', flag: 'database_lock' },
  ],
  public: [
    { title: '稽查現場的熟人', text: '你認識負責人，也知道規定不會因為認識而改變。', skill: 'regulation', flag: 'inspection_conflict' },
    { title: '記者問了最難的一題', text: '數據正確不代表民眾會理解，你只有二十秒。', skill: 'communication', flag: 'press_question' },
    { title: '偏鄉藥事計畫', text: '預算有限，但那幾個鄉鎮真的沒有其他選擇。', skill: 'management', flag: 'rural_program' },
    { title: '立法院的質詢資料', text: '每一個數字都需要來源，每一句話都可能被放大。', skill: 'research', flag: 'legislative_brief' },
  ],
  academia: [
    { title: '重做整門課', text: '學生不再需要另一套投影片，他們需要真的會判斷。', skill: 'communication', flag: 'course_redesign' },
    { title: '報告裡的複製貼上', text: '問題不只是一個分數，而是你要教會學生什麼叫誠實。', skill: 'regulation', flag: 'student_plagiarism' },
    { title: '儀器在收案中途故障', text: '研究時程沒有備份，樣本卻不會等維修完成。', skill: 'research', flag: 'lab_failure' },
    { title: '跨校合作邀請', text: '資源會變多，作者順序與決策權也會變得複雜。', skill: 'management', flag: 'academic_collab' },
  ],
}

const extraCareerEvents = Object.entries(careerMoments).flatMap(([career, scenes]) => scenes.map((scene, index): GameEvent => ({
  id: `${career}-moment-${index + 1}`,
  category: 'career', title: scene.title, eyebrow: `${career.toUpperCase()} · 工作日常`, text: scene.text,
  weight: 9, cooldown: 6, conditions: { phase: 'career', career: career as CareerId },
  choices: [
    { id: 'own', text: '把責任接下來', hint: `${skillLabel[scene.skill]}檢定`, check: { stats: { [scene.skill]: 1 }, difficulty: 54 + index * 2 }, success: { text: '你讓這件事停在可被解決的範圍裡。', effects: { stats: { [scene.skill]: 2 }, status: { reputation: 3, stress: 3 }, flags: { [scene.flag]: true } } }, failure: { text: '結果留下缺口，但你比昨天更知道問題在哪。', effects: { stats: { [scene.skill]: 2 }, status: { stress: 7, burnout: 2 }, flags: { [`${scene.flag}_scar`]: true } } } },
    { id: 'team', text: '找對的人一起處理', hint: '溝通與關係', effects: { stats: { communication: 2 }, status: { stress: 1 }, personality: { empathy: 2 }, flags: { [`${scene.flag}_shared`]: true } } },
    { id: 'slow', text: '先確認程序與風險', hint: '速度較慢，但比較安全', effects: { stats: { regulation: 1 }, status: { reputation: -1, stress: -1 }, personality: { risk: -2 }, flags: { [`${scene.flag}_careful`]: true } } },
  ],
})))

const lifeEvents: GameEvent[] = [
  {
    id: 'first-salary-talk', category: 'career', title: '第一次薪資面談', eyebrow: '職場 · 談判', weight: 10, once: true,
    text: '主管說公司很肯定你，停了一下，接著說明年會有更多責任。', conditions: { phase: 'career', minAge: 25 },
    choices: [
      { id: 'ask', text: '所以，加薪呢？', hint: '溝通與商業檢定', check: { stats: { communication: .6, business: .4 }, difficulty: 54 }, success: { text: '沉默幾秒後，主管重新打開了預算表。', effects: { economy: { annualIncome: 8, cash: 4 }, status: { reputation: 2 }, personality: { ambition: 3 } } }, failure: { text: '你沒有拿到數字，但第一次練習了替自己開口。', effects: { stats: { communication: 2 }, status: { stress: 4 }, flags: { salary_talk_failed: true } } } },
      { id: 'accept', text: '先把責任接下來', hint: '升遷傾向，但壓力增加', effects: { status: { reputation: 4, stress: 6, burnout: 4 }, personality: { ambition: 3, worklife: -2 } } },
      { id: 'browse', text: '回家打開求職網站', hint: '可能出現新職涯邀請', effects: { flags: { open_to_work: true }, personality: { risk: 3 }, status: { stress: 2 } } },
    ],
  },
  {
    id: 'lin-invitation', category: 'career', title: '林學姊的訊息', eyebrow: '事件鏈 · 林怡君', weight: 8, once: true, npcId: 'lin',
    text: '「我們這裡有缺。不是輕鬆的工作，但我覺得你會做得很好。」',
    conditions: { phase: 'career', career: ['community', 'chain', 'clinic', 'pharma', 'cro', 'public', 'academia'], npc: { id: 'lin', met: true, minTrust: 8 } },
    choices: [
      { id: 'follow', text: '跟學姊談談', hint: '獲得醫院邀請', effects: { addOffer: 'hospital', relationships: { lin: { favor: 5, trust: 3 } }, flags: { lin_offer: true } } },
      { id: 'stay', text: '謝謝她，但我想留下', hint: '關係保留、職涯更穩定', effects: { relationships: { lin: { favor: 2 } }, personality: { risk: -3 }, flags: { lin_offer_declined: true } } },
    ],
  },
  {
    id: 'hao-startup-offer', category: 'startup', title: '學長找到一個點', eyebrow: '事件鏈 · 創業邀請', weight: 8, once: true, npcId: 'hao',
    text: '昱豪把租約、商圈資料和一張手畫平面圖攤開：「你要不要一起？」',
    conditions: { phase: 'career', minAge: 30, minCash: 45, npc: { id: 'hao', met: true, minFavor: 5 }, founder: false },
    choices: [
      { id: 'all-in', text: '一起開', hint: '投入 45 萬；高風險高報酬', check: { stats: { business: .6, management: .4 }, difficulty: 58 }, success: { text: '鐵門拉起來的第一天，你們站在還有油漆味的店裡。', effects: { economy: { cash: -45, businesses: 1, assets: 30 }, startBusiness: true, relationships: { hao: { trust: 12, interest: 10 } }, flags: { startup_with_hao: true } } }, failure: { text: '開幕後的客流遠低於預估，現金開始燒得比想像快。', effects: { economy: { cash: -45, debt: 28, businesses: 1 }, startBusiness: true, relationships: { hao: { trust: 5, interest: 12 } }, status: { stress: 16, burnout: 8 }, flags: { startup_struggling: true } } } },
      { id: 'invest', text: '只投資，不離職', hint: '投入 20 萬；保留本業', effects: { economy: { cash: -20, assets: 15 }, relationships: { hao: { favor: 3, interest: 8 } }, flags: { invested_hao: true } } },
      { id: 'decline', text: '這不是現在的我', hint: '守住穩定', effects: { personality: { risk: -4, worklife: 2 }, relationships: { hao: { favor: -1 } }, flags: { refused_startup: true } } },
    ],
  },
  {
    id: 'startup-cashflow', category: 'startup', title: '現金流只剩兩個月', eyebrow: '創業 · 生存', weight: 18, cooldown: 4,
    text: '營業額不是零，但房租、人事與庫存不會等你。', conditions: { phase: 'career', founder: true },
    choices: [
      { id: 'turnaround', text: '重做品項與社區經營', hint: '商業＋溝通檢定', check: { stats: { business: .65, communication: .35 }, difficulty: 62 }, success: { text: '第三個月，回購的人開始比路過的人多。', effects: { economy: { cash: 22, assets: 12 }, status: { reputation: 5, stress: -3 }, flags: { business_turnaround: true } } }, failure: { text: '調整來得太晚，你用貸款換到下一季。', effects: { economy: { debt: 25, cash: 8 }, status: { stress: 14, burnout: 8 }, flags: { business_debt: true } } } },
      { id: 'close', text: '停損收店', hint: '失去店，但保住下一段人生', effects: { economy: { businesses: -1, assets: -18, debt: 8 }, closeBusiness: true, status: { stress: 8, burnout: -10 }, flags: { startup_closed: true } } },
    ],
  },
  {
    id: 'startup-second-store', category: 'startup', title: '第二間店', eyebrow: '創業 · 擴張', weight: 7, once: true,
    text: '商仲說這個點錯過就沒有了。你也知道，第二間店不只是第一間店乘以二。', conditions: { phase: 'career', founder: true, minCash: 80, requiresFlags: ['business_turnaround'] },
    choices: [
      { id: 'expand', text: '展店', hint: '管理檢定；投入 60 萬', check: { stats: { management: .6, business: .4 }, difficulty: 68 }, success: { text: '你第一次不必親自站在每個櫃台，店仍然運作。', effects: { economy: { cash: -60, assets: 90, businesses: 1, annualIncome: 24 }, status: { reputation: 8, stress: 8 }, flags: { second_store: true } } }, failure: { text: '兩間店同時需要你，管理斷點變成每天的火。', effects: { economy: { cash: -60, debt: 45, businesses: 1 }, status: { stress: 18, burnout: 15 }, flags: { expansion_crisis: true } } } },
      { id: 'enough', text: '一間就夠了', hint: '生活與穩定', effects: { personality: { ambition: -3, worklife: 5 }, status: { family: 5, stress: -4 }, flags: { chose_small_business: true } } },
    ],
  },
  {
    id: 'burnout-warning', category: 'health', title: '明明才剛上班', eyebrow: 'Burnout · 警訊', weight: 30, cooldown: 4,
    text: '你坐在休息室裡，還沒打卡就已經在想下班。你知道事情不太對了。', conditions: { phase: 'career', minStatus: { burnout: 72 } },
    choices: [
      { id: 'leave', text: '請一段長假', hint: '收入降低，大幅恢復', effects: { economy: { cash: -10 }, status: { burnout: -45, stress: -25, energy: 25, health: 5 }, personality: { worklife: 5 }, flags: { took_leave: true } } },
      { id: 'push', text: '再撐一下', hint: '維持收入，但可能崩潰', check: { stats: { efficiency: .4, communication: .2 }, personality: { worklife: -0.4 }, difficulty: 64 }, success: { text: '你撐過了這一季，但身體把帳記下來。', effects: { status: { burnout: 10, health: -6, reputation: 3 }, flags: { pushed_burnout: true } } }, failure: { text: '某天早上，你真的沒有辦法走進那扇門。', effects: { status: { burnout: -30, stress: 15, health: -10 }, economy: { cash: -15 }, flags: { burnout_collapse: true } } } },
      { id: 'quit', text: '離開這份工作', hint: '進入求職狀態', effects: { status: { burnout: -28, stress: -12 }, flags: { quit_for_health: true } } },
    ],
  },
  {
    id: 'meet-partner', category: 'relationship', title: '沒有談工作的晚餐', eyebrow: '關係 · 江予安', weight: 8, once: true, npcId: 'partner',
    text: '予安在你第三次提到加班後笑了：「我們今天可不可以聊一件跟工作完全無關的事？」',
    conditions: { minAge: 25, maxAge: 44, familyStatus: 'single', maxStatus: { burnout: 88 } },
    choices: [
      { id: 'stay', text: '把手機翻面', hint: '讓一段關係開始', effects: { setFamilyStatus: 'dating', relationships: { partner: { favor: 12, trust: 6 } }, meetNPC: ['partner'], status: { family: 10, stress: -4 }, personality: { worklife: 4 }, flags: { dating_partner: true } } },
      { id: 'work', text: '先把訊息回完', hint: '工作優先', effects: { status: { reputation: 2, family: -3 }, personality: { worklife: -5, ambition: 2 }, meetNPC: ['partner'], flags: { missed_dinner: true } } },
    ],
  },
  {
    id: 'marriage-question', category: 'family', title: '要不要成為一家人', eyebrow: '人生 · 婚姻', weight: 8, once: true, npcId: 'partner',
    text: '問題沒有戲劇性的配樂，只是在回家路上，很自然地被說了出來。', conditions: { minAge: 28, familyStatus: 'dating', npc: { id: 'partner', minFavor: 8 } },
    choices: [
      { id: 'yes', text: '好，我們一起走', hint: '家庭穩定、支出增加', effects: { setFamilyStatus: 'married', economy: { cash: -18, annualExpense: 6 }, status: { family: 18, stress: 2 }, flags: { married: true } } },
      { id: 'wait', text: '我還沒準備好', hint: '保留自由，但關係受影響', effects: { relationships: { partner: { favor: -5, trust: -6 } }, personality: { risk: -2 }, flags: { delayed_marriage: true } } },
    ],
  },
  {
    id: 'first-child', category: 'family', title: '多了一個人的未來', eyebrow: '人生 · 家庭', weight: 7, once: true,
    text: '你們把那張小小的檢查照片看了很久，開始重新計算時間與錢。', conditions: { minAge: 29, maxAge: 45, familyStatus: 'married' },
    choices: [
      { id: 'adjust', text: '調整工作，把時間留下', hint: '家庭大幅提升、職涯放慢', effects: { addChildren: 1, economy: { annualExpense: 12 }, status: { family: 18, reputation: -2, stress: 5 }, personality: { worklife: 6 }, flags: { first_child: true } } },
      { id: 'same', text: '維持原本節奏', hint: '收入不變、壓力提高', effects: { addChildren: 1, economy: { annualExpense: 12 }, status: { family: 8, stress: 12, burnout: 8 }, personality: { worklife: -3 }, flags: { first_child: true, work_through_parenthood: true } } },
    ],
  },
  {
    id: 'parent-care', category: 'family', title: '父母開始需要你', eyebrow: '人生 · 照護', weight: 8, once: true,
    text: '醫院的電話不是打給藥師，而是打給孩子。角色交換得比你預期快。', conditions: { minAge: 42 },
    choices: [
      { id: 'care', text: '重新安排工作', hint: '家庭優先、收入降低', effects: { economy: { annualExpense: 8, annualIncome: -6 }, status: { family: 14, stress: 6 }, personality: { empathy: 5, worklife: 5 }, flags: { parent_care: true } } },
      { id: 'support', text: '用錢補足照護', hint: '保留工作、增加支出', effects: { economy: { annualExpense: 15 }, status: { family: 7, stress: 4 }, flags: { parent_care_paid: true } } },
    ],
  },
  {
    id: 'buy-home', category: 'economy', title: '一間自己的房子', eyebrow: '資產 · 負債', weight: 7, once: true,
    text: '仲介說現在不買以後更貴。試算表則提醒你，二十年很長。', conditions: { minAge: 30, minCash: 65 },
    choices: [
      { id: 'buy', text: '付頭期款', hint: '資產增加，同時背上房貸', effects: { economy: { cash: -60, assets: 180, debt: 135, homes: 1, annualExpense: 10 }, status: { family: 8, stress: 6 }, flags: { bought_home: true } } },
      { id: 'rent', text: '保持彈性', hint: '保留現金與轉職自由', effects: { personality: { risk: 2 }, status: { stress: -2 }, flags: { chose_rent: true } } },
    ],
  },
  {
    id: 'health-check', category: 'health', title: '健檢報告上的紅字', eyebrow: '健康 · 中年', weight: 10, once: true,
    text: '你每天提醒別人按時照顧自己，現在輪到報告提醒你。', conditions: { minAge: 40, maxStatus: { health: 72 } },
    choices: [
      { id: 'change', text: '真的改變生活', hint: '投入時間與金錢恢復健康', effects: { economy: { cash: -5 }, status: { health: 14, burnout: -8, energy: 8, reputation: -2 }, personality: { worklife: 5 }, flags: { health_changed: true } } },
      { id: 'later', text: '忙完這陣子再說', hint: '工作不受影響', effects: { status: { health: -8, stress: 4, reputation: 2 }, personality: { worklife: -3 }, flags: { ignored_health: true } } },
    ],
  },
  {
    id: 'junior-asks', category: 'relationship', title: '後輩問你值不值得', eyebrow: '傳承 · 陳若晴', weight: 8, once: true, npcId: 'junior',
    text: '若晴問：「如果重來一次，你還會走這條路嗎？」她是真的想知道。', conditions: { phase: 'career', minAge: 46, minRole: 2 },
    choices: [
      { id: 'honest', text: '把代價也說清楚', hint: '信任與傳承', effects: { meetNPC: ['junior'], relationships: { junior: { trust: 12, favor: 6 } }, status: { reputation: 5 }, personality: { idealism: 3, empathy: 3 }, flags: { mentored_junior: true } } },
      { id: 'bright', text: '只說最好的一面', hint: '鼓舞，但不完整', effects: { meetNPC: ['junior'], relationships: { junior: { favor: 8, trust: -2 } }, status: { reputation: 2 }, flags: { idealized_career: true } } },
    ],
  },
  {
    id: 'mei-reunion', category: 'world', title: '同學會的位置', eyebrow: '世界仍在前進', weight: 6, once: true, npcId: 'mei',
    text: '美真已經換了三次工作。有人留在醫院，有人出國，有人沒有再做藥師。', conditions: { minAge: 38 },
    choices: [
      { id: 'listen', text: '聽每個人說完', hint: '重新看見不同人生', effects: { meetNPC: ['mei'], relationships: { mei: { favor: 8, trust: 4 } }, status: { family: 7, stress: -5 }, personality: { empathy: 4 }, flags: { attended_reunion: true } } },
      { id: 'compare', text: '忍不住比較成就', hint: '野心被重新點燃', effects: { personality: { ambition: 5 }, status: { stress: 5, reputation: 2 }, flags: { compared_reunion: true } } },
    ],
  },
]

const lifeMomentSeeds: { id: string; title: string; text: string; category: GameEvent['category']; once?: boolean; effects: EffectSet }[] = [
  { id: 'certificate-course', title: '週末的證照課', text: '同事說這張證照不一定加薪，但可能替下一次轉職多開一扇門。', category: 'career', effects: { stats: { knowledge: 2, regulation: 2 }, economy: { cash: -3 }, status: { energy: -6, stress: 2 } } },
  { id: 'colleague-resigns', title: '隔壁座位空了', text: '一起抱怨過無數次的同事先遞出了辭呈。', category: 'world', once: true, effects: { status: { stress: 4 }, flags: { colleague_left: true }, personality: { ambition: 2 } } },
  { id: 'conference-trip', title: '三天的研討會', text: '新知、名片與離開工作現場的三天，都可能改變你的視線。', category: 'career', effects: { stats: { knowledge: 2, communication: 1 }, economy: { cash: -4 }, status: { energy: 3 } } },
  { id: 'unexpected-bonus', title: '沒有預期的獎金', text: '金額不算改變人生，但足以讓你決定怎麼對待這一年的辛苦。', category: 'economy', effects: { economy: { cash: 8 }, status: { stress: -2 } } },
  { id: 'phone-off', title: '整個週末沒有開機', text: '星期一早上，世界沒有因為你消失兩天而停止運作。', category: 'health', effects: { status: { energy: 13, stress: -9, burnout: -5 }, personality: { worklife: 3 } } },
  { id: 'insurance-review', title: '重新整理保障', text: '人生風險被排成一張表。你第一次認真看完每一列。', category: 'economy', once: true, effects: { economy: { cash: -3, annualExpense: 1 }, status: { family: 4, stress: -2 }, flags: { insured: true } } },
  { id: 'patient-thanks', title: '一張手寫卡片', text: '上面沒有你的完整名字，只寫著「謝謝那天願意多說五分鐘的藥師」。', category: 'relationship', once: true, effects: { status: { reputation: 6, family: 3, stress: -4 }, personality: { idealism: 4 } } },
  { id: 'missed-holiday', title: '錯過的家庭聚餐', text: '群組裡的合照沒有你。工作確實需要人，只是照片也是真的。', category: 'family', effects: { status: { reputation: 2, family: -7, stress: 5 }, personality: { worklife: -3 } } },
  { id: 'online-advice', title: '你的回答被大量轉發', text: '一段原本只想澄清迷思的文字，突然被很多陌生人看見。', category: 'world', once: true, effects: { stats: { communication: 2 }, status: { reputation: 8, stress: 3 }, flags: { online_voice: true } } },
  { id: 'national-shortage', title: '大家都在問同一個藥', text: '缺貨消息擴散得比正式通知快，你得在資訊不完整時回答。', category: 'career', effects: { stats: { communication: 1, regulation: 1 }, status: { stress: 6 }, flags: { handled_shortage: true } } },
  { id: 'own-mistake', title: '那個錯誤是你的', text: '目前沒有造成傷害。你可以趁還沒有人發現時選擇怎麼做。', category: 'career', once: true, effects: { stats: { regulation: 3 }, status: { reputation: 2, stress: 9 }, personality: { idealism: 3 }, flags: { disclosed_mistake: true } } },
  { id: 'mentor-retires', title: '帶你入行的人退休了', text: '他把櫃子清空，只留下幾本沒有人想搬走的舊書。', category: 'world', once: true, effects: { status: { family: 4, stress: -2 }, personality: { empathy: 3 }, flags: { mentor_retired: true } } },
  { id: 'family-trip', title: '一趟很普通的旅行', text: '沒有升等、沒有成果，只有幾張後來會一直被翻到的照片。', category: 'family', effects: { economy: { cash: -6 }, status: { family: 10, energy: 6, stress: -7 }, personality: { worklife: 4 } } },
]

const lifeMoments = lifeMomentSeeds.map((moment): GameEvent => ({
  id: `life-moment-${moment.id}`, category: moment.category, title: moment.title, eyebrow: '人生 · 片刻', text: moment.text,
  weight: 7, cooldown: 6, once: moment.once, conditions: { phase: 'career' },
  choices: [
    { id: 'embrace', text: '讓這件事進入生活', hint: '接受它帶來的影響', effects: moment.effects },
    { id: 'pass', text: '把重心留在原本的路上', hint: '維持節奏與界線', effects: { status: { stress: -1 }, personality: { risk: -1 }, flags: { [`passed_${moment.id}`]: true } } },
  ],
}))

const fallbackEvents: GameEvent[] = [
  {
    id: 'quiet-year', category: 'world', title: '沒有大事的一年', eyebrow: '人生 · 日常', text: '有些年份沒有戲劇性的轉折。你只是把該做的事做好，然後記得回家。', weight: 5, cooldown: 2,
    choices: [
      { id: 'notice', text: '平凡也值得記住', hint: '恢復與生活', effects: { status: { energy: 8, stress: -6, family: 4 }, personality: { worklife: 2 } } },
      { id: 'prepare', text: '替下一步做準備', hint: '能力小幅成長', effects: { stats: { knowledge: 1, communication: 1, efficiency: 1 }, personality: { ambition: 2 } } },
    ],
  },
  {
    id: 'unexpected-complaint', category: 'career', title: '一星評論', eyebrow: '職場 · 客訴', text: '「藥師態度很差，問問題還叫我看說明書。」你記得的版本完全不同。', weight: 8, cooldown: 5,
    conditions: { phase: 'career' },
    choices: [
      { id: 'reply', text: '冷靜回覆並查清楚', hint: '溝通檢定', check: { stats: { communication: 1 }, difficulty: 50 }, success: { text: '你沒有贏得爭論，但讓事情停在可修復的位置。', effects: { stats: { communication: 2 }, status: { reputation: 2, stress: 2 } } }, failure: { text: '回覆又引來一輪爭議。團隊花了更多時間收拾。', effects: { status: { reputation: -4, stress: 8 }, flags: { complaint_spread: true } } } },
      { id: 'ignore', text: '先不回應', hint: '降低當下衝突', effects: { status: { reputation: -2, stress: 2 }, flags: { ignored_complaint: true } } },
    ],
  },
  {
    id: 'open-offer', category: 'career', title: '一封沒有預期的邀請', eyebrow: '職涯 · 跳槽', text: '對方沒有保證比較快樂，只說這會是一條不同的路。', weight: 7, cooldown: 6,
    conditions: { phase: 'career', requiresFlags: ['open_to_work'] },
    choices: [
      { id: 'talk', text: '先去談談', hint: '獲得隨機職涯邀請', effects: { flags: { interviewed: true } } },
      { id: 'stay', text: '關掉訊息', hint: '穩定目前生活', effects: { flags: { open_to_work: false }, status: { stress: -3 }, personality: { risk: -2 } } },
    ],
  },
]

export const EVENTS: GameEvent[] = [...studentEvents, ...careerEvents, ...extraCareerEvents, ...lifeEvents, ...lifeMoments, ...fallbackEvents]

export const EVENT_BY_ID = Object.fromEntries(EVENTS.map((event) => [event.id, event]))

export function eventCountByCategory() {
  return EVENTS.reduce<Record<string, number>>((counts, event) => {
    counts[event.category] = (counts[event.category] ?? 0) + 1
    return counts
  }, {})
}

export function mergeEffects(...effects: (EffectSet | undefined)[]): EffectSet {
  return effects.filter(Boolean).reduce<EffectSet>((merged, effect) => ({
    ...merged,
    stats: { ...merged.stats, ...effect?.stats },
    personality: { ...merged.personality, ...effect?.personality },
    status: { ...merged.status, ...effect?.status },
    economy: { ...merged.economy, ...effect?.economy },
    relationships: { ...merged.relationships, ...effect?.relationships },
    flags: { ...merged.flags, ...effect?.flags },
    meetNPC: [...(merged.meetNPC ?? []), ...(effect?.meetNPC ?? [])],
    achievements: [...(merged.achievements ?? []), ...(effect?.achievements ?? [])],
  }), {})
}
