import { useEffect, useRef, useState } from "react";

export default function useFlappyLoop(containerRef){
  const [running, setRunning] = useState(false);
  const [bird, setBird] = useState({ y: 0.42, vy: 0 }); // normalized 0..1 (0 top)
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(Number(localStorage.getItem("flippy_best")||0));

  // TUNED PHYSICS: softer gravity + gentler flap impulse for classic feel
  const gravity = 680;        // px/s^2 (reduced from ~1200)
  const flapImpulse = -260;   // px/s (reduced impulse so less twitchy)
  const pipeBaseSpeed = 0.32; // base horizontal speed multiplier (slightly slower)

  const lastRef = useRef(performance.now());
  const spawnRef = useRef(0);
  const dimsRef = useRef({w:360,h:560});
  const birdSizeRef = useRef({w:44,h:32}); // slightly smaller, closer to classic proportions

  useEffect(()=>{
    const onResize = ()=> {
      const el = containerRef.current;
      if (!el) return;
      dimsRef.current = { w: el.clientWidth, h: el.clientHeight };
    };
    onResize();
    window.addEventListener("resize", onResize);
    return ()=> window.removeEventListener("resize", onResize);
  },[containerRef]);

  useEffect(()=>{
    let raf;
    function loop(t){
      const dt = Math.min(0.05, (t - lastRef.current)/1000);
      lastRef.current = t;
      if (running){
        // physics: vy += g*dt; y += vy*dt / height
        const h = dimsRef.current.h || 560;
        setBird(b => {
          const newVy = b.vy + gravity * dt;
          const newYpx = (b.y * h) + newVy * dt;
          const newY = newYpx / h;
          return { y: newY, vy: newVy };
        });

        // spawn pipes (gap narrows slowly as score increases)
        spawnRef.current -= dt;
        const spawnInterval = Math.max(0.9, 1.45 - Math.min(0.9, score/26));
        if (spawnRef.current <= 0){
          spawnRef.current = spawnInterval;
          const gap = Math.max(120, 180 - Math.min(60, score*1.6)); // px
          const center = Math.random()*(dimsRef.current.h - gap - 160) + 80 + gap/2;
          const xStart = 1.06;
          setPipes(prev => [...prev, {
            id: Math.random().toString(36).slice(2),
            x: xStart,
            center,
            gap,
            passed: false
          }]);
        }

        // move pipes & scoring
        setPipes(prev => prev
          .map(p => ({...p, x: p.x - (dt * pipeBaseSpeed * (1 + Math.min(0.9, score / 200)))}))
          .filter(p => p.x > -0.28)
        );

        // scoring: when pipe crosses bird x point (birdX)
        setPipes(prev => {
          const birdX = 0.34; // fraction of width where bird sits visually (slightly left)
          let scored = 0;
          const next = prev.map(p => {
            if (!p.passed && (p.x <= birdX)) { scored++; p.passed = true; }
            return p;
          });
          if (scored) setScore(s => { const ns = s + scored; return ns; });
          return next;
        });

        // collision detection
        const collided = checkCollision(bird, pipes, dimsRef.current, birdSizeRef.current);
        if (collided) {
          setRunning(false);
          // save best
          setBest(b => {
            const nb = Math.max(b, Math.round(score));
            localStorage.setItem("flippy_best", nb);
            return nb;
          });
        }
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return ()=> cancelAnimationFrame(raf);
  },[running, score, bird, pipes]);

  function flap(){
    // immediate upward impulse in px/s
    setBird(b => ({ y: b.y, vy: -Math.abs(flapImpulse) }));
  }

  function start(){
    setPipes([]); setScore(0);
    setBird({ y: 0.42, vy: 0 });
    setRunning(true);
    lastRef.current = performance.now();
    spawnRef.current = 0.8;
  }

  return { running, start, flap, bird, pipes, score, best, setRunning, setScore };
}

// collision helper
function checkCollision(bird, pipes, dims, birdSize){
  const w = dims.w || 360;
  const h = dims.h || 560;
  const bx = 0.34 * w; // bird x px (left-ish)
  const by = bird.y * h;
  const bw = birdSize.w, bh = birdSize.h;
  // out of bounds (top/bottom)
  if (by < 6 || by + bh > h - 6) return true;
  // pipes: each pipe has gap center (px) and gap size (px); pipe width constant
  const pipeW = 76;
  for (let p of pipes){
    const px = p.x * w;
    const topH = p.center - p.gap/2;
    const bottomY = p.center + p.gap/2;
    // check overlap if bird x overlaps pipe x-range
    if (bx + bw/2 > px - pipeW/2 && bx - bw/2 < px + pipeW/2){
      // if bird is not within gap vertically => collision
      if (!(by > topH && by + bh < bottomY)) return true;
    }
  }
  return false;
}
