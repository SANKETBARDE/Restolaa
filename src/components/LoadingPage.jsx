import { useState, useEffect } from 'react';

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF8E7] overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D4A017] rounded-full opacity-5 animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#B8860B] rounded-full opacity-5 animate-[spin_15s_linear_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4A017] rounded-full opacity-3 animate-[pulse_3s_ease-in-out_infinite]"></div>
      </div>

      {/* Logo Container with Cool Animation */}
      <div className="relative mb-8 z-10">
        {/* Outer Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 border-2 border-[#D4A017] rounded-full opacity-20 animate-[spin_8s_linear_infinite]"></div>
        </div>
        
        {/* Middle Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border border-[#B8860B] rounded-full opacity-30 animate-[spin_6s_linear_infinite_reverse]"></div>
        </div>

        {/* Inner Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 border-2 border-[#D4A017] rounded-full opacity-40 animate-[spin_4s_linear_infinite]"></div>
        </div>

        {/* Logo with Scale and Fade Animation */}
        <div className="relative flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-2xl animate-[fadeInScale_1s_ease-out]">
          <img
            src="/Restolacut.png"
            alt="Restola logo"
            className="w-20 h-20 object-contain animate-[float_3s_ease-in-out_infinite]"
          />
        </div>

        {/* Glowing Effect */}
        <div className="absolute inset-0 bg-[#D4A017] rounded-full blur-3xl opacity-20 animate-[pulse_2s_ease-in-out_infinite]"></div>
      </div>

      {/* Loading Text */}
      <p className="text-gray-600 mb-8 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">Loading your dining experience...</p>

      {/* Progress Bar with Shimmer Effect */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden animate-[fadeInUp_0.8s_ease-out_0.7s_both]">
        <div
          className="h-full bg-gradient-to-r from-[#D4A017] via-[#B8860B] to-[#D4A017] rounded-full transition-all duration-300 ease-out relative"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-[shimmer_2s_linear_infinite]"></div>
        </div>
      </div>

      {/* Loading Text */}
      <p className="mt-4 text-sm text-gray-500 animate-[fadeInUp_0.8s_ease-out_0.9s_both]">
        {progress < 30 ? 'Preparing menu...' : progress < 60 ? 'Loading ingredients...' : progress < 90 ? 'Setting the table...' : 'Almost ready...'}
      </p>

      {/* Decorative Floating Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 animate-[fadeInUp_0.8s_ease-out_1.1s_both]">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-[#D4A017] rounded-full animate-[floatDot_1.5s_ease-in-out_infinite]"
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          ></div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes floatDot {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-10px) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;
