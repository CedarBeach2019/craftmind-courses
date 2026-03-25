import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const DEFAULT_DIR = 'progress';

/**
 * Progress — tracks student progress: completed lessons, quiz scores, time spent, achievements.
 */
export class Progress {
  /**
   * @param {string} studentName
   * @param {string} [saveDir]
   */
  constructor(studentName, saveDir = DEFAULT_DIR) {
    this.studentName = studentName;
    this.saveDir = saveDir;
    /** @type {Map<string, {completed:boolean, quizScore:number|null, timeSpent:number, completedAt:string|null, attempts:number}>} */
    this.lessons = new Map();
    /** @type {string[]} */
    this.achievements = [];
    this.startedAt = new Date().toISOString();
  }

  /** @param {string} lessonId */
  getLesson(lessonId) {
    return this.lessons.get(lessonId);
  }

  /** Record a lesson as completed. */
  completeLesson(lessonId, quizScore = null, timeSpent = 0) {
    const existing = this.lessons.get(lessonId) ?? { attempts: 0 };
    this.lessons.set(lessonId, {
      ...existing,
      completed: true,
      quizScore,
      timeSpent: (existing.timeSpent ?? 0) + timeSpent,
      completedAt: new Date().toISOString(),
      attempts: existing.attempts + 1,
    });
  }

  /** Record a quiz attempt. */
  recordQuiz(lessonId, score) {
    const existing = this.lessons.get(lessonId) ?? {};
    this.lessons.set(lessonId, { ...existing, quizScore: score, attempts: (existing.attempts ?? 0) + 1 });
  }

  /** @param {string} achievementId @returns {boolean} true if newly unlocked */
  unlockAchievement(achievementId) {
    if (this.achievements.includes(achievementId)) return false;
    this.achievements.push(achievementId);
    return true;
  }

  /** @param {string} courseId @returns {number} 0-1 */
  courseProgress(courseId, totalLessons) {
    let completed = 0;
    for (const l of this.lessons.values()) if (l.completed) completed++;
    return totalLessons ? completed / totalLessons : 0;
  }

  /** @returns {number} Average quiz score across completed lessons. */
  get averageQuizScore() {
    const scores = [...this.lessons.values()].map(l => l.quizScore).filter(s => s !== null && s !== undefined);
    return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  /** Persist to disk. */
  async save() {
    const dir = join(process.cwd(), this.saveDir);
    await mkdir(dir, { recursive: true });
    const data = {
      studentName: this.studentName,
      startedAt: this.startedAt,
      achievements: this.achievements,
      lessons: Object.fromEntries(this.lessons),
    };
    await writeFile(join(dir, `${this.studentName}.json`), JSON.stringify(data, null, 2));
  }

  /** Load from disk. */
  async load() {
    try {
      const raw = JSON.parse(await readFile(join(process.cwd(), this.saveDir, `${this.studentName}.json`), 'utf-8'));
      this.startedAt = raw.startedAt ?? this.startedAt;
      this.achievements = raw.achievements ?? [];
      this.lessons = new Map(Object.entries(raw.lessons ?? {}));
      return true;
    } catch {
      return false;
    }
  }
}

export default Progress;
