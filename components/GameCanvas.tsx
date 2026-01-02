import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../classes/GameEngine';
import { EntityType, Entity } from '../types';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, COLOR_WALL, COLOR_FLOOR, ATTACK_RANGE, ATTACK_ARC, ATTACK_DURATION } from '../constants';

interface Props {
    game: GameEngine;
    width: number;
    height: number;
    paused?: boolean;
}

const GameCanvas: React.FC<Props> = ({ game, width, height, paused = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let lastTime = performance.now();

        const render = (time: number) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            // Update Game Logic only if not paused
            // Cap dt to prevent spiraling
            if (!paused) {
                game.update(Math.min(dt, 0.1));
            }

            // Clear
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);

            if (!game.player) return;

            // Camera Follow
            const camX = Math.max(0, Math.min(game.player.pos.x - width / 2, WORLD_WIDTH - width));
            const camY = Math.max(0, Math.min(game.player.pos.y - height / 2, WORLD_HEIGHT - height));

            ctx.save();
            ctx.translate(-camX, -camY);

            // Draw Floor/Walls
            // Optimization: Only draw rooms visible on screen
            game.rooms.forEach(room => {
                if (room.x + room.w < camX || room.x > camX + width ||
                    room.y + room.h < camY || room.y > camY + height) return;

                ctx.fillStyle = COLOR_WALL;
                ctx.fillRect(room.x - TILE_SIZE / 4, room.y - TILE_SIZE / 4, room.w + TILE_SIZE / 2, room.h + TILE_SIZE / 2);
                ctx.fillStyle = COLOR_FLOOR;
                ctx.fillRect(room.x, room.y, room.w, room.h);
            });

            // Draw Entities
            // Sort by Y for simple depth
            const sortedEntities = [...game.entities].sort((a, b) => a.pos.y - b.pos.y);

            sortedEntities.forEach(entity => {
                if (entity.pos.x < camX - 50 || entity.pos.x > camX + width + 50 ||
                    entity.pos.y < camY - 50 || entity.pos.y > camY + height + 50) return;

                drawEntity(ctx, entity);
            });

            // Draw Attack Visual
            // Player
            if (game.player.attackVisual?.active) {
                drawAttackVisual(ctx, game.player.pos, game.player.attackVisual);
            }

            // Monsters
            game.entities.forEach(entity => {
                if (entity.type === EntityType.MONSTER && entity.attackVisual?.active) {
                    drawAttackVisual(ctx, entity.pos, entity.attackVisual, true);
                }
            });

            // Floating Texts
            game.floatingTexts.forEach(ft => {
                ctx.save();
                ctx.globalAlpha = ft.life / ft.maxLife;
                ctx.fillStyle = ft.color;
                ctx.font = 'bold 20px monospace'; // Keeping it pixel-y
                ctx.textAlign = 'center';
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.restore();
            });

            // Draw Mouse Cursor/Target line
            if (game.player) {
                const mx = game.mousePos.x + camX;
                const my = game.mousePos.y + camY;

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.moveTo(game.player.pos.x, game.player.pos.y);
                ctx.lineTo(mx, my);
                ctx.stroke();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(mx, my, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
            animationFrameId = requestAnimationFrame(render);
        };

        render(performance.now());

        return () => cancelAnimationFrame(animationFrameId);
    }, [game, width, height, paused]);

    const drawEntity = (ctx: CanvasRenderingContext2D, entity: Entity) => {
        ctx.fillStyle = entity.color;

        if (entity.type === EntityType.PLAYER) {
            ctx.font = `bold ${entity.size}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🦹', entity.pos.x, entity.pos.y);

            // Direction indicator (small dot still useful?)
            // Maybe removed for clearer emoji
        } else if (entity.type === EntityType.MONSTER) {
            ctx.font = `bold ${entity.size}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(entity.label || 'M', entity.pos.x, entity.pos.y);

            // HP Bar
            if (entity.stats) {
                const pct = entity.stats.hp / entity.stats.maxHp;
                ctx.fillStyle = 'red';
                ctx.fillRect(entity.pos.x - 10, entity.pos.y - 20, 20, 4);
                ctx.fillStyle = 'green';
                ctx.fillRect(entity.pos.x - 10, entity.pos.y - 20, 20 * pct, 4);
            }
        } else if (entity.type === EntityType.ITEM) {
            ctx.beginPath();
            ctx.arc(entity.pos.x, entity.pos.y, entity.size / 3, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const drawAttackVisual = (ctx: CanvasRenderingContext2D, pos: { x: number, y: number }, visual: { angle: number, timer: number }, isMonster: boolean = false) => {
        const { angle, timer } = visual;
        const pct = timer / ATTACK_DURATION; // 1 to 0

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, ATTACK_RANGE, -ATTACK_ARC / 2, ATTACK_ARC / 2);
        ctx.closePath();

        if (isMonster) {
            ctx.fillStyle = `rgba(255, 50, 50, ${0.4 * pct})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 100, 100, ${0.8 * pct})`;
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * pct})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.8 * pct})`;
        }

        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    };

    // Event Handlers attached to canvas container in parent, but we handle mouse move translation here effectively via game logic updates
    // Actually, we need to update mouse pos in game engine relative to canvas.

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block bg-black"
        />
    );
};

export default GameCanvas;