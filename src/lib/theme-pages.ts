import type { Locale } from "./i18n";
import type { Theme } from "./schema";

/**
 * Long-form copy for the five theme pages — the part that is written, not
 * derived from the content collection.
 *
 * The theme's heading and sub-title come from `THEME_INFO`; this file adds the
 * **description** (element 4 of the theme page: more context, written in the words
 * a teacher or curriculum lead searches with, so the page can be found and quoted
 * for that theme) and the **FAQs** (element 6: the questions people actually ask,
 * answered on the page — the same text is published as FAQ structured data, which
 * is what an AI answer engine reads).
 *
 * All five themes are written in both languages (Billy, 2026-10-10). The map is
 * still typed as PARTIAL, and `ThemePageView` still renders a theme that has no
 * copy — heading, sub-title, hero and the locked catalogue, minus the description
 * and FAQs — so a sixth theme, or a new language, degrades instead of breaking.
 * `tests/theme-pages.test.ts` holds the shape any entry must arrive in.
 *
 * **Accuracy rules for this copy** (it is public and it is about official
 * documents):
 * - Name the official documents by their own published titles, in each language.
 *   Never translate a title, never invent one. The codes below are the source
 *   codes on the resource pages (`E` through to `G` — see the workflow skill's
 *   `references/edb-source-documents.md`, which also records that document B has
 *   no English edition).
 * - Describe what those documents are for; do not assert specific requirements,
 *   hour counts, deadlines or figures that the documents would have to be checked
 *   against first.
 * - Say plainly that this is an independent initiative, not an official EDB
 *   publication.
 */

export interface ThemeFaq {
  question: string;
  answer: string;
}

export interface ThemePageCopy {
  /** Paragraphs, in order. Rendered as prose, not as a bullet list. */
  intro: string[];
  /** Four to five questions, answered on the page. */
  faqs: ThemeFaq[];
}

const SOURCE_FRAMEWORK_ZH = "《中小學人工智能素養學習架構》";
const SOURCE_FRAMEWORK_EN = "AI Literacy Learning Framework for Primary and Secondary Schools";
const SOURCE_BLUEPRINT_ZH = "《中小學數字教育發展藍圖》";
const SOURCE_BLUEPRINT_EN = "Blueprint for Digital Education Development in Primary and Secondary Schools";
const SOURCE_GUIDE_ZH = "《中小學應用人工智能教學指南》";
const SOURCE_GUIDE_EN = "Guide to Using AI in Teaching in Primary and Secondary Schools";
const SOURCE_SCENARIOS_ZH = "《中小學人工智能素養學習架構（應用場景示例）》";
const SOURCE_SCENARIOS_EN =
  "AI Literacy Learning Framework for Primary and Secondary Schools (Examples of Application Scenarios)";

export const THEME_PAGES: Record<Locale, Partial<Record<Theme, ThemePageCopy>>> = {
  "zh-HK": {
    A: {
      intro: [
        "「校本 AI 教育規劃」是把人工智能素養納入學校整體課程的過程：決定先由哪些科目、哪些級別開始，用什麼課時，由誰負責，以及如何知道學生真的學到了。它不是在買了 AI 工具之後填的一份清單，而是一份可以在一個學年內逐步執行的計劃。",
        `香港的官方文件已經給出方向：${SOURCE_BLUEPRINT_ZH}說明學校數字教育的整體發展，${SOURCE_FRAMEWORK_ZH}則描述學生在人工智能素養上需要達到的學習重點。最花時間的一步，是把這些文件翻譯成切合自己校情的學期規劃——不少學校就停在「聽過框架」而未有下一步。`,
        "這個主題的資源正是為這一步而設：一份可編輯的一學期規劃範本（附完成示例），以及一份課程覆蓋分析，幫你看清 AI 素養已經落在哪些科目、哪些級別仍有缺口。它們的對象是校長、課程主任及科主任——需要向同事交代「下學期做什麼」的人。",
        "全部資源免費下載、不需註冊，可直接以 Word 或 Excel 開啟修改，方便你按校情調整。若你未決定從哪一份開始，建議先看「一學期 AI 教育規劃」範本，再用「課程覆蓋分析」檢查現況；你亦可以在下方按主題、學習階段和科目篩選，找出最適合你學校的材料。",
      ],
      faqs: [
        {
          question: "甚麼是校本 AI 教育規劃？",
          answer:
            "指學校按自己的校情——科目、級別、課時、教師人手——把人工智能素養納入課程的整體安排，包括推行次序、負責人、課時安排，以及檢視學生學習成效的方法。它是一份需要逐年檢視的計劃，而不是一份採購清單。",
        },
        {
          question: `${SOURCE_FRAMEWORK_ZH}要求學校做什麼？`,
          answer:
            "這是教育局就中小學人工智能素養發布的官方文件，列出學生需要掌握的學習重點。學校的實際做法，是把這些重點對應到現有科目的課題與課時，再決定先做哪一部分。本主題的規劃範本與課程覆蓋分析，就是為逐項討論而設。",
        },
        {
          question: "一份學期 AI 規劃應該包含哪些部分？",
          answer:
            "最少包括：推行目標與範圍（哪些級別、哪些科目）、時間表、負責教師與分工、所需器材，以及檢視方式。「一學期 AI 教育規劃」範本已把這些部分排好，並附上一間學校的完成示例，你可以直接改寫成自己學校的版本。",
        },
        {
          question: "我們學校還未用過 AI，這些規劃範本適用嗎？",
          answer:
            "適用。範本設想的是「先由一至兩個科目、一個級別開始」，不需要全校同時推行，也不假設教師已有 AI 教學經驗。若你想先看單一課堂怎樣做，可以先取「共融 AI 課堂」主題的資源，再回來做整體規劃。",
        },
        {
          question: "這些資源需要收費或有使用限制嗎？",
          answer:
            "全部免費下載，不需註冊。資源可作教學用途自由改編，只需保留來源標示。它們是 Beets Limited 的獨立資源計劃，並非教育局官方文件；每份資源都列明所參考的官方文件與版本。",
        },
      ],
    },
    B: {
      intro: [
        "學生用 AI 做功課、用 AI 生成圖片、把自己的相片或對話貼進工具裡——這些是學校和家庭每天都要處理的實務問題。這個主題不處理「AI 好不好」的討論，而是處理具體決定：哪些資料不可以上載、發現深偽內容時怎樣做、在家要訂立什麼規則。",
        `官方文件把這些列入學校要處理的範圍：${SOURCE_BLUEPRINT_ZH}談學校層面的數字教育發展，${SOURCE_FRAMEWORK_ZH}把安全、責任與倫理列為學生需要學習的一部分。學校的難處，通常不是不知道要教，而是要在班主任課、家長通告和日常課堂之間，找到一個說得清楚的版本。`,
        "這個主題有三份可直接使用的材料：一份上載前安全檢查（找出並移除學生個人資料）、一個深偽應對遊戲（暫停、核實、舉報），以及一份家庭 AI 功課指引，內含三個家庭活動、一份親子協議和一封可直接發出的家長通告。前兩份適合課堂，第三份適合家長會或家校溝通。",
        "全部免費下載、不需註冊，可直接以 Word 或 Excel 開啟修改。你可以在下方按級別和科目篩選；若教師本身未用過 AI，建議先取「共融 AI 課堂」主題的資源建立課堂常規，再回來處理安全與責任的議題。",
      ],
      faqs: [
        {
          question: "學生的個人資料可以上載到 AI 工具嗎？",
          answer:
            "一般原則是最少化：不上載可辨識學生的資料，包括姓名、學號、相片和成績。「上載前安全檢查」提供一份可以貼在課室或電腦室的清單，幫教師和學生在貼上內容之前找出並移除個人資料。重點是建立習慣，而不是要學生記住一堆規則。",
        },
        {
          question: "發現深偽（deepfake）內容時，學校應該怎樣處理？",
          answer:
            "教學上可以先教三個步驟：暫停（不轉發）、核實（向可信來源確認）、舉報（向平台或學校報告）。「深偽應對遊戲」把這三步做成一節課的活動，適合 S1–S3 的人文或班主任課，教師不需要技術背景也能帶領。",
        },
        {
          question: "家長應該在家為子女訂立什麼 AI 規則？",
          answer:
            "建議集中在兩三條可執行的規則：哪些功課可以用 AI、用完之後要說明什麼、什麼資料不可以貼進工具。「家庭 AI 功課指引」提供三個家庭活動、一份可以與子女共同簽署的協議，以及一封家長通告，學校可以直接沿用或改寫。",
        },
        {
          question: "學校需要為 AI 使用訂立書面政策嗎？",
          answer:
            "我們不代學校寫政策，但本主題的檢查清單、家校協議範本和課堂活動可以作為討論的起點。學校可以參考官方文件中關於安全、責任和倫理的部分，再按校情決定哪些要求要寫進校規或使用指引。",
        },
        {
          question: "這些材料適合小學生嗎？",
          answer:
            "適合。標示 P1–P6 的資源以具體生活情境為主，避免技術細節，家長通告和家庭活動都可以直接使用；深偽應對遊戲的原設計對象是中學階段（S1–S3）。教師可按學生程度選用，兩者之間沒有嚴格的先後次序。",
        },
      ],
    },
    C: {
      intro: [
        "學生交回來的功課愈來愈完整，但教師最想知道的其實是另一件事：這份答案背後，學生自己想過什麼？如果只批改最後的成品，教師看到的是工具的輸出，而不是學生的思考，也很難判斷學生是否真的學到了。",
        "這個主題的資源把「思考」變成看得見的證據：學生第一次嘗試寫了什麼、用了什麼提示、如何核對、最後怎樣修訂。做法不是禁止使用 AI，而是要求學生把過程記錄下來，教師則按過程而不只是成品去給回饋。",
        "三份材料分別對應三個日常場景：重新設計課業並附上兩份前後對照的範例（功課重設計套件）、讓學生填寫 AI 使用歷程表，以及三個可在十分鐘內完成的判斷小測，用來檢查學生會不會核對 AI 的說法。",
        "全部免費下載、不需註冊，可直接以 Word 或 Excel 開啟修改，適合高小的常識、數學及人文科，也適合初中科目。你可以在下方按學習階段和科目篩選，找出配合你現有單元的材料。",
      ],
      faqs: [
        {
          question: "怎樣知道學生有沒有用 AI 做功課？",
          answer:
            "單看成品通常無法確定。實務做法是把重點由「有沒有用」轉向「用得對不對」：要求學生記錄第一次嘗試、所用的提示、如何核對，以及最後的修訂。「學生 AI 使用歷程表」就是為此而設，一頁表格就可以改變整份功課的評核重點。",
        },
        {
          question: "功課應該怎樣重新設計？",
          answer:
            "「功課重設計套件」提供兩份前後對照的課業範例，示範如何把一份只要求答案的功課，改成同時要求過程、理由和核對步驟的功課。要點是連評分準則一起改，而不只是改題目，否則學生仍然只會交最後答案。",
        },
        {
          question: "沒有額外課時，怎樣教學生核對 AI？",
          answer:
            "用形成性評估的方式切入。「十分鐘 AI 判斷小測」提供三個可在單一課時內完成的任務，讓學生在課堂上即時練習找出 AI 輸出中可疑或需要查證的地方，不需要另開一個單元。",
        },
        {
          question: "評估學生使用 AI 時，應該用什麼準則？",
          answer:
            "建議把過程納入準則：能否說明所用的提示與理由、能否指出 AI 說法之中不確定或可能有錯的地方、能否在核對之後修訂答案。本主題的範本已按這些面向排好，可以直接改寫成學校自己的評分說明。",
        },
        {
          question: "家長會不會覺得學校在縱容學生用 AI？",
          answer:
            "這是很常見的顧慮，家校說法一致就能處理。「家庭 AI 功課指引」（屬「安全及負責任使用 AI」主題）內含一封家長通告和一份家庭協議，說明學校要求學生記錄過程的原因，可以配合本主題的歷程表一起發給家長。",
        },
      ],
    },
    D: {
      intro: [
        "AI 最容易被誤用的地方，是它說得好像很肯定。這個主題的探究活動都以香港為題材，並刻意把「核對 AI 的說法」放進學習目標之內：學生先自己觀察、估算或查找，再拿 AI 的答案來對照，然後找出差異的原因。",
        "三份材料分別落在科學、人文和數學科：校園植物觀察（先觀察，再核對 AI 的說法）、香港今昔的本地歷史專題（附上不需要訪談家人的替代方案），以及用香港人口數據做的折線圖活動，請學生檢查 AI 生成的解釋是否站得住腳。",
        "這些活動都按現有科目的課題設計，不需要額外添置器材。題材取自香港，學生有直接的生活經驗可以對照——校園裡的植物、居住地區的變化、人口數字——因此更容易看出 AI 的答案在哪裡出了問題。",
        `${SOURCE_SCENARIOS_ZH}是這些活動的參考來源之一。全部資源免費下載、不需註冊，可直接以 Word 或 Excel 開啟修改；你可以在下方按學習階段和科目篩選，或先到「安全及負責任使用 AI」主題取核對資料的檢查清單。`,
      ],
      faqs: [
        {
          question: "為什麼要用「核對 AI」作為學習目標？",
          answer:
            "因為學生會自行使用 AI，而 AI 的答案通常語氣肯定、卻可能出錯。與其只教他們問對問題，更實用的是教他們核實：先自己觀察或計算，再與 AI 的說法對照，並解釋差異從何而來。這個習慣在離開學校之後仍然有用。",
        },
        {
          question: "沒有 AI 裝置的班房可以做這些活動嗎？",
          answer:
            "可以。活動本身是學科探究——觀察植物、比較歷史照片、閱讀數據——AI 部分可以由教師示範，或把 AI 的回答投影出來全班一起核對。學生有機會自己操作工具固然好，但學習目標並不依賴學生手持裝置。",
        },
        {
          question: "這些活動需要額外的課時嗎？",
          answer:
            "三份材料都按現有課題設計，可以置入常識、科學、人文或數學科的既有單元。若你只有一節課，建議先做「校園植物」或「香港人口折線圖」，兩者都可以在一節課內完成，並留下一份學生的核對記錄。",
        },
        {
          question: "學生需要自己開設 AI 帳戶嗎？",
          answer:
            "不需要。活動容許由教師操作 AI 工具、把結果帶給學生核對；若學校已有學生帳戶，也可以讓學生自行使用，並依「安全及負責任使用 AI」主題的上載前安全檢查處理學生個人資料。",
        },
        {
          question: "為什麼選擇香港本地題材？",
          answer:
            "因為學生對本地事物有直接經驗——校園的植物、居住地區的今昔、人口數字的變化——比較容易判斷 AI 的回答是否合理，也更容易自己提出後續的探究問題。本地題材同時回應課程中對社區與國家認識的要求。",
        },
      ],
    },
    E: {
      intro: [
        "第一次在課堂用 AI，最常見的兩個顧慮是「我不熟這個工具」和「我沒有時間備課」。這個主題的材料假設你由零開始：不需要先成為 AI 專家，也不需要學校添置新器材，三份材料都是教師可以自己準備的起點。",
        "「第一堂 AI 課」是一份教師自學套件，逐步說明怎樣準備和帶領第一節課；「同一份人文科工作紙，三個版本（標準、扶助、圖像）」示範如何照顧班內不同的學習需要；「P1–P3 體育：兩個不插電 AI 遊戲」則完全不用裝置，適合低年級或器材有限的課室。",
        "三份材料都以「多數班房已經有的條件」為前提：一份工作紙、一部投影機，或者只有黑板和課室空間。這是共融課堂的實際起點——先讓所有學生都能參與同一個活動，再按情況加入工具。",
        `${SOURCE_GUIDE_ZH}及${SOURCE_SCENARIOS_ZH}是本主題的參考來源。全部資源免費下載、不需註冊，可直接修改成你班別的用語；你亦可以在下方按學習階段和科目篩選。`,
      ],
      faqs: [
        {
          question: "我從未用過 AI，可以教嗎？",
          answer:
            "可以。「第一堂 AI 課」是為沒有 AI 使用經驗的教師而寫的自學套件，逐步說明怎樣準備和帶領第一節課。建議你先自己完整做一次，再帶到課堂；套件本身也是可以拿在手上照著用的。",
        },
        {
          question: "學校沒有 AI 工具或平板，可以做嗎？",
          answer:
            "可以。「P1–P3 體育：兩個不插電 AI 遊戲」完全不需要裝置；其他活動也可以由教師操作工具、把結果帶給學生討論。不少學習目標——例如判斷 AI 的說法是否合理——本身就不需要學生手持裝置。",
        },
        {
          question: "如何照顧班內的能力差異？",
          answer:
            "其中一份材料正是為此而設：「同一份人文科工作紙，三個版本」提供標準、扶助和圖像三個版本，同一份課業可以同時交給不同需要的學生，教師不需要為每組另出一份功課。",
        },
        {
          question: "教師備課需要多少時間？",
          answer:
            "資源已包含工作紙、課堂步驟和教師筆記，主要時間用於按你的班別調整用語。如果你只有一節課的準備時間，建議由「P1–P3 體育：兩個不插電 AI 遊戲」或「第一堂 AI 課」開始，兩者都有清楚的逐步指示。",
        },
        {
          question: "這些資源適合有特殊教育需要（SEN）的學生嗎？",
          answer:
            "三個版本的設計，正是為了讓同一份課業可以被不同需要的學生使用，包括圖像化版本和拆細步驟的扶助版本。這些材料是教學起點：實際的調適仍應由熟悉學生情况的教師，按個別學生的需要決定。",
        },
      ],
    },
  },
  en: {
    A: {
      intro: [
        "Whole-school AI education planning is how a school decides what to teach, in which subjects and year levels, with whose time — and how it will know students actually learned it. It is not a checklist that ends with buying a tool: it is a plan a school can carry out across a school year.",
        `Hong Kong's official documents already set the direction. The ${SOURCE_BLUEPRINT_EN} describes how digital education develops across a school, and the ${SOURCE_FRAMEWORK_EN} describes the learning students are expected to reach. The step that takes the time is translating those into a term plan that fits your own school, which is where many schools stop: the framework has been read, but nothing has changed yet.`,
        "The resources in this theme exist for that step — an editable one-term plan template with a completed school example, and a curriculum coverage analysis that shows where AI literacy already sits in your subjects and where the gaps are. They are written for principals, curriculum coordinators and panel heads: the people who have to tell colleagues what happens next term.",
        "Everything is free to download with no registration, and opens in Word or Excel so you can adapt it to your school. If you are not sure where to start, begin with the one-term plan template and then use the curriculum coverage analysis to see where you stand; you can also filter by theme, learning stage and subject below.",
      ],
      faqs: [
        {
          question: "What is whole-school AI education planning?",
          answer:
            "It is the school's own arrangement for bringing AI literacy into the curriculum — which subjects and year levels go first, whose time it uses, who is responsible, and how you check whether students learned it. It is a plan to review year by year, not a purchasing list.",
        },
        {
          question: `What does the ${SOURCE_FRAMEWORK_EN} ask schools to do?`,
          answer:
            "It is the Education Bureau's published framework for AI literacy in primary and secondary schools, setting out the learning students are expected to reach. In practice a school maps those points onto the topics and lesson time it already has, then decides which part to start with. This theme's planning template and coverage analysis are built for exactly that discussion.",
        },
        {
          question: "What should a one-term AI plan contain?",
          answer:
            "At its minimum: the aim and scope (which year levels, which subjects), a timetable, the teachers responsible and how the work is shared, the equipment needed, and how you will review it. The one-term plan template lays those sections out and includes a completed example from a school, so you can rewrite it as your own version.",
        },
        {
          question: "Our school has not used AI yet. Do these templates still apply?",
          answer:
            "Yes. The template assumes you start with one or two subjects at a single year level — it does not require a whole-school rollout, and it does not assume any teacher has taught with AI before. If you would rather see a single lesson first, start with the First and inclusive lessons theme, then come back to the whole-school plan.",
        },
        {
          question: "Do these resources cost anything, and may we adapt them?",
          answer:
            "They are free to download with no registration, and you may adapt them freely for teaching as long as you keep the attribution. They are an independent resource initiative by Beets Limited and not an official EDB publication; every resource names the official document and version it draws on.",
        },
      ],
    },
    B: {
      intro: [
        "Students use AI to do homework, to make images, and to paste their own photos or conversations into a tool. These are practical questions a school and a family deal with every week. This theme is not about whether AI is good or bad: it is about the specific decisions — what must never be uploaded, what to do when you meet a deepfake, and what rules to set at home.",
        `The official documents put this inside the school's remit: the ${SOURCE_BLUEPRINT_EN} covers digital education development at school level, and the ${SOURCE_FRAMEWORK_EN} treats safety, responsibility and ethics as part of what students are expected to learn. The difficulty for a school is rarely knowing that it should be taught — it is finding one version that can be used in a form period, a parent letter and an ordinary lesson without contradicting itself.`,
        "Three resources here cover that: a pre-upload safety check that finds and removes pupil personal data, a deepfake response game built on pause, verify and report, and a family AI homework guide containing three family activities, a parent-child agreement and a ready-to-send letter home. The first two suit a lesson; the third suits a parents' evening or a home-school conversation.",
        "Everything is free to download with no registration, and opens in Word or Excel for editing. Filter by stage and subject below — and if your teachers have not used AI at all yet, start with the First and inclusive lessons theme to establish classroom routines, then come back to safety and responsibility.",
      ],
      faqs: [
        {
          question: "May we upload pupil personal data to an AI tool?",
          answer:
            "The working rule is data minimisation: do not upload information that identifies a pupil, including names, class numbers, photographs and marks. The pre-upload safety check gives teachers and students a list to work through before pasting anything in. The aim is a habit, not a set of rules to memorise.",
        },
        {
          question: "What should a school do when it meets a deepfake?",
          answer:
            "Teach three steps first: pause (do not forward it), verify (confirm with a source you trust), and report (to the platform or the school). The deepfake response game turns those three steps into a single lesson, suitable for S1-S3, and it needs no technical background from the teacher.",
        },
        {
          question: "What AI rules should parents set at home?",
          answer:
            "Keep it to two or three rules that can actually be followed: which homework AI may be used for, what the child must explain afterwards, and what information must never be pasted into a tool. The family AI homework guide provides three family activities, an agreement to sign together, and a letter home the school can adapt.",
        },
        {
          question: "Does the school need a written AI policy?",
          answer:
            "We do not write a school's policy for it, but the safety check, the family agreement and the lesson activities here are a reasonable starting point for the discussion. A school can take the parts of the official documents that cover safety, responsibility and ethics, and decide which requirements belong in its own rules.",
        },
        {
          question: "Is this material suitable for primary pupils?",
          answer:
            "Yes. The resources marked P1-P6 use everyday situations and avoid technical detail, and the parent letter and family activities can be used as they are. The deepfake response game was designed for the junior secondary years (S1-S3). Teachers can choose by their class; there is no required order between the two.",
        },
      ],
    },
    C: {
      intro: [
        "The work students hand in keeps getting more polished, but the question a teacher wants answered is a different one: what did the student actually think? Mark only the finished product and you are marking the tool's output, not the student's reasoning — and you cannot tell whether anything was learned.",
        "The resources in this theme turn thinking into evidence: what the student tried first, which prompts they used, how they checked the answer, and what they changed afterwards. The approach is not to ban AI; it is to require the process to be recorded, so that feedback and marking can rest on the process rather than only the product.",
        "Three resources cover three everyday situations: redesigning a piece of homework, with two before-and-after examples of the same task; a log sheet students fill in as they work; and three ten-minute judgement tasks that show whether students check what AI tells them.",
        "Everything is free to download with no registration and opens in Word or Excel, so you can put your own wording on it. Filter by learning stage and subject below to find the materials that fit a unit you are already teaching.",
      ],
      faqs: [
        {
          question: "How can I tell whether a student used AI for their homework?",
          answer:
            "You usually cannot tell from the finished product. The practical move is to shift the question from whether AI was used to whether it was used well: ask students to record their first attempt, the prompts they used, how they checked the answer, and what they revised. The AI use log sheet exists for exactly that, and one page changes what the task is really assessing.",
        },
        {
          question: "How should a homework task be redesigned?",
          answer:
            "The homework redesign kit gives two before-and-after examples of the same task, showing how to turn a task that asks only for an answer into one that also asks for the reasoning, the checking steps and the revision. Change the marking criteria at the same time as the task, or students will still hand in only the final answer.",
        },
        {
          question: "We have no extra lesson time. How do we teach students to check AI?",
          answer:
            "Treat it as formative assessment rather than a new unit. The ten-minute AI judgement tasks are three activities that fit inside a single lesson, so students practise spotting claims that are doubtful or need verifying as part of the subject work they are already doing.",
        },
        {
          question: "What criteria should we use when assessing work done with AI?",
          answer:
            "Include the process: whether the student can explain the prompts and reasoning, whether they can identify what in the AI's answer is uncertain or possibly wrong, and whether they revised after checking. The templates in this theme are laid out around those points and can be rewritten as your own marking notes.",
        },
        {
          question: "Will parents think the school is going easy on AI use?",
          answer:
            "It is a common concern, and it is answered by consistency between home and school. The family AI homework guide (in the Responsible and safe AI use theme) contains a letter home and a family agreement explaining why the school asks students to record their process; send it together with the log sheet.",
        },
      ],
    },
    D: {
      intro: [
        "The worst thing about AI answers is how certain they sound. The inquiry activities in this theme all use Hong Kong material, and they put checking the AI's claim inside the learning objective: students observe, estimate or look something up first, then compare what AI says, then explain the difference.",
        "Three resources cover science, Humanities and maths: observing plants on the school campus and then checking what AI says about them; a local history project on how Hong Kong changed, with an alternative that does not require interviewing family members; and a line-graph activity on Hong Kong population data asking students to test whether the AI's explanation holds up.",
        "All three fit topics already in the curriculum and need no extra equipment. The material is local, so students have first-hand experience to compare against — the plants in their own playground, how their district has changed, the population figures — which makes it far easier for them to see where an AI answer goes wrong.",
        `The ${SOURCE_SCENARIOS_EN} is one of the sources these activities draw on. Everything is free to download with no registration and opens in Word or Excel; filter by learning stage and subject below, or take the checking checklist from the Responsible and safe AI use theme first.`,
      ],
      faqs: [
        {
          question: "Why make checking AI a learning objective?",
          answer:
            "Because students will use AI on their own, and AI answers usually sound certain while still being wrong. Rather than teaching only how to ask better questions, the more durable skill is verification: observe or calculate first, compare with what the AI says, and explain where the difference came from. That habit outlasts school.",
        },
        {
          question: "Can these activities be run in a classroom with no AI devices?",
          answer:
            "Yes. The activity itself is subject inquiry — observing plants, comparing historical photographs, reading data — and the AI part can be demonstrated by the teacher or projected for the whole class to check together. Students handling the tool themselves is better, but the learning objective does not depend on it.",
        },
        {
          question: "Do these activities need extra lesson time?",
          answer:
            "All three are designed around topics that already exist, so they slot into an existing General Studies, Science, Humanities or Maths unit. If you have only one lesson, start with the campus plants activity or the population line graph; both fit in a single period and leave a written record of what the class checked.",
        },
        {
          question: "Do students need their own AI accounts?",
          answer:
            "No. The activities allow the teacher to operate the AI tool and bring the results to the class to check. Where a school already has student accounts, students can use them — handling any pupil data with the pre-upload safety check from the Responsible and safe AI use theme.",
        },
        {
          question: "Why use Hong Kong material rather than generic examples?",
          answer:
            "Because students have first-hand experience of it — the plants on their campus, how their own district has changed, the population figures — so they can judge whether an AI answer is plausible, and they can generate their own follow-up questions. Local material also serves the curriculum's expectations for knowing the community.",
        },
      ],
    },
    E: {
      intro: [
        "The two worries teachers raise about their first AI lesson are almost always the same: I do not know the tool well enough, and I do not have time to prepare it. The material in this theme assumes you start from nothing — you do not need to become an AI expert first, and your school does not need to buy new equipment.",
        "The first AI lesson is a self-study kit for teachers that walks through preparing and leading that first lesson. One Humanities worksheet, three versions (standard, supported, visual) shows how to hold one task open to different learners in the same room. And P1-P3 PE: two unplugged AI games needs no devices at all, which suits the earliest years or a classroom with very little equipment.",
        "All three assume only what most classrooms already have: a worksheet, a projector, or simply a whiteboard and floor space. That is the practical starting point for an inclusive lesson — get every student into the same activity first, then add the tool where it helps.",
        `The ${SOURCE_GUIDE_EN} and the ${SOURCE_SCENARIOS_EN} are the sources this theme draws on. Everything is free to download with no registration and can be edited into your own class's wording; filter by learning stage and subject below.`,
      ],
      faqs: [
        {
          question: "I have never used AI. Can I still teach this?",
          answer:
            "Yes. The first AI lesson was written as a self-study kit for teachers with no AI experience, and it walks through preparing and leading that first lesson. Work through it once on your own and then take it into class; it is designed to be held in your hand while you teach.",
        },
        {
          question: "Our school has no AI tools or tablets. Can we do this?",
          answer:
            "Yes. The P1-P3 PE unit uses two unplugged games and needs no devices at all, and the other activities can be run with the teacher operating the tool and bringing the results to the class. Several of the learning objectives, such as judging whether an AI claim is reasonable, do not require students to hold a device.",
        },
        {
          question: "How do I handle the range of abilities in one class?",
          answer:
            "One of the resources is built for exactly that. One Humanities worksheet, three versions provides standard, supported and visual versions of the same task, so one piece of work can go to students with different needs without the teacher preparing a separate task per group.",
        },
        {
          question: "How much preparation time does a teacher need?",
          answer:
            "The resources include the worksheets, the lesson steps and teacher notes, so most of the time goes into adjusting the wording for your class. If you have one preparation period, start with the P1-P3 PE unit or the first AI lesson: both come with step-by-step instructions.",
        },
        {
          question: "Is this suitable for students with special educational needs?",
          answer:
            "The three-version design exists so that one task can serve students with different needs, including a visual version and a supported version with the steps broken down. Treat these as a starting point: the adjustment itself is still a decision for the teacher who knows the student.",
        },
      ],
    },
  },
};

export function themePageCopy(locale: Locale, theme: Theme): ThemePageCopy | undefined {
  return THEME_PAGES[locale][theme];
}
