import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from './classes/GameEngine';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import MetaShop from './components/MetaShop';
import TutorialModal from './components/TutorialModal';
import { GameState, MetaProgress } from './types';
import { Skull, Play, ShoppingBag } from 'lucide-react';

const STORAGE_KEY = 'rogue_clone_meta';

const INITIAL_META: MetaProgress = {
  souls: 0,
  upgrades: {},
  unlocks: []
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [meta, setMeta] = useState<MetaProgress>(INITIAL_META);
  const [game, setGame] = useState<GameEngine | null>(null);
  const [tick, setTick] = useState(0); // For HUD updates
  const [showTutorial, setShowTutorial] = useState(false);

  // Load Meta
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMeta(JSON.parse(stored));
      } catch (e) { console.error("Failed to load save", e); }
    }
  }, []);

  // Save Meta
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  }, [meta]);

  // Input Listeners for the whole window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'h') {
            setShowTutorial(prev => !prev);
            return;
        }

        if (game && !showTutorial) {
            game.keys[e.key.toLowerCase()] = true;
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (game && !showTutorial) {
            game.keys[e.key.toLowerCase()] = false;
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [game, showTutorial]);

  // Game Loop Ticker for UI
  useEffect(() => {
    if (gameState !== GameState.PLAYING || !game || showTutorial) return;
    const interval = setInterval(() => {
        setTick(t => t + 1);
        if (game.gameOver) {
            setGameState(GameState.GAME_OVER);
            // Update souls from run
            if (game.player && game.player.stats) {
                setMeta(prev => ({ ...prev, souls: prev.souls + game.player!.stats!.souls }));
            }
        }
    }, 100);
    return () => clearInterval(interval);
  }, [gameState, game, showTutorial]);

  const startGame = () => {
    const newGame = new GameEngine(meta);
    newGame.viewport = { w: window.innerWidth, h: window.innerHeight };
    newGame.initLevel(1);
    setGame(newGame);
    setGameState(GameState.PLAYING);
    setShowTutorial(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!game || showTutorial) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      game.mousePos = { x, y };
      game.viewport = { w: window.innerWidth, h: window.innerHeight };
  };

  const handleMouseDown = () => {
      if (game && !showTutorial) game.mousePressed = true;
  }

  const handleMouseUp = () => {
       if (game) game.mousePressed = false;
  }

  const buyUpgrade = (id: string, cost: number) => {
      if (meta.souls >= cost) {
          setMeta(prev => ({
              ...prev,
              souls: prev.souls - cost,
              upgrades: {
                  ...prev.upgrades,
                  [id]: (prev.upgrades[id] || 0) + 1
              }
          }));
      }
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative font-mono text-gray-200 select-none">
        
        {/* Main Menu */}
        {gameState === GameState.MENU && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-gray-900 to-black">
                <h1 className="text-6xl font-bold text-red-600 tracking-widest uppercase mb-4 drop-shadow-lg">Rogue Clone</h1>
                <p className="text-gray-500">A nice little roguelite dungeon crawler.</p>
                
                <div className="flex flex-col gap-4 w-64">
                    <button 
                        onClick={startGame}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-700 hover:bg-red-600 text-white rounded shadow-lg transition-transform hover:scale-105"
                    >
                        <Play size={20} /> New Run
                    </button>
                    <button 
                        onClick={() => setGameState(GameState.SHOP)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded shadow-lg transition-transform hover:scale-105"
                    >
                        <ShoppingBag size={20} /> Soul Altar
                    </button>
                    <button 
                        onClick={() => setShowTutorial(true)}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded shadow-lg transition-colors"
                    >
                        How to Play
                    </button>
                </div>
            </div>
        )}

        {/* Game Loop */}
        {gameState === GameState.PLAYING && game && (
            <div 
                className="w-full h-full cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                <GameCanvas 
                    game={game} 
                    width={window.innerWidth} 
                    height={window.innerHeight} 
                    paused={showTutorial}
                />
                <HUD game={game} tick={tick} />
            </div>
        )}

        {/* Game Over */}
        {gameState === GameState.GAME_OVER && (
            <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex flex-col items-center justify-center text-white z-50">
                <Skull size={64} className="mb-4 text-black opacity-50" />
                <h2 className="text-5xl font-bold mb-2">YOU DIED</h2>
                <p className="text-xl opacity-75 mb-8">But your soul grows stronger...</p>
                <button 
                    onClick={() => setGameState(GameState.MENU)}
                    className="px-8 py-3 bg-black hover:bg-gray-900 border border-red-500 text-red-500 font-bold rounded"
                >
                    Return to Void
                </button>
            </div>
        )}

        {/* Shop */}
        {gameState === GameState.SHOP && (
            <MetaShop 
                meta={meta} 
                onClose={() => setGameState(GameState.MENU)} 
                onUpgrade={buyUpgrade}
            />
        )}

        {/* Tutorial Overlay */}
        {showTutorial && (
            <TutorialModal onClose={() => setShowTutorial(false)} />
        )}
    </div>
  );
};

export default App;