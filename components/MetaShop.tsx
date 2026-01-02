import React from 'react';
import { MetaProgress } from '../types';
import { UPGRADES } from '../constants';
import { Ghost, ArrowUpCircle } from 'lucide-react';

interface Props {
  meta: MetaProgress;
  onClose: () => void;
  onUpgrade: (id: string, cost: number) => void;
}

const MetaShop: React.FC<Props> = ({ meta, onClose, onUpgrade }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center text-white z-50">
      <div className="max-w-4xl w-full p-8">
        <div className="flex justify-between items-center mb-8 border-b border-purple-800 pb-4">
            <h2 className="text-4xl font-bold text-purple-400 font-mono">Soul Altar</h2>
            <div className="flex items-center gap-2 text-2xl">
                <span className="text-purple-300">{meta.souls}</span>
                <Ghost className="text-purple-500" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {UPGRADES.map(u => {
                const currentLevel = meta.upgrades[u.id] || 0;
                const isMax = currentLevel >= u.maxLevel;
                const canAfford = meta.souls >= u.cost;
                
                return (
                    <div key={u.id} className="bg-gray-900 border border-purple-900 p-6 rounded-lg shadow-lg hover:border-purple-500 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-100">{u.name}</h3>
                            <span className="text-xs bg-purple-900 px-2 py-1 rounded text-purple-200">Lvl {currentLevel}/{u.maxLevel}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 h-12">{u.description}</p>
                        
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-purple-300 font-mono">
                                {isMax ? 'MAXED' : `${u.cost} Souls`}
                            </div>
                            <button
                                onClick={() => onUpgrade(u.id, u.cost)}
                                disabled={isMax || !canAfford}
                                className={`p-2 rounded-full transition-all ${
                                    isMax ? 'bg-gray-700 opacity-50 cursor-not-allowed' :
                                    canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 shadow-lg' : 
                                    'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <ArrowUpCircle size={24} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="mt-12 text-center">
            <button 
                onClick={onClose}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xl font-mono transition-colors"
            >
                Return to Surface
            </button>
        </div>
      </div>
    </div>
  );
};

export default MetaShop;