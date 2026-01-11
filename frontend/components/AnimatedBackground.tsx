"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      containerRef.current.style.setProperty("--mouse-x", `${x}`);
      containerRef.current.style.setProperty("--mouse-y", `${y}`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-900" 
      // 👆 Changed base to dark slate for richer contrast, or keep bg-slate-50 if you prefer light mode.
      // Let's stick to a very light gray to match your light theme but allow colors to pop.
      style={{ 
        backgroundColor: '#f8fafc', // Slate-50
        "--mouse-x": "0.5", 
        "--mouse-y": "0.5" 
      } as React.CSSProperties}
    >
      {/* 1. Base Gradient (Deep, Richer Light) */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-transparent to-purple-100/50" />

      {/* 2. Moving Mesh Blobs (Vibrant & Electric) */}
      <div className="absolute inset-0 opacity-100">
        {/* Blob 1: Deep Purple (Top Left) */}
        <div 
          className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-purple-400/20 mix-blend-multiply filter blur-[80px] animate-blob transition-transform duration-1000 ease-out"
          style={{ transform: 'translate(calc(var(--mouse-x) * -40px), calc(var(--mouse-y) * -40px))' }}
        />
        
        {/* Blob 2: Electric Cyan (Top Right) */}
        <div 
          className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-cyan-400/20 mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000 transition-transform duration-1000 ease-out"
          style={{ transform: 'translate(calc(var(--mouse-x) * 40px), calc(var(--mouse-y) * -40px))' }}
        />

        {/* Blob 3: Royal Indigo (Bottom Center) */}
        <div 
          className="absolute -bottom-40 left-[10%] w-[80vw] h-[80vw] rounded-full bg-indigo-500/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 transition-transform duration-1000 ease-out"
          style={{ transform: 'translate(calc(var(--mouse-x) * 20px), calc(var(--mouse-y) * 20px))' }}
        />
      </div>

      {/* 3. The "Spotlight" Digital Grid */}
      <div 
        className="absolute inset-0 opacity-60 mix-blend-overlay"
        style={{ 
          // Sharp Indigo Lines
          backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          // 👇 Radial Mask: Visible in center, fades to edges completely
          maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 80%)'
        }}
      />
    </div>
  );
}