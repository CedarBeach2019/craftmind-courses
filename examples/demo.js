// ═══════════════════════════════════════════════════════════════
// CraftMind Courses — Demo
// ═══════════════════════════════════════════════════════════════

import { Course } from '../src/course.js';
import { Progress } from '../src/progress.js';
import { Quiz } from '../src/quiz.js';
import { AchievementSystem } from '../src/achievements.js';
import { SkillTree } from '../src/skill-tree.js';
import { TeachingStyleManager, TEACHING_STYLES } from '../src/teaching-styles.js';

console.log(`
📚 CraftMind Courses — AI Education Demo
══════════════════════════════════════════
`);

// Course loading
const course = await Course.fromFile('courses/building-basics.json');
console.log(`📖 Course: "${course.title}"`);
console.log(`   Lessons: ${course.orderedLessons.length}`);
console.log(`   Est. time: ~${course.totalEstimatedMinutes}min`);

// Skill tree
const progress = new Progress('demo-student');
const skillTree = SkillTree.fromCourse(course, progress, progress.adaptive, progress.spacedRep);
console.log('\n🌳 Skill Tree:');
console.log(skillTree.toASCII());

// Teaching styles
console.log('\n🎨 Available Teaching Styles:');
const styleList = TeachingStyleManager.getStyleList();
for (const s of styleList) {
  console.log(`   ${s.id.padEnd(10)} ${s.name} — ${s.description}`);
}

// Quiz
console.log('\n📝 Sample Quiz:');
const quiz = new Quiz([
  { question: 'What block is best for a wall?', options: ['Dirt', 'Cobblestone', 'Glass', 'Sand'], answer: 1, points: 10 },
  { question: 'How many blocks tall is a door?', options: ['1', '2', '3', '4'], answer: 1, points: 10 },
]);
console.log(`   ${quiz.questions.length} questions, ${quiz.totalPoints} total points`);

// Achievements
const achievements = new AchievementSystem(progress);
const unlocked = achievements.check({ completedLessons: 1, perfectQuiz: true });
console.log(`\n🏆 Achievements: ${unlocked.length > 0 ? unlocked.map(a => a.name).join(', ') : 'Complete a lesson to unlock!'}`);

console.log('\n✨ Demo complete!');
