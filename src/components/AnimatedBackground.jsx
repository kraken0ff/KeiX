import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true }); // alpha: true для прозрачности
    let width, height;
    let particles = [];
    let animationFrameId;

    // СНИЖАЕМ КОЛИЧЕСТВО ДЛЯ FPS (было 100 -> стало 40-50)
    // На 240Hz мониторах каждый расчет критичен
    const particleCount = 45; 
    const connectionDistance = 160;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Чуть медленнее движение для плавности
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2 + 0.5;
        this.color = `rgba(99, 102, 241, ${Math.random() * 0.5})`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

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
      
      // Оптимизированный цикл: draw и update в одном проходе
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw();

        // Рисуем линии только если i < j (чтобы не рисовать дважды)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          // Оптимизация: сначала грубая проверка квадрата расстояния (быстрее корня)
          const distSq = dx * dx + dy * dy;
          
          if (distSq < connectionDistance * connectionDistance) {
            const dist = Math.sqrt(distSq);
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.12 - dist/connectionDistance * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
        // Debounce resize
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-40 will-change-transform" // Hardware accel
      style={{ background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 100%)' }}
    />
  );
};

export default AnimatedBackground;