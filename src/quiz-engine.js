/**
 * Quiz Engine — Enhanced interactive quiz system with spaced repetition and confidence tracking.
 * Supports multiple choice, true/false, and fill-in-the-blank questions via Minecraft chat.
 */

/**
 * @typedef {object} QuizQuestion
 * @property {string} id
 * @property {string} question
 * @property {"multiple_choice"|"true_false"|"fill_blank"} type
 * @property {string[]} [options] — for multiple choice
 * @property {string|boolean|number} answer
 * @property {string} explanation
 * @property {number} [points] — default 1
 * @property {string} [topic] — for confidence tracking
 * @property {string} [commonMistake] — common misconception to address
 */

/**
 * @typedef {object} ScheduledReview
 * @property {string} questionId
 * @property {string} topic
 * @property {number} interval — days until next review
 * @property {number} easeFactor — SM-2 ease factor
 * @property {number} repetitions — successful repetitions
 * @property {Date} nextReview
 */

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on Piotr Woźniak's SuperMemo 2 algorithm
 */
class SM2Scheduler {
  constructor() {
    /** @type {Map<string, ScheduledReview>} */
    this.schedule = new Map();
  }

  /**
   * Calculate next review interval based on performance
   * @param {string} questionId
   * @param {number} quality — 0-5 rating (0=blackout, 5=perfect)
   * @param {string} topic
   * @returns {ScheduledReview}
   */
  scheduleReview(questionId, quality, topic = 'general') {
    const existing = this.schedule.get(questionId);
    let interval = 1; // days
    let easeFactor = 2.5;
    let repetitions = 0;

    if (existing) {
      easeFactor = existing.easeFactor;
      repetitions = existing.repetitions;
    }

    // SM-2 algorithm
    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(existing.interval * easeFactor);
      }
      repetitions++;
    } else {
      // Incorrect response — restart
      repetitions = 0;
      interval = 1;
    }

    // Update ease factor
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const review = {
      questionId,
      topic,
      interval,
      easeFactor,
      repetitions,
      nextReview,
    };

    this.schedule.set(questionId, review);
    return review;
  }

  /**
   * Get questions due for review
   * @param {string} [topic] — filter by topic
   * @returns {ScheduledReview[]}
   */
  getDueReviews(topic = null) {
    const now = new Date();
    return Array.from(this.schedule.values())
      .filter(review => review.nextReview <= now && (!topic || review.topic === topic));
  }

  /**
   * Clear all scheduled reviews (useful for testing)
   */
  clear() {
    this.schedule.clear();
  }
}

/**
 * Confidence Tracker — Per-topic confidence scoring
 */
class ConfidenceTracker {
  constructor() {
    /** @type {Map<string, number>} — topic -> confidence (0.0-1.0) */
    this.confidence = new Map();
  }

  /**
   * Get confidence score for a topic
   * @param {string} topic
   * @returns {number} 0.0-1.0
   */
  getConfidence(topic) {
    return this.confidence.get(topic) ?? 0.5; // default to neutral
  }

  /**
   * Update confidence based on performance
   * @param {string} topic
   * @param {boolean} correct
   * @param {number} [difficulty] — 1-5, higher = harder
   */
  update(topic, correct, difficulty = 3) {
    const current = this.getConfidence(topic);
    const delta = correct ? 0.1 : -0.15;
    const difficultyMultiplier = difficulty / 3;
    const newConfidence = Math.max(0.0, Math.min(1.0, current + delta * difficultyMultiplier));
    this.confidence.set(topic, newConfidence);
  }

  /**
   * Get all topics below a confidence threshold
   * @param {number} threshold
   * @returns {string[]}
   */
  getWeakTopics(threshold = 0.6) {
    return Array.from(this.confidence.entries())
      .filter(([_, confidence]) => confidence < threshold)
      .map(([topic, _]) => topic);
  }

  /**
   * Get strong topics to use for peer teaching
   * @param {number} threshold
   * @returns {string[]}
   */
  getStrongTopics(threshold = 0.8) {
    return Array.from(this.confidence.entries())
      .filter(([_, confidence]) => confidence >= threshold)
      .map(([topic, _]) => topic);
  }
}

/**
 * Quiz Engine — Main quiz management system
 */
export class QuizEngine {
  /**
   * @param {import('mineflayer').Bot} teacherBot
   * @param {import('mineflayer').Bot} studentBot
   * @param {object} [opts]
   * @param {import('./progress.js').Progress} [opts.progress]
   */
  constructor(teacherBot, studentBot, opts = {}) {
    this.teacher = teacherBot;
    this.student = studentBot;
    this.progress = opts.progress ?? null;

    this.scheduler = new SM2Scheduler();
    this.confidence = new ConfidenceTracker();

    /** @type {QuizQuestion[]} */
    this.questionBank = [];
    /** @type {QuizQuestion|null} */
    this.currentQuestion = null;
    this.awaitingAnswer = false;
    this._answerResolver = null;

    this.score = 0;
    this.totalAsked = 0;
    this.correctAnswers = 0;

    // Listen for student chat
    this.student.on('chat', (username, message) => {
      if (username === this.student.username) return; // ignore self
      this.handleAnswer(message);
    });
  }

  /**
   * Add questions to the question bank
   * @param {QuizQuestion[]} questions
   */
  addQuestions(questions) {
    this.questionBank.push(...questions);
  }

  /**
   * Ask a question in chat and wait for answer
   * @param {QuizQuestion} question
   * @returns {Promise<{correct:boolean, explanation:string, points:number}>}
   */
  async askQuestion(question) {
    this.currentQuestion = question;
    this.awaitingAnswer = true;
    this.totalAsked++;

    // Build question text
    let qText = `📝 ${question.question}`;
    if (question.type === 'multiple_choice' && question.options) {
      qText += '\n';
      question.options.forEach((opt, i) => {
        qText += `\n  ${String.fromCharCode(65 + i)}) ${opt}`;
      });
    } else if (question.type === 'true_false') {
      qText += '\n  a) True\n  b) False';
    }
    qText += '\n\nType your answer in chat!';

    this.teacher.chat(qText);

    return new Promise((resolve) => {
      this._answerResolver = resolve;
    });
  }

  /**
   * Process a student's answer
   * @param {string} message
   * @returns {boolean} true if message was consumed as an answer
   */
  handleAnswer(message) {
    if (!this.awaitingAnswer || !this.currentQuestion || !this._answerResolver) {
      return false;
    }

    const q = this.currentQuestion;
    const input = message.trim().toLowerCase();
    const correct = this.checkAnswer(input, q);

    // Provide feedback
    if (correct) {
      this.correctAnswers++;
      this.score += q.points ?? 1;
      this.teacher.chat(`✅ Correct! ${q.explanation}`);

      // Update confidence
      if (q.topic) {
        this.confidence.update(q.topic, true, q.difficulty ?? 3);
      }

      // Schedule review
      const quality = this.calculateQuality(q, true);
      this.scheduler.scheduleReview(q.id, quality, q.topic);
    } else {
      const answerText = this.formatAnswer(q.answer);
      this.teacher.chat(`❌ Not quite! The answer is: ${answerText}`);
      this.teacher.chat(`💡 ${q.explanation}`);

      if (q.commonMistake) {
        this.teacher.chat(`⚠️ ${q.commonMistake}`);
      }

      // Update confidence
      if (q.topic) {
        this.confidence.update(q.topic, false, q.difficulty ?? 3);
      }

      // Schedule review with lower quality
      const quality = this.calculateQuality(q, false);
      this.scheduler.scheduleReview(q.id, quality, q.topic);
    }

    // Resolve promise
    const result = {
      correct,
      explanation: q.explanation,
      points: q.points ?? 1,
      topic: q.topic,
    };

    this.awaitingAnswer = false;
    this.currentQuestion = null;
    const resolver = this._answerResolver;
    this._answerResolver = null;
    resolver(result);

    return true;
  }

  /**
   * Check if an answer is correct
   * @param {string} input
   * @param {QuizQuestion} q
   * @returns {boolean}
   */
  checkAnswer(input, q) {
    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      // Letter answer (a, b, c, d)
      const idx = input.charCodeAt(0) - 97;
      if (idx >= 0 && idx < (q.options?.length ?? 2)) {
        if (q.type === 'true_false') {
          return (idx === 0 && q.answer === true) || (idx === 1 && q.answer === false);
        }
        const selected = q.options[idx].toLowerCase();
        const answerStr = String(q.answer).toLowerCase();
        return selected.includes(answerStr) || answerStr.includes(selected);
      }
    }

    // Text-based answer (fill_blank or open-ended)
    const answerStr = String(q.answer).toLowerCase();
    return answerStr.includes(input) || input.includes(answerStr);
  }

  /**
   * Format answer for display
   * @param {string|boolean|number} answer
   * @returns {string}
   */
  formatAnswer(answer) {
    if (typeof answer === 'boolean') return answer ? 'True' : 'False';
    return String(answer);
  }

  /**
   * Calculate quality rating for SM-2 (0-5)
   * @param {QuizQuestion} q
   * @param {boolean} correct
   * @returns {number}
   */
  calculateQuality(q, correct) {
    if (!correct) return 1; // poor recall
    if (q.difficulty >= 4) return 5; // perfect, hard question
    if (q.difficulty >= 3) return 4; // good
    return 3; // acceptable
  }

  /**
   * Get questions due for spaced repetition review
   * @param {string} [topic]
   * @returns {QuizQuestion[]}
   */
  getReviewQuestions(topic = null) {
    const dueReviews = this.scheduler.getDueReviews(topic);
    return dueReviews
      .map(review => this.questionBank.find(q => q.id === review.questionId))
      .filter(Boolean);
  }

  /**
   * Run a complete quiz session with review questions injected
   * @param {QuizQuestion[]} questions
   * @param {string} [topic]
   * @returns {Promise<{score:number, total:number, correct:number, confidence:Object}>}
   */
  async runQuiz(questions, topic = null) {
    // Inject review questions
    const reviewQuestions = this.getReviewQuestions(topic);
    const allQuestions = [...reviewQuestions, ...questions];

    for (const q of allQuestions) {
      await this.askQuestion(q);
      // Small delay between questions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      score: this.score,
      total: this.totalAsked,
      correct: this.correctAnswers,
      confidence: Object.fromEntries(this.confidence.confidence),
    };
  }

  /**
   * Show final quiz results
   */
  showResults() {
    const pct = this.totalAsked > 0 ? Math.round((this.correctAnswers / this.totalAsked) * 100) : 0;
    this.teacher.chat(`🏁 Quiz complete! Score: ${this.correctAnswers}/${this.totalAsked} (${pct}%)`);

    if (pct === 100) {
      this.teacher.chat('🌟 Perfect score! You\'ve truly mastered this topic!');
    } else if (pct >= 80) {
      this.teacher.chat('⭐ Great job! Almost perfect — review the ones you missed.');
    } else if (pct >= 60) {
      this.teacher.chat('👍 Not bad! The concepts are starting to click. A quick review will help.');
    } else {
      this.teacher.chat('📚 This topic needs more practice — don\'t worry, spaced repetition will help!');
    }

    // Show confidence report
    const weakTopics = this.confidence.getWeakTopics(0.6);
    if (weakTopics.length > 0) {
      this.teacher.chat(`💪 Focus areas: ${weakTopics.join(', ')}`);
    }
  }

  /**
   * Get current confidence scores
   * @returns {Object.<string, number>}
   */
  getConfidenceScores() {
    return Object.fromEntries(this.confidence.confidence);
  }

  /**
   * Reset quiz state (useful for starting fresh)
   */
  reset() {
    this.score = 0;
    this.totalAsked = 0;
    this.correctAnswers = 0;
    this.currentQuestion = null;
    this.awaitingAnswer = false;
    this._answerResolver = null;
  }
}

export default QuizEngine;
