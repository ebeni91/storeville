
"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      
      // Calculate mouse position as a percentage (0 to 1)
      const x = clientX / window.innerWidth;
      const y = clientY / window.innerHeight;
      
      // Update CSS variables for the parallax effect
      containerRef.current.style.setProperty("--mouse-x", `${x}`);
      containerRef.current.style.setProperty("--mouse-y", `${y}`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50"
      style={{
        // Default values to prevent hydration errors
        "--mouse-x": "0.5",
        "--mouse-y": "0.5",
      } as React.CSSProperties}
    >
      {/* 1. The Grid (Darker & More Visible) */}
      <div 
        className="absolute inset-0 opacity-[0.6]" // Increased opacity
        style={{ 
          backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`, // Slate-300 lines
          backgroundSize: '50px 50px', // Larger squares
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 90%)'
        }}
      />

      {/* 2. Interactive Aurora Blobs (They move with the mouse!) */}
      {/* Blob 1: Purple (Moves Opposite to mouse) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-300/40 blur-[100px] transition-transform duration-700 ease-out will-change-transform animate-float"
        style={{ 
          transform: 'translate(calc(var(--mouse-x) * -40px), calc(var(--mouse-y) * -40px))' 
        }} 
      />
      
      {/* Blob 2: Indigo (Moves WITH mouse) */}
      <div 
        className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-300/40 blur-[100px] transition-transform duration-700 ease-out will-change-transform animate-float [animation-delay:2s]"
        style={{ 
          transform: 'translate(calc(var(--mouse-x) * 40px), calc(var(--mouse-y) * 40px))' 
        }} 
      />

      {/* Blob 3: Blue (Subtle movement) */}
      <div 
        className="absolute bottom-[-10%] left-[20%] w-[70%] h-[50%] rounded-full bg-blue-200/40 blur-[120px] transition-transform duration-1000 ease-out will-change-transform animate-float [animation-delay:4s]"
        style={{ 
          transform: 'translate(calc(var(--mouse-x) * 20px), calc(var(--mouse-y) * 20px))' 
        }} 
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}