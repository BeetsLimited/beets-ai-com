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
prepTime: "Two lessons (about 40 min each): the repair lab, then the release note and review"
equipment: "Printed worksheets (with the training record and rule); a whiteboard or projector to write the rules on; no AI tool required - the whole lab is done on paper"
author: "BeetsBot"
version: "1.0"
date: 2026-10-15
description: "An unplugged lab for ICT: the class builds a paper recommendation system, spots skewed data, traces each output to its rule, and writes a release note."
image: "/images/biased-ai-lab-repair-hero.webp"
imageAlt: "Three pupils sit at a table sorting a pile of small wooden blocks into a red tray and a blue tray."
downloads: ["/files/en/biased-ai-lab-repair.docx"]
feedback: true
---

## What this solves

The hardest part of teaching AI ethics in a secondary ICT lesson is that the ideas go in but the pupils have nothing to work on: the teacher says "AI can be biased", the pupils nod, but they cannot see where the bias is or what they could change. Getting pupils to try a real AI tool raises privacy and safety concerns, and any company's system changes its behaviour, so the teacher cannot guarantee what the demonstration will show.

This resource turns the question into a **debugging lab done on paper**. The class builds a simple recommendation system themselves - eight old pupils' training data (the old records used to "teach" the system), plus a rule written by "the previous developer". Pupils find the skew in the data, trace how the rule produces a biased output, propose a fix and predict its cost, and finally write a release note.

Because the whole system is one they built, every input and every line of the rule can be seen and changed. What pupils learn is this: **a biased output can be traced back to a choice someone made** - not an empty warning that "AI is dangerous". No AI tool is used at any point, and nothing involves a real pupil, school or product.

This resource can sit inside a school's digital education planning and its School Development Plan, as one unit of ICT teaching and learning with professional judgement built in: pupils build a small machine-learning system from training data of their own and trace how data bias is learned into it.

## Learning objectives

By the end of the two lessons, pupils can:

1. Say that a biased output does not appear from nowhere, but can be traced back to a choice in the data or the rule.
2. Find the skew in a training record: which attribute (each column of a row) is "carrying" the decision and which pupils are not represented, and say that this is a data problem, not a pupil problem.
3. Run the rule step by step on a new example and point to the line of the rule that decided the outcome.
4. Propose a fix (change the rule or the data), say who it helps and who it may disadvantage, and name one thing it still cannot do.
5. Write a release note of four to six sentences: what the system may be used for, what it must not be used for, and when a human must look at the decision.

It targets the reflection on the application of AI strand of AI literacy, asking pupils to apply critical thinking to a system they built themselves and to keep human judgement first.

## Teaching steps

The two lessons total about 80 minutes: the first runs the repair lab, the second writes the release note and reviews.

**Lesson 1 (40 min) - the repair lab**

1. **Introduction (5 min)** - Set the scene: the school wants a small system to decide "should this pupil be recommended for the after-school coding club?". Set the ground rule: every person, school and record is fictional; the lab is offline and uses no AI tool. Write on the board: "rules are written by people, data is chosen by people."
2. **Build the system together (5 min)** - Read the eight old pupils' training record and the rule written by "the previous developer" as a class. Go column by column so everyone follows every word, explaining "attribute" and "label" (the "result" column the system learns to predict) in plain language the first time they appear.
3. **Task 1: find the skew (10 min)** - Pupils use the bias-spotting checklist to circle: which attribute is carrying the decision? Which pupils are not represented? Circulate, prompting "count it, do not go on feeling."
4. **Task 2: trace the rule (10 min)** - Pupils run the rule step by step on two new pupils and fill in the trace table, writing which line of the rule decided each outcome.
5. **Task 3: propose a fix and its cost (10 min)** - Pupils write one change (to the rule or the data), who it helps, who it may disadvantage, and what it still cannot do, in the fix-and-trade-off table. Collect the sheets for lesson 2.

**Lesson 2 (40 min) - the release note and review**

1. **Recap (5 min)** - Ask two or three pupils to share their fix from task 3; summarise on the board that "every change has a cost."
2. **Task 4: write the release note (15 min)** - Pupils use the release-note frame to write four to six sentences (may be used for / must not be used for / when a human must look). This is the assessed deliverable.
3. **Peer sharing (10 min)** - In pairs, pupils swap release notes and use the marking guide to find each other's sentences with a concrete use and a concrete limit; read one or two aloud to the class.
4. **Wrap-up (10 min)** - Discuss as a class: what this system "cannot see" (real interest, a pupil's actual home situation), and who that hurts (a keen pupil with no computer at home). Close with the point that fairness is a design and evidence problem, not "AI is born biased".

## Answer key and marking notes

The material and answers below are fictional. Teachers can use them as they are, or swap in their own school's version (for example, replace "coding club" with any other activity).

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

### Task 1: find the skew

- **The attribute carrying the decision: "computer at home".** Of the six old pupils who stayed and enjoyed it, five (A-E) had a computer at home; "computer at home = Yes" is almost the same as "stayed". Line 1 of the rule uses it, and that line alone decides five cases.
- **The pupils not represented: 1D has no record at all.** Of the eight old pupils, four come from 1A, three from 1B and one from 1C; 1D has none. The system knows nothing about 1D, yet it still has to decide about 1D pupils.
- **This is a data problem, not a pupil problem:** the data only measures what the school recorded - "has a computer", not "is interested". Pupils with a computer are over-represented in the data, which makes the system mistake "has a computer" for the reason they stayed. A good answer names what the data measures and what it leaves out, rather than blaming any pupil.

### Task 2: trace the rule

| Step | New pupil X (1D, has a computer, 0 sessions) | New pupil Y (1D, no computer, 2 sessions) |
|---|---|---|
| Line 1: computer at home = Yes? | Yes, so recommend (stop at line 1) | No, so move to line 2 |
| Line 2: sessions 3 or more? | Not applicable | No (2 is less than 3), so move to line 3 |
| Line 3 | Not applicable | Do not recommend |
| Outcome | Recommend | Do not recommend |
| Which line decided | Line 1 | Line 3 |
| Any problem? | Yes - X never attended a session, yet is recommended only for "having a computer" | Yes - Y attended 2 sessions and comes from 1D (absent from the training data), yet is refused by the threshold and the data gap |

### Task 3: fixes and their costs (examples)

| Change | Who it helps | Who it may disadvantage | What it still cannot do |
|---|---|---|---|
| Replace "computer at home" in line 1 with "sessions attended is 1 or more" | Pupils with no computer at home who are keen and have attended | Pupils who have never attended but are genuinely interested (blocked by the threshold) | Tell why a pupil is interested, or whether the interest will last |
| Add data: include more 1C, 1D and "no computer" old pupils | The classes and the no-computer pupils who were left out | Adding data takes time, so the system may still be wrong for a while; it may also mistake one class's case for the whole class | Guarantee the new data has no new skew of its own |
| Add a human check: every "do not recommend" is talked over with the pupil | Pupils wrongly refused by the system | The teacher's time is limited, so checks may be delayed | Remove human bias entirely (people have bias too) |

A good answer has all four parts: the change, who it helps, who it may disadvantage, and one thing it still cannot do; the "still cannot do" part must be specific (not "it needs to be better"). Writing only "make it fairer" without naming a cost does not meet the goal.

### Release note: marking guide

| Level | What it looks like |
|---|---|
| **Strong** | All four parts present and specific: "may be used for" has an example (such as "flag which pupils might want a taster session"); "must not be used for" names a concrete harm (such as "must not decide who is not allowed to join, or replace talking to the pupil"); "a human must look" has a trigger (such as "when the system says no but the pupil is keen"). |
| **Developing** | Only two or three parts are written, or all parts are there but vague ("use it carefully", "a human should check sometimes"), with no concrete use or limit. |
| **Needs help** | Only one sentence like "the system is better now", or the task is restated in other words, with no use or limit. |

### What not to grade

- **Do not grade how "big" the fix is.** A small fix whose cost is stated is better than a "perfect" plan whose cost is not.
- **Do not grade whether a pupil used an AI tool, and do not grade whether the answer is "politically correct".** What is scored is: spotting the skew in the data, tracing the rule, proposing a cost-aware fix, and writing a release note with limits.
- **Do not assume that mentioning "a computer at home" touches family wealth or sensitive data.** It is just one attribute in a school record; the discussion is about who the data represents, not about any pupil's home.

## Files

The worksheet and the full answer notes are in the download file:

**[Worksheet and answer notes (editable Word document)](/files/en/biased-ai-lab-repair.docx)** - includes the eight old pupils' training record, the rule as written, the bias-spotting checklist, the trace table, the fix-and-trade-off table, the release-note frame and the full answer notes.

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
