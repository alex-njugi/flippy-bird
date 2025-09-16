import { useEffect, useRef, useState } from "react";

function rand(min,max){ return Math.random()*(max-min)+min; }

export default function useGameLoop(containerRef){
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(0.5);
  const playerSize = 56;
  const [obstacles, setObstacles] = useState([]);
  const spawnRef = useRef(0);
  const lastRef = useRef(performance.now());
  const dimsRef = useRef({w:360,h:640});
  const [powerUps, setPowerUps] = useState([
    {id:"slow", name:"Slow-mo", active:false, cooldown:0},
    {id:"shield", name:"Shield", active:false, cooldown:0}
  ]);

  useEffect(()=> {
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
        setScore(s => s + dt*15);
        spawnRef.current -= dt;
        const spawnInterval = Math.max(0.38, 1.0 - Math.min(0.85, score/160));
        if (spawnRef.current <= 0){
          spawnRef.current = spawnInterval;
          setObstacles(prev => [...prev, {
            id: Math.random().toString(36).slice(2),
            x: rand(0.08,0.92),
            y: -0.05,
            size: `${Math.floor(rand(26,68))}px`,
            vy: rand(0.13,0.28)
          }]);
        }
        // move obstacles
        setObstacles(prev => prev.map(o => ({...o, y: o.y + o.vy * dt * (1 + score/200)})).filter(o=> o.y < 1.2));

        // collisions
        const plyY = 1 - 0.08;
        const px = playerX;
        const pw = playerSize / (dimsRef.current.w || 360);
        const ph = playerSize / (dimsRef.current.h || 560);
        const colliding = obstacles.some(o => {
          const ox = o.x; const oy = o.y; const os = parseInt(o.size) / (dimsRef.current.h || 560);
          const dx = Math.abs(px - ox); const dy = Math.abs(plyY - oy);
          return dx < (pw + os)*0.6 && dy < (ph + os)*0.6;
        });
        // if collision and no shield active -> stop
        const shield = powerUps.find(p=>p.id==="shield")?.active;
        if (colliding && !shield){
          setRunning(false);
          // write result to localStorage externally by parent
          const lb = JSON.parse(localStorage.getItem("dd_lb")||"[]");
          lb.push({score: Math.round(score), ts: Date.now()});
          lb.sort((a,b)=>b.score-a.score);
          localStorage.setItem("dd_lb", JSON.stringify(lb.slice(0,50)));
        } else if (colliding && shield){
          // consume shield
          setPowerUps(prev => prev.map(p => p.id==="shield" ? {...p, active:false} : p));
        }

        // decay cooldowns
        setPowerUps(prev => prev.map(p => ({...p, cooldown: Math.max(0, p.cooldown - dt)})));
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return ()=> cancelAnimationFrame(raf);
  },[running, score, playerX, obstacles, powerUps]);

  function start(){
    setObstacles([]); setScore(0); setRunning(true);
    lastRef.current = performance.now();
  }

  function setPlayerXPercent(pct){ setPlayerX(Math.min(1, Math.max(0, pct))); }

  function usePowerUp(id){
    setPowerUps(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.cooldown > 0) return p; // still cooling
      if (id === "slow") {
        // slow time scale by reducing vy for a few seconds: implement as global multiplier via vy adjustment
        // here we set active true and set a cooldown timer
        setTimeout(()=> setPowerUps(q => q.map(x => x.id==="slow"? {...x, active:false}: x)), 4200);
        return {...p, active:true, cooldown: 12};
      } else if (id === "shield"){
        setTimeout(()=> setPowerUps(q => q.map(x => x.id==="shield"? {...x, active:false}: x)), 6000);
        return {...p, active:true, cooldown: 18};
      }
      return p;
    }));
  }

  function resetPowerUps(){ setPowerUps(prev => prev.map(p=>({...p, active:false}))); }

  return {
    running, start, score, playerX, setPlayerXPercent, playerSize,
    obstacles, powerUps, usePowerUp, resetPowerUps
  };
}
