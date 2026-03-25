# Course Authoring Guide

Welcome, course author! 👋 This guide covers everything you need to create engaging, effective courses for CraftMind.

## Quick Start

1. Copy `courses/redstone-basics.json` as a template
2. Modify the `id`, `title`, `description`, and `lessons`
3. Place your file in `courses/`
4. Run with: `node src/index.js --course courses/your-course.json`

## Course Structure

```json
{
  "id": "unique-course-id",
  "title": "Human-Readable Title",
  "description": "One or two sentences about what students will learn.",
  "author": "Your Name",
  "lessons": [ ... ]
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (kebab-case, used for progress files) |
| `title` | string | Display name shown to students |
| `description` | string | Course overview (shown at start) |
| `author` | string | Your name or team |
| `lessons` | array | Ordered list of lesson objects |

## Lesson Structure

```json
{
  "id": "lesson-unique-id",
  "title": "Lesson Title",
  "description": "What this lesson covers",
  "objectives": ["Learn X", "Build Y", "Understand Z"],
  "prerequisites": ["lesson-previous-id"],
  "difficulty": 1,
  "estimatedMinutes": 15,
  "steps": [ ... ],
  "quiz": [ ... ],
  "worldTemplate": { ... }
}
```

### Lesson Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique within the course |
| `title` | string | ✅ | Shown when lesson starts |
| `description` | string | ✅ | Overview of what student will do |
| `objectives` | string[] | ✅ | 2-4 learning goals, listed in chat |
| `prerequisites` | string[] | ✅ | IDs of lessons that must be completed first |
| `difficulty` | number | ✅ | 1 (beginner) to 5 (expert) |
| `estimatedMinutes` | number | ✅ | Approximate time to complete |
| `steps` | array | ✅ | Ordered steps the student follows |
| `quiz` | array | ❌ | Questions asked after steps are complete |
| `worldTemplate` | object | ❌ | Auto-built structures for this lesson |

## Step Types

Steps are the core of each lesson. Each step has:

- **`type`** (required): determines what happens
- **`description`** (required): instruction text shown to student
- **`target`** (optional): coordinate object `{x, y, z}` for navigation

### All Supported Types

#### `navigate_to` — Go to a location
```json
{
  "type": "navigate_to",
  "description": "Walk to the crafting area",
  "target": { "x": 10, "y": 64, "z": 20 }
}
```
The teacher tells the student coordinates to walk to. Use this to guide movement between stations.

#### `build_block` — Build something
```json
{
  "type": "build_block",
  "description": "Place 5 oak planks in an L-shape for the chair frame"
}
```
The student builds blocks following instructions. Be specific about what, where, and how many.

#### `interact_npc` — Talk to an NPC
```json
{
  "type": "interact_npc",
  "description": "Talk to ProfBlock to explain what you observed about the circuit"
}
```
Pauses for discussion. The student chats with the teacher NPC to explain thinking or ask questions.

#### `observe` — Watch and learn
```json
{
  "type": "observe",
  "description": "Watch the demo: the redstone torch powers the lamp when the lever is off"
}
```
The student watches a pre-built demonstration. Good for introducing concepts before hands-on work.

#### `solve_puzzle` — Figure something out
```json
{
  "type": "solve_puzzle",
  "description": "Power all 3 lamps using only 2 redstone torches — find the right positions!"
}
```
A challenge with a specific correct solution. Students experiment to find the answer.

#### `complete_challenge` — Free-form building
```json
{
  "type": "complete_challenge",
  "description": "Add your own decorations to make this house feel like home!"
}
```
Open-ended creative task. Great for lesson finales where students personalize their work.

### Best Practices for Steps

1. **Start with `navigate_to`** — move students to the right location first
2. **Alternate observation and action** — demonstrate, then practice
3. **End with `complete_challenge`** — let students be creative and reinforce learning
4. **Keep descriptions conversational** — "Build a 5×5 platform" not "Construct platform 5x5"
5. **5-8 steps per lesson** — long enough to learn, short enough to stay engaging

## Quiz Questions

Quizzes test understanding after completing steps. Two types are supported:

### Multiple Choice
```json
{
  "question": "How far does redstone signal travel?",
  "type": "multiple_choice",
  "options": ["10 blocks", "15 blocks", "32 blocks", "Unlimited"],
  "answer": "15 blocks",
  "explanation": "Signals start at strength 15 and decrease by 1 per block.",
  "points": 1
}
```

### Open-Ended
```json
{
  "question": "What item extends a redstone signal?",
  "type": "open_ended",
  "answer": ["repeater", "redstone repeater"],
  "explanation": "A repeater refreshes the signal to full strength."
}
```

### Quiz Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | ✅ | The question text |
| `type` | string | ✅ | `"multiple_choice"` or `"open_ended"` |
| `options` | string[] | ✅ for MC | Answer choices (shown as A, B, C, D) |
| `answer` | string/string[] | ✅ | Correct answer(s). Multiple accepted values for fuzzy matching. |
| `explanation` | string | ✅ | Shown after answering — teach even when wrong! |
| `points` | number | ❌ | Points awarded (default: 1) |

### Quiz Best Practices

1. **3-4 questions per lesson** — enough to assess, not exhausting
2. **Always include explanations** — the goal is learning, not just scoring
3. **Mix multiple choice and open-ended** — different thinking styles
4. **Accept multiple answer forms** — e.g., `["repeater", "redstone repeater"]`
5. **First question should be easy** — build confidence before harder ones

## World Templates (Optional)

Auto-build structures when a lesson starts:

```json
{
  "worldTemplate": {
    "room": {
      "corner": { "x": 0, "y": 64, "z": 0 },
      "dims": { "width": 10, "height": 4, "depth": 10 },
      "blockId": 1
    },
    "signs": [
      { "pos": { "x": 1, "y": 65, "z": 1 }, "lines": ["Step 1:", "Place torch", "on block"] }
    ]
  }
}
```

## Difficulty Guidelines

| Level | Target Audience | Examples |
|-------|----------------|----------|
| 1 | Complete beginners | First house, basic crafting |
| 2 | Some experience | Redstone dust, farming |
| 3 | Comfortable players | Logic gates, piston doors |
| 4 | Advanced builders | Complex circuits, big builds |
| 5 | Experts | Computing, massive projects |

## NPC Personalities

Your course automatically has 3 classmate NPCs with distinct personalities:

- **Alex (curious)** — Asks thoughtful questions, makes connections. Great for verbalizing concepts.
- **Sam (competitive)** — Races ahead, shows off. Creates energy and friendly competition.
- **Jordan (struggling)** — Needs encouragement, relatable frustration. Makes students feel less alone when stuck.

These create natural classroom dynamics — students see others learning too!

## Full Example

See `courses/redstone-basics.json` for a complete, well-structured 5-lesson course. It demonstrates:
- Progressive difficulty (1→3)
- All step types used appropriately
- Mixed quiz question types
- Prerequisites between lessons
- Clear, engaging descriptions

## Tips for Great Courses

1. **Start easy, ramp up** — first lesson should be achievable for anyone
2. **Learn by doing** — minimize reading, maximize building
3. **Celebrate progress** — use encouraging language in step descriptions
4. **Connect to real concepts** — redstone teaches logic gates, farming teaches resource management
5. **Test your course** — have someone else try it and note where they get stuck
6. **Keep lessons under 20 minutes** — attention spans are short in Minecraft!
