# 📚 CraftMind Courses

> AI teaching system for Minecraft — NPC teachers adapt to your learning style.

## Features

- **Course System** — JSON-defined courses with ordered lessons and prerequisites
- **AI Teacher** — NPC teacher with 5 teaching styles (patient, challenger, socratic, hands-on, storyteller)
- **Adaptive Difficulty** — Adjusts challenge level based on student performance
- **Spaced Repetition** — Science-backed review scheduling
- **Peer Learning** — NPC classmates with distinct personalities
- **Skill Trees** — Visual progression tracking
- **Achievement System** — Rewards and milestones
- **Discovery Zones** — Open-ended learning areas
- **Quiz Engine** — Multi-question assessments with scoring

## Quick Start

```bash
npm install
node examples/demo.js    # Run standalone demo
node scripts/playtest.js # Simulated plugin test
npm test                 # Run test suite (33 tests)
```

## API Documentation

### Course (`src/course.js`)
| Class/Method | Description |
|---|---|
| `Course.fromFile(path)` | Load course from JSON |
| `course.title` | Course name |
| `course.orderedLessons` | Sorted lesson list |
| `course.totalEstimatedMinutes` | Estimated completion time |

### Teaching Styles (`src/teaching-styles.js`)
| Method | Description |
|---|---|
| `TeachingStyleManager.setStyle(id)` | Set teaching style |
| `TeachingStyleManager.style` | Current style config |
| `TeachingStyleManager.getStyleList()` | Available styles |
| `TeachingStyleManager.getPrompt()` | Style-appropriate prompt modifier |

### Progress & Achievement (`src/progress.js`, `src/achievements.js`)
| Class/Method | Description |
|---|---|
| `Progress(studentId)` | Track student progress |
| `AchievementSystem.check(ctx)` | Check unlocked achievements |

### Plugin Integration (`src/index.js`)
```js
import { registerWithCore } from 'craftmind-courses';
registerWithCore(core); // Registers as 'courses' plugin
```

## Architecture

```
┌──────────────────────────────────────────────────┐
│                CraftMind Courses                  │
├──────────────────────────────────────────────────┤
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐ │
│  │ Course   │  │ NPCTeacher │  │   Progress   │ │
│  │ Loader   │→ │ (5 styles) │→ │   Tracker    │ │
│  └────┬─────┘  └─────┬──────┘  └──────┬───────┘ │
│       │              │                │         │
│       ▼              ▼                ▼         │
│  ┌──────────────────────────────────────────┐   │
│  │        Learning Pipeline                 │   │
│  │  Lesson → Quiz → Skill Tree → Achieve    │   │
│  └──────────────────┬───────────────────────┘   │
│                     │                           │
│  ┌──────────┐ ┌─────┴──────┐ ┌────────────┐   │
│  │ Adaptive │ │   Spaced   │ │    Peer    │   │
│  │ Engine   │ │Repetition  │ │  Learning  │   │
│  └──────────┘ └────────────┘ └────────────┘   │
├──────────────────────────────────────────────────┤
│              registerWithCore(core)              │
└──────────────────────────────────────────────────┘
```

## Testing

```bash
npm test          # 33 tests, 6 suites
node examples/demo.js
node scripts/playtest.js
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed plans.

## License

MIT
