# 🎮 CraftMind Courses

**Gamified Minecraft education with AI teachers and classmates.**

CraftMind Courses brings interactive learning into Minecraft. AI-powered teacher and classmate NPCs guide students through hands-on lessons — building, solving puzzles, and taking quizzes — all inside the game world.

> Inspired by [OpenMAIC](https://github.com/openmaic) (Tsinghua University) — adapted from web slides to Minecraft worlds where **the world IS the lesson**.

## Quick Start

```bash
npm install
node src/index.js --host localhost --port 25565 --course courses/redstone-basics.json
```

Requires a running Minecraft server (Java Edition, 1.19+).

Set `ZAI_API_KEY` in your environment for LLM-powered teacher responses (optional — falls back to scripted lines).

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

## Supported Lesson Step Types

| Step Type | Description |
|-----------|-------------|
| `navigate_to` | Go to a specific coordinate in the world |
| `build_block` | Place blocks following instructions |
| `interact_npc` | Talk to an NPC for discussion/explanation |
| `observe` | Watch a demonstration and learn |
| `solve_puzzle` | Figure out a redstone/building puzzle |
| `complete_challenge` | Free-form building challenge |

## Creating Custom Courses

Courses are JSON files in the `courses/` directory. See `courses/redstone-basics.json` for a complete example.

```jsonc
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
        { "type": "build_block", "description": "Build something awesome" }
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

## Achievements

Students earn badges as they progress:

| Badge | Condition |
|-------|-----------|
| 🏗️ First Build | Complete your first lesson |
| ⚡ Redstone Novice | Complete 3+ redstone lessons |
| 🔌 Redstone Master | 100% on a redstone quiz |
| 🏃 Speed Runner | Complete a lesson in under 5 min |
| 🏆 Quiz Ace | Perfect score on any quiz |
| 🔥 On Fire | 3-lesson streak |
| 💎 Unstoppable | 5-lesson streak |
| 🎓 Course Graduate | Complete all lessons |

## License

MIT
