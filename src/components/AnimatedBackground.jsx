// src/components/AnimatedBackground.jsx
import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Настройка частиц
    const particleCount = 100;
    const connectionDistance = 150;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5; // Скорость X
        this.vy = (Math.random() - 0.5) * 0.5; // Скорость Y
        this.size = Math.random() * 2 + 0.5;
        this.color = `rgba(99, 102, 241, ${Math.random() * 0.5})`; // Indigo tint
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Отталкивание от границ (без исчезновения)
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Рендер частиц
      particles.forEach((p, index) => {
        p.update();
        p.draw();

        // Рисуем линии между близкими частицами
        for (let j = index; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.15 - dist/connectionDistance * 0.15})`; // Очень тонкая линия
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{ background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 100%)' }}
    />
  );
};

export default AnimatedBackground;