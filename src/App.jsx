import React, { useState } from "react";
import FlippyApp from "./components/Flappy/FlappyShell";
import Loading from "./components/Loading/Loading";
import "./index.css";

export default function App(){
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded ? (
        <Loading onComplete={() => setLoaded(true)} />
      ) : (
        <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
          <FlippyApp />
        </div>
      )}
    </>
  );
}
