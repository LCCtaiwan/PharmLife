# Event Authoring Guide

PharmLife v0.2 目前包含 100 個資料事件。新增事件只需更新 `src/data/events.ts`，不必修改 React UI。

## 最小事件

```ts
{
  id: 'hospital-new-event',
  category: 'career',
  title: '事件標題',
  eyebrow: 'HOSPITAL · 職涯事件',
  text: '玩家現在面對的情境。',
  weight: 8,
  cooldown: 5,
  conditions: { phase: 'career', career: 'hospital' },
  choices: [
    {
      id: 'choice-a',
      text: '選項文字',
      hint: '只說方向，不揭露精確數值',
      effects: { stats: { knowledge: 2 }, status: { stress: 3 } },
    },
  ],
}
```

## 檢定

`check.stats` 是加權能力，權重不必加總為 1；引擎會正規化。骰值、體力、壓力、Burnout、指定人格與 NPC 信任會共同影響結果。

成功與失敗都必須提供敘事與效果。失敗不應只寫「什麼都沒發生」，而應增加能力、flag、關係或新的風險，讓後續故事有路可走。

## Flags 與事件鏈

- `effects.flags` 寫入世界狀態。
- `conditions.requiresFlags` 要求 flags。
- `conditions.excludesFlags` 排除 flags。
- `once: true` 讓事件一局只出現一次。
- `cooldown` 是再次出現前需要經過的遊戲年度數。

事件 ID、同一事件內的 choice ID 必須唯一。`npm test` 會驗證 ID 與內容數量。

## NPC 關係

關係分成 `favor`、`trust`、`interest`。不要把三者當成同一條好感度；一位主管可以不喜歡玩家，但仍然高度信任玩家的工作能力。

## 內容原則

- 每個選項都要有可理解的取捨，避免唯一正解。
- 避免把遊戲寫成即時薪資或醫療建議資料庫。
- 使用虛構人物與雇主，不嵌入真實病人資訊。
- 選項前只顯示方向；選擇後才顯示實際變化。
