import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// === КОНФИГ КЛАВИАТУРЫ (Разбиваем на секции) ===

const SECTION_MAIN = [
  ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
  ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'MetaRight', 'ContextMenu', 'ControlRight']
];

const SECTION_NAV = [
  ['PrintScreen', 'ScrollLock', 'Pause'],
  ['Insert', 'Home', 'PageUp'],
  ['Delete', 'End', 'PageDown'],
  // Пустой ряд для отступа перед стрелками
  [], 
  ['ArrowUp'],
  ['ArrowLeft', 'ArrowDown', 'ArrowRight']
];

const SECTION_NUM = [
  ['NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract'],
  ['Numpad7', 'Numpad8', 'Numpad9', 'NumpadAdd'],
  ['Numpad4', 'Numpad5', 'Numpad6'], // NumpadAdd занимает 2 ряда, но в упрощенной сетке оставим так
  ['Numpad1', 'Numpad2', 'Numpad3', 'NumpadEnter'],
  ['Numpad0', 'NumpadDecimal'] // NumpadEnter занимает 2 ряда
];

const LABELS = {
  Backquote: '~', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', Space: '', 
  ControlLeft: 'Ctrl', MetaLeft: 'Win', AltLeft: 'Alt', ControlRight: 'Ctrl', MetaRight: 'Win', AltRight: 'Alt', ShiftLeft: 'Shift', ShiftRight: 'Shift', Backspace: 'Backspace', Enter: 'Enter', CapsLock: 'Caps', Tab: 'Tab', ContextMenu: 'Fn', Escape: 'ESC',
  PrintScreen: 'PrtSc', ScrollLock: 'ScrLk', Pause: 'Pause', Insert: 'Ins', Home: 'Home', PageUp: 'PgUp', Delete: 'Del', End: 'End', PageDown: 'PgDn',
  ArrowUp: '↑', ArrowLeft: '←', ArrowDown: '↓', ArrowRight: '→',
  NumLock: 'Num', NumpadDivide: '/', NumpadMultiply: '*', NumpadSubtract: '-', NumpadAdd: '+', NumpadEnter: 'Ent', NumpadDecimal: '.',
  Numpad0: '0', Numpad1: '1', Numpad2: '2', Numpad3: '3', Numpad4: '4', Numpad5: '5', Numpad6: '6', Numpad7: '7', Numpad8: '8', Numpad9: '9'
};

const WIDTHS = {
  Backspace: 'w-24', Tab: 'w-20', CapsLock: 'w-24', Enter: 'w-28', ShiftLeft: 'w-28', ShiftRight: 'w-32', 
  Space: 'w-64 sm:w-80', 
  ControlLeft: 'w-16', MetaLeft: 'w-14', AltLeft: 'w-16', ControlRight: 'w-16', AltRight: 'w-16', MetaRight: 'w-14',
  Numpad0: 'w-[108px]', // Двойная ширина для нуля
  NumpadAdd: 'h-[108px]', // Вертикальные пока сложно реализовать в flex-row, оставим обычными
  NumpadEnter: 'h-[108px]'
};

// Тексты для тайпинга
const TEXTS = [
  "Элегантный код подобен музыке. Каждая строка должна иметь свой ритм и смысл.",
  "Совершенство достигнуто не тогда, когда нечего добавить, а когда нечего убрать.",
  "Качественные механические переключатели создают тактильную симфонию для пальцев.",
  "В мире цифрового шума чистота дизайна и скорость реакции решают всё."
];

// === КОМПОНЕНТЫ ===

// 1. Кнопка с "дорогой" физикой
const Key = ({ code, active, tested, label, customClass = "" }) => {
  // Базовая ширина
  const baseWidth = WIDTHS[code] || 'w-12';
  
  return (
    <div className={`relative ${baseWidth} h-12 m-[3px] perspective-500 ${customClass}`}>
      <motion.div
        layout
        initial={false}
        animate={{
          y: active ? 4 : 0,
          scale: active ? 0.95 : 1,
          backgroundColor: active ? '#6366f1' : tested ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
          borderColor: active ? '#818cf8' : tested ? '#4f46e5' : 'rgba(255,255,255,0.1)',
          boxShadow: active 
            ? '0 0 25px rgba(99, 102, 241, 0.6), inset 0 0 10px rgba(255,255,255,0.3)' 
            : tested 
            ? '0 0 8px rgba(99, 102, 241, 0.2)' 
            : '0 4px 0 rgba(0,0,0,0.4)'
        }}
        transition={{ duration: 0.1 }}
        className={`
          w-full h-full rounded-lg border border-white/5 
          flex items-center justify-center 
          text-[10px] sm:text-xs font-bold tracking-wider font-mono
          text-slate-400 select-none relative z-10
          backdrop-blur-sm cursor-pointer
        `}
      >
        <span className={`transition-colors duration-200 ${active ? 'text-white' : tested ? 'text-indigo-300' : ''}`}>
          {label}
        </span>
        
        {/* Блик сверху */}
        <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent rounded-t-lg pointer-events-none" />
      </motion.div>
      
      {/* "Дно" кнопки */}
      {!active && (
        <div className="absolute inset-x-0 -bottom-1 h-full rounded-lg bg-slate-900 -z-10 translate-y-1" />
      )}
    </div>
  );
};

// 2. Тестер Клавиш
const TesterMode = () => {
  const [activeKeys, setActiveKeys] = useState([]);
  const [history, setHistory] = useState(new Set());
  const [lastKey, setLastKey] = useState(null);

  // ОПТИМИЗИРОВАННЫЙ СЛУШАТЕЛЬ (Исправлен баг перерисовки)
  useEffect(() => {
    const handleDown = (e) => {
      e.preventDefault();
      // Используем callback, чтобы не зависеть от activeKeys
      setActiveKeys(prev => {
        if (prev.includes(e.code)) return prev;
        return [...prev, e.code];
      });
      setHistory(prev => new Set(prev).add(e.code));
      setLastKey(e.code);
    };

    const handleUp = (e) => {
      setActiveKeys(prev => prev.filter(k => k !== e.code));
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    
    // Очистка при размонтировании
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []); // Пустой массив = работает всегда

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center"
    >
      {/* Контейнер для скролла на маленьких экранах */}
      <div className="w-full overflow-x-auto pb-8 flex justify-center">
        {/* Сама клавиатура (3 секции) */}
        <div className="glass-panel p-6 rounded-[20px] inline-flex gap-4 shadow-2xl relative min-w-max">
          
          {/* СЕКЦИЯ 1: ОСНОВНАЯ */}
          <div className="flex flex-col gap-1">
            {SECTION_MAIN.map((row, i) => (
              <div key={i} className="flex">
                {row.map(code => (
                  <Key key={code} code={code} label={LABELS[code] || code.replace('Key', '').replace('Digit', '')} active={activeKeys.includes(code)} tested={history.has(code)} />
                ))}
              </div>
            ))}
          </div>

          {/* СЕКЦИЯ 2: НАВИГАЦИЯ + СТРЕЛКИ */}
          <div className="flex flex-col gap-1 justify-between">
            <div className="flex flex-col gap-1">
              {SECTION_NAV.slice(0, 3).map((row, i) => (
                <div key={i} className="flex">
                  {row.map(code => (
                     <Key key={code} code={code} label={LABELS[code]} active={activeKeys.includes(code)} tested={history.has(code)} />
                  ))}
                </div>
              ))}
            </div>
            
            {/* Стрелки отдельно для выравнивания */}
            <div className="flex flex-col items-center gap-1 mt-auto">
               <Key code="ArrowUp" label="↑" active={activeKeys.includes('ArrowUp')} tested={history.has('ArrowUp')} />
               <div className="flex gap-1">
                  <Key code="ArrowLeft" label="←" active={activeKeys.includes('ArrowLeft')} tested={history.has('ArrowLeft')} />
                  <Key code="ArrowDown" label="↓" active={activeKeys.includes('ArrowDown')} tested={history.has('ArrowDown')} />
                  <Key code="ArrowRight" label="→" active={activeKeys.includes('ArrowRight')} tested={history.has('ArrowRight')} />
               </div>
            </div>
          </div>

          {/* СЕКЦИЯ 3: NUMPAD */}
          <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
             {SECTION_NUM.map((row, i) => (
                <div key={i} className="flex">
                  {row.map(code => (
                     <Key key={code} code={code} label={LABELS[code]} active={activeKeys.includes(code)} tested={history.has(code)} />
                  ))}
                </div>
              ))}
          </div>

        </div>
      </div>

      {/* Статистика снизу */}
      <div className="mt-4 flex items-center gap-8 px-8 py-4 glass-panel rounded-full text-sm sm:text-base">
        <div className="flex flex-col items-center">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Нажато</span>
          <span className="text-indigo-400 font-mono text-xl">{history.size}</span>
        </div>
        <div className="h-8 w-[1px] bg-white/10"></div>
        <div className="flex flex-col items-center min-w-[100px]">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Code</span>
          <motion.span 
            key={lastKey}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-white font-bold font-mono text-xl text-glow"
          >
            {lastKey || "..."}
          </motion.span>
        </div>
        <div className="h-8 w-[1px] bg-white/10"></div>
        <button 
          onClick={() => { setHistory(new Set()); setLastKey(null); }}
          className="text-red-400 hover:text-red-300 transition-colors font-medium text-xs sm:text-sm uppercase tracking-wider"
        >
          Reset
        </button>
      </div>
    </motion.div>
  );
};

// 3. Режим Тайпинга
const TypingMode = () => {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [stats, setStats] = useState({ wpm: 0 });
  const inputRef = useRef(null);

  const restart = () => {
    setText(TEXTS[Math.floor(Math.random() * TEXTS.length)]);
    setInput("");
    setStarted(false);
    setFinished(false);
    setStats({ wpm: 0 });
    setStartTime(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => restart(), []);

  const handleChange = (e) => {
    if(finished) return;
    const val = e.target.value;
    if(!started) { setStarted(true); setStartTime(Date.now()); }
    setInput(val);

    if(val === text) {
      setFinished(true);
      const dur = (Date.now() - startTime) / 60000;
      const wpm = Math.round((text.length / 5) / dur);
      setStats({ wpm });
      confetti({
        particleCount: 200, spread: 100, origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });
    }
  };

  const liveWpm = started && !finished && startTime 
    ? Math.round((input.length/5) / ((Date.now() - startTime)/60000)) || 0 
    : stats.wpm;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center"
    >
      <div className="glass-panel p-12 rounded-[40px] w-full text-center relative overflow-hidden">
        <div className="flex justify-between items-end mb-10 px-4">
          <div className="text-left">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Speed</div>
            <div className="text-5xl font-mono text-white text-glow transition-all">{liveWpm}</div>
          </div>
          {!finished ? (
            <div className="animate-pulse text-xs text-slate-500 font-mono">печатай...</div>
          ) : (
            <div className="text-green-400 text-sm font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">Complete</div>
          )}
        </div>

        <div className="relative text-2xl sm:text-3xl font-light leading-relaxed font-mono text-left tracking-wide min-h-[120px]" onClick={() => inputRef.current.focus()}>
          <input ref={inputRef} type="text" value={input} onChange={handleChange} className="opacity-0 absolute inset-0 -z-10 cursor-default"/>
          
          {text.split('').map((char, i) => {
            let statusClass = "text-slate-600";
            if (i < input.length) {
              statusClass = input[i] === char ? "text-slate-200" : "text-red-500 decoration-red-500/50 underline decoration-2";
            }
            if (i === input.length && !finished) return <span key={i} className="bg-indigo-500 text-black shadow-[0_0_15px_#6366f1] rounded-sm px-[2px]">{char}</span>;
            return <span key={i} className={`${statusClass} transition-colors duration-150`}>{char}</span>
          })}
        </div>

        {finished && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={restart}
            className="mt-12 px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 ring-1 ring-white/20"
          >
            Try Again ↻
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// === MAIN APP ===
export default function App() {
  const [tab, setTab] = useState('tester'); 

  return (
    <div className="min-h-screen w-full flex flex-col p-4 sm:p-8 overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      {/* Фон-сетка */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <header className="flex justify-between items-center max-w-[1400px] mx-auto w-full mb-12 relative z-20">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 font-sans tracking-tight">
          Kei<span className="font-light italic text-indigo-400">X</span>
        </h1>
        
        {/* Анимированные Вкладки */}
        <div className="glass-panel p-1 rounded-2xl flex gap-1 relative">
          {['tester', 'typing'].map((mode) => (
            <button
              key={mode}
              onClick={() => setTab(mode)}
              className={`relative z-10 px-6 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${tab === mode ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {tab === mode && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              {mode === 'tester' ? 'Switch Tester' : 'Speed Type'}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start relative z-10 w-full">
        <AnimatePresence mode="wait">
          {tab === 'tester' ? (
            <TesterMode key="tester" />
          ) : (
            <TypingMode key="typing" />
          )}
        </AnimatePresence>
      </main>

      {/* Футер */}
      <footer className="text-center text-slate-600 text-xs py-4 font-mono mt-auto">
        Made with React & Tailwind
      </footer>
    </div>
  );
}