import { useState, useEffect } from "react";
import { useCustomSearchParams } from "../hooks/useCustomSearchParams";

const Game = ({ socket }) => {
  const [status, setStatus] = useState("#fcdb03");
  const [touched, setTouched] = useState(false);
  const [touchedOther, setTouchedOther] = useState(false);
  const [search] = useCustomSearchParams();

  if (socket)
    socket.on("receive_other", (data) => {
      setTouchedOther(data);
    });

  useEffect(() => {
    if (search.hash && socket) {
      socket.emit("join_room", search.hash);
      console.log("joining");
    }
  }, [search, socket]);

  useEffect(() => {
    if (touched && touchedOther) setStatus("#27e30e");
    else if (touchedOther) setStatus("#0362fc");
    else setStatus("#fcdb03");
  }, [touched, touchedOther]);

  useEffect(() => {
    if (socket) {
      socket.emit("touched_other", { touched, hash: search.hash });
    }
  }, [touched, socket]);

  return (
    <div
      onPointerDown={() => setTouched(true)}
      onPointerUp={() => setTouched(false)}
      style={{ backgroundColor: status, width: "100%", height: "100%" }}
    />
  );
};

export default Game;
