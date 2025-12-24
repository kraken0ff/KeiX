import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [clicked, setClicked] = useState(false);

  // Более мягкая пружина для следа (Lag effect)
  const springConfig = { damping: 20, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    const handleDown = () => setClicked(true);
    const handleUp = () => setClicked(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-visible hidden md:block">
      {/* 1. TRAIL (Кольцо, отстающее от курсора) */}
      <motion.div
        className="absolute w-8 h-8 rounded-full border border-indigo-500/50"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          left: -16, // Центрируем кольцо относительно координат
          top: -16,
        }}
      />

      {/* 2. CURSOR BODY (Сама стрелка) */}
      <motion.div
        className="absolute"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{ scale: clicked ? 0.9 : 1 }}
      >
        {/* SVG Стрелка, смещенная, чтобы кончик был ровно на координатах (0,0) */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
          style={{ transform: "translate(-2px, -2px)" }} // Коррекция кончика
        >
          <path
            d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
            fill="#6366f1"
            stroke="#a5b4fc"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}