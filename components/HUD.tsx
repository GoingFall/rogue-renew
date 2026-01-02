import React from 'react';
import { GameEngine } from '../classes/GameEngine';
import { Heart, Coins, Ghost, Shield, Zap, HelpCircle, Wind } from 'lucide-react';

interface Props {
    game: GameEngine;
    tick: number; // Used to trigger re-renders
}

const HUD: React.FC<Props> = ({ game }) => {
    if (!game.player || !game.player.stats) return null;
    const s = game.player.stats;

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    {/* Health */}
                    <div className="bg-gray-900 bg-opacity-80 p-2 rounded border border-gray-700 flex flex-col w-48">
                        <div className="flex items-center gap-2 mb-1 text-red-500 font-bold">
                            <Heart size={18} fill="currentColor" />
                            <span>HP {Math.floor(s.hp)} / {s.maxHp}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-600 transition-all duration-200"
                                style={{ width: `${Math.max(0, (s.hp / s.maxHp) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-gray-900 bg-opacity-80 p-2 rounded border border-gray-700 flex gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                            <Shield size={16} className="text-blue-400" />
                            <span>Def {s.armor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Zap size={16} className="text-yellow-400" />
                            <span>Str {s.str}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Wind size={16} className="text-green-400" />
                            <span>Agi {s.agility}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-green-400 font-bold">Lvl {s.level}</span>
                        </div>
                    </div>
                </div>

                {/* Resources */}
                <div className="bg-gray-900 bg-opacity-80 p-2 rounded border border-gray-700 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold">
                        <span>{s.gold}</span>
                        <Coins size={18} />
                    </div>
                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <span>{s.souls} (Saved)</span>
                        <Ghost size={18} />
                    </div>
                </div>
            </div>

            {/* Messages Log */}
            <div className="w-full flex justify-between items-end">
                <div className="bg-black bg-opacity-60 p-2 rounded text-sm font-mono space-y-1 max-w-md w-full">
                    {game.messages.map((msg, i) => (
                        <div key={i} className={`opacity-${(i + 1) * 20} text-white`}>
                            {i === game.messages.length - 1 ? '> ' : '  '} {msg}
                        </div>
                    ))}
                </div>

                <div className="text-gray-500 text-xs flex items-center gap-1 bg-black bg-opacity-40 p-1 px-2 rounded">
                    <HelpCircle size={12} /> Press [H] for Help
                </div>
            </div>
        </div>
    );
};

export default HUD;