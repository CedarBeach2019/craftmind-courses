/**
 * Achievements — badge/achievement system with unlock conditions and celebration effects.
 */

/** @typedef {{id:string, name:string, description:string, icon:string, condition:(ctx:object)=>boolean}} Achievement */

export const ACHIEVEMENTS = [
  { id: 'first_build', name: 'First Build', description: 'Complete your very first lesson', icon: '🏗️',
    condition: (ctx) => ctx.completedLessons >= 1 },
  { id: 'redstone_novice', name: 'Redstone Novice', description: 'Complete all redstone basics lessons', icon: '⚡',
    condition: (ctx) => ctx.redstoneLessons >= 3 },
  { id: 'redstone_master', name: 'Redstone Master', description: 'Get 100% on a redstone quiz', icon: '🔌',
    condition: (ctx) => ctx.perfectQuiz && ctx.lastTopic?.includes('redstone') },
  { id: 'speed_runner', name: 'Speed Runner', description: 'Complete a lesson in under 5 minutes', icon: '🏃',
    condition: (ctx) => ctx.lastLessonTime < 300 },
  { id: 'perfect_quiz', name: 'Quiz Ace', description: 'Get a perfect score on any quiz', icon: '🏆',
    condition: (ctx) => ctx.perfectQuiz },
  { id: 'streak_3', name: 'On Fire', description: 'Complete 3 lessons in a row', icon: '🔥',
    condition: (ctx) => ctx.streak >= 3 },
  { id: 'streak_5', name: 'Unstoppable', description: 'Complete 5 lessons in a row', icon: '💎',
    condition: (ctx) => ctx.streak >= 5 },
  { id: 'curious_mind', name: 'Curious Mind', description: 'Ask 10 questions during lessons', icon: '🤔',
    condition: (ctx) => ctx.questionsAsked >= 10 },
  { id: 'helper', name: 'Helpful Hand', description: 'Get a classmate to thank you', icon: '🤝',
    condition: (ctx) => ctx.helpedClassmate },
  { id: 'graduate', name: 'Course Graduate', description: 'Complete all lessons in a course', icon: '🎓',
    condition: (ctx) => ctx.courseComplete },
];

export class AchievementSystem {
  /** @param {import('./progress.js').Progress} progress */
  constructor(progress) {
    this.progress = progress;
    /** @type {Map<string, Achievement>} */
    this.registry = new Map(ACHIEVEMENTS.map(a => [a.id, a]));
  }

  /**
   * Check all achievements against current context and unlock new ones.
   * @param {object} ctx — context with properties matching condition checks
   * @returns {Achievement[]} newly unlocked achievements
   */
  check(ctx) {
    const newlyUnlocked = [];
    for (const ach of ACHIEVEMENTS) {
      if (this.progress.achievements.includes(ach.id)) continue;
      if (ach.condition(ctx)) {
        this.progress.unlockAchievement(ach.id);
        newlyUnlocked.push(ach);
      }
    }
    return newlyUnlocked;
  }

  /**
   * Announce unlocked achievements in chat.
   * @param {import('mineflayer').Bot} bot
   * @param {Achievement[]} achievements
   */
  celebrate(bot, achievements) {
    for (const ach of achievements) {
      bot.chat('');
      bot.chat(`╔══════════════════════════╗`);
      bot.chat(`║  ${ach.icon} ACHIEVEMENT UNLOCKED! ║`);
      bot.chat(`║  ${ach.name.padEnd(22)}║`);
      bot.chat(`║  ${ach.description.substring(0, 22).padEnd(22)}║`);
      bot.chat(`╚══════════════════════════╝`);
      bot.chat('');
    }
  }
}

export default AchievementSystem;
