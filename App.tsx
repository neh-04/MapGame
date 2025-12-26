import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import Confetti from './components/Confetti';
import CloudBackground from './components/CloudBackground';
import { GameMode, MapRegion, GeoFeature } from './types';
import { speak, playSoundEffect, musicPlayer } from './services/audioService';
import { getFunFact } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [region, setRegion] = useState<MapRegion>(MapRegion.WORLD);
  const [isMusicOn, setIsMusicOn] = useState(false);

  // Game State
  const [score, setScore] = useState(0);
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("Tap to start!");
  const [feedbackEmoji, setFeedbackEmoji] = useState<string>("🐻"); // Mascot: Bear
  const [showConfetti, setShowConfetti] = useState(false);

  // Interaction State
  const [correctName, setCorrectName] = useState<string | null>(null);
  const [errorName, setErrorName] = useState<string | null>(null);
  const [mistakesInRound, setMistakesInRound] = useState(0);

  const toggleMusic = () => {
    const playing = musicPlayer.toggle();
    setIsMusicOn(playing);
  };

  useEffect(() => {
    // Reset state on mode change
    setScore(0);
    setCorrectName(null);
    setErrorName(null);
    setMistakesInRound(0);
    setFeedbackMessage(mode === GameMode.LEARN ? "Tap any colorful shape!" : "Ready Set Go!");
    setFeedbackEmoji(mode === GameMode.LEARN ? "👀" : "🏁");
    setShowConfetti(false);

    if (mode === GameMode.FIND) {
      startNextRound();
    }
  }, [mode, region]);

  const getCommonTargets = (r: MapRegion) => {
    // Expanded list for fun
    switch (r) {
      case MapRegion.INDIA: return ['Maharashtra', 'Delhi', 'Tamil Nadu', 'Rajasthan', 'Kerala', 'Gujarat', 'West Bengal', 'Karnataka', 'Punjab', 'Goa'];
      case MapRegion.ASIA: return ['India', 'China', 'Japan', 'Thailand', 'Vietnam', 'Russia', 'Indonesia', 'Saudi Arabia', 'Iran'];
      case MapRegion.WORLD: return ['USA', 'China', 'Brazil', 'Australia', 'India', 'Canada', 'France', 'Egypt', 'United Kingdom', 'Mexico', 'Japan'];
    }
  };

  const startNextRound = useCallback(() => {
    const targets = getCommonTargets(region);
    const randomTarget = targets[Math.floor(Math.random() * targets.length)];
    setCurrentTarget(randomTarget);
    setCorrectName(null);
    setErrorName(null);
    setMistakesInRound(0);
    setFeedbackMessage(`Find ${randomTarget}`);
    setFeedbackEmoji("🧐");
    speak(`Can you find ${randomTarget}?`);
  }, [region]);

  const handleRegionClick = async (feature: GeoFeature) => {
    const name = feature.properties.name;
    if (!name) return;

    if (mode === GameMode.LEARN) {
      playSoundEffect('pop');
      setCorrectName(name);
      setFeedbackMessage(name);
      setFeedbackEmoji("✨");
      speak(name);

      const factData = await getFunFact(name);
      setFeedbackMessage(factData.fact);
      setFeedbackEmoji(factData.emoji);
      speak(factData.fact);
      setTimeout(() => setCorrectName(null), 3000);

    } else if (mode === GameMode.FIND) {
      if (!currentTarget) return;
      const clicked = name.toLowerCase().trim();
      const target = currentTarget.toLowerCase().trim();

      if (clicked === target || clicked.includes(target) || target.includes(clicked)) {
        // Correct
        setScore(prev => prev + 1);
        setCorrectName(name);
        setFeedbackMessage(`Yay! You found ${name}!`);
        setFeedbackEmoji("🤩"); // Star eyes
        setShowConfetti(true);
        playSoundEffect('win');
        speak(`You found ${name}! You are smart!`);

        setTimeout(() => {
          setShowConfetti(false);
          startNextRound();
        }, 3000);
      } else {
        // Wrong
        playSoundEffect('wrong');
        setErrorName(name);
        setMistakesInRound(prev => prev + 1);
        setFeedbackMessage(`That is ${name}. Try again!`);
        setFeedbackEmoji("🙈"); // Monkey covering eyes
        speak(`Oops, that is ${name}.`);
        setTimeout(() => setErrorName(null), 1000);
      }
    }
  };

  const MenuCard = ({ label, emoji, color, onClick, active }: any) => (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden group rounded-3xl p-4 flex flex-col items-center justify-center
        transition-all duration-300 transform
        ${active ? 'scale-110 ring-8 ring-white shadow-2xl z-10' : 'hover:scale-105 opacity-90 hover:opacity-100 hover:shadow-xl'}
        ${color}
      `}
      style={{ minHeight: '140px', minWidth: '120px' }}
    >
      {/* Background circles decoration */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-white opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white opacity-20 rounded-full translate-x-1/2 translate-y-1/2"></div>

      <span className="text-6xl mb-2 filter drop-shadow-md group-hover:animate-bounce">{emoji}</span>
      <span className="font-fredoka font-bold text-white text-xl md:text-2xl tracking-wide shadow-black drop-shadow-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-sky-300 to-sky-100 font-fredoka overflow-hidden select-none">
      <CloudBackground />

      {/* Top Bar */}
      <div className="flex-none z-20 flex justify-between items-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="font-extrabold text-sky-600 text-lg hidden md:inline">Tiny Explorers</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggleMusic}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${isMusicOn ? 'bg-pink-400 text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            {isMusicOn ? '🎵' : '🔇'}
          </button>

          {mode !== GameMode.MENU && (
            <button
              onClick={() => setMode(GameMode.MENU)}
              className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-transform active:scale-95"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      <main className="flex-grow relative z-10 flex flex-col items-center justify-center p-2 md:p-4">

        {mode === GameMode.MENU ? (
          <div className="w-full max-w-5xl flex flex-col items-center animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] mb-2 text-center">
              Let's Explore!
            </h1>
            <p className="text-xl text-white font-bold drop-shadow-md mb-10 bg-sky-500/30 px-6 py-1 rounded-full">
              Tap a map to start your adventure
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 mb-12">
              <MenuCard label="World" emoji="🌍" color="bg-indigo-400" active={region === MapRegion.WORLD} onClick={() => setRegion(MapRegion.WORLD)} />
              <MenuCard label="Asia" emoji="⛩️" color="bg-rose-400" active={region === MapRegion.ASIA} onClick={() => setRegion(MapRegion.ASIA)} />
              <MenuCard label="India" emoji="🐅" color="bg-amber-400" active={region === MapRegion.INDIA} onClick={() => setRegion(MapRegion.INDIA)} />
            </div>

            <div className="flex gap-6 w-full max-w-xl px-4">
              <button onClick={() => { setMode(GameMode.LEARN); playSoundEffect('pop'); }} className="flex-1 bg-green-500 hover:bg-green-400 text-white text-3xl font-black py-6 rounded-3xl shadow-[0_8px_0_#15803d] active:shadow-none active:translate-y-2 transition-all">
                Learn 🎓
              </button>
              <button onClick={() => { setMode(GameMode.FIND); playSoundEffect('pop'); }} className="flex-1 bg-purple-500 hover:bg-purple-400 text-white text-3xl font-black py-6 rounded-3xl shadow-[0_8px_0_#7e22ce] active:shadow-none active:translate-y-2 transition-all">
                Play 🎮
              </button>
            </div>

            <div className="mt-12 text-sky-900 font-black text-xl animate-pulse tracking-wider drop-shadow-sm">
              Made with ❤️ by Neha
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col gap-4 relative">
            {/* Score Badge */}
            {mode === GameMode.FIND && (
              <div className="absolute top-2 right-2 z-30 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-black text-xl shadow-lg border-4 border-white transform rotate-2">
                ⭐ {score}
              </div>
            )}

            {/* Map */}
            <div className="flex-grow w-full relative">
              <MapComponent
                region={region}
                onRegionClick={handleRegionClick}
                highlightName={mode === GameMode.FIND ? currentTarget : null}
                correctName={correctName}
                errorName={errorName}
                hintName={mistakesInRound > 2 ? currentTarget : null} // Smart Hint
                showLabels={mode === GameMode.LEARN}
              />
              {showConfetti && <Confetti />}
            </div>

            {/* Character Box / HUD */}
            <div className="flex-none h-32 md:h-40 bg-white rounded-[2rem] shadow-xl mx-2 mb-2 flex items-center p-4 relative overflow-visible border-b-8 border-gray-200">
              {/* Mascot Circle */}
              <div className="absolute -top-10 left-4 md:left-10 w-24 h-24 md:w-32 md:h-32 bg-orange-300 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-5xl md:text-7xl animate-bounce-slow">
                {feedbackEmoji}
              </div>

              <div className="ml-24 md:ml-40 flex flex-col justify-center w-full">
                <h2 className="text-2xl md:text-4xl font-black text-gray-800 leading-tight">
                  {feedbackMessage}
                </h2>
                {mode === GameMode.FIND && currentTarget && mistakesInRound > 2 && (
                  <p className="text-orange-500 font-bold animate-pulse">
                    Look for the flashing yellow shape!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .font-fredoka { font-family: 'Fredoka', sans-serif; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;