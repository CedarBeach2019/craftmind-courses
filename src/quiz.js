/**
 * Quiz — in-game quiz system with multiple choice and open-ended questions via chat.
 */

/**
 * @typedef {object} QuizQuestion
 * @property {string} question
 * @property {"multiple_choice"|"open_ended"} type
 * @property {string[]} [options] — for multiple choice
 * @property {string|string[]} answer — correct answer(s)
 * @property {string} explanation
 * @property {number} [points] — default 1
 */

export class Quiz {
  /**
   * @param {QuizQuestion[]} questions
   * @param {import('mineflayer').Bot} bot
   */
  constructor(questions, bot) {
    this.questions = questions;
    this.bot = bot;
    this.currentIndex = 0;
    this.score = 0;
    this.totalPoints = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);
    this.awaitingAnswer = false;
    this._answerResolver = null;
  }

  /** @returns {QuizQuestion|null} */
  get currentQuestion() {
    return this.questions[this.currentIndex] ?? null;
  }

  /** @returns {boolean} */
  get isComplete() {
    return this.currentIndex >= this.questions.length;
  }

  /**
   * Present the current question in chat and wait for an answer.
   * @returns {Promise<{correct:boolean, score:number, explanation:string}|null>} null if quiz is done.
   */
  async askCurrent() {
    const q = this.currentQuestion;
    if (!q) return null;

    this.bot.chat(`📝 Q${this.currentIndex + 1}/${this.questions.length}: ${q.question}`);
    if (q.type === 'multiple_choice' && q.options) {
      q.options.forEach((opt, i) => this.bot.chat(`  ${String.fromCharCode(65 + i)}) ${opt}`));
    }
    this.bot.chat('Type your answer in chat!');

    this.awaitingAnswer = true;
    return new Promise((resolve) => { this._answerResolver = resolve; });
  }

  /**
   * Process a chat message as a potential quiz answer.
   * @param {string} message — student's chat message
   * @returns {boolean} true if this message was consumed as an answer
   */
  processAnswer(message) {
    if (!this.awaitingAnswer || !this._answerResolver) return false;

    const q = this.currentQuestion;
    this.awaitingAnswer = false;

    const correct = this._check(message, q);
    if (correct) {
      this.score += q.points ?? 1;
      this.bot.chat(`✅ Correct! ${q.explanation}`);
    } else {
      this.bot.chat(`❌ Not quite! The answer: ${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}`);
      this.bot.chat(`💡 ${q.explanation}`);
    }

    const result = { correct, score: this.score, explanation: q.explanation };
    const resolver = this._answerResolver;
    this._answerResolver = null;
    this.currentIndex++;
    resolver(result);
    return true;
  }

  /** @private */
  _check(message, q) {
    const input = message.trim().toLowerCase();
    if (q.type === 'multiple_choice' && q.options) {
      const idx = input.charCodeAt(0) - 97; // 'a' → 0
      if (idx >= 0 && idx < q.options.length) {
        const selected = q.options[idx].toLowerCase();
        const answers = Array.isArray(q.answer) ? q.answer.map(a => a.toLowerCase()) : [q.answer.toLowerCase()];
        return answers.some(a => selected.includes(a) || a.includes(selected));
      }
    }
    const answers = Array.isArray(q.answer) ? q.answer.map(a => a.toLowerCase()) : [q.answer.toLowerCase()];
    return answers.some(a => input.includes(a) || a.includes(input));
  }

  /** Present final score. */
  showResults() {
    const pct = this.totalPoints ? Math.round((this.score / this.totalPoints) * 100) : 0;
    this.bot.chat(`🏁 Quiz complete! Score: ${this.score}/${this.totalPoints} (${pct}%)`);
    if (pct === 100) this.bot.chat('🌟 Perfect score! You\'re a genius!');
    else if (pct >= 80) this.bot.chat('⭐ Great job! Almost perfect!');
    else if (pct >= 60) this.bot.chat('👍 Not bad! Review the ones you missed.');
    else this.bot.chat('📚 Keep studying — you\'ll get there!');
  }
}

export default Quiz;
