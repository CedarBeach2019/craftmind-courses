import { Lesson } from './lesson.js';

/**
 * Course — ordered collection of lessons with prerequisites, difficulty progression, and time estimates.
 */
export class Course {
  /**
   * @param {object} data
   * @param {string} data.id
   * @param {string} data.title
   * @param {string} data.description
   * @param {string} data.author
   * @param {object[]} data.lessons
   */
  constructor(data) {
    Object.assign(this, data);
    /** @type {Map<string, Lesson>} */
    this.lessonMap = new Map();
    for (const raw of data.lessons) {
      const lesson = Lesson.fromJSON(raw.id, raw);
      this.lessonMap.set(raw.id, lesson);
    }
  }

  /** @param {string} id @returns {Lesson} */
  getLesson(id) {
    return this.lessonMap.get(id);
  }

  /** Ordered lesson list respecting prerequisites. */
  get orderedLessons() {
    return [...this.lessonMap.values()];
  }

  /** @returns {number} Total estimated minutes for all lessons. */
  get totalEstimatedMinutes() {
    let total = 0;
    for (const l of this.lessonMap.values()) total += l.estimatedMinutes ?? 15;
    return total;
  }

  /** @returns {number} Average difficulty (1-5). */
  get averageDifficulty() {
    const vals = [...this.lessonMap.values()].map(l => l.difficulty ?? 1);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1;
  }

  /**
   * Load a course from a JSON file.
   * @param {string} filePath
   * @returns {Promise<Course>}
   */
  static async fromFile(filePath) {
    const { readFile } = await import('node:fs/promises');
    const raw = JSON.parse(await readFile(filePath, 'utf-8'));
    return new Course(raw);
  }
}

export default Course;
