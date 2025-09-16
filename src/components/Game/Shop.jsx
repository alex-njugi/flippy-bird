import React from "react";
import { DEFAULT_SKINS } from "../../services/shop";
import { loadState, saveState } from "../../hooks/usePersistence";
import Button from "../UI/Button";

export default function Shop({ onBack, coins, setCoins, unlocked, setUnlocked }){
  function buySkin(s){
    if (unlocked.includes(s.id)) return;
    if (coins < s.cost) { alert('Not enough coins'); return; }
    setCoins(c=>c - s.cost);
    setUnlocked([...unlocked, s.id]);
    alert('Bought '+s.name);
  }
  return (
    <div className="p-2">
      <div className="mb-3 flex justify-between">
        <div className="font-semibold">Shop</div>
        <button className="small-btn bg-black/20 rounded" onClick={onBack}>Back</button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {DEFAULT_SKINS.map(s=>(
          <div key={s.id} className="p-3 bg-black/20 rounded flex items-center justify-between">
            <div>
              <div className="font-bold">{s.name}</div>
              <div className="text-xs opacity-70">Cost: {s.cost}</div>
            </div>
            <div className="flex items-center gap-2">
              {unlocked.includes(s.id) ? <div className="text-sm opacity-70">Unlocked</div> : <button onClick={()=>buySkin(s)} className="small-btn bg-black/20 rounded">Buy</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
