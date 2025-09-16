import React from "react";
import { loadState } from "../../hooks/usePersistence";
export default function Leaderboard({ onBack }){
  const lb = loadState("dd_lb", []).slice(0,10);
  return (
    <div className="p-2">
      <div className="mb-3 flex justify-between">
        <div className="font-semibold">Leaderboard</div>
        <button className="small-btn bg-black/20 rounded" onClick={onBack}>Back</button>
      </div>
      <div className="space-y-2">
        {lb.length === 0 && <div className="text-sm opacity-70">No runs yet — play to populate the board.</div>}
        {lb.map((r, i)=>(
          <div key={r.ts} className="p-2 bg-black/20 rounded flex justify-between">
            <div>#{i+1}</div>
            <div className="font-semibold">{r.score}</div>
            <div className="text-xs opacity-70">{new Date(r.ts).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
