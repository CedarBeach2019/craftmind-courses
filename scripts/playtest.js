// ═══════════════════════════════════════════════════════════════
// CraftMind Courses — Playtest Launcher
// ═══════════════════════════════════════════════════════════════
//
// Loads the repo as a CraftMind Core plugin and runs a simulated demo.
// No actual Minecraft server needed — extend for real integration.
// ═══════════════════════════════════════════════════════════════

import { registerWithCore } from '../src/index.js';

// ─── Mock CraftMind Core ──────────────────────────────────────

class MockCore {
  constructor() {
    this.plugins = new Map();
    this.bot = null;
    this.eventBus = { emit: (...a) => console.log(`[event] ${a.join(' ')}`) };
    this.config = new Map();
    this.logger = { info: console.log, warn: console.warn, error: console.error };
  }

  registerPlugin(name, plugin) {
    this.plugins.set(name, plugin);
    console.log(`✅ Plugin registered: ${plugin.name} v${plugin.version}`);
    console.log(`   Modules: ${Object.keys(plugin.modules).join(', ')}`);
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }
}

// ─── Simulated Bot ────────────────────────────────────────────

class SimulatedBot {
  constructor(username) {
    this.username = username;
    this.position = { x: 100, y: 64, z: 200 };
    this.inventory = [];
    this.chatHistory = [];
  }

  chat(message) {
    console.log(`  [${this.username}] ${message}`);
    this.chatHistory.push(message);
  }

  on(event, handler) {
    // Simulated — no real events
  }

  once(event, handler) {
    // Simulated — resolve immediately for spawn
    if (event === 'spawn') setTimeout(() => handler(), 50);
  }
}

// ─── Playtest ─────────────────────────────────────────────────

async function runPlaytest() {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   📚 CraftMind Courses — Playtest 📚          ║
  ║   AI Education
  ╚══════════════════════════════════════════════╝
  `);

  // 1. Create mock core
  const core = new MockCore();
  console.log('\n📡 Connecting to CraftMind Core...');
  console.log('   Mode: Simulated (no Minecraft server)');

  // 2. Register plugin
  console.log('\n🔌 Registering plugin...');
  registerWithCore(core);
  const plugin = core.getPlugin('courses');
  console.log(`   Plugin ready with ${Object.keys(plugin.modules).length} modules`);

  // 3. Create simulated bot
  console.log('\n🤖 Creating simulated bot...');
  const bot = new SimulatedBot('CM_PlaytestBot');
  core.bot = bot;
  console.log(`   Bot spawned at (${bot.position.x}, ${bot.position.y}, ${bot.position.z})`);

  // 4. Demo module interaction
  console.log('\n🎮 Running simulated  session...');
  bot.chat('Hello from CraftMind Courses!');
  console.log('   ✅ Chat sent successfully');

  // 5. Summary
  console.log(`
  ┌─────────────────────────────────────┐
  │  Playtest Complete                  │
  │                                     │
  │  Plugins loaded:  ${core.plugins.size}               │
  │  Bot connected:   ✅                  │
  │  Simulated:      ✅ (no server)     │
  │                                     │
  │  To connect to a real server:       │
  │  MC_HOST=localhost npm run start    │
  └─────────────────────────────────────┘
  `);
}

runPlaytest().catch(err => {
  console.error('❌ Playtest failed:', err);
  process.exit(1);
});
