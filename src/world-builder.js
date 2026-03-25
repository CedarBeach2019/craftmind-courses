import { Vec3 } from 'vec3';

/**
 * WorldBuilder — creates learning environments programmatically.
 * Wraps mineflayer bot methods to build structures, circuits, signs, etc.
 */
export class WorldBuilder {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {object} [opts]
   * @param {Vec3}   [opts.origin] — reference point (defaults to bot position)
   */
  constructor(bot, opts = {}) {
    this.bot = bot;
    this.origin = opts.origin ?? bot.entity.position;
  }

  /**
   * Place a single block.
   * @param {Vec3} pos
   * @param {import('mineflayer').Block} blockType — e.g. bot.registry.blocksByName.redstone_block
   */
  async placeBlock(pos, blockType) {
    const block = this.bot.blockAt(pos);
    if (!block) return;
    await this.bot.placeBlock(block, this.bot.entity.position.offset(0, 1, 0));
  }

  /**
   * Fill a rectangular region with a block type.
   * @param {Vec3} start — corner 1 (inclusive)
   * @param {Vec3} end   — corner 2 (inclusive)
   * @param {number} blockId
   */
  async fill(start, end, blockId) {
    const minX = Math.min(start.x, end.x), maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y), maxY = Math.max(start.y, end.y);
    const minZ = Math.min(start.z, end.z), maxZ = Math.max(start.z, end.z);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          await this.bot.setBlock(new Vec3(x, y, z), blockId);
        }
      }
    }
  }

  /**
   * Build a simple rectangular room (hollow box).
   * @param {Vec3} corner — bottom-north-west corner
   * @param {{width:number, height:number, depth:number}} dims
   * @param {number} blockId
   */
  async buildRoom(corner, dims, blockId) {
    const { width, height, depth } = dims;
    // Floor + ceiling
    await this.fill(corner, corner.offset(width, 0, depth), blockId);
    await this.fill(corner.offset(0, height, 0), corner.offset(width, height, depth), blockId);
    // Walls
    for (let y = 1; y < height; y++) {
      await this.fill(corner.offset(0, y, 0), corner.offset(width, y, 0), blockId);
      await this.fill(corner.offset(0, y, depth), corner.offset(width, y, depth), blockId);
      await this.fill(corner.offset(0, y, 0), corner.offset(0, y, depth), blockId);
      await this.fill(corner.offset(width, y, 0), corner.offset(width, y, depth), blockId);
    }
  }

  /**
   * Place a sign with text.
   * @param {Vec3} pos
   * @param {string[]} lines — up to 4 lines
   */
  async placeSign(pos, lines) {
    await this.bot.setBlock(pos, this.bot.registry.blocksByName.oak_sign.id);
    // mineflayer-sign-update event handles text in newer versions
    const signBlock = this.bot.blockAt(pos);
    if (signBlock) {
      await this.bot.signUpdate?.(signBlock, lines.slice(0, 4));
    }
  }

  /**
   * Place items in the nearest chest.
   * @param {Vec3} chestPos
   * @param {{itemId:number, count:number}[]} items
   */
  async fillChest(chestPos, items) {
    const chest = await this.bot.openChest(this.bot.blockAt(chestPos));
    for (const { itemId, count } of items) {
      const item = { name: this.bot.registry.items[itemId]?.name, count };
      await chest.deposit(item.name, count);
    }
    await chest.close();
  }

  /**
   * Build a simple redstone circuit: power source → dust → component.
   * @param {Vec3} start
   * @param {number} length
   * @param {object} opts
   * @param {number} [opts.powerBlockId]
   * @param {number} [opts.componentId]
   */
  async buildRedstoneLine(start, length, opts = {}) {
    const reg = this.bot.registry.blocksByName;
    // Place redstone dust line
    for (let i = 0; i < length; i++) {
      await this.bot.setBlock(start.offset(i, 0, 0), reg.redstone_wire.id);
    }
    // Power source at start
    if (opts.powerBlockId) {
      await this.bot.setBlock(start.offset(-1, 0, 0), opts.powerBlockId);
    }
    // Component at end
    if (opts.componentId) {
      await this.bot.setBlock(start.offset(length, 0, 0), opts.componentId);
    }
  }

  /**
   * Build a simple obstacle course with platforms and gaps.
   * @param {Vec3} start
   * @param {number} segments
   */
  async buildObstacleCourse(start, segments = 5) {
    const reg = this.bot.registry.blocksByName;
    for (let i = 0; i < segments; i++) {
      const x = start.x + i * 4;
      // Platform (3x1)
      await this.fill(new Vec3(x, start.y, start.z), new Vec3(x + 2, start.y, start.z + 2), reg.stone.id);
      // Gap of 1 block (no blocks placed)
    }
  }
}

export default WorldBuilder;
