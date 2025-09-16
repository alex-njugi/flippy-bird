import React from "react";
import FlappyGame from "./FlappyGame";
import { AudioProvider } from "../../lib/audio";
import Particles from "../Particles/Particles";

export default function FlippyApp(){
  return (
    <AudioProvider>
      <div className="app-card" style={{position:"relative", overflow:"hidden"}}>
        {/* background particles & parallax layer */}
        <Particles intensity={28} />
        <div className="parallax-layer" aria-hidden />
        <div style={{position:"relative", zIndex:4}}>
          <div className="header">
            <div>
              <div className="title">Flippy</div>
              <div className="subtitle">Tap • Dodge • Flex</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12, opacity:0.8}}>Best</div>
              <div style={{fontWeight:800, fontSize:16}}>{localStorage.getItem("flippy_best")||0}</div>
            </div>
          </div>
          <FlappyGame />
        </div>
      </div>
    </AudioProvider>
  );
}
