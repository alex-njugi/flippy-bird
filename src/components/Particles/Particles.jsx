import React, { useEffect, useRef } from "react";

/*
  Lightweight particle canvas for subtle motion.
  Small number of moving dots that respond to cursor (parallax).
*/
export default function Particles({ intensity = 28 }) {
  const ref = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let running = true;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      // initialize particles
      const count = Math.max(12, Math.min(80, parseInt(intensity, 10)));
      particlesRef.current = new Array(count).fill(0).map(() => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.1
      }));
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const mouse = pointerRef.current;
      particlesRef.current.forEach(p => {
        // slight attraction to pointer (parallax)
        const dx = (mouse.x - p.x) || 0;
        const dy = (mouse.y - p.y) || 0;
        const dist = Math.sqrt(dx*dx+dy*dy) + 1;
        const pull = Math.max(0, 12 - dist) * 0.0008;
        p.vx += dx * pull;
        p.vy += dy * pull * 0.6;
        p.x += p.vx;
        p.y += p.vy;
        // gentle wrap-around
        if (p.x < -10) p.x = rect.width + 10;
        if (p.x > rect.width + 10) p.x = -10;
        if (p.y < -10) p.y = rect.height + 10;
        if (p.y > rect.height + 10) p.y = -10;
        // draw
        ctx.beginPath();
        ctx.fillStyle = 'rgba(123,97,255,' + (p.alpha * 0.6) + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // pointer handlers on document for parallax
    function onPointer(e){
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
    }
    function onLeave(){ pointerRef.current.x = -9999; pointerRef.current.y = -9999; }
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return <canvas ref={ref} className="particle-canvas" />;
}
