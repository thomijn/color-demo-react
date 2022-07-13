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
      <QRCode value={`http://click.tpdev.nl/?hash=${hash}`} />
    </div>
  );
};

export default ScanMe;
