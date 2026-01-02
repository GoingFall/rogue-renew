import { Entity, EntityType, Position, Room, Stats, MetaProgress, FloatingText } from '../types';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, COLOR_MONSTER, COLOR_GOLD, COLOR_POTION_AGILITY, COLOR_RING_AGILITY, BASE_PLAYER_STATS, MONSTER_TEMPLATES, UPGRADES, ATTACK_RANGE, ATTACK_ARC, ATTACK_DURATION } from '../constants';

export class GameEngine {
    public entities: Entity[] = [];
    public floatingTexts: FloatingText[] = [];
    public rooms: Room[] = [];
    public corridors: Position[] = []; // Simple point list for corridors
    public player: Entity | null = null;
    public level: number = 1;
    public messages: string[] = [];
    public gameOver: boolean = false;
    public victory: boolean = false;

    // Input state
    public keys: Record<string, boolean> = {};
    public mousePos: Position = { x: 0, y: 0 };
    public mousePressed: boolean = false;
    public viewport = { w: 800, h: 600 }; // Default viewport size

    private lastTime: number = 0;
    private accumulator: number = 0;
    private meta: MetaProgress;

    constructor(meta: MetaProgress) {
        this.meta = meta;
    }

    public initLevel(level: number) {
        this.level = level;
        this.entities = [];
        this.rooms = [];
        this.corridors = [];
        this.generateDungeon();

        // Spawn Player
        if (this.rooms.length > 0) {
            const startRoom = this.rooms[0];
            const cx = startRoom.x + startRoom.w / 2;
            const cy = startRoom.y + startRoom.h / 2;

            // Apply upgrades
            const hpBonus = this.getUpgradeBonus('maxHp');
            const strBonus = this.getUpgradeBonus('base_damage');
            const agilityBonus = this.getUpgradeBonus('agility');

            this.player = {
                id: 'player',
                type: EntityType.PLAYER,
                pos: { x: cx, y: cy },
                size: TILE_SIZE * 0.8,
                color: '#3b82f6',
                stats: {
                    ...BASE_PLAYER_STATS,
                    maxHp: BASE_PLAYER_STATS.maxHp + hpBonus,
                    hp: BASE_PLAYER_STATS.maxHp + hpBonus,
                    str: BASE_PLAYER_STATS.str + strBonus,
                    speed: BASE_PLAYER_STATS.speed, // Base speed, dynamic mod applied in update
                    agility: BASE_PLAYER_STATS.agility + agilityBonus,
                },
                cooldown: 0,
                maxCooldown: 0.5, // 0.5s attack speed
                attackVisual: { active: false, angle: 0, timer: 0 }
            };
            this.entities.push(this.player);
        }

        this.log(`Welcome to Level ${level} of the Dungeon.`);
    }

    private getUpgradeBonus(key: string): number {
        const lvl = this.meta.upgrades[key] || 0;
        const upgrade = UPGRADES.find(u => u.id === key);
        return upgrade ? upgrade.effect(lvl) : 0;
    }

    private generateDungeon() {
        // 3x3 Grid generation simplified
        const gridW = WORLD_WIDTH / 3;
        const gridH = WORLD_HEIGHT / 3;
        const roomCenters: Position[] = [];

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                // Chance to skip room? Low chance to ensure playability
                if (Math.random() > 0.9) continue;

                const w = (Math.random() * (gridW - 200) + 150);
                const h = (Math.random() * (gridH - 200) + 150);
                const x = c * gridW + (Math.random() * (gridW - w));
                const y = r * gridH + (Math.random() * (gridH - h));

                const room: Room = { x, y, w, h };
                this.rooms.push(room);
                roomCenters.push({ x: x + w / 2, y: y + h / 2 });

                // Spawn items/monsters in room
                this.populateRoom(room);
            }
        }

        // Simple corridors: Connect room i to i+1
        for (let i = 0; i < roomCenters.length - 1; i++) {
            this.createCorridor(roomCenters[i], roomCenters[i + 1]);
        }
    }

    private createCorridor(p1: Position, p2: Position) {
        // Create L-shaped corridor
        // We will just store points and use them for simple drawing/logic
        // A full implementation would rasterize this into a grid, 
        // but for continuous movement, we verify if player is inside any room OR 
        // inside the "rects" defined by these corridors.

        const thickness = TILE_SIZE * 2;

        // Horizontal leg
        this.rooms.push({
            x: Math.min(p1.x, p2.x) - thickness / 2,
            y: p1.y - thickness / 2,
            w: Math.abs(p2.x - p1.x) + thickness,
            h: thickness
        });

        // Vertical leg
        this.rooms.push({
            x: p2.x - thickness / 2,
            y: Math.min(p1.y, p2.y) - thickness / 2,
            w: thickness,
            h: Math.abs(p2.y - p1.y) + thickness
        });
    }

    private populateRoom(room: Room) {
        // Monsters
        if (Math.random() < 0.6) {
            const count = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < count; i++) {
                const template = MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];
                this.entities.push({
                    id: `monster_${Math.random()}`,
                    type: EntityType.MONSTER,
                    pos: {
                        x: room.x + Math.random() * room.w,
                        y: room.y + Math.random() * room.h
                    },
                    size: TILE_SIZE * 0.8,
                    color: COLOR_MONSTER,
                    label: template.label,
                    stats: {
                        hp: template.hp,
                        maxHp: template.hp,
                        str: this.parseDice(template.damage),
                        armor: 0,
                        exp: template.exp,
                        level: 1,
                        gold: Math.floor(Math.random() * 10),
                        souls: 1 + Math.floor(Math.random() * 5),
                        speed: template.speed,
                        agility: 10 // Base agility for monsters
                    },
                    cooldown: 0,
                    maxCooldown: 1.0,
                    state: 'SLEEP',
                    attackVisual: { active: false, angle: 0, timer: 0 }
                });
            }
        }
        // Gold
        if (Math.random() < 0.4) {
            this.entities.push({
                id: `gold_${Math.random()}`,
                type: EntityType.ITEM,
                pos: { x: room.x + Math.random() * room.w, y: room.y + Math.random() * room.h },
                size: TILE_SIZE * 0.5,
                color: COLOR_GOLD,
                stats: { ...BASE_PLAYER_STATS, gold: Math.floor(Math.random() * 50) + 10, agility: 0 },
                cooldown: 0,
                maxCooldown: 0
            });
        }
        // Agility Potion
        if (Math.random() < 0.1) {
            this.entities.push({
                id: `potion_agi_${Math.random()}`,
                type: EntityType.ITEM, // Using generic ITEM type for now, distinguishable by color/label logic later
                pos: { x: room.x + Math.random() * room.w, y: room.y + Math.random() * room.h },
                size: TILE_SIZE * 0.4,
                color: COLOR_POTION_AGILITY,
                label: 'Potion',
                stats: { ...BASE_PLAYER_STATS, agility: 1 }, // +1 Agility
                cooldown: 0,
                maxCooldown: 0
            });
        }
        // Agility Ring
        if (Math.random() < 0.05) {
            this.entities.push({
                id: `ring_agi_${Math.random()}`,
                type: EntityType.ITEM,
                pos: { x: room.x + Math.random() * room.w, y: room.y + Math.random() * room.h },
                size: TILE_SIZE * 0.3,
                color: COLOR_RING_AGILITY,
                label: 'Ring',
                stats: { ...BASE_PLAYER_STATS, agility: 1 }, // +1 Agility
                cooldown: 0,
                maxCooldown: 0
            });
        }
    }

    private parseDice(dice: string): number {
        const [count, sides] = dice.split('d').map(Number);
        if (!count || !sides) return 1;
        let total = 0;
        for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
        return total;
    }

    public update(dt: number) {
        if (!this.player || this.player.stats!.hp <= 0) return;

        // Player Movement
        let dx = 0;
        let dy = 0;
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            // Normalize
            const len = Math.sqrt(dx * dx + dy * dy);
            // Dynamic Speed: Base * (1 + Agility / 50)
            const agilityMod = 1 + (this.player.stats!.agility / 50);
            const speed = this.player.stats!.speed * agilityMod;
            dx = (dx / len) * speed * dt;
            dy = (dy / len) * speed * dt;

            const newX = this.player.pos.x + dx;
            const newY = this.player.pos.y + dy;

            if (this.isValidMove(newX, this.player.pos.y)) this.player.pos.x = newX;
            if (this.isValidMove(this.player.pos.x, newY)) this.player.pos.y = newY;
        }

        // Update Visuals for Player
        if (this.player.attackVisual?.active) {
            this.player.attackVisual.timer -= dt;
            if (this.player.attackVisual.timer <= 0) {
                this.player.attackVisual.active = false;
            }
        }

        // Update Visuals for other Entities
        for (const entity of this.entities) {
            if (entity.attackVisual?.active) {
                entity.attackVisual.timer -= dt;
                if (entity.attackVisual.timer <= 0) {
                    entity.attackVisual.active = false;
                }
            }
        }


        // Update Floating Texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.life -= dt;
            ft.x += ft.velocity.x * dt;
            ft.y += ft.velocity.y * dt;
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Player Combat
        if (this.player.cooldown > 0) this.player.cooldown -= dt;
        if (this.mousePressed && this.player.cooldown <= 0) {
            this.performAttack(this.player, this.mousePos);

            // Dynamic Cooldown: Base / (1 + Agility / 50)
            const agilityMod = 1 + (this.player.stats!.agility / 50);
            this.player.cooldown = this.player.maxCooldown / agilityMod;
        }

        // Entities Update
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (entity.type === EntityType.PLAYER) continue;

            if (entity.type === EntityType.MONSTER) {
                this.updateMonster(entity, dt);
            } else if (entity.type === EntityType.ITEM) {
                // Pickup check
                const dist = Math.hypot(entity.pos.x - this.player.pos.x, entity.pos.y - this.player.pos.y);
                if (dist < this.player.size + entity.size) {
                    if (entity.color === COLOR_GOLD) {
                        this.player.stats!.gold += entity.stats!.gold;
                        this.log(`Picked up ${entity.stats!.gold} gold.`);
                        this.entities.splice(i, 1);
                    } else if (entity.color === COLOR_POTION_AGILITY) {
                        this.player.stats!.agility += 1;
                        this.log("Drank Agility Potion! (+1 Agility)");
                        this.entities.splice(i, 1);
                    } else if (entity.color === COLOR_RING_AGILITY) {
                        this.player.stats!.agility += 1;
                        this.log("Equipped Ring of Agility! (+1 Agility)");
                        this.entities.splice(i, 1);
                    }
                }
            }
        }

        // Level check logic (placeholder/if any)
    }

    private updateMonster(monster: Entity, dt: number) {
        if (!this.player) return;

        const distToPlayer = Math.hypot(this.player.pos.x - monster.pos.x, this.player.pos.y - monster.pos.y);
        const wakeRange = TILE_SIZE * 8;
        const attackRange = TILE_SIZE * 1.5;

        // State Machine
        if (monster.state === 'SLEEP') {
            if (distToPlayer < wakeRange) {
                monster.state = 'HUNT';
                this.log(`${monster.label} wakes up!`);
            }
        } else if (monster.state === 'HUNT') {
            if (distToPlayer > attackRange) {
                // Move towards player
                const dx = this.player.pos.x - monster.pos.x;
                const dy = this.player.pos.y - monster.pos.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const speed = monster.stats!.speed;

                const mx = (dx / len) * speed * dt;
                const my = (dy / len) * speed * dt;

                const newX = monster.pos.x + mx;
                const newY = monster.pos.y + my;

                // Simple collision avoidance with walls
                if (this.isValidMove(newX, monster.pos.y)) monster.pos.x = newX;
                if (this.isValidMove(monster.pos.x, newY)) monster.pos.y = newY;

            } else {
                // Attack
                if (monster.cooldown <= 0) {
                    this.performAttack(monster, this.player.pos);
                    monster.cooldown = monster.maxCooldown;
                }
            }
        }

        if (monster.cooldown > 0) monster.cooldown -= dt;
    }

    private performAttack(attacker: Entity, targetPos: Position) {
        const range = ATTACK_RANGE;
        const coneAngle = ATTACK_ARC;

        let hitEntity: Entity | null = null;
        let minDst = range;

        // Determine Attack Angle
        let attackAngle = 0;
        if (attacker.type === EntityType.PLAYER) {
            // Convert screen mouse position (targetPos) to world position for correct angle calculation
            // We need to replicate the Camera Logic here:
            // camX = clamp(player.x - viewW/2, ...)
            const camX = Math.max(0, Math.min(attacker.pos.x - this.viewport.w / 2, WORLD_WIDTH - this.viewport.w));
            const camY = Math.max(0, Math.min(attacker.pos.y - this.viewport.h / 2, WORLD_HEIGHT - this.viewport.h));

            const worldMouseX = targetPos.x + camX;
            const worldMouseY = targetPos.y + camY;

            attackAngle = Math.atan2(worldMouseY - attacker.pos.y, worldMouseX - attacker.pos.x);

            // Set Visual
            if (attacker.attackVisual) {
                attacker.attackVisual.active = true;
                attacker.attackVisual.angle = attackAngle;
                attacker.attackVisual.timer = ATTACK_DURATION;
            }
        } else {
            // Monster Attack Angle
            attackAngle = Math.atan2(targetPos.y - attacker.pos.y, targetPos.x - attacker.pos.x);

            if (attacker.attackVisual) {
                attacker.attackVisual.active = true;
                attacker.attackVisual.angle = attackAngle;
                attacker.attackVisual.timer = ATTACK_DURATION;
            }
        }

        // Identify potential targets
        const potentialTargets = attacker.type === EntityType.PLAYER
            ? this.entities.filter(e => e.type === EntityType.MONSTER)
            : (this.player ? [this.player] : []);

        for (const t of potentialTargets) {
            const dist = Math.hypot(t.pos.x - attacker.pos.x, t.pos.y - attacker.pos.y);
            if (dist < minDst) {
                // Direction check for player aiming
                if (attacker.type === EntityType.PLAYER) {
                    const angleToTarget = Math.atan2(t.pos.y - attacker.pos.y, t.pos.x - attacker.pos.x);
                    let diff = Math.abs(attackAngle - angleToTarget);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff; // Normalize
                    if (diff < coneAngle / 2) { // Check if inside half the cone angle from center
                        hitEntity = t;
                        minDst = dist;
                    }
                } else {
                    hitEntity = t;
                    minDst = dist;
                }
            }
        }

        if (hitEntity && hitEntity.stats && attacker.stats) {
            // Calculate Damage
            const dmg = Math.floor(attacker.stats.str * 0.2 + Math.random() * 2 + 1);
            hitEntity.stats.hp -= dmg;
            if (attacker.type === EntityType.PLAYER) {
                this.log(`You hit ${hitEntity.label} for ${dmg} damage.`);
            } else {
                this.log(`${attacker.label} hits you for ${dmg} damage.`);
            }

            // Floating Text
            this.spawnFloatingText(hitEntity.pos.x, hitEntity.pos.y, dmg.toString(), '#ffffff');

            if (hitEntity.stats.hp <= 0) {
                this.killEntity(hitEntity);
            }
        }
    }

    private killEntity(entity: Entity) {
        if (entity.type === EntityType.PLAYER) {
            this.log("You died!");
            this.gameOver = true;
            // Save souls
            if (this.player && this.player.stats) {
                this.meta.souls += this.player.stats.souls;
            }
        } else {
            this.log(`${entity.label} died.`);
            // Grant Exp/Souls
            if (this.player && this.player.stats && entity.stats) {
                this.player.stats.souls += entity.stats.souls;
                this.player.stats.exp += entity.stats.exp;
                // Level up?
                if (this.player.stats.exp > this.player.stats.level * 100) {
                    this.player.stats.level++;
                    this.player.stats.maxHp += 5;
                    this.player.stats.hp = this.player.stats.maxHp;
                    this.player.stats.str += 1;
                    this.log("Level Up!");
                }
            }
            this.entities = this.entities.filter(e => e !== entity);
        }
    }

    private isValidMove(x: number, y: number): boolean {
        // Check boundaries
        if (x < 0 || y < 0 || x > WORLD_WIDTH || y > WORLD_HEIGHT) return false;

        // Check rooms (AABB)
        for (const r of this.rooms) {
            if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
                return true;
            }
        }
        return false;
    }

    private spawnFloatingText(x: number, y: number, text: string, color: string) {
        this.floatingTexts.push({
            id: `ft_${Math.random()}`,
            x,
            y,
            text,
            color,
            life: 1.0,
            maxLife: 1.0,
            velocity: { x: 0, y: -20 } // Float up
        });
    }

    private log(msg: string) {
        this.messages.push(msg);
        if (this.messages.length > 5) this.messages.shift();
    }
}