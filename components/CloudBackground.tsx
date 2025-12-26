import React from 'react';

const CloudBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="cloud cloud-1">☁️</div>
      <div className="cloud cloud-2">☁️</div>
      <div className="cloud cloud-3">☁️</div>
      <div className="cloud cloud-4">☁️</div>
      
      <style>{`
        .cloud {
          position: absolute;
          font-size: 5rem;
          color: rgba(255, 255, 255, 0.8);
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
          opacity: 0.6;
        }
        .cloud-1 { top: 10%; left: -20%; animation: float 25s linear infinite; }
        .cloud-2 { top: 30%; left: -10%; animation: float 35s linear infinite 5s; font-size: 3rem; }
        .cloud-3 { top: 60%; left: -25%; animation: float 30s linear infinite 10s; font-size: 6rem; }
        .cloud-4 { top: 80%; left: -15%; animation: float 40s linear infinite 2s; font-size: 4rem; }

        @keyframes float {
          0% { transform: translateX(0); }
          100% { transform: translateX(120vw); }
        }
      `}</style>
    </div>
  );
};

export default CloudBackground;