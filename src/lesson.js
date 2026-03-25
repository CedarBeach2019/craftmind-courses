/**
 * Lesson — represents a single lesson with objectives, steps, quiz questions, and a world template.
 *
 * Step types: "navigate_to", "build_block", "interact_npc", "observe",
 *             "solve_puzzle", "complete_challenge"
 */
export class Lesson {
  /**
   * @param {object} data
   * @param {string} data.id
   * @param {string} data.title
   * @param {string} data.description
   * @param {string[]} data.objectives
   * @param {string[]} data.prerequisites
   * @param {number}   data.difficulty        // 1-5
   * @param {number}   data.estimatedMinutes
   * @param {object[]} data.steps
   * @param {string}   data.steps[].type
   * @param {string}   data.steps[].description
   * @param {object}   [data.steps[].target]
   * @param {object[]} [data.quiz]
   * @param {object}   [data.worldTemplate]
   */
  constructor(data) {
    Object.assign(this, data);
    this.completed = false;
    this.currentStepIndex = 0;
  }

  /** @returns {{ type: string, description: string, target?: object }|null} */
  get currentStep() {
    return this.steps[this.currentStepIndex] ?? null;
  }

  /** Advance to the next step. Returns true if lesson is now complete. */
  advanceStep() {
    this.currentStepIndex++;
    if (this.currentStepIndex >= this.steps.length) {
      this.completed = true;
      return true;
    }
    return false;
  }

  /** Reset lesson progress (for replaying). */
  reset() {
    this.completed = false;
    this.currentStepIndex = 0;
  }

  /** @returns {number} Progress as 0-1 */
  get progress() {
    return this.steps.length ? this.currentStepIndex / this.steps.length : 0;
  }

  /** @param {string} id @returns {import('./lesson.js').Lesson} */
  static fromJSON(id, raw) {
    return new Lesson({ id, ...raw });
  }
}

export default Lesson;
