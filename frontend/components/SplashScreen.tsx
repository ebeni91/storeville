"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Trigger entry animation slightly after mount
    setTimeout(() => setStartAnimation(true), 100);

    // Start exit fade-out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2200);

    // Unmount component
    const cleanup = setTimeout(() => {
      setShouldRender(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Logo Container 
        - Gradient Background
        - Smooth Scale & Rotate Entry Animation
      */}
      <div 
        className={`p-7 rounded-3xl shadow-2xl shadow-indigo-200 mb-8 bg-gradient-to-br from-indigo-600 to-purple-600 transform transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          startAnimation ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-12 opacity-0"
        }`}
      >
        <Store size={64} className="text-white drop-shadow-md" />
      </div>
      
      {/* Brand Text
        - Gradient Text
        - Fade Up Animation
      */}
      <div 
        className={`text-center transition-all duration-1000 delay-200 ${
          startAnimation ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <h1 className="text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          StoreVille
        </h1>
        <p className="text-slate-400 text-lg font-medium tracking-wide">
          The Digital Mall of Ethiopia
        </p>
      </div>

      {/* Loading Bar 
        - A sleek gradient line instead of dots
      */}
      {/* <div className="mt-12 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 w-1/2 animate-[loading_1s_ease-in-out_infinite]" />
      </div> */}

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}