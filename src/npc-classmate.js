/**
 * NPC Classmate — AI classmates with distinct personalities that create realistic classroom dynamics.
 */

const PERSONALITY = {
  curious: {
    name: 'Alex',
    skin: 'Steve',
    traits: ['asks thoughtful questions', 'connects ideas', 'gets excited about discoveries'],
    prefixes: ['Wait, so ', 'Oh! What if ', 'That reminds me — ', 'I just realized! '],
    reactions: {
      new_topic: ["Ooh, this looks cool! 😮", "I've been wanting to learn about this!"],
      correct: ["Nice! That makes sense now!", "Oh I see how it works!"],
      wrong: ["Hmm, I thought it was the other way around?", "Wait, can you explain that part again?"],
      stuck: ["I think I almost have it...", "Let me try something different..."],
    },
  },
  competitive: {
    name: 'Sam',
    skin: 'Alex',
    traits: ['races ahead', 'shows off', 'occasionally makes mistakes'],
    prefixes: ["Bet I can do it faster! 😤", "Already on it!", "Psh, easy! "],
    reactions: {
      new_topic: ["Let's see how hard this actually is.", "Speedrun time! ⚡"],
      correct: ["Too easy! What's next?", "First try! 😎"],
      wrong: ["Okay... maybe not THAT easy.", "That was a fluke, I swear!"],
      stuck: ["Ugh, this one's annoying...", "Give me a second..."],
    },
  },
  struggling: {
    name: 'Jordan',
    skin: 'Ari',
    traits: ['needs encouragement', 'slow but steady', 'relatable frustration'],
    prefixes: ["Um... ", "I don't really get ", "Is it okay if I ", "This is hard... "],
    reactions: {
      new_topic: ["This looks... complicated 😟", "I'll try my best!"],
      correct: ["I actually got it!! 🎉", "Wait, did I really? Yes!!"],
      wrong: ["I keep messing this up...", "Can someone help me?"],
      stuck: ["I'm so confused right now 😢", "Why is this so hard for me?"],
    },
  },
};

export class NPCClassmate {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {"curious"|"competitive"|"struggling"} type
   */
  constructor(bot, type) {
    this.bot = bot;
    this.type = type;
    const p = PERSONALITY[type];
    if (!p) throw new Error(`Unknown classmate type: ${type}`);
    this.name = p.name;
    this.profile = p;
    this.chatHistory = [];
    this.lastAction = Date.now();
  }

  /** Send a chat message in character. */
  chat(message) {
    this.bot.chat(message);
    this.chatHistory.push(`[${this.name}]: ${message}`);
    if (this.chatHistory.length > 50) this.chatHistory.shift();
    this.lastAction = Date.now();
  }

  /** Pick a random reaction for a given situation. */
  react(situation) {
    const options = this.profile.reactions[situation];
    if (!options) return;
    const msg = options[Math.floor(Math.random() * options.length)];
    this.chat(msg);
  }

  /** Generate an in-character observation about the current lesson topic. */
  observe(topic) {
    const prefix = this.profile.prefixes[Math.floor(Math.random() * this.profile.prefixes.length)];
    const observations = {
      curious: [
        `${prefix}does ${topic} work the same way in real life? 🤔`,
        `${prefix}what would happen if we combined this with something else?`,
      ],
      competitive: [
        `${prefix}I bet I can build this without any help!`,
        `${prefix}watch and learn! 💨`,
      ],
      struggling: [
        `${prefix}can someone explain ${topic} in simpler words?`,
        `${prefix}I think I understand... mostly. Maybe? 😅`,
      ],
    };
    const lines = observations[this.type] ?? observations.curious;
    this.chat(lines[Math.floor(Math.random() * lines.length)]);
  }

  /**
   * React to student progress — simulates classroom dynamics.
   * @param {number} stepIndex — current step (0-based)
   * @param {number} totalSteps
   * @param {boolean} studentCompleted — did the student just complete a step?
   */
  reactToProgress(stepIndex, totalSteps, studentCompleted) {
    const pct = stepIndex / totalSteps;
    // Competitive races ahead, struggles behind, curious stays close
    if (this.type === 'competitive') {
      if (pct < 0.3) this.react('correct');
      else if (pct > 0.7 && !studentCompleted) this.react('stuck');
    } else if (this.type === 'struggling') {
      if (pct < 0.5) this.react('wrong');
      else if (studentCompleted) this.react('correct');
    } else {
      if (studentCompleted) this.react('correct');
      else if (Math.random() < 0.3) this.observe('this concept');
    }
  }
}

export default NPCClassmate;
