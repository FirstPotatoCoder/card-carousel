import React, { useState, useRef, useEffect } from 'react';

const CardCarousel3D = () => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const velocityRef = useRef(0);
  const rotationRef = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(Date.now());
  const animationFrame = useRef(null);
  const carouselRef = useRef(null);
  const mouseMoveTimeout = useRef(null);

  const cardCount = 30;
  const radius = 600;
  const angleStep = 360 / cardCount;

  // Sync ref with state
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const handleMouseDown = (e) => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    setIsDragging(true);
    lastX.current = e.clientX;
    lastTime.current = Date.now();
    velocityRef.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    // Clear any existing timeout
    if (mouseMoveTimeout.current) {
      clearTimeout(mouseMoveTimeout.current);
    }

    const currentX = e.clientX;
    const currentTime = Date.now();
    const deltaX = currentX - lastX.current;
    const deltaTime = currentTime - lastTime.current;

    rotationRef.current += deltaX * 0.5;
    
    // Update DOM directly for smoother animation
    if (carouselRef.current) {
      carouselRef.current.style.transform = `rotateX(10deg) rotateY(${rotationRef.current}deg)`;
    }
    
    if (deltaTime > 0) {
      velocityRef.current = deltaX * 0.5;
    }

    lastX.current = currentX;
    lastTime.current = currentTime;

    // If no mouse movement for 50ms, treat as release
    mouseMoveTimeout.current = setTimeout(() => {
      if (isDragging) {
        setIsDragging(false);
        startMomentum();
      }
    }, 50);
  };

  const startMomentum = () => {
    const applyMomentum = () => {
      if (Math.abs(velocityRef.current) > 0.1) {
        rotationRef.current += velocityRef.current;
        velocityRef.current *= 0.95;
        
        if (carouselRef.current) {
          carouselRef.current.style.transform = `rotateX(10deg) rotateY(${rotationRef.current}deg)`;
        }
        
        animationFrame.current = requestAnimationFrame(applyMomentum);
      }
    };
    
    animationFrame.current = requestAnimationFrame(applyMomentum);
  };

  const handleMouseUp = () => {
    if (mouseMoveTimeout.current) {
      clearTimeout(mouseMoveTimeout.current);
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    setIsDragging(false);
    startMomentum();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      if (mouseMoveTimeout.current) {
        clearTimeout(mouseMoveTimeout.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      setIsDragging(false);
      startMomentum();
    }
  };

  return (
    <div 
      className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative"
        style={{
          width: '400px',
          height: '400px',
          perspective: '2000px',
          transformStyle: 'preserve-3d'
        }}
      >
        <div
          ref={carouselRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: `rotateX(10deg) rotateY(${rotation}deg)`,
            willChange: 'transform'
          }}
        >
          {[...Array(cardCount)].map((_, i) => {
            const angle = i * angleStep;
            const rad = (angle * Math.PI) / 180;
            const x = Math.sin(rad) * radius;
            const z = Math.cos(rad) * radius;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '160px',
                  height: '220px',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-80px',
                  marginTop: '-110px',
                  transform: `translate3d(${x}px, 0, ${z}px) rotateY(${angle + 180 - 5}deg) rotateZ(-7.5deg)`,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform'
                }}
              >
                {/* Card Front */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    border: '2px solid rgba(255,255,255,0.1)'
                  }}
                />
                
                {/* Card Back */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    border: '3px solid #fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}
                >
                  <div className="w-full h-full border-4 border-amber-400 rounded-lg relative">
                    <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-amber-300 rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-amber-300 rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-amber-300 rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-amber-300 rounded-br-lg"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 border-4 border-amber-400 rounded-full opacity-30"></div>
                      <div className="absolute w-16 h-16 border-4 border-amber-400 rounded-full opacity-50"></div>
                      <div className="absolute w-8 h-8 bg-amber-400 rounded-full opacity-70"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-lg font-semibold">Click and drag to rotate</p>
        <p className="text-sm opacity-70 mt-1">Release to see momentum effect</p>
      </div>
    </div>
  );
};

export default CardCarousel3D;