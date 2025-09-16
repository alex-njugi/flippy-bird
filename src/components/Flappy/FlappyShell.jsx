import React from "react";
import FlappyGame from "./FlappyGame";
import { AudioProvider } from "../../lib/audio";

export default function FlippyApp(){
  return (
    <AudioProvider>
      <div className="app-card">
        <div className="header">
          <div>
            <div className="title">Flippy</div>
            <div className="subtitle">A fresh twist on a classic</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12, opacity:0.8}}>Best</div>
            <div style={{fontWeight:800, fontSize:16}}>{localStorage.getItem("flippy_best")||0}</div>
          </div>
        </div>
        <FlappyGame />
      </div>
    </AudioProvider>
  );
}
