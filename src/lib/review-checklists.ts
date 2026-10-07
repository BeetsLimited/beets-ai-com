/**
 * Review checklists for the internal review hub, keyed by resource address.
 *
 * Writing these by hand for every resource does not scale past a few, so a
 * resource without its own entry gets `EVERY_RESOURCE_CHECKLIST` — the checks
 * that apply to everything on this site. A resource-specific entry adds the
 * things only a human can judge about *that* lesson.
 *
 * These are prompts for the reviewer, not attestations: nothing here publishes
 * anything. A resource goes live only when its frontmatter carries a named
 * `factCheckedBy` and `reviewer`.
 */

export interface ReviewChecklist {
  fact: string[];
  educator: string[];
}

/** Applies to every resource, whichever theme it belongs to. */
export const EVERY_RESOURCE_CHECKLIST: ReviewChecklist = {
  fact: [
    "每一項事實、數字與來源頁碼，均對照所列的 EDB 文件逐項核對（不得只靠二手敘述）",
    "香港具體情境（學校、數據、政策、地名）全部真確，或明確標示為虛構示例",
    "英文版的數字、來源與日期與中文版完全一致",
    "凡標示為待核實（[[VERIFY]]）的項目，已由人核實或刪去",
  ],
  educator: [
    "學習目標與該級別的課程和年齡是否相符",
    "課堂時間（含說明與收尾）在實際課堂是否行得通",
    "答案／評分要點正確，教師可以直接批改",
    "這份資源有一個明確的課堂產出（工作紙、活動或規劃表），不是泛泛主題",
    "中文用語是否適合香港教師（英文版：是否適合香港小學教師）",
  ],
};

export const RESOURCE_CHECKLISTS: Record<string, ReviewChecklist> = {
  "safe-to-upload-ai-rehearsal": {
    fact: [
      "六份示例全部為虛構，沒有影射任何真實學生或學校個案",
      "所列的移除手法與 EDB 文件 G（pp.2-4, 2-9）的說法一致",
      "「檔案名稱 / 中繼資料」的風險描述正確",
    ],
    educator: [
      "「讀寫障礙」示例是否適合香港學校的文化與敏感度",
      "45 分鐘的課堂時間是否可行",
      "六份示例的難度是否適合 P4–P6",
    ],
  },
  "student-ai-use-process-sheet": {
    fact: [
      "五格架構忠實反映 F（p.1-13）重視歷程、G（p.2-8）以思考歷程檢視學習的要求",
      "「不必交出完整對話紀錄」符合私隱與資料最小化的做法",
    ],
    educator: [
      "第 4 格是否真的能用一句話寫完",
      "是否符合實際課業時間",
      "表內不綁定學科的設計是否合用",
    ],
  },
  "p4-hk-population-ai-graph-check": {
    fact: [
      "⚠️ 最重要：2021 年人口 7,413,070 須與政府統計處 2021 年人口普查一致",
      "⚠️ 「人口並非逐年上升」在現行官方數據下仍然成立",
      "⚠️ 要求學生填寫的年份與 Table 110-01001 現行版本一致",
      "⚠️ censtatd.gov.hk 的來源連結仍然有效",
      "⚠️ 英文版的數字、來源與中文版完全一致（英文版為新譯本）",
    ],
    educator: [
      "35–40 分鐘對 P4 是否合適",
      "「AI 對了一半」這個切入點是否 P4 學生能掌握",
      "方格紙／試算表的器材假設是否合理",
      "英文版的用語是否適合香港小學教師",
    ],
  },
};
