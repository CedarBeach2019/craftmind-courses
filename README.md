# 🎮 CraftMind Courses

**Gamified Minecraft education with AI teachers and classmates.**

CraftMind Courses brings interactive learning into Minecraft. AI-powered teacher and classmate NPCs guide students through hands-on lessons — building, solving puzzles, and taking quizzes — all inside the game world.

> Inspired by [OpenMAIC](https://github.com/openmaic) (Tsinghua University) — adapted from web slides to Minecraft worlds where **the world IS the lesson**.

## ✨ Features

- 🧑‍🏫 **AI Teacher** — LLM-powered tutor (or scripted fallback) that encourages, hints, and celebrates
- 👥 **NPC Classmates** — 3 personalities (curious, competitive, struggling) create realistic classroom dynamics
- 📖 **Structured Lessons** — Step-by-step guided learning with 6 step types
- 📝 **In-Game Quizzes** — Multiple choice and open-ended, with explanations
- 🏆 **Achievement System** — 10+ badges with unlock conditions and celebrations
- 📊 **Progress Tracking** — Persistent JSON saves, quiz scores, time tracking
- 🏗️ **World Building** — Auto-generate rooms, signs, redstone circuits, obstacle courses
- 📚 **Course System** — JSON-based course definitions, easy to author and share

## Quick Start

```bash
# Install dependencies
npm install

# Run with a local Minecraft server (Java Edition, 1.19+)
node src/index.js --host localhost --port 25565 --course courses/redstone-basics.json
```

### Configuration

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `ZAI_API_KEY` | *(none)* | API key for LLM-powered teacher responses |
| `MC_HOST` | `localhost` | Minecraft server host |
| `MC_PORT` | `25565` | Minecraft server port |
| `TEACHER_NAME` | `ProfBlock` | In-game teacher NPC username |
| `COURSE_FILE` | `courses/redstone-basics.json` | Default course to load |

Or pass via CLI: `node src/index.js --host mc.example.com --port 25565 --course courses/survival-101.json`

## Included Courses

| Course | Lessons | Difficulty | Time |
|--------|---------|------------|------|
| 🔴 Redstone Basics | 5 (torches → logic gates) | 1-3 | ~70 min |
| 🏠 Building Basics | 4 (house, tower, bridge, garden) | 1-2 | ~65 min |
| 🌲 Survival 101 | 4 (tools, shelter, night, farming) | 1-2 | ~50 min |

## Running Tests

```bash
npm test
```

33 tests covering lesson loading, quiz validation, progress tracking, achievement unlocking, and NPC personality distinctness.

## Running Without a Server

The example scripts work standalone — no Minecraft server required:

```bash
# Run through a course with a fake bot (console output)
node examples/run-redstone-course.js

# See how to create a custom lesson in code
node examples/custom-lesson.js
```

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   CRAFTMIND COURSES                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│   src/index.js  ─── Main orchestrator                │
│       │                                              │
│       ├── NPCTeacher ── LLM or scripted chat         │
│       │       └── z.ai API (glm-4.7-flash)          │
│       │                                              │
│       ├── NPCClassmate ── 3 personality types        │
│       │       ├── curious  (Alex — asks questions)   │
│       │       ├── competitive (Sam — races ahead)    │
│       │       └── struggling (Jordan — needs help)   │
│       │                                              │
│       ├── Course ──── Lesson collection              │
│       │       └── Lesson ── Steps + Quiz             │
│       │                                              │
│       ├── WorldBuilder ── Procedural environments    │
│       │       ├── Rooms, signs, chests              │
│       │       ├── Redstone circuits                  │
│       │       └── Obstacle courses                   │
│       │                                              │
│       ├── Quiz ──── In-game MC/essay questions       │
│       ├── Progress ── JSON persistence               │
│       └── Achievements ── Badges + celebrations      │
│                                                      │
│   courses/*.json  ── Course definitions              │
│   progress/*.json  ── Student save data              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Module Overview

| Module | File | Purpose |
|--------|------|---------|
| Course | `src/course.js` | Loads and manages lesson collections from JSON |
| Lesson | `src/lesson.js` | Single lesson: steps, quiz, progress tracking |
| Quiz | `src/quiz.js` | Multiple choice and open-ended questions via chat |
| NPCTeacher | `src/npc-teacher.js` | AI tutor with LLM or scripted fallback |
| NPCClassmate | `src/npc-classmate.js` | 3 distinct personality types |
| Progress | `src/progress.js` | JSON-based student save data |
| Achievements | `src/achievements.js` | Badge system with unlock conditions |
| WorldBuilder | `src/world-builder.js` | Procedural structure generation |

## Step Types

| Step Type | Description | Example |
|-----------|-------------|---------|
| `navigate_to` | Go to specific coordinates | "Walk to the lab at 10, 64, 10" |
| `build_block` | Place blocks per instructions | "Place 5 oak planks in an L-shape" |
| `interact_npc` | Talk to teacher for discussion | "Explain what you observed" |
| `observe` | Watch a pre-built demo | "Watch the redstone signal flow" |
| `solve_puzzle` | Find a specific solution | "Power all 3 lamps with 2 torches" |
| `complete_challenge` | Open-ended creative task | "Decorate your house however you like!" |

## Creating Custom Courses

Courses are JSON files in `courses/`. See [`docs/course-authoring-guide.md`](docs/course-authoring-guide.md) for the complete guide, or check [`courses/redstone-basics.json`](courses/redstone-basics.json) for a reference example.

Quick template:

```json
{
  "id": "my-course",
  "title": "My Awesome Course",
  "description": "What students will learn",
  "author": "Your Name",
  "lessons": [
    {
      "id": "lesson-1",
      "title": "First Lesson",
      "description": "Lesson overview",
      "objectives": ["Learn X", "Build Y"],
      "prerequisites": [],
      "difficulty": 1,
      "estimatedMinutes": 10,
      "steps": [
        { "type": "navigate_to", "description": "Go here!", "target": { "x": 0, "y": 64, "z": 0 } },
        { "type": "observe", "description": "Look at this cool thing" },
        { "type": "build_block", "description": "Build something awesome" },
        { "type": "complete_challenge", "description": "Make it your own!" }
      ],
      "quiz": [
        {
          "question": "What did you learn?",
          "type": "multiple_choice",
          "options": ["A", "B", "C"],
          "answer": "B",
          "explanation": "Because B is correct!"
        }
      ]
    }
  ]
}
```

## NPC Classmate Personalities

The 3 classmates create natural classroom dynamics:

| Classmate | Personality | Behavior |
|-----------|-------------|----------|
| 🤔 **Alex** (curious) | Thoughtful, enthusiastic | Asks questions, makes connections, gets excited about discoveries |
| 😤 **Sam** (competitive) | Confident, fast-paced | Races ahead, occasionally makes mistakes, shows off |
| 😟 **Jordan** (struggling) | Needs encouragement | Gets confused, asks for help, celebrates small wins |

## Achievements

| Badge | Name | Condition |
|-------|------|-----------|
| 🏗️ | First Build | Complete your first lesson |
| ⚡ | Redstone Novice | Complete 3+ redstone lessons |
| 🔌 | Redstone Master | 100% on a redstone quiz |
| 🏃 | Speed Runner | Complete a lesson in under 5 min |
| 🏆 | Quiz Ace | Perfect score on any quiz |
| 🔥 | On Fire | 3-lesson streak |
| 💎 | Unstoppable | 5-lesson streak |
| 🤔 | Curious Mind | Ask 10 questions during lessons |
| 🤝 | Helpful Hand | Get a classmate to thank you |
| 🎓 | Course Graduate | Complete all lessons in a course |

## Troubleshooting

**"Connection refused"** — Make sure your Minecraft server is running and accessible. Check host/port.

**Teacher just says generic lines** — Set `ZAI_API_KEY` in `.env` for LLM-powered responses. Without it, the teacher uses scripted fallback lines (which are still fun!).

**Bots can't connect** — Some servers require authentication. Use an offline/cracked server for local testing, or configure auth.

**Lesson progress not saving** — Ensure the `progress/` directory is writable. Check `cwd` — Progress saves relative to the working directory.

**Quiz answers not registering** — The student bot needs to receive chat messages. Make sure the student account has permission to chat on the server.

**"Cannot find module" errors** — Run `npm install` first. This project requires `mineflayer` and `vec3`.

## License

MIT — see [LICENSE](LICENSE)
