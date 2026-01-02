import React from 'react';
import { Keyboard, Mouse, X, Sword, Shield } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const TutorialModal: React.FC<Props> = ({ onClose }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg max-w-2xl w-full shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X />
                </button>
                <h2 className="text-3xl font-bold text-white mb-6 text-center border-b border-gray-700 pb-4 font-mono">Field Manual</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Controls Section */}
                    <div>
                        <h3 className="text-xl text-yellow-400 mb-4 flex items-center gap-2 font-mono border-b border-gray-800 pb-2">
                            <Keyboard className="w-5 h-5" /> Controls
                        </h3>
                        <ul className="space-y-3 text-gray-300 font-mono text-sm">
                            <li className="flex justify-between items-center">
                                <span>Move</span>
                                <span className="bg-gray-800 px-2 py-1 rounded text-white border border-gray-700">W A S D</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Aim</span>
                                <span className="bg-gray-800 px-2 py-1 rounded text-white border border-gray-700">Mouse Cursor</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Attack</span>
                                <span className="bg-gray-800 px-2 py-1 rounded text-white border border-gray-700">Left Click</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Help</span>
                                <span className="bg-gray-800 px-2 py-1 rounded text-white border border-gray-700">H</span>
                            </li>
                        </ul>
                    </div>

                    {/* Mechanics Section */}
                    <div>
                         <h3 className="text-xl text-blue-400 mb-4 flex items-center gap-2 font-mono border-b border-gray-800 pb-2">
                            <Shield className="w-5 h-5" /> Mechanics
                        </h3>
                        <ul className="space-y-4 text-gray-300 text-sm font-mono">
                            <li className="flex gap-3">
                                <Sword className="text-red-500 w-5 h-5 flex-shrink-0" />
                                <div>
                                    <span className="text-red-400 font-bold block">Combat</span>
                                    Kill monsters to gain EXP. Level up to fully restore HP and increase stats.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="text-purple-400 font-bold w-5 text-center flex-shrink-0">S</div>
                                <div>
                                    <span className="text-purple-400 font-bold block">Souls</span>
                                    Permanent currency. Collected souls are saved even if you die. Use them at the Altar.
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded font-bold font-mono transition-colors shadow-lg"
                    >
                        RETURN TO BATTLE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;