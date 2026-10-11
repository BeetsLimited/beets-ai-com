import type { Locale } from "./i18n";
import type { Audience } from "./schema";

/**
 * Long-form copy for the three audience index pages (對象) — the part that is
 * written, not derived from the content collection.
 *
 * An audience page is built like a theme page: the heading and the
 * one-sentence need come from `AUDIENCE_INFO`, the hero from the audience's own
 * home-page illustration, and this file adds the **description** (element 4:
 * more context, written in the words the audience itself searches with, so the
 * page can be found and quoted) and the **FAQs** (element 6: the questions
 * people actually ask, answered on the page — the same text goes out as FAQ
 * structured data, which is what an AI answer engine reads).
 *
 * `tests/audience-pages.test.ts` holds the shape any entry must arrive in, in
 * both languages, for every audience.
 *
 * **Accuracy rules for this copy** (it is public, and it is about official
 * documents):
 * - Name the official documents by their own published titles, in each language.
 *   Never translate a title, never invent one — see the workflow skill's
 *   `references/edb-source-documents.md`.
 * - Describe what those documents are FOR; do not assert specific requirements,
 *   hour counts, deadlines or figures that would have to be checked against the
 *   documents first.
 * - Say plainly that this is an independent initiative, not an official EDB
 *   publication.
 * - Only promise material that actually exists in the library. If a resource
 *   named below is ever retired, this copy has to change with it.
 */

export interface AudienceFaq {
  question: string;
  answer: string;
}

export interface AudiencePageCopy {
  /** Paragraphs, in order. Rendered as prose, not as a bullet list. */
  intro: string[];
  /** Four to five questions, answered on the page. */
  faqs: AudienceFaq[];
}

const ZH_TEACHERS: AudiencePageCopy = {
  intro: [
    "這一頁集中所有以教師為對象的資源：需要在課室施教、在課程會議上規劃，或把 AI 納入某一科某一級時，都可以在這裡找到可以直接下載、按校情修改的教案、工作紙、評估任務與規劃範例。上方可按主題、對象、學習階段、科目或關鍵字篩選，只留下你真正需要的那幾份。",
    "資源的依據是香港的官方文件，主要是《中小學人工智能素養學習架構》與《中小學數字教育發展藍圖》：前者描述中小學生在人工智能素養上的學習重點，後者說明學校數字教育的整體發展方向。每份資源都會列明它參考了哪份文件及相關頁數，你可以回到原始文件核對，不必只信我們的整理。",
    "如果你不確定從哪一份開始：要交學期規劃或做課程檢視，先看「一學期 AI 教育規劃」範本與「課程覆蓋分析」；明天就要上第一堂 AI 課，先看「第一堂 AI 課」自學套件；課室器材有限或不想用裝置，先看 P1–P3 體育的兩個不插電遊戲；要把學生的功課或資料交給 AI 工具之前，先看「上載前安全檢查」。",
    "全部資源免費下載、不需註冊，附件是 Word、Excel 或 PowerPoint 檔案，下載後可直接改寫成你學校的版本。若你在這裡找不到需要的材料，可以在頁面底部的意見區提出，我們會按需求排先後。",
  ],
  faqs: [
    {
      question: "這些資源要收費或登記嗎？",
      answer:
        "全部免費，下載不需註冊，也沒有隱藏收費。附件以 Word、Excel 或 PowerPoint 格式提供，下載後可以直接修改成你學校的版本；你亦可以把連結分享給同事。",
    },
    {
      question: "資源是教育局發布的官方文件嗎？",
      answer:
        "不是。這是 Beets Limited 的獨立資源計劃，並非教育局官方文件。每份資源都會列明它所依據的官方文件，例如《中小學人工智能素養學習架構》，方便你回到原始文件核對細節。",
    },
    {
      question: "我從未用過 AI，可以從哪一份開始？",
      answer:
        "建議先看「第一堂 AI 課」自學套件：它包含一個 40 分鐘的示範課堂、課前準備清單、投影片逐頁大綱、學生工作紙與課後反思三問，讓你可以自行備課後直接上課。若班上有學習多樣性，可再取「同一份人文科工作紙，三個版本」的分層設計。",
    },
    {
      question: "怎樣找到適合某一級或某一科的資源？",
      answer:
        "用上方的篩選器：主題、對象、學習階段和科目可以同時使用，你所選的每一組條件都要符合。例如選「P4-P6」加「科學」，就只會留下這個階段與科目的資源；關鍵字一欄可以搜尋標題和簡介，例如「人口」或「私隱」。",
    },
    {
      question: "可以直接改編成自己學校的版本嗎？",
      answer:
        "可以。資源供教學使用及改編，請保留來源標示，寫明材料來自 Beets AI（Beets Limited）。改編後的版本不需要交回給我們，但如果你願意告訴我們改了什麼，會幫我們把下一份做得更合用。",
    },
  ],
};

const EN_TEACHERS: AudiencePageCopy = {
  intro: [
    "This page gathers every resource that is made for teachers. Whether you are teaching the lesson tomorrow, planning a term of AI education, or working out what one subject and year group can take on, the materials here — lesson plans, worksheets, assessment tasks and planning templates — are ready to download and adapt to your own school. Use the filters above to narrow the list by theme, audience, learning stage, subject or keyword.",
    "The resources are built on Hong Kong's official documents, above all the AI Literacy Learning Framework for Primary and Secondary Schools, which sets out the learning foci for AI literacy, and the Blueprint for Digital Education Development in Primary and Secondary Schools, which describes the overall direction for digital education in schools. Every resource names the document and the pages it draws on, so you can check our summary against the original rather than taking it on trust.",
    "If you are not sure where to start: for a term plan or a curriculum review, begin with the one-term AI education plan template and the curriculum coverage analysis; for a first AI lesson tomorrow, begin with the first AI lesson self-study kit; if the classroom has little equipment or you would rather not use devices, begin with the two unplugged P1-P3 PE games; and before any pupil work goes into an AI tool, begin with the safe-to-upload rehearsal.",
    "Everything is free to download and needs no registration. Attachments are Word, Excel or PowerPoint files you can edit straight away. If the material you need is not here, use the feedback form at the bottom of the page and we will prioritise it.",
  ],
  faqs: [
    {
      question: "Does this cost anything, or need an account?",
      answer:
        "No. Every resource is free to download with no registration and no hidden charge. Attachments come as Word, Excel or PowerPoint files you can edit immediately, and you are welcome to share the links with colleagues.",
    },
    {
      question: "Is this official EDB material?",
      answer:
        "No. This is an independent resource initiative by Beets Limited and not an official EDB publication. Each resource names the official document it draws on — the AI Literacy Learning Framework for Primary and Secondary Schools, for example — so you can check the detail at source.",
    },
    {
      question: "I have never used AI. Where should I start?",
      answer:
        "Start with the first AI lesson self-study kit. It contains a 40-minute demonstration lesson, a preparation checklist, a slide-by-slide plan, a pupil worksheet and three reflection questions, so you can prepare and teach a first AI lesson on your own. If your class spans a range of abilities, add the three-version Humanities worksheet.",
    },
    {
      question: "How do I find resources for one year group or subject?",
      answer:
        "Use the filters above. Theme, audience, learning stage and subject can be combined, and every group you set has to be met — choosing P4-P6 and Science leaves only that stage and subject. The keyword box searches titles and descriptions, so a word like population or privacy will find the relevant items.",
    },
    {
      question: "May I adapt a resource for my own school?",
      answer:
        "Yes. Download and adapt these resources freely for teaching; please keep the attribution to Beets AI (Beets Limited). You do not need to send your version back to us, but telling us what you changed helps us make the next one more useful.",
    },
  ],
};

const ZH_PARENTS: AudiencePageCopy = {
  intro: [
    "這一頁收集以家長為對象的資源。現時最主要的一份是「家庭 AI 功課指引：三個活動、一份協議、一封家長通告」：三個 15–20 分鐘、在家中就可以完成的親子活動，一份一家人可以一起訂立的家庭功課協議，還有一封學校可以直接修改使用的家長通告。",
    "我們做這些材料的起點很簡單：子女用 AI 做功課時，家長最想知道的通常不是「AI 是什麼」，而是「應該容許到什麼程度」，以及「交回學校的功課，還是不是他自己做的」。指引把這些問題變成幾件可以一起做的事：先講清楚哪些可以用，再一起決定怎樣檢查。",
    "家庭功課協議就是為此而設的一頁紙：由家長和子女一起填寫，寫明哪些功課可以用 AI、可以用來做什麼、交之前要檢查什麼，以及不確定的時候找誰問。它不會替你決定界線，而是把界線寫下來，讓一家人不必每晚重新爭論同一件事。",
    "全部免費下載、不需註冊，也不會有隱藏收費。這份指引的設計是在家使用，不需要老師在場；如果你是老師，同一份材料也放在教師資源中，當中的家長通告可以直接改成你學校的版本發出。",
  ],
  faqs: [
    {
      question: "子女用 AI 做功課，家長應該完全禁止嗎？",
      answer:
        "這不是一道是非題，答案取決於功課本身和學校的要求。本頁的指引提供的是活動與一份協議，讓你和子女把界線寫清楚——哪些功課可以用 AI、可以用來做什麼、交之前要看什麼——而不是替你的家庭定規矩。",
    },
    {
      question: "這份指引是在學校用，還是在家中用？",
      answer:
        "設計上是在家中使用，不需要老師在場：活動以 15–20 分鐘為一個單位，由家長和子女一起完成。同一份材料亦包含一封家長通告，學校可以直接修改後發給家長。",
    },
    {
      question: "這些材料是教育局的規定嗎？",
      answer:
        "不是。這是 Beets Limited 的獨立資源計劃，並非教育局官方文件。我們把香港官方文件（例如《中小學人工智能素養學習架構》）的內容整理成家庭可以使用的做法，你可以在每份資源看到它所依據的文件。",
    },
    {
      question: "我的孩子讀小一，這份指引也適合嗎？",
      answer:
        "指引以 15–20 分鐘的小活動為單位，內容按小學階段的家庭設計，年紀較小的孩子需要家長在旁一起操作。中學生的家長仍可使用同一份家庭功課協議與檢查步驟，但活動內容需要自行調整。",
    },
    {
      question: "我自己不熟悉 AI 工具，可以怎樣開始？",
      answer:
        "先做第一項活動就可以：家長與子女用同一條問題向 AI 提問，再一起看看答案有沒有交代來源、有沒有把不確定的事說得太肯定。你不需要先學會用工具，活動本身就是一起學的過程。",
    },
  ],
};

const EN_PARENTS: AudiencePageCopy = {
  intro: [
    "This page collects the resources made for parents. The main one today is the Family AI homework guide, with three separate activities: three 15-20 minute activities you can do at home with your child, a family homework agreement you fill in together, and a parent notice a school can adapt and send out.",
    "The starting point is simple. When a child uses AI for homework, what a parent usually wants to know is not what AI is, but how much of it should be allowed, and whether the work handed in is still the child's own. The guide turns those two questions into a few things you can do together: agree what is allowed first, then agree how you will check.",
    "The family homework agreement is one page for exactly that. Parent and child fill it in together and write down which homework AI may be used for, what it may be used to do, what has to be checked before the work is handed in, and who to ask when nobody is sure. It does not decide the boundary for you — it writes the boundary down, so the family does not have to argue it out again every evening.",
    "Everything is free to download and needs no registration. The guide is designed to be used at home, with no teacher present. If you are a teacher, the same material also sits in the teacher resources, and the parent notice in it can be adapted for your school and sent out.",
  ],
  faqs: [
    {
      question: "Should parents ban AI for homework altogether?",
      answer:
        "There is no single answer: it depends on the task and on what the school asks for. What this page offers is an activity and an agreement that let you and your child write the boundary down — which homework AI may be used for, what it may do, what to check before handing work in — rather than a rule imposed on your family.",
    },
    {
      question: "Is the guide for school, or for home?",
      answer:
        "It is designed for home use, with no teacher present: the activities are built in 15-20 minute units for a parent and child to do together. The same material also contains a parent notice that a school can adapt and send out.",
    },
    {
      question: "Is this an official EDB requirement?",
      answer:
        "No. This is an independent resource initiative by Beets Limited and not an official EDB publication. We turn the content of Hong Kong's official documents — the AI Literacy Learning Framework for Primary and Secondary Schools, for example — into things a family can actually do, and each resource names the document it draws on.",
    },
    {
      question: "My child is in P1. Is the guide suitable?",
      answer:
        "The guide is built from 15-20 minute activities and is written for primary-age families, so a younger child will need an adult working alongside them. Parents of secondary students can still use the family homework agreement and the checking steps, but the activities themselves will need adjusting.",
    },
    {
      question: "I do not know much about AI tools. How do I start?",
      answer:
        "Start with the first activity. Parent and child ask the same question of the same AI, then look at the answer together and ask whether it named a source and whether it sounded more certain than the evidence supports. You do not need to learn the tool first: the activity is how you learn it.",
    },
  ],
};

const ZH_STUDENTS: AudiencePageCopy = {
  intro: [
    "這一頁收集你可以自己直接使用的資源：核對 AI 給你的答案、記錄你怎樣用 AI、做專題時一步一步跟着做的紀錄表和工作紙。這些不是給老師或家長看的說明，而是你真的會寫在上面的東西。",
    "AI 可以很快給你一個答案，但快不等於準確：它有時沒有交代來源，有時把不確定的事用一個聽起來很肯定的說法講出來。這裡的幾份資源練的都是同一件事——先問來源，再對照官方資料，最後自己寫下確認過的結論。",
    "不知道從哪一份開始？做數學或常識專題之前，先用「學生 AI 使用歷程表」記下第一次嘗試、你用過的提示、核對結果與最後的修訂；要找出 AI 的錯處，用「十分鐘 AI 判斷小測」；做香港本地專題（例如香港人口、香港今昔）時，頁面裡有可以直接跟着做的步驟與評分表。",
    "全部免費下載、不需註冊，也沒有隱藏收費。附件可以列印，也可以在電腦上填寫；工作紙和紀錄表都寫成可以直接交回學校的形式。如果你覺得某一份不夠清楚，歡迎用頁面底部的意見區告訴我們，我們會優先處理。",
  ],
  faqs: [
    {
      question: "使用這些工作紙需要註冊或付費嗎？",
      answer:
        "不需要。全部免費下載，不用註冊，也沒有隱藏收費。附件可以列印，也可以在電腦上直接填寫；部分紀錄表以表格檔案提供，方便你重複使用。",
    },
    {
      question: "AI 給我的答案，怎樣知道可不可信？",
      answer:
        "養成三個習慣：第一，要求它提供來源；第二，拿它給的數字或說法去對照官方資料，例如政府統計處的數據；第三，把你親自確認過的部分寫下來。遇到沒有來源、卻說得很肯定的句子，先當作未確認，而不是事實。",
    },
    {
      question: "這些資源是教育局發布的嗎？",
      answer:
        "不是。這是 Beets Limited 的獨立資源計劃，並非教育局官方文件。我們把《中小學人工智能素養學習架構》等官方文件的內容，整理成學生可以直接使用的步驟，你可以在每份資源看到它參考了哪份文件。",
    },
    {
      question: "我可以把填好的紀錄表交回學校嗎？",
      answer:
        "可以。工作紙與歷程表都按課堂或家課的形式設計，老師可以直接看到你的第一次嘗試、核對過程與修訂；如果不確定要用哪一頁，先問你的老師。",
    },
    {
      question: "可以把這些檔案分享給同學嗎？",
      answer:
        "可以。資源供教學使用及改編，請保留來源標示。把連結分享給同學比自己傳檔案好，他們會拿到最新版本。",
    },
  ],
};

const EN_STUDENTS: AudiencePageCopy = {
  intro: [
    "This page collects the resources you can use yourself: for checking what an AI tells you, for recording how you used it, and for working through a project step by step with a record sheet and a worksheet. These are not explanations for a teacher or a parent — they are the pages you actually write on.",
    "An AI can give you an answer very quickly, but quick does not mean accurate. Sometimes it does not say where a number came from, and sometimes it states something uncertain in a way that sounds certain. The resources here practise one thing: ask for the source first, then compare it with official data, then write down the conclusion you checked yourself.",
    "Not sure where to begin? Before a maths or general studies project, start with the student AI use process sheet, which records your first attempt, the prompts you used, what you checked and what you changed; to hunt for an AI's mistakes, use the ten-minute AI judgement checks; and for a Hong Kong project such as population or then-and-now local history, the steps and marking schemes are ready to follow.",
    "Everything is free and needs no registration. Attachments can be printed or filled in on a computer, and the worksheets and record sheets are written so they can be handed in as they are. If one of them is not clear, tell us through the feedback form at the bottom of the page.",
  ],
  faqs: [
    {
      question: "Do I need an account or a payment to use these?",
      answer:
        "No. Everything is free to download, with no registration and no hidden charge. Attachments can be printed or filled in on a computer, and some record sheets come as spreadsheet files so you can reuse them.",
    },
    {
      question: "How do I know whether an AI answer is trustworthy?",
      answer:
        "Build three habits. First, ask it for a source. Second, take the number or the claim it gave you and compare it with official data, such as figures from the Census and Statistics Department. Third, write down the part you checked yourself. A confident sentence with no source is unconfirmed, not a fact.",
    },
    {
      question: "Is this material published by the EDB?",
      answer:
        "No. This is an independent resource initiative by Beets Limited and not an official EDB publication. We turn the content of official documents such as the AI Literacy Learning Framework for Primary and Secondary Schools into steps a student can use directly, and each resource names the document it draws on.",
    },
    {
      question: "Can I hand in the record sheet I filled in?",
      answer:
        "Yes. The worksheets and the process sheet are written as classwork or homework, so a teacher can see your first attempt, how you checked it and what you changed. If you are unsure which page to use, ask your teacher.",
    },
    {
      question: "May I share the files with classmates?",
      answer:
        "Yes — the resources may be used and adapted for teaching, so please keep the attribution. Sharing the link with classmates is better than sending the file, because they will get the current version.",
    },
  ],
};

export const AUDIENCE_PAGES: Record<Locale, Partial<Record<Audience, AudiencePageCopy>>> = {
  "zh-HK": {
    teachers: ZH_TEACHERS,
    parents: ZH_PARENTS,
    students: ZH_STUDENTS,
  },
  en: {
    teachers: EN_TEACHERS,
    parents: EN_PARENTS,
    students: EN_STUDENTS,
  },
};

export function audiencePageCopy(locale: Locale, audience: Audience): AudiencePageCopy | undefined {
  return AUDIENCE_PAGES[locale][audience];
}
