import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Game from "./components/Game";
import ScanMe from "./components/ScanMe";
import Three from "./components/Three";
import Controller from "./components/Controller";

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("https://click.tpdev.nl:8000/");
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Game socket={socket} />} />
        <Route path="/scan" element={<ScanMe />} />
        <Route path="/three" element={<Three socket={socket} />} />
        <Route path="/controller" element={<Controller socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
