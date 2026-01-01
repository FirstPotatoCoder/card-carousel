import React, { useState, useRef, useEffect } from 'react';

const CardCarousel3D = () => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const velocityRef = useRef(0);
  const rotationRef = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animationFrame = useRef(null);
  const carouselRef = useRef(null);
  const mouseMoveTimeout = useRef(null);

  // ===== Hand tracking refs =====
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const isPinchingRef = useRef(false);
  const pinchStartXRef = useRef(0);
  const lastPinchX = useRef(0);
  const lastPinchTime = useRef(0);

  const cardCount = 30;
  const radius = 600;
  const angleStep = 360 / cardCount;

  // ==============================
  // Sync rotation state → ref
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

  // ==============================
  // Momentum physics (shared)
  const startMomentum = () => {
    const applyMomentum = () => {
      if (Math.abs(velocityRef.current) > 0.1) {
        rotationRef.current += velocityRef.current;
        velocityRef.current *= 0.95;

        if (carouselRef.current) {
          carouselRef.current.style.transform =
            `rotateX(10deg) rotateY(${rotationRef.current}deg)`;
        }

        animationFrame.current = requestAnimationFrame(applyMomentum);
      }
    };
    animationFrame.current = requestAnimationFrame(applyMomentum);
  };

  // ==============================
  // Mouse input
  const handleMouseDown = (e) => {
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    setIsDragging(true);
    lastX.current = e.clientX;
    lastTime.current = Date.now();
    velocityRef.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    if (mouseMoveTimeout.current) {
      clearTimeout(mouseMoveTimeout.current);
    }

    const currentX = e.clientX;
    const currentTime = Date.now();
    const deltaX = currentX - lastX.current;
    const deltaTime = currentTime - lastTime.current;

    rotationRef.current += deltaX * 0.5;

    if (carouselRef.current) {
      carouselRef.current.style.transform =
        `rotateX(10deg) rotateY(${rotationRef.current}deg)`;
    }

    if (deltaTime > 0) {
      velocityRef.current = deltaX * 0.5;
    }

    lastX.current = currentX;
    lastTime.current = currentTime;

    mouseMoveTimeout.current = setTimeout(() => {
      if (isDragging) {
        setIsDragging(false);
        startMomentum();
      }
    }, 50);
  };

  const handleMouseUp = () => {
    if (mouseMoveTimeout.current) clearTimeout(mouseMoveTimeout.current);
    setIsDragging(false);
    startMomentum();
  };

  // ==============================
  // Hand tracking
  const isPinching = (landmarks) => {
    const thumb = landmarks[4];
    const index = landmarks[8];
    const dx = thumb.x - index.x;
    const dy = thumb.y - index.y;
    return Math.sqrt(dx * dx + dy * dy) < 0.05;
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = window.__handCanvas;
    const ctx = canvas.getContext('2d');

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!results.multiHandLandmarks?.length) {
        window.__pinchLabel.innerText = 'NO HAND';

        if (isPinchingRef.current) {
          isPinchingRef.current = false;
          startMomentum();
        }
        return;
      }

      const landmarks = results.multiHandLandmarks[0];

      // ===== Draw landmarks =====
      // mirror canvas to match video
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      // ===== Draw landmarks =====
      // ctx.fillStyle = '#00ffcc';
      // landmarks.forEach((p) => {
      //   ctx.beginPath();
      //   ctx.arc(
      //     p.x * canvas.width,
      //     p.y * canvas.height,
      //     4,
      //     0,
      //     Math.PI * 2
      //   );
      //   ctx.fill();
      // });

      ctx.restore();

      // ===== Pinch math =====
      const thumb = landmarks[4];
      const index = landmarks[8];
      const dx = thumb.x - index.x;
      const dy = thumb.y - index.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pinching = dist < 0.05;

      const mirroredX = (1 - index.x) * window.innerWidth;
      const currentX = mirroredX;

      const now = performance.now();

      window.__pinchLabel.innerText = pinching
        ? `PINCHING (${dist.toFixed(3)})`
        : `OPEN (${dist.toFixed(3)})`;

      // ===== PINCH START =====
      if (pinching && !isPinchingRef.current) {
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }

        isPinchingRef.current = true;
        pinchStartXRef.current = currentX;
        lastPinchX.current = currentX;
        lastPinchTime.current = now;
        velocityRef.current = 0;
      }

      // ===== PINCH MOVE =====
      if (pinching && isPinchingRef.current) {
        const deltaX = currentX - pinchStartXRef.current;

        const rotationDelta =
          (deltaX / window.innerWidth) * 360 * 1.2;

        rotationRef.current += rotationDelta;

        if (carouselRef.current) {
          carouselRef.current.style.transform =
            `rotateX(10deg) rotateY(${rotationRef.current}deg)`;
        }

        const dt = now - lastPinchTime.current;
        if (dt > 0) {
          velocityRef.current =
            (currentX - lastPinchX.current) * 0.4;
        }

        pinchStartXRef.current = currentX;
        lastPinchX.current = currentX;
        lastPinchTime.current = now;
      }

      // ===== PINCH RELEASE =====
      if (!pinching && isPinchingRef.current) {
        isPinchingRef.current = false;
        startMomentum();
      }
    });

    const camera = new window.Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, []);


  // ==============================
  // Render
  return (
    <div
      className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex items-center justify-center select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        style={{
          width: '400px',
          height: '400px',
          perspective: '2000px',
          transformStyle: 'preserve-3d',
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
            willChange: 'transform',
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
        {/* ===== Hand Debug Window ===== */}
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 320,
            height: 240,
            background: '#000',
            borderRadius: 8,
            overflow: 'hidden',
            zIndex: 9999,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            opacity: 0
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // mirror
            }}
          />

          <canvas
            ref={(el) => (window.__handCanvas = el)}
            width={320}
            height={240}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          />

          <div
            ref={(el) => (window.__pinchLabel = el)}
            style={{
              position: 'absolute',
              bottom: 6,
              left: 6,
              color: '#fff',
              fontSize: 12,
              background: 'rgba(0,0,0,0.5)',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            waiting…
          </div>
        </div>

    </div>

  );
};

export default CardCarousel3D;