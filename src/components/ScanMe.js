import QRCode from "react-qr-code";
import { useId } from "react";

const ScanMe = () => {
  const hash = useId();

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <QRCode value={`https://color-demo-react.vercel.app/?hash=${hash}`} />
    </div>
  );
};

export default ScanMe;
