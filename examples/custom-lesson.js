#!/usr/bin/env node

/**
 * Example: Create and run a custom lesson programmatically.
 * Shows how to define lessons in code without a JSON file.
 *
 * Usage:  node examples/custom-lesson.js
 */
import { Lesson } from '../src/lesson.js';
import { Course } from '../src/course.js';
import { Quiz } from '../src/quiz.js';

// Fake bot
const fakeBot = { chat(msg) { console.log(`  [BOT] ${msg}`); } };

// Define a custom lesson entirely in JavaScript
const myLesson = Lesson.fromJSON('custom-waterfall', {
  title: 'Building a Waterfall',
  description: 'Create a stunning natural waterfall feature using water physics and decorative blocks!',
  objectives: [
    'Carve a cliff face',
    'Set up water flow with a single source block',
    'Add vegetation and lighting',
  ],
  prerequisites: [],
  difficulty: 2,
  estimatedMinutes: 20,
  steps: [
    { type: 'navigate_to', description: 'Find a cliff or build one at least 10 blocks tall', target: { x: 0, y: 74, z: 0 } },
    { type: 'build_block', description: 'Carve the cliff face into a natural-looking shape — not perfectly flat!' },
    { type: 'build_block', description: 'Place a water source block at the very top edge of the cliff' },
    { type: 'observe', description: 'Watch how the water flows down — Minecraft water flows up to 7 blocks from a source!' },
    { type: 'build_block', description: 'Create a pool at the bottom: dig a 5×5 area, 2 blocks deep' },
    { type: 'build_block', description: 'Add decorative elements: mossy cobblestone, vines, ferns, and flowers around the base' },
    { type: 'build_block', description: 'Place sea lanterns or glowstone inside the cliff face for a hidden light effect' },
  ],
  quiz: [
    {
      question: 'How far does water flow from a single source block?',
      type: 'multiple_choice',
      options: ['3 blocks', '5 blocks', '7 blocks', '15 blocks'],
      answer: '7 blocks',
      explanation: 'Water flows up to 7 blocks from a source. To make longer waterfalls, place source blocks every 8 blocks vertically!',
    },
    {
      question: 'What block looks natural behind a waterfall?',
      type: 'open_ended',
      answer: ['mossy cobblestone', 'stone', 'deepslate', 'granite'],
      explanation: 'Mossy cobblestone, stone, and deepslate all look great behind waterfalls. Avoid smooth blocks — rough textures blend better with flowing water.',
    },
  ],
});

// Wrap it in a course
const course = new Course({
  id: 'custom-scenery',
  title: 'Custom Scenery Building',
  description: 'My custom lesson collection!',
  author: 'You!',
  lessons: [{
    id: 'custom-waterfall',
    title: myLesson.title,
    description: myLesson.description,
    objectives: myLesson.objectives,
    prerequisites: myLesson.prerequisites,
    difficulty: myLesson.difficulty,
    estimatedMinutes: myLesson.estimatedMinutes,
    steps: myLesson.steps,
    quiz: myLesson.quiz,
  }],
});

console.log(`\n🏗️ Custom Course: ${course.title}`);
console.log(`   ${course.description}\n`);

// Run through it
for (const lesson of course.orderedLessons) {
  console.log(`📖 ${lesson.title}`);
  while (!lesson.completed) {
    const step = lesson.currentStep;
    console.log(`  📌 [${step.type}] ${step.description}`);
    lesson.advanceStep();
  }
}

// Run quiz interactively (auto-answer)
if (myLesson.quiz?.length) {
  console.log(`\n📝 Quiz:`);
  const quiz = new Quiz(myLesson.quiz, fakeBot);
  while (!quiz.isComplete) {
    const q = quiz.currentQuestion;
    const answer = Array.isArray(q.answer) ? q.answer[0] : q.answer;
    quiz.processAnswer(answer);
  }
}

console.log(`\n✅ Done! Lesson progress: ${(myLesson.progress * 100).toFixed(0)}%`);
console.log('\n💡 Tip: Save your lesson as a JSON file in courses/ and load it with:');
console.log('   node src/index.js --course courses/my-course.json\n');
