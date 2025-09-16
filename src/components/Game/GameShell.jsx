import React from "react";
import Game from "./Game";
import Shop from "./Shop";
import Leaderboard from "./Leaderboard";
import { loadState } from "../../hooks/usePersistence";
import { motion } from "framer-motion";

export default function GameShell(){
  const [view, setView] = React.useState("menu");
  const [coins, setCoins] = React.useState(loadState("dd_coins",0));

  return (
    <div className="game-area">
      <div className="header">
        <div>
          <div className="title">Dodge Dash</div>
          <div className="subtitle">Swipe · Dodge · Flex</div>
        </div>
        <div className="score-pill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2v20" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <div style={{fontSize:14}}>{coins}</div>
        </div>
      </div>

      {view === 'menu' && (
        <div style={{padding:20, paddingTop:6}}>
          <motion.div initial={{y:8, opacity:0}} animate={{y:0, opacity:1}} transition={{duration:0.45}} className="mb-6">
            <div style={{fontSize:20, fontWeight:800, color:"#fff"}}>Ready to flex?</div>
            <div style={{opacity:0.75, marginTop:6}}>Quick runs. Big hype. Mobile-ready.</div>
          </motion.div>

          <div style={{display:"flex", gap:12}}>
            <motion.button onClick={()=> setView('game')} className="play-btn" whileTap={{scale:0.96}} layout>Play</motion.button>
            <button className="small-btn" onClick={()=> setView('shop')}>Shop</button>
            <button className="small-btn" onClick={()=> setView('lb')}>Leaderboard</button>
          </div>
        </div>
      )}

      {view === 'game' && <Game onExit={()=> setView('menu')} onEarn={(n)=> setCoins(c=>c+n)} />}

      {view === 'shop' && <div style={{padding:16}}><Shop onBack={()=> setView('menu')} coins={coins} setCoins={setCoins} /></div>}
      {view === 'lb' && <div style={{padding:16}}><Leaderboard onBack={()=> setView('menu')} /></div>}
    </div>
  );
}
