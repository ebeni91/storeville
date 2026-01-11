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
      // 👇 KEY CHANGE: Heavy Backdrop Blur + Low Opacity White
      // This creates the "Frosted Glass" window effect
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/10 backdrop-blur-3xl transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Logo Container 
        - Glassy Gradient Gem
        - Smooth Scale & Rotate Entry Animation
      */}
      <div 
        className={`p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/20 mb-8 bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-md border border-white/20 transform transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          startAnimation ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-12 opacity-0"
        }`}
      >
        <Store size={72} className="text-white drop-shadow-md" />
      </div>
      
      {/* Brand Text */}
      <div 
        className={`text-center transition-all duration-1000 delay-200 ${
          startAnimation ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <h1 className="text-5xl font-extrabold tracking-tight mb-3 text-slate-900 drop-shadow-sm">
          StoreVille
        </h1>
        <p className="text-slate-600 text-lg font-medium tracking-wide">
          The Digital Mall of Ethiopia
        </p>
      </div>

      {/* Optional: Simple Glass Loading Bar */}
      {/* <div className={`mt-12 h-1.5 w-48 bg-slate-200/50 rounded-full overflow-hidden transition-all duration-1000 delay-500 ${
         startAnimation ? "opacity-100" : "opacity-0"
      }`}>
        <div className="h-full bg-indigo-600/80 w-1/2 animate-[loading_1.5s_ease-in-out_infinite]" />
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