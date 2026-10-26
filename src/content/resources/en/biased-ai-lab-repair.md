---
title: "S1-S3 ICT: repair the biased AI (four debugging tasks)"
metaTitle: "Repair the biased AI: an S1-S3 ICT lesson"
address: "biased-ai-lab-repair"
lang: "en"
type: "resource"
kind: "lesson"
theme: "B"
audience: [teachers, students]
stage: "S1-S3"
subject: "ICT"
sourceIdea: "#20"
sources: ["F, p.1-13", "G, p.2-9"]
prepTime: "1 lesson (60 min)"
equipment: "Printed worksheets (with the training record, the rule and the answer pages); a whiteboard or projector to write the rules on; no AI tool required - the whole lab is done on paper"
author: "BeetsBot"
version: "1.0"
date: 2026-10-15
description: "An unplugged lab for ICT: the class builds a paper recommendation system, spots skewed data, traces each output to its rule, and writes a release note. Includes four worked answers, a full model answer, a below-standard contrast, three pupils' own work marked, and a sixty-second marking routine."
metaDescription: "An unplugged ICT lab: build a paper recommendation system, find the data skew, trace the rule, propose a fix and write a release note."
image: "/images/biased-ai-lab-repair-hero.webp"
imageAlt: "Three pupils sit at a table sorting a pile of small wooden blocks into a red tray and a blue tray."
downloads: ["/files/en/biased-ai-lab-repair.docx"]
feedback: true
---

| Key learning area | Learning elements | Points to note when using AI |
|---|---|---|
| Technology Education | information processing, programming, debugging | Data bias: bias can be traced back to a choice made in the training data or in a rule, and a biased output is not a fact; check it (fact-check). |

## What this solves

The hardest part of teaching AI ethics in a secondary ICT lesson is that the ideas go in but the pupils have nothing to work on: the teacher says "AI can be biased", the pupils nod, but they cannot see where the bias is or what they could change. Getting pupils to try a real AI tool raises privacy and safety concerns, and any company's system changes its behaviour, so the teacher cannot guarantee what the demonstration will show.

This resource turns the question into a **debugging lab done on paper**. The class builds a simple recommendation system themselves - eight old pupils' training data (the old records used to "teach" the system), plus a rule written by "the previous developer". Pupils find the skew in the data, trace how the rule produces a biased output, propose a fix and predict its cost, and finally write a release note.

Because the whole system is one they built, every input and every line of the rule can be seen and changed. What pupils learn is this: **a biased output can be traced back to a choice someone made** - not an empty warning that "AI is dangerous". No AI tool is used at any point, and nothing involves a real pupil, school or product.

This resource can sit inside a school's digital education planning and its School Development Plan, as one unit of ICT teaching and learning with professional judgement built in: pupils build a small machine-learning system from training data of their own and trace how data bias is learned into it.

## Learning objectives

By the end of the lesson, pupils can do these five things. Each one is an action the teacher can see or hear, so nothing here depends on an impression:

1. Point at the training record, count how many of the six old pupils whose result is "Yes" had a computer at home, and say that "computer at home" is the attribute carrying the decision.
2. Circle "1D has no record at all" and say in one sentence that this is a data problem, not a pupil problem.
3. Run the three-line rule step by step on new pupils X and Y and point to Line 1 and Line 3 as the lines that decided their results.
4. Write one change on the worksheet and, in the same row, who it helps, who it may disadvantage, and one thing it still cannot do.
5. Write a release note of four to six sentences, with at least one sentence naming what the system must not be used for and one naming when a human must look.
6. Read someone else's answer and say which of the four columns are there and which one is missing.

It targets the reflection on the application of AI strand of AI literacy, asking pupils to apply critical thinking to a system they built themselves and to keep human judgement first.

## Teaching steps

One 60-minute lesson in four segments (10 / 15 / 15 / 20). The worksheet's answer pages are four pages, and the teacher does not need to talk the class through them: each page opens with one instruction, and a pupil who can read it can start.

1. **Set the scene and build the system (10 min)** — Set the scene: the school wants a small system to decide "should this pupil be recommended for the after-school coding club?". Set the ground rule: every person, school and record is fictional; the lab is offline and uses no AI tool. Write on the board: "rules are written by people, data is chosen by people." Read the eight old pupils' training record and the rule written by "the previous developer" as a class. Go column by column so everyone follows every word, explaining "attribute" and "label" (the "result" column the system learns to predict) in plain language the first time they appear.
2. **Find the skew and trace the rule (15 min)** — Pupils answer the bias-spotting checklist: each of the four questions has a "my count" box beside it, and the count is filled in before the sentence — an answer with no count is not finished. Circulate, prompting "count it, do not go on feeling". Pupils then run the rule step by step on the two new pupils and fill in the trace table, writing which line of the rule decided each outcome.
3. **Propose a fix and its cost (15 min)** — First look at the worksheet's "fix and trade-off" model page (one row already filled in, all four columns complete), then turn to the blank page and write their own row: one change (to the rule or the data), who it helps, who it may disadvantage, and what it still cannot do. Collect the sheets for the release note. Ask two or three pupils to share their fix from task 3; summarise on the board that "every change has a cost."
4. **Write the release note and review (20 min)** — Pupils use the release-note frame to write four to six sentences (may be used for / must not be used for / when a human must look); three hint lines under the frame say how specific each sentence has to be. This is the assessed deliverable. In pairs, pupils swap release notes and look for each other's sentences with a concrete use and a concrete limit; read one or two aloud to the class. Discuss as a class: what this system "cannot see" (real interest, a pupil's actual home situation), and who that hurts (a keen pupil with no computer at home). Close with the point that fairness is a design and evidence problem, not "AI is born biased".

After the lesson, the teacher reads each sheet once with the sixty-second marking routine below — one minute a sheet.

## Answer key and marking notes

The answers below are given as **models**: first what a correct answer looks like (four questions, four answers), then a full model answer to task 3, then a below-standard contrast, and finally three pupils' own work to mark. All people, schools and data are fictional. Teachers can use them as they are, or swap in their own school's version (for example, replace "coding club" with any other activity).

### Material: the training record and the rule (as printed in the worksheet)

| Old pupil | Class | Computer at home (school record) | Sessions attended | Adult can collect (school record) | Result: stayed and enjoyed |
|---|---|---|---|---|---|
| A | 1A | Yes | 3 | Yes | Yes |
| B | 1A | Yes | 2 | Yes | Yes |
| C | 1B | Yes | 3 | No | Yes |
| D | 1B | Yes | 1 | Yes | Yes |
| E | 1A | Yes | 2 | Yes | Yes |
| F | 1C | No | 3 | Yes | No |
| G | 1B | No | 3 | No | Yes |
| H | 1A | No | 0 | No | No |

Rule (written by the previous developer):

- Line 1: if "computer at home" = Yes, then recommend
- Line 2: else, if "sessions attended" is 3 or more, then recommend
- Line 3: else, do not recommend

### Four questions, four answers (task 1)

These are the four questions on the worksheet's bias-spotting checklist. Every model answer carries a count, because a sentence with no count cannot be told apart from a hunch.

**Question 1: which attribute is "carrying" the decision?**

Answer (model): "Computer at home". Six old pupils have the result "Yes" (A, B, C, D, E, G) and five of them had a computer (A, B, C, D, E); only G did not. So "has a computer" is almost the same as "stayed" - and Line 1 of the rule uses exactly that, so that one line decides five cases.

My count: 5 out of 6.

**Question 2: which pupils are not represented?**

Answer (model): All of 1D. Of the eight old pupils, four come from 1A (A, B, E, H), three from 1B (C, D, G) and one from 1C (F); 1D has none. The system knows nothing about 1D, yet it still has to decide about X and Y in 1D.

My count: 1D = 0 pupils.

**Question 3: what does the data measure, and what does it leave out?**

Answer (model): The data measures the four things the school recorded - class, whether there is a computer at home, how many sessions were attended, whether an adult can collect. What it leaves out is "is the pupil interested" and "why do they want to come", which is the question the system was built to answer. So the fact that many pupils in the data have a computer does not make "has a computer" the reason.

My count: 0 of 4 columns measure interest.

**Question 4: is this a data problem or a pupil problem, and why?**

Answer (model): A data problem. F attended 3 sessions and was clearly interested, and was recorded as "No" only because there was no computer at home. What went wrong is what the record chose to keep and what it left out - not F.

My count: 1 pupil recorded wrongly (F) - 3 sessions attended, 0 support for that result.

All four answered, each with a count, is task 1 met. "This system is biased" with no count does not meet it: that sentence names neither the column nor the pupils.

### Task 2: trace the rule (model)

What matters is not "recommend / do not recommend" but which line.

| Step | New pupil X (1D, has a computer, 0 sessions) | New pupil Y (1D, no computer, 2 sessions) |
|---|---|---|
| Line 1: computer at home = Yes? | Yes, so recommend (stop at line 1) | No, so move to line 2 |
| Line 2: sessions 3 or more? | Not applicable | No (2 is less than 3), so move to line 3 |
| Line 3 | Not applicable | Do not recommend |
| Outcome | Recommend | Do not recommend |
| Which line decided | Line 1 | Line 3 |
| Any problem? | Yes - X never attended a session, yet is recommended only for "having a computer" | Yes - Y attended 2 sessions and comes from 1D (absent from the training data), yet is refused by the threshold and the data gap |

### Task 3: a full model answer

An answer that meets the goal writes all four columns as sentences someone could check:

| Change | Who it helps | Who it may disadvantage | What it still cannot do |
|---|---|---|---|
| Replace "computer at home = Yes" in line 1 with "sessions attended is 1 or more". | Pupils with no computer at home who are interested and have attended at least once, such as F. | Pupils who never attended but genuinely wanted to - they are still stopped by line 2 (3 sessions or more), for example a pupil who was ill for the whole term. | It does not know why a pupil wants to join, or whether that interest will last; this rule only sees attendance. |

Why this row meets the goal: all four columns say something specific; "who it may disadvantage" names which kind of pupil and why they are stopped; "what it still cannot do" names something this rule cannot see (motivation, persistence) rather than "it needs to be better".

### Task 3: the below-standard contrast

The same change, written like this:

| Change | Who it helps | Who it may disadvantage | What it still cannot do |
|---|---|---|---|
| Make the rule better so it is fairer. | All pupils. | Some pupils may be unhappy. | It needs to be better. |

What is missing: not one of the four columns can be checked. "Fairer" is which line changed to what? "All pupils" helps no one in particular; "some pupils may be unhappy" does not say who or why; "it needs to be better" is a wish, not a thing the rule cannot do. Marked: below standard - four columns, nothing in them.

### Three pupils' own work, marked

The three pieces below are pupils' own words (typos corrected, wording kept), marked together with the release note. Teachers can mark them first and then compare.

**Piece 1**

> I changed line 1 to "sessions attended is 1 or more". That helps people like F who have no computer but did come to sessions. But people who never came are still blocked, like the one who was ill all term. The system still doesn't know if they actually want to join.
>
> Release note: this system may only be used to tell a teacher which pupils might want a taster session. It must not be used to decide who is not allowed to join. If the system says do not recommend but the teacher knows the pupil is keen, the teacher has to talk to the pupil in person.

Marked: **meets the goal**. Why: the change names the line and the new wording; "who it helps" has a real pupil (F); "who it may disadvantage" names a real case (ill all term); the release note has all three things - a use, a prohibition, and a trigger for a human to look.

**Piece 2**

> I changed line 1 to sessions attended is 1 or more, so pupils without a computer get a chance too. It might make some pupils unhappy.
>
> Release note: this system can be used to help teachers pick pupils for the coding club, but use it carefully, and a teacher should look again.

Marked: **developing**. Why: the change is specific (present); "who it may disadvantage" is vague - which pupils, and why unhappy (missing); "what it still cannot do" is not written (missing); the release note has a use, but "use it carefully" and "should look again" name no trigger (half).

**Piece 3**

> I changed the rule and now it is much fairer, the AI won't be biased any more.
>
> Release note: this system is very good, it can help teachers.

Marked: **needs help**. Why: it does not say which line changed or to what; helps / disadvantages / still cannot do are all empty; "the AI won't be biased any more" is not a claim that holds - the rule is written by people, and people still have bias; the release note has no use and no limit.

| Piece | Judgement | The reason at a glance | What to do in class |
|---|---|---|---|
| 1 | Meets the goal | All four columns checkable; release note has a use, a prohibition and a trigger | Read it aloud as the class example |
| 2 | Developing | Change is specific, but "who it may disadvantage" is vague and "still cannot do" is missing | Ask one question: "who is unhappy, and why?" |
| 3 | Needs help | No line named; "won't be biased" does not hold | Back to line 1: ask the pupil to point at the rule and say which word changes |

### The teacher's sixty-second marking routine

One sheet means reading four columns and one release note - a minute is enough. The order is fixed: **do not start at the first line**; read the "change" column first and most of the work is already decided.

1. **0-10 s | Read "change".** Does it say which line changes and to what? If not, mark "needs help" and stop reading.
2. **10-25 s | Read "who it helps".** Is there a person or a kind of pupil you could point at? "All pupils" counts as empty.
3. **25-40 s | Read "who it may disadvantage" and "what it still cannot do".** Both must be filled; the second must name something the rule itself cannot see (motivation, persistence, home situation), not "it needs to be better".
4. **40-50 s | Read the release note.** Look for three things: a concrete use, a concrete prohibition, and a trigger for "a human must look".
5. **50-60 s | Write one next step.** One thing to add next time, for example "add 'still cannot do': this rule cannot see why a pupil wants to join". No long comments on the sheet.

Three levels only: all four columns plus all three parts of the release note = **meets the goal**; one or two missing = **developing**; the "change" column already uncheckable = **needs help**.

### What not to grade

- **Do not grade how "big" the fix is.** A small fix whose cost is stated is better than a "perfect" plan whose cost is not.
- **Do not grade whether a pupil used an AI tool, and do not grade whether the answer is "politically correct".** What is scored is: spotting the skew in the data, tracing the rule, proposing a cost-aware fix, and writing a release note with limits.
- **Do not assume that mentioning "a computer at home" touches family wealth or sensitive data.** It is just one attribute in a school record; the discussion is about who the data represents, not about any pupil's home.

## Files

The worksheet and the full answer notes are in the download file:

**[Worksheet and answer notes (editable Word document)](/files/en/biased-ai-lab-repair.docx)** - includes the eight old pupils' training record, the rule as written, the bias-spotting checklist with a "my count" column, the trace table, the "fix and trade-off" model page and blank page (on separate pages), the release-note frame with its three hint lines, and the reordered answer pages: four questions and four answers, the full model answer, the below-standard contrast, three pupils' work marked, and the sixty-second marking routine.

> All people, schools and data are fictional and do not involve any real pupil, school or AI product; the whole lab is done on paper, with no AI tool used.

## Official documents

Every resource in this library is written to the AI Literacy Learning Framework for Primary and Secondary Schools and falls within the policy scope of the Blueprint for Digital Education Development in Primary and Secondary Schools.

This resource maps to:

- **Supplement I: AI Literacy Learning Framework for Primary and Secondary Schools** (p.1-13): covers the ethics and responsibility strand of AI literacy, asking learners to understand that AI systems are designed by people, that their outputs can be traced back to design choices, and to be aware of data, bias and fairness.
- **Supplement II: Guide to Using AI in Teaching in Primary and Secondary Schools** (p.2-9): prompts teachers to guide pupils toward safe and responsible AI use through activities and discussion, building judgement by doing rather than by being told.

**Learning strand**: fundamental operating principles of AI

Official documents page: <https://www.edb.gov.hk/en/edu-system/primary-secondary/applicable-to-primary-secondary/it-in-edu/debp.html>

> This page is an independent Beets teaching resource, not an official EDB document.

## Feedback

If you have any comments or questions about this resource, or an idea for the next one, tell us on the [feedback page](/en/feedback/).
