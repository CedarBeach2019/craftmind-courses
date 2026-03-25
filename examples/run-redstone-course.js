#!/usr/bin/env node

/**
 * Example: Run the Redstone Basics course standalone (no Minecraft server needed).
 * Demonstrates loading a course, iterating lessons, and simulating quiz flow.
 *
 * Usage:  node examples/run-redstone-course.js
 */
import { Course } from '../src/course.js';
import { Quiz } from '../src/quiz.js';
import { Progress } from '../src/progress.js';
import { AchievementSystem } from '../src/achievements.js';

// Fake bot for quiz output (prints to console instead of Minecraft chat)
const fakeBot = {
  chat(msg) {
    console.log(`  [BOT] ${msg}`);
  },
};

async function main() {
  const course = await Course.fromFile('courses/redstone-basics.json');
  console.log(`\n📚 ${course.title}`);
  console.log(`   ${course.description}`);
  console.log(`   ${course.orderedLessons.length} lessons · ~${course.totalEstimatedMinutes}min · avg difficulty ${course.averageDifficulty.toFixed(1)}/5\n`);

  const progress = new Progress('example-student', '/tmp/craftmind-example');
  const achievements = new AchievementSystem(progress);

  for (const lesson of course.orderedLessons) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📖 ${lesson.title}`);
    console.log(`   ${lesson.description}`);
    console.log(`   Objectives: ${lesson.objectives.join(', ')}`);
    console.log(`   Steps: ${lesson.steps.length} · Quiz: ${lesson.quiz?.length ?? 0} questions · Difficulty: ${lesson.difficulty}`);

    // Simulate going through steps
    while (!lesson.completed) {
      const step = lesson.currentStep;
      console.log(`   📌 Step ${lesson.currentStepIndex + 1}: [${step.type}] ${step.description}`);
      lesson.advanceStep();
    }
    console.log(`   ✅ Lesson complete! (${(lesson.progress * 100).toFixed(0)}%)`);

    // Simulate quiz
    if (lesson.quiz?.length) {
      console.log(`\n   📝 Quiz Time!`);
      const quiz = new Quiz(lesson.quiz, fakeBot);
      while (!quiz.isComplete) {
        const q = quiz.currentQuestion;
        // Auto-answer correctly for demo
        const correctAnswer = Array.isArray(q.answer) ? q.answer[0] : q.answer;
        console.log(`   🧠 Auto-answering: "${correctAnswer}"`);
        quiz.processAnswer(correctAnswer);
      }
    }

    // Record progress
    const completedCount = [...progress.lessons.values()].filter(l => l.completed).length + 1;
    progress.completeLesson(lesson.id, 100, 300);
    const ctx = {
      completedLessons: completedCount,
      perfectQuiz: true,
      lastTopic: course.id,
      lastLessonTime: 300,
      streak: completedCount,
      questionsAsked: 0,
      helpedClassmate: false,
      courseComplete: false,
    };
    const newlyUnlocked = achievements.check(ctx);
    for (const ach of newlyUnlocked) {
      console.log(`\n   ${ach.icon} ACHIEVEMENT UNLOCKED: ${ach.name} — ${ach.description}`);
    }
  }

  // Final stats
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`🎉 Course complete!`);
  console.log(`   Achievements: ${progress.achievements.join(', ')}`);
  console.log(`   Avg quiz score: ${progress.averageQuizScore.toFixed(0)}%`);
  console.log(`   Course progress: ${(progress.courseProgress(course.id, course.orderedLessons.length) * 100).toFixed(0)}%`);
}

main().catch(console.error);
