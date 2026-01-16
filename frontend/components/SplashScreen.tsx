"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // 🔒 LOCK SCROLL: Prevent user from scrolling the homepage while splash is on
    if (typeof window !== "undefined") {
      document.body.style.overflow = "hidden";
    }

    // Trigger entry animation slightly after mount
    setTimeout(() => setStartAnimation(true), 100);

    // Start exit fade-out
    const timer = setTimeout(() => {
      setIsVisible(false);
      // 🔓 UNLOCK SCROLL: Allow scrolling again once fade-out starts
      if (typeof window !== "undefined") {
        document.body.style.overflow = "unset";
      }
    }, 3500); // Increased slightly to 2.5s for a better "Entrance" feel

    // Unmount component
    const cleanup = setTimeout(() => {
      setShouldRender(false);
    }, 4000); // Matches fade duration

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
      // Safety cleanup in case component unmounts early
      if (typeof window !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/5 backdrop-blur-3xl transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Optional: Dark overlay to make the content pop more before revealing the app */}
      <div className="absolute inset-0 bg-white/0" />

      {/* Logo Container */}
      <div 
        className={`relative z-10 p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/20 mb-8 bg-gradient-to-br from-indigo-600 to-purple-600 backdrop-blur-md border border-white/20 transform transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          startAnimation ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-12 opacity-0"
        }`}
      >
        <Store size={72} className="text-white drop-shadow-md" />
      </div>
      
      {/* Brand Text */}
      <div 
        className={`relative z-10 text-center transition-all duration-1000 delay-200 ${
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

      {/* Loading Bar */}
      {/* <div className={`relative z-10 mt-12 h-1.5 w-48 bg-slate-300/50 rounded-full overflow-hidden transition-all duration-1000 delay-500 ${
         startAnimation ? "opacity-100" : "opacity-0"
      }`}>
        <div className="h-full bg-indigo-600 w-1/2 animate-[loading_1.5s_ease-in-out_infinite]" />
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