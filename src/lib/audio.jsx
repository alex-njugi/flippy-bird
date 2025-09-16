import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const AudioCtx = createContext(null);

export function AudioProvider({children}) {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(()=> {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    ref.current = { ctx, master, loopNodes: [] };
    return ()=> { try { ctx.close(); } catch(e){} };
  },[]);

  function resume() {
    if (!ref.current) return;
    try { ref.current.ctx.resume(); } catch(e){}
  }

  function playSfx(name){
    if (!enabled || !ref.current) return;
    const { ctx, master } = ref.current;
    const now = ctx.currentTime;
    if (name === "flap") {
      const o = ctx.createOscillator(); o.type="square"; o.frequency.value = 520;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.16, now+0.01); g.gain.exponentialRampToValueAtTime(0.001, now+0.25);
      o.connect(g); g.connect(master);
      o.start(now); o.stop(now+0.26);
    } else if (name === "hit") {
      const o = ctx.createOscillator(); o.type="sawtooth"; o.frequency.value=120;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.5, now+0.01); g.gain.exponentialRampToValueAtTime(0.001, now+0.45);
      o.connect(g); g.connect(master);
      o.start(now); o.stop(now+0.45);
    } else if (name === "point") {
      const o = ctx.createOscillator(); o.type="sine"; o.frequency.value=880;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.28, now+0.01); g.gain.exponentialRampToValueAtTime(0.001, now+0.3);
      o.connect(g); g.connect(master);
      o.start(now); o.stop(now+0.3);
    }
  }

  // light ambient loop (low volume)
  function startLoop() {
    if (!ref.current) return;
    const { ctx, master } = ref.current;
    if (ref.current.loopNodes.length) return;
    // create a gentle pulsing tone using gain automation
    const o = ctx.createOscillator(); o.type="sine"; o.frequency.value = 60;
    const g = ctx.createGain(); g.gain.value = 0.03;
    o.connect(g); g.connect(master);
    o.start();
    ref.current.loopNodes = [o, g];
  }
  function stopLoop(){
    if (!ref.current) return;
    ref.current.loopNodes.forEach(n=>{ try{ n.stop?.(); }catch(e){} });
    ref.current.loopNodes = [];
  }

  return <AudioCtx.Provider value={{ playSfx, startLoop, stopLoop, resume, enabled, setEnabled }}>{children}</AudioCtx.Provider>;
}

export function useAudio(){ return useContext(AudioCtx); }
