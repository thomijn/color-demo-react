import React, { useEffect, useState } from "react";

const Controller = ({ socket }) => {
  const [orientation, setOrientation] = useState("neee");
  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (e) => {
        socket.emit("send_orientation", {
          alpha: e.alpha,
          beta: e.beta,
          gamma: e.gamma,
        });
      });
    } else {
      setOrientation("not supported");
    }
  }, []);

  return <div>{orientation}</div>;
};

export default Controller;
