/**
 * Classroom Spawner — Manages classroom creation, NPC spawning, and lesson orchestration.
 * Uses RCON for server commands and coordinates teacher/classmate interactions.
 */

import mineflayer from 'mineflayer';

/**
 * @typedef {object} ClassroomConfig
 * @property {string} host — Minecraft server host
 * @property {number} port — Minecraft server port
 * @property {string} rconHost — RCON server host
 * @property {number} rconPort — RCON server port
 * @property {string} rconPassword — RCON password
 * @property {string} teacherName — username for teacher bot
 * @property {string[]} classmateNames — usernames for classmate bots
 * @property {string} studentName — username for student (real player)
 * @property {object} location — classroom spawn point {x, y, z}
 */

/**
 * Simple RCON client for Minecraft servers
 */
class RCONClient {
  /**
   * @param {string} host
   * @param {number} port
   * @param {string} password
   */
  constructor(host, port, password) {
    this.host = host;
    this.port = port;
    this.password = password;
    this.connected = false;
  }

  /**
   * Connect to RCON server
   * Note: This is a simplified version. For production, use a proper RCON library.
   */
  async connect() {
    // In production, use a proper RCON library like 'rcon-client' or 'minecraft-rcon'
    // For now, we'll mark as connected for demo purposes
    this.connected = true;
    return true;
  }

  /**
   * Send a command via RCON
   * @param {string} command
   * @returns {Promise<string>}
   */
  async send(command) {
    if (!this.connected) {
      throw new Error('RCON not connected');
    }

    // Simplified - in production, actual RCON protocol happens here
    console.log(`[RCON] ${command}`);
    return '';
  }

  /**
   * Disconnect from RCON
   */
  disconnect() {
    this.connected = false;
  }
}

/**
 * Classroom Manager — Spawns and manages classroom NPCs
 */
export class Classroom {
  /**
   * @param {ClassroomConfig} config
   */
  constructor(config) {
    this.config = config;
    this.rcon = new RCONClient(config.rconHost, config.rconPort, config.rconPassword);

    /** @type {import('mineflayer').Bot|null} */
    this.teacherBot = null;
    /** @type {Map<string, import('mineflayer').Bot>} */
    this.classmateBots = new Map();
    /** @type {import('mineflayer').Bot|null} */
    this.studentBot = null;

    this.active = false;
    this.currentLesson = null;
  }

  /**
   * Spawn all NPCs and build the classroom
   * @returns {Promise<boolean>}
   */
  async spawn() {
    try {
      // Connect RCON
      await this.rcon.connect();

      // Build classroom structure
      await this.buildClassroom();

      // Spawn NPCs
      await this.spawnTeacher();
      await this.spawnClassmates();

      // Wait for student (real player)
      this.studentBot = await this.waitForStudent();

      this.active = true;
      console.log('🏫 Classroom ready!');

      // Teacher welcomes student
      if (this.teacherBot) {
        this.teacherBot.chat(`👋 Welcome to class, ${this.config.studentName}! I'm ${this.config.teacherName}, your teacher!`);
        this.teacherBot.chat('📚 Today we\'re going to learn something amazing. Let\'s get started!');
      }

      return true;
    } catch (error) {
      console.error('Failed to spawn classroom:', error);
      return false;
    }
  }

  /**
   * Build the classroom structure using RCON commands
   */
  async buildClassroom() {
    const { x, y, z } = this.config.location;
    const commands = [
      // Clear area
      `/fill ${x - 10} ${y} ${z - 10} ${x + 10} ${y + 5} ${z + 10} air replace`,
      // Floor
      `/fill ${x - 10} ${y - 1} ${z - 10} ${x + 10} ${y - 1} ${z + 10} oak_planks`,
      // Walls
      `/fill ${x - 10} ${y} ${z - 10} ${x - 10} ${y + 4} ${z + 10} oak_fence`,
      `/fill ${x + 10} ${y} ${z - 10} ${x + 10} ${y + 4} ${z + 10} oak_fence`,
      `/fill ${x - 10} ${y} ${z - 10} ${x + 10} ${y + 4} ${z - 10} oak_fence`,
      `/fill ${x - 10} ${y} ${z + 10} ${x + 10} ${y + 4} ${z + 10} oak_fence`,
      // Ceiling
      `/fill ${x - 10} ${y + 5} ${z - 10} ${x + 10} ${y + 5} ${z + 10} oak_planks`,
      // Desks
      `/fill ${x - 5} ${y} ${z - 5} ${x - 3} ${y} ${z - 3} oak_slab`,
      `/fill ${x - 5} ${y} ${z - 4} ${x - 3} ${y} ${z - 4} oak_fence`,
      // Blackboard
      `/setblock ${x} ${y + 2} ${z - 10} black_wall_sign[facing=north]`,
    ];

    for (const cmd of commands) {
      await this.rcon.send(cmd);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Set blackboard text
    await this.rcon.send(`/data merge block ${x} ${y + 2} ${z - 10} {Text1:'{"text":"📚 LESSON"}',Text2:'{"text":"--------"}',Text3:'{"text":"Ready to"}',Text4:'{"text":"Learn!"}'}`);
  }

  /**
   * Spawn the teacher NPC
   */
  async spawnTeacher() {
    this.teacherBot = mineflayer.createBot({
      host: this.config.host,
      port: this.config.port,
      username: this.config.teacherName,
    });

    return new Promise((resolve, reject) => {
      this.teacherBot.once('spawn', () => {
        // Teleport to teacher position
        this.teacherBot.chat(`/tp ${this.config.teacherName} ${this.config.location.x} ${this.config.location.y} ${this.config.location.z + 5}`);
        console.log(`✅ Teacher spawned: ${this.config.teacherName}`);
        resolve();
      });

      this.teacherBot.once('error', reject);
    });
  }

  /**
   * Spawn classmate NPCs
   */
  async spawnClassmates() {
    for (let i = 0; i < this.config.classmateNames.length; i++) {
      const name = this.config.classmateNames[i];
      const bot = mineflayer.createBot({
        host: this.config.host,
        port: this.config.port,
        username: name,
      });

      await new Promise((resolve, reject) => {
        bot.once('spawn', () => {
          // Position classmates at student desks
          const offsetX = (i - 1) * 3;
          bot.chat(`/tp ${name} ${this.config.location.x + offsetX} ${this.config.location.y} ${this.config.location.z - 4}`);
          this.classmateBots.set(name, bot);
          console.log(`✅ Classmate spawned: ${name}`);
          resolve();
        });

        bot.once('error', reject);
      });
    }
  }

  /**
   * Wait for the real student to join
   * @returns {Promise<import('mineflayer').Bot>}
   */
  async waitForStudent() {
    return new Promise((resolve) => {
      // Create a bot to represent the student
      const bot = mineflayer.createBot({
        host: this.config.host,
        port: this.config.port,
        username: this.config.studentName,
      });

      bot.once('spawn', () => {
        // Teleport student to desk
        bot.chat(`/tp ${this.config.studentName} ${this.config.location.x} ${this.config.location.y} ${this.config.location.z - 4}`);
        console.log(`✅ Student joined: ${this.config.studentName}`);
        resolve(bot);
      });
    });
  }

  /**
   * Start a lesson
   * @param {object} lesson — lesson object from course
   * @param {import('./quiz-engine.js').QuizEngine} quizEngine
   */
  async startLesson(lesson, quizEngine) {
    if (!this.active || !this.teacherBot) {
      throw new Error('Classroom not active');
    }

    this.currentLesson = lesson;

    // Teacher introduces lesson
    this.teacherBot.chat('');
    this.teacherBot.chat(`📖 ${lesson.title}`);
    this.teacherBot.chat('');
    this.teacherBot.chat(lesson.description);
    this.teacherBot.chat('');

    // Objectives
    this.teacherBot.chat('🎯 Objectives:');
    lesson.objectives.forEach((obj, i) => {
      this.teacherBot.chat(`  ${i + 1}. ${obj}`);
    });
    this.teacherBot.chat('');

    // Difficulty indicator
    const difficultyStars = '⭐'.repeat(lesson.difficulty);
    this.teacherBot.chat(`Difficulty: ${difficultyStars} (${lesson.estimatedMinutes} min)`);
    this.teacherBot.chat('');

    // Random classmate reaction
    this.triggerClassmateReaction('start');

    // Wait a moment for student to read
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Begin steps
    await this.runLessonSteps(lesson, quizEngine);
  }

  /**
   * Run through lesson steps
   * @param {object} lesson
   * @param {import('./quiz-engine.js').QuizEngine} quizEngine
   */
  async runLessonSteps(lesson, quizEngine) {
    for (let i = 0; i < lesson.steps.length; i++) {
      const step = lesson.steps[i];
      const stepNum = i + 1;

      this.teacherBot.chat(`📍 Step ${stepNum}/${lesson.steps.length}: ${step.description}`);

      // Handle different step types
      switch (step.type) {
        case 'navigate_to':
          this.teacherBot.chat(`🗺️ Head to: ${step.target.x}, ${step.target.y}, ${step.target.z}`);
          break;

        case 'build_block':
          this.teacherBot.chat(`🔨 Time to build! Follow the instructions carefully.`);
          break;

        case 'interact_npc':
          this.teacherBot.chat('💬 Come talk to me when you\'re ready to explain what you learned!');
          break;

        case 'observe':
          this.teacherBot.chat('👀 Take a good look at the demo setup. Notice how things work!');
          break;

        case 'solve_puzzle':
          this.teacherBot.chat('🧩 Puzzle time! Use what you\'ve learned to solve this challenge.');
          // Random classmate might give a hint or wrong answer
          this.triggerClassmateReaction('puzzle');
          break;

        case 'complete_challenge':
          this.teacherBot.chat('🏆 Challenge: Put your skills to the test!');
          break;

        case 'discovery':
          this.teacherBot.chat(`🔍 ${step.discovery.title}`);
          this.teacherBot.chat(step.discovery.description);
          break;

        default:
          this.teacherBot.chat(`➡️ ${step.description}`);
      }

      // Wait for student to complete step (in real implementation, detect completion)
      await this.waitForStepCompletion(step);

      // Occasional classmate interaction
      if (Math.random() < 0.3) {
        this.triggerClassmateReaction('random');
      }
    }

    // Quiz time!
    if (lesson.quiz && lesson.quiz.length > 0) {
      await this.runQuiz(lesson, quizEngine);
    }
  }

  /**
   * Wait for student to complete a step
   * @param {object} step
   */
  async waitForStepCompletion(step) {
    // In production, this would detect actual completion (blocks placed, location reached, etc.)
    // For now, simulate with a delay
    const delay = step.type === 'solve_puzzle' || step.type === 'complete_challenge' ? 8000 : 3000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Teacher acknowledgment
    if (this.teacherBot) {
      const acknowledgments = [
        'Great progress!',
        'Nice work!',
        'You\'re getting it!',
        'Keep it up!',
      ];
      const msg = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
      this.teacherBot.chat(msg);
    }
  }

  /**
   * Run the quiz for a lesson
   * @param {object} lesson
   * @param {import('./quiz-engine.js').QuizEngine} quizEngine
   */
  async runQuiz(lesson, quizEngine) {
    if (!this.teacherBot) return;

    this.teacherBot.chat('');
    this.teacherBot.chat('📝 Time for a quiz! Let\'s see what you learned.');
    this.teacherBot.chat('');

    // Run quiz through engine
    const results = await quizEngine.runQuiz(lesson.quiz, lesson.id);

    // Show results
    quizEngine.showResults();

    // Classmates react to results
    this.triggerClassmateReaction('quiz', results);
  }

  /**
   * Trigger a classmate reaction/event
   * @param {string} event — 'start'|'puzzle'|'random'|'quiz'
   * @param {object} [data]
   */
  triggerClassmateReaction(event, data = null) {
    const classmates = Array.from(this.classmateBots.values());
    if (classmates.length === 0) return;

    // Pick random classmate
    const classmate = classmates[Math.floor(Math.random() * classmates.length)];

    /** @type {Object.<string, string[]>} */
    const reactions = {
      start: [
        'Ooh, this sounds interesting!',
        'I\'ve been wondering about this topic!',
        'Let\'s do this!',
      ],
      puzzle: [
        'Hmm, I\'m not sure how to solve this...',
        'Wait, shouldn\'t we use redstone here?',
        'I think I know the answer! ...actually, no I don\'t.',
      ],
      random: [
        'This is making sense now!',
        'Can you explain that part again?',
        'Oh! I get it!',
      ],
      quiz: [
        'Good luck on the quiz!',
        'You\'ve got this!',
        'I learned a lot just watching you work!',
      ],
    };

    const lines = reactions[event] ?? reactions.random;
    const line = lines[Math.floor(Math.random() * lines.length)];

    setTimeout(() => {
      classmate.chat(line);
    }, 1000);
  }

  /**
   * End the current lesson
   */
  async endLesson() {
    if (!this.teacherBot || !this.currentLesson) return;

    this.teacherBot.chat('');
    this.teacherBot.chat('🎉 Great job completing this lesson!');
    this.teacherBot.chat('📚 Make sure to review what you learned — spaced repetition is key!');
    this.teacherBot.chat('');
    this.teacherBot.chat('👋 See you next time!');

    this.currentLesson = null;
  }

  /**
   * End the classroom session and disconnect all bots
   */
  async endSession() {
    this.active = false;

    // Disconnect all bots
    if (this.teacherBot) {
      this.teacherBot.quit();
      this.teacherBot = null;
    }

    for (const bot of this.classmateBots.values()) {
      bot.quit();
    }
    this.classmateBots.clear();

    if (this.studentBot) {
      this.studentBot.quit();
      this.studentBot = null;
    }

    // Disconnect RCON
    this.rcon.disconnect();

    console.log('🏫 Classroom session ended.');
  }

  /**
   * Get current lesson info
   * @returns {object|null}
   */
  getCurrentLesson() {
    return this.currentLesson;
  }

  /**
   * Check if classroom is active
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }
}

export default Classroom;
