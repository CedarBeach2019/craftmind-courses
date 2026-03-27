# CraftMind Courses - Developer Guide

## Project Overview

CraftMind Courses is a gamified Minecraft education platform that uses AI-powered NPC teachers and classmates to create engaging, personalized learning experiences. Students learn real-world concepts (redstone engineering, building, survival skills) through interactive in-game courses with adaptive difficulty, spaced repetition, and peer learning mechanics.

**Core Philosophy**: Learning through guided discovery — not lectures. The system uses Socratic questioning, progressive hints, and hands-on building challenges to develop genuine understanding.

### Key Features
- **AI Teacher System** - NPC teachers with 5 teaching styles (patient, challenger, socratic, hands-on, storyteller)
- **Adaptive Difficulty** - Per-topic confidence tracking that adjusts pacing and challenge level
- **Spaced Repetition** - SM-2 algorithm for long-term retention through periodic reviews
- **Discovery Zones** - Open-ended puzzles with progressive hints to build problem-solving skills
- **Peer Learning** - NPC classmates that students can teach, reinforcing their own learning
- **Skill Trees** - Visual progress tracking showing mastered, in-progress, and locked skills
- **Achievement System** - Meaningful badges based on demonstrated competence, not participation
- **Quiz Engine** - In-game assessments with spaced repetition review questions

## Architecture

### High-Level Flow

```
Course Loading → Student Bot Spawns → Teacher + Classmates Spawn
                        ↓
        ┌───────────────────────────────────────────┐
        │           Main Learning Loop              │
        ├───────────────────────────────────────────┤
        │  For each lesson in course:               │
        │  1. Check adaptive difficulty             │
        │  2. Present lesson objectives             │
        │  3. Walk through steps (navigate, build,  │
        │     observe, interact, solve puzzles)     │
        │  4. Handle discovery zones (hints)        │
        │  5. Track peer learning opportunities     │
        │  6. Quiz with spaced repetition reviews   │
        │  7. Update progress + skill tree          │
        │  8. Check achievements                    │
        └───────────────────────────────────────────┘
                        ↓
                Course Completion → Recommend Next Course
```

### Core Systems

**Course System** (`src/course.js`, `src/lesson.js`)
- JSON-defined courses with ordered lessons and prerequisites
- Each lesson has: objectives, difficulty (1-5), estimated time, step-by-step instructions, quiz questions
- Steps: `navigate_to`, `build_block`, `interact_npc`, `observe`, `solve_puzzle`, `complete_challenge`, `discovery`
- World templates can build learning environments programmatically

**Curriculum System** (`src/curriculum.js`)
- Multi-course management with prerequisites and learning paths
- Tracks skill requirements and awards from each course
- Real-world connections for each course (bridges Minecraft concepts to real subjects)
- Recommends next course based on completed courses and prerequisites

**Adaptive Learning** (`src/adaptive.js`)
- Per-topic confidence scores (0.1-1.0) updated by quiz performance, hint usage, peer teaching
- Confidence drives: extra examples, slower pacing, skip review, offer advanced challenges
- Global failure tracking triggers teacher intervention after 3+ consecutive failures

**Spaced Repetition** (`src/spaced-repetition.js`)
- Simplified SM-2 algorithm for scheduling reviews
- Quality ratings (0-5) based on quiz performance and hint usage
- Injects review questions from earlier lessons into current quizzes
- Tracks retention estimates based on repetitions and ease factors

**Peer Learning** (`src/peer-learning.js`, `src/npc-classmate.js`)
- Three classmate personalities: curious (asks thoughtful questions), competitive (races ahead), struggling (needs help)
- Struggling classmates ask for help on topics the student has mastered
- Student explanations are scored on length, structure, and examples
- Teaching reinforces learning — peer teaching boosts confidence

**AI Teaching System** (`src/ai/`)
- **teaching-agents.js** - 4 NPC teacher personalities (Iris/scientific, Joe/practical, Maya/peer, Textbook/reference)
- **socratic-engine.js** - Guided questioning chains that help students discover answers
- **teaching-actions.js** - Action planner mapping student input to teaching responses (EXPLAIN, DEMONSTRATE, QUIZ, ADAPT, CHALLENGE, STORY, SOCRATIC, ENCOURAGE)
- **adaptive-difficulty.js** - Engagement tracking, teaching method effectiveness, cross-game knowledge bridges
- **teaching-evaluator.js** - Comparative evaluation of teaching methods with student profiles

**Teaching Styles** (`src/teaching-styles.js`)
- Five teaching styles with different traits: patient (slow, encouraging), challenger (fast, demanding), socratic (questions), hands-on (doing), storyteller (narratives)
- Each style has: prompt modifier for LLM, extra examples count, pace multiplier, hint eagerness, emoji density
- Student can request style changes during lessons

**Progress Tracking** (`src/progress.js`)
- Central tracking hub: completed lessons, quiz scores, time spent, achievements
- Embeds: AdaptiveEngine, SpacedRepetition, PeerLearningSystem
- Persists to disk in `progress/{studentName}.json`

**Skill Trees** (`src/skill-tree.js`)
- Visual representation of learning progress with dependency tracking
- Node states: locked, available, in_progress, mastered
- Includes confidence scores and review due flags
- ASCII art output for in-game chat display

**Achievement System** (`src/achievements.js`)
- 19 achievements across: mastery, exploration, social, curriculum, streak
- Rarity tiers: common, rare, epic, legendary
- Conditions check: completion time, perfect quizzes, zero hints, peer teaching, course completion
- Celebrate with rarity-appropriate fanfare in chat

**Quiz Engine** (`src/quiz.js`)
- Multiple choice and open-ended questions via chat
- Accepts partial matches for open-ended answers
- Common mistake explanations address misconceptions
- Injects spaced repetition review questions at start
- Shows detailed results breakdown

**Discovery Zones** (`src/discovery.js`)
- Exploration-based learning with progressive hints
- Quality rating (0-5) based on hints used: 0 hints = 5 (perfect independent discovery)
- Real-world insights after successful discoveries
- Time limits optional
- Abandonment tracking for students who give up

**Script Engine** (`src/scripts/script-engine.js`)
- Stochastic step system for teaching interactions
- Step types: ask_question, explain_concept, give_hint, wait_for_answer, praise, encourage, adjust_difficulty, branch, wait, action, noop
- StudentContext tracks: topic, confidence, engagement, consecutive correct/wrong, hints used, lesson progress, difficulty, mood
- TeacherMood tracks: patience, enthusiasm (reacts to student performance)
- Weighted random selection for natural dialogue variety

**World Builder** (`src/world-builder.js`)
- Programmatic building of learning environments
- Methods: placeBlock, fill (rectangular region), buildRoom (hollow box), placeSign, fillChest, buildRedstoneLine, buildObstacleCourse
- Integrates with lesson world templates

## File Structure

```
craftmind-courses/
├── src/
│   ├── index.js                    # Main orchestrator, registerWithCore()
│   ├── course.js                   # Course class, fromFile() loader
│   ├── lesson.js                   # Lesson class, step progression
│   ├── curriculum.js               # Multi-course system, learning paths
│   ├── progress.js                 # Student progress tracking hub
│   ├── skill-tree.js               # Visual progress, dependency tracking
│   ├── quiz.js                     # In-game quiz system
│   ├── achievements.js             # Badge system with 19 achievements
│   ├── discovery.js                # Exploration zones with progressive hints
│   ├── world-builder.js            # Programmatic building
│   ├── teaching-styles.js          # 5 teaching styles with traits
│   ├── npc-teacher.js              # AI teacher with LLM integration
│   ├── npc-classmate.js            # 3 classmate personalities
│   ├── adaptive.js                 # Per-topic confidence tracking
│   ├── spaced-repetition.js        # SM-2 algorithm for reviews
│   ├── peer-learning.js            # Teaching classmates system
│   ├── scripts/
│   │   ├── script-engine.js        # Stochastic teaching step system
│   │   ├── v1-socrates.js          # Socratic questioning scripts
│   │   ├── v1-encourager.js        # Encouragement scripts
│   │   └── v1-tough-love.js        # Challenge-oriented scripts
│   └── ai/
│       ├── teaching-agents.js      # NPC teacher personalities
│       ├── socratic-engine.js      # Guided questioning chains
│       ├── teaching-actions.js     # Action planner (EXPLAIN, DEMONSTRATE, etc.)
│       ├── adaptive-difficulty.js  # Engagement + method effectiveness
│       └── teaching-evaluator.js   # Comparative teaching evaluation
├── courses/
│   ├── redstone-basics.json        # 5 lessons, torches to logic gates
│   ├── building-basics.json        # Foundations, walls, roofs, bridges
│   └── survival-101.json           # Crafting, shelter, combat, farming
├── curriculum.json                 # Multi-course definition with paths
├── examples/
│   ├── demo.js                     # Standalone demo (no MC server)
│   └── run-redstone-course.js      # Run full course
├── scripts/
│   └── playtest.js                 # Simulated plugin test
├── tests/
│   ├── test-all.js                 # Main test runner
│   ├── test-course-scripts.js      # Script engine tests
│   ├── test-ai.js                  # AI system tests
│   └── integration.test.js         # End-to-end tests
├── docs/
│   └── course-authoring-guide.md   # How to create courses
├── package.json
├── README.md
├── ROADMAP.md
└── CLAUDE.md                       # This file
```

## Key Dependencies

### Core Runtime
- **mineflayer** (^4.25.0) - Minecraft bot framework, connects student/teacher/classmate bots
- **vec3** (^0.1.10) - 3D vector math for block placement and navigation

### CraftMind Core Integration
The `registerWithCore(core)` function in `src/index.js` registers courses as a plugin:

```javascript
export function registerWithCore(core) {
  core.registerPlugin('courses', {
    name: 'CraftMind Courses',
    version: '1.0.0',
    modules: { Course, NPCTeacher, Progress, WorldBuilder, Curriculum, SkillTree, Quiz },
  });
}
```

**Integration Points with New Core Systems:**

1. **Actions System** - `src/ai/teaching-actions.js` defines education-specific actions (EXPLAIN, DEMONSTRATE, QUIZ, ADAPT, CHALLENGE, STORY, SOCRATIC, ENCOURAGE) that map to core action schemas

2. **Knowledge System** - `src/ai/adaptive-difficulty.js` includes CrossGameKnowledgeBridge for tracking what students learned in other CraftMind games (fishing, researcher, ranch) and applying it to course content

3. **Communication System** - `src/npc-teacher.js` and `src/npc-classmate.js` use core chat/messaging; `src/ai/socratic-engine.js` extends this with multi-agent collaborative dialogues

4. **Skill-Tree System** - `src/skill-tree.js` provides the core skill tree model with node statuses (locked, available, in_progress, mastered), confidence tracking, and dependency resolution

### LLM Integration (Optional)
- **ZAI API** (api.z.ai) - Used when `ZAI_API_KEY` env var is set
- Model: `glm-4.7-flash`
- Fallback: Scripted responses when no API key
- LLM purposes: Dynamic teacher dialogue, teaching action planning, Socratic questions

## Current State

### What Works ✅
- **Course Loading** - JSON courses load correctly with lessons, steps, quizzes
- **Teaching Styles** - All 5 styles implemented with traits and prompt modifiers
- **Adaptive Difficulty** - Per-topic confidence tracking with adaptations (extra_examples, slow_down, skip_review, offer_challenge, intervene)
- **Spaced Repetition** - SM-2 algorithm working with quality-based scheduling
- **Peer Learning** - NPC classmates with personalities, help request generation, explanation scoring
- **Skill Trees** - Visual ASCII skill trees with dependency tracking
- **Achievement System** - 19 achievements with condition checking and celebration
- **Quiz Engine** - Multiple choice + open-ended questions with partial matching
- **Discovery Zones** - Progressive hints, quality ratings, real-world insights
- **Script Engine** - Stochastic teaching steps with mood and context tracking
- **AI Teaching Agents** - 4 personalities (Iris, Joe, Maya, Textbook) with traits
- **Socratic Engine** - Guided questioning chains with agent interjections
- **Teaching Actions** - Action planner with LLM + fallback pattern matching
- **Progress Tracking** - Full persistence with adaptive/spaced-rep/peer-learning embedding
- **World Building** - Programmatic building of rooms, signs, redstone circuits

### What's Stubbed Out / TODO 🚧
- **Real Minecraft Server Testing** - Code runs but needs production server validation
- **Multiplayer Support** - Architecture supports multiple students but not tested
- **Web Dashboard** - Mentioned in ROADMAP but not implemented
- **Advanced Courses** - Only 3 basic courses exist; advanced-redstone.json, redstone-computers.json referenced in curriculum.json but don't exist yet
- **LLM Integration** - Works with ZAI API but could be extended to other providers (Anthropic, OpenAI)
- **Voice Chat** - Not implemented (text-only)
- **Analytics Dashboard** - No teacher/student analytics UI
- **Course Sharing** - Community course marketplace not built

### Test Coverage
- **test-course-scripts.js** - Script engine tests (weighted random, student context, step execution)
- **test-ai.js** - AI system tests (socratic engine, teaching actions, adaptive difficulty)
- **integration.test.js** - End-to-end course flow tests
- Total: ~33 tests across 6 suites

## 5 Most Impactful Improvements (Ranked by Effort)

### 1. Add LLM Provider Abstraction (Effort: Low, Impact: High)
**Problem**: Hardcoded to ZAI API (`glm-4.7-flash`), limiting accessibility.

**Solution**: Add provider abstraction layer supporting Anthropic Claude, OpenAI GPT, and local models (Ollama).

**Implementation**:
```javascript
// src/ai/llm-providers.js
export class LLMProvider {
  async chat(prompt, opts = {}) { throw new Error('Not implemented'); }
}

export class AnthropicProvider extends LLMProvider {
  constructor(apiKey) { this.apiKey = apiKey; }
  async chat(prompt, opts) {
    // Use Anthropic SDK
  }
}

export class OpenAIProvider extends LLMProvider { /* ... */ }
export class ZAIProvider extends LLMProvider { /* existing code */ }

// Factory
export function createProvider(type, config) {
  switch(type) {
    case 'anthropic': return new AnthropicProvider(config.apiKey);
    case 'openai': return new OpenAIProvider(config.apiKey);
    case 'zai': return new ZAIProvider(config.apiKey);
    default: throw new Error(`Unknown provider: ${type}`);
  }
}
```

**Benefits**: Enables use of Claude/ChatGPT, supports local models for privacy, improves teacher dialogue quality.

---

### 2. Implement Course Validation Linter (Effort: Low, Impact: Medium)
**Problem**: Courses are hand-authored JSON; easy to make mistakes (broken prerequisites, unreachable lessons, invalid block IDs).

**Solution**: Add a validation linter that checks course integrity before running.

**Implementation**:
```javascript
// scripts/lint-course.js
import { Course } from '../src/course.js';
import { Curriculum } from '../src/curriculum.js';

async function lintCourse(coursePath) {
  const course = await Course.fromFile(coursePath);
  const errors = [];
  const warnings = [];

  // Check lesson IDs unique
  const ids = new Set();
  for (const lesson of course.orderedLessons) {
    if (ids.has(lesson.id)) errors.push(`Duplicate lesson ID: ${lesson.id}`);
    ids.add(lesson.id);
  }

  // Check prerequisites exist
  for (const lesson of course.orderedLessons) {
    for (const prereq of lesson.prerequisites ?? []) {
      if (!ids.has(prereq)) warnings.push(`Lesson ${lesson.id} has unknown prereq: ${prereq}`);
    }
  }

  // Check quiz answers are valid for type
  for (const lesson of course.orderedLessons) {
    for (const q of lesson.quiz ?? []) {
      if (q.type === 'multiple_choice' && !q.options) {
        errors.push(`Lesson ${lesson.id} quiz missing options for multiple_choice`);
      }
      if (q.type === 'multiple_choice' && typeof q.answer !== 'number') {
        errors.push(`Lesson ${lesson.id} quiz answer should be index for multiple_choice`);
      }
    }
  }

  // Check world template block IDs against registry
  // Check discovery zone hint progression (3-4 hints)

  return { errors, warnings };
}

const coursePath = process.argv[2];
const result = await lintCourse(coursePath);
console.log(`Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);
process.exit(result.errors.length > 0 ? 1 : 0);
```

**Benefits**: Catches course authoring errors early, improves course quality, prevents runtime failures.

---

### 3. Build Analytics Dashboard (Effort: Medium, Impact: High)
**Problem**: Teachers/researchers have no visibility into student learning patterns.

**Solution**: Add a web dashboard showing student progress, engagement, and learning outcomes.

**Implementation**:
- Backend: Express API serving aggregated progress data from `progress/*.json`
- Frontend: Simple HTML/JS dashboard with charts (Chart.js or D3)
- Metrics: average quiz scores, completion rates, time per lesson, hint usage patterns, achievement unlocks, teaching method effectiveness

**Key Views**:
- **Student Detail**: Progress timeline, skill tree, quiz history, achievement badges
- **Course Overview**: Completion funnel (started → lesson 1 → lesson 2 → completed), average time per lesson, common failure points
- **System Health**: Active students, courses most taught, average session length

**Data Schema**:
```javascript
// analytics/student-summary.json
{
  "studentId": "student",
  "coursesCompleted": 1,
  "lessonsCompleted": 5,
  "averageQuizScore": 0.85,
  "totalTimeSpent": 1800, // seconds
  "achievementsUnlocked": 3,
  "classmatesHelped": 2,
  "preferredTeachingStyle": "socratic",
  "lastActiveAt": "2026-03-27T10:30:00Z"
}
```

**Benefits**: Enables research into learning effectiveness, helps teachers identify struggling students, provides insights for course improvement.

---

### 4. Add Multi-Student Support (Effort: Medium, Impact: High)
**Problem**: System designed for single student; multi-player classrooms not supported.

**Solution**: Extend architecture to support concurrent students in the same course session.

**Implementation**:
- **Session Manager**: Track multiple student bots with unique IDs
- **Shared State**: Teacher serves all students; classmates react to all students
- **Individual Progress**: Each student has separate Progress instance
- **Collaborative Features**: Students can see each other's progress, form study groups, work on group projects

**API Changes**:
```javascript
// src/index.js
async function startMultiPlayerSession(coursePath, students) {
  const teacherBot = mineflayer.createBot({ host, port, username: 'ProfBlock' });
  const studentBots = students.map(name =>
    mineflayer.createBot({ host, port, username: `CM_${name}` })
  );

  const session = new MultiPlayerSession(teacherBot, studentBots, course);
  await session.start();
}

class MultiPlayerSession {
  constructor(teacherBot, studentBots, course) {
    this.teacher = new NPCTeacher(teacherBot);
    this.students = new Map(studentBots.map(bot =>
      [bot.username, new StudentState(bot, new Progress(bot.username))]
    ));
    this.course = course;
  }

  async runLesson(lessonId) {
    const lesson = this.course.getLesson(lessonId);
    for (const [name, student] of this.students) {
      this.teacher.chat(`${name}: ${lesson.description}`);
      // Wait for each student to complete step
    }
  }
}
```

**Benefits**: Enables classroom deployment, collaborative learning, study groups, peer-to-peer teaching (real students, not just NPCs).

---

### 5. Implement Course Export/Import System (Effort: Low-Medium, Impact: Medium)
**Problem**: No way to share courses with community; courses are hardcoded JSON files.

**Solution**: Add course packaging, export, and import with validation and versioning.

**Implementation**:
```bash
# Export course to distributable package
npm run course:export -- redstone-basics

# Output: courses/redstone-basics-1.0.0.course
# (ZIP file with course.json, world templates, assets, manifest.json)

# Import course from package
npm run course:import -- path/to/redstone-basics-1.0.0.course
```

**Manifest Schema**:
```json
{
  "format": "craftmind-course",
  "version": "1.0.0",
  "course": {
    "id": "redstone-basics",
    "title": "Redstone Basics",
    "version": "1.0.0",
    "author": "CraftMind",
    "description": "Learn redstone from torches to logic gates!"
  },
  "files": [
    "course.json",
    "world/lobby.schematic",
    "world/lesson1.schematic",
    "assets/textures/custom.png"
  ],
  "dependencies": {
    "minecraftVersion": "1.20.x",
    "requiredPlugins": []
  },
  "checksums": {
    "course.json": "sha256:abc123..."
  }
}
```

**CLI Commands**:
```javascript
// cli/export-course.js
import { Course } from '../src/course.js';
import { createHash } from 'crypto';

async function exportCourse(courseId, outputDir) {
  const course = await Course.fromFile(`courses/${courseId}.json`);
  const manifest = {
    format: 'craftmind-course',
    version: '1.0.0',
    course: {
      id: course.id,
      title: course.title,
      version: '1.0.0',
      author: course.author,
      description: course.description,
    },
    files: [`${courseId}.json`],
    dependencies: {
      minecraftVersion: '1.20.x',
      requiredPlugins: [],
    },
    checksums: {},
  };

  // Add world templates if defined
  for (const lesson of course.orderedLessons) {
    if (lesson.worldTemplate) {
      manifest.files.push(`world/${lesson.id}.schematic`);
    }
  }

  // Create ZIP archive
  const archive = archiver('zip', { zlib: { level: 9 } });
  const output = fs.createWriteStream(`${outputDir}/${courseId}-1.0.0.course`);
  archive.pipe(output);

  // Add files
  archive.file(`courses/${courseId}.json`, { name: `${courseId}.json` });
  for (const file of manifest.files) {
    const content = await fs.readFile(path.join('courses', file));
    manifest.checksums[file] = createHash('sha256').update(content).digest('hex');
  }

  archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
  await archive.finalize();
}
```

**Benefits**: Community course sharing, version control, course marketplace prerequisites, easier course distribution.

## Integration with CraftMind Core Systems

### Actions System
The `TeachingActionPlanner` in `src/ai/teaching-actions.js` defines education-specific actions that integrate with the core actions system:

**Action Types**:
- `EXPLAIN` - Direct concept explanation
- `DEMONSTRATE` - Show how to do something
- `QUIZ` - Test knowledge
- `ADAPT` - Rephrase for confused students
- `CHALLENGE` - Give harder problems
- `REVIEW` - Go over mistakes
- `STORY` - Teach through narrative
- `FIELD_TRIP` - Direct observation
- `SOCRATIC` - Guided questions
- `ENCOURAGE` - Motivate
- `PRAISE` - Acknowledge success
- `CORRECT` - Fix misconceptions
- `REFERENCE` - Point to resources

**Integration Pattern**:
```javascript
// Core action schema
{
  type: 'EXPLAIN',
  params: { topic: 'redstone-torches', depth: 'standard', analogy: 'like electricity' },
  reasoning: 'Student asked direct question'
}

// Maps to teacher dialogue via LLM or scripted fallback
teacher.say('EXPLAIN', 'redstone-torches');
```

### Knowledge System
The `CrossGameKnowledgeBridge` in `src/ai/adaptive-difficulty.js` connects learning across CraftMind games:

**Knowledge Flow**:
```javascript
// In craftmind-fishing, student learns about "tides"
// Fishing game unlocks knowledge:
knowledgeBridge.unlockKnowledge('fishing', ['tides', 'currents', 'baitfish']);

// In craftmind-courses, redstone-basics course checks:
const unlocked = knowledgeBridge.checkTopicUnlocked('currents', {
  fishing: ['tides', 'currents']
});
// Result: { unlocked: true, fromGames: ['fishing'], context: 'You learned about currents from fishing!' }

// Teacher says: "Great! You already learned about currents in fishing — redstone currents work the same way!"
```

**Prerequisites in Curriculum**:
```json
{
  "id": "advanced-redstone",
  "prerequisites": ["redstone-basics"],
  "crossGamePrerequisites": {
    "fishing": ["tides"],
    "researcher": ["scientific-method"]
  }
}
```

### Communication System
NPC teachers and classmates extend the core communication system with multi-agent collaborative dialogues:

**Socratic Multi-Agent Dialogues** (`src/ai/socratic-engine.js`):
```javascript
// Iris asks the main question
{ agent: 'iris', question: 'What causes tides?' }

// Joe adds practical context
{ agent: 'joe', message: "Think practical — what pulls on the ocean from space?" }

// Maya asks peer question
{ agent: 'maya', message: "Wait, I'm confused too. Can you explain it simpler?" }

// Teacher orchestrates the dialogue based on student responses
```

**Agent Selection Based on Student Profile** (`src/ai/teaching-agents.js`):
```javascript
selectBestAgent('EXPLAIN', {
  preferredStyle: 'socratic',
  confidence: 0.4,
  engagementLevel: 'low'
});
// Returns: 'iris' (high patience, high rigor, socratic tendency)
```

### Skill-Tree System
The skill tree model in `src/skill-tree.js` provides the core implementation for visual progress tracking:

**Node Schema**:
```javascript
{
  id: 'rb-torches',
  title: 'Redstone Torches',
  description: 'Understanding redstone torches as power sources',
  category: 'Redstone Basics',
  prerequisites: [],
  status: 'mastered', // locked | available | in_progress | mastered
  confidence: 0.85,
  achievements: ['independent_solver'],
  reviewDue: false
}
```

**Dependency Resolution**:
- Nodes start `locked`
- When all prerequisites are `mastered`, node becomes `available`
- When student starts lesson, node becomes `in_progress`
- When lesson completes with quiz, node becomes `mastered`

**ASCII Visualization**:
```
╔══════════════════════════════╗
║      SKILL TREE               ║
╠══════════════════════════════╣
║ Redstone Basics:
║   ✅ Redstone Torches
║   ✅ Redstone Dust & Wiring
║   🔄 Repeaters & Comparators
║   🔒 Pistons & Doors
║   🔒 Basic Logic Gates
╠══════════════════════════════╣
║ Mastery: 40%                  ║
╚══════════════════════════════╝
```

**Integration with Progress**:
- `Progress.completeLesson()` → updates `SkillTree.completeNode()`
- `AdaptiveEngine.getConfidence()` → reflects in node confidence
- `SpacedRepetition.shouldInjectReview()` → sets node `reviewDue`

## Development Quick Reference

### Running the System

**Standalone Demo** (no Minecraft server):
```bash
node examples/demo.js
```

**Full Course** (requires Minecraft server):
```bash
node src/index.js --host localhost --port 25565 --course courses/redstone-basics.json --style socratic
```

**Run Tests**:
```bash
npm test
```

### Environment Variables

```bash
# LLM Integration (optional)
export ZAI_API_KEY="your-api-key"

# Minecraft Server (for full course runs)
export MC_HOST="localhost"
export MC_PORT="25565"

# Course Configuration
export COURSE_FILE="courses/redstone-basics.json"
export TEACHER_NAME="ProfBlock"
export TEACHING_STYLE="patient"
```

### Creating a New Course

1. Create `courses/your-course.json` following the schema in `courses/redstone-basics.json`
2. Add entry to `curriculum.json`:
```json
{
  "id": "your-course",
  "title": "Your Course",
  "courseFile": "courses/your-course.json",
  "difficulty": 1,
  "prerequisites": [],
  "requiredSkills": [],
  "awardsSkills": ["skill1", "skill2"],
  "realWorldConnections": ["Connection to real world"]
}
```
3. Test with: `node examples/demo.js` (swap course path)
4. Validate with: `npm run lint:course -- courses/your-course.json` (if implemented)

### Debugging Tips

**Enable Verbose Logging**:
```javascript
// In src/index.js, add at top:
process.env.DEBUG = 'craftmind-courses:*';
```

**Inspect Progress State**:
```bash
cat progress/student.json
```

**Test Specific Lesson**:
```javascript
const course = await Course.fromFile('courses/redstone-basics.json');
const lesson = course.getLesson('rb-torches');
console.log(lesson.steps);
```

### Extending Teaching Styles

Add a new teaching style in `src/teaching-styles.js`:

```javascript
experimental: {
  id: 'experimental',
  name: 'Experimental Lab',
  description: 'Learn by breaking things — failure is data!',
  traits: ['hands-on', 'trial-and-error', 'hypothesis-driven'],
  promptModifier: 'Always suggest experiments: "What if we try X?" Treat failures as learning opportunities, not mistakes.',
  responseStyle: 'inquisitive',
  extraExamplesOnWrong: 0,
  paceMultiplier: 0.9,
  hintEagerness: 0.3,
  emojiDensity: 'medium',
}
```

### Adding New Achievement

Add to `ACHIEVEMENTS` array in `src/achievements.js`:

```javascript
{
  id: 'explorer',
  name: 'Explorer',
  description: 'Complete 5 discovery zones',
  icon: '🗺️',
  category: 'exploration',
  rarity: 'rare',
  condition: (ctx) => ctx.discoveryZonesCompleted >= 5
}
```

## Common Patterns

### Adding a New Step Type

1. Extend step type in `src/lesson.js` step validation
2. Add handler in `src/index.js` main loop
3. Update course authoring guide

Example:
```javascript
// In src/index.js main loop, add to step type switch:
if (step.type === 'craft_item') {
  teacherBot.chat(`🔨 Craft: ${step.item}`);
  teacherBot.chat(`Recipe: ${step.recipe.join(' + ')}`);
  // Wait for student to craft
  const crafted = await waitForChat(studentBot, ['crafted', 'made', 'done']);
}
```

### Extending the Script Engine

Add new step type in `src/scripts/script-engine.js`:

```javascript
export class Step {
  static give_reward(rewards) {
    return {
      type: 'give_reward',
      pick: () => {
        if (typeof rewards === 'string') return rewards;
        if (Array.isArray(rewards)) return rewards[Math.floor(Math.random() * rewards.length)];
        return weightedRandom(rewards);
      },
    };
  }
}

// In CourseScriptRunner._executeStep, add:
case 'give_reward': {
  const reward = step.pick();
  this.emit(`🎁 Reward: ${reward}`);
  break;
}
```

### Hooking into Core Events

The system emits events that can be hooked for analytics or extensions:

```javascript
// In src/index.js, after lesson completion:
progress.completeLesson(lesson.id, quizScore, lessonTime, course.id);

// Emit event for external listeners
if (core.events) {
  core.events.emit('courses:lesson_completed', {
    studentId: 'student',
    courseId: course.id,
    lessonId: lesson.id,
    quizScore,
    timeSpent: lessonTime,
  });
}
```

## Best Practices

1. **Always test courses with demo mode first** before running on a real Minecraft server
2. **Keep lessons under 20 minutes** for optimal engagement
3. **Use discovery zones sparingly** — they're powerful but time-consuming
4. **Write quiz explanations that address common misconceptions**
5. **Provide real-world connections** — this is what makes the learning stick
6. **Balance hint difficulty** — hints should progress from vague to specific
7. **Test with all teaching styles** — ensure content works for patient AND challenger styles
8. **Validate prerequisites** — make sure the learning graph has no cycles
9. **Use progress.save() liberally** — don't lose student progress on crashes
10. **Celebrate achievements appropriately** — rare achievements should feel special

## Resources

- **CraftMind Core**: [github.com/CedarBeach2019/craftmind](https://github.com/CedarBeach2019/craftmind)
- **Course Authoring Guide**: `docs/course-authoring-guide.md`
- **Mineflayer Docs**: [github.com/PrismarineJS/mineflayer](https://github.com/PrismarineJS/mineflayer)
- **Spaced Repetition**: SM-2 Algorithm research by Piotr Woźniak
- **Adaptive Learning**: Bloom's Mastery Learning, Vygotsky's Zone of Proximal Development

---

**Version**: 0.1.0
**Last Updated**: 2026-03-27
**Maintainer**: CraftMind Team
