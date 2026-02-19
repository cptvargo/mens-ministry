import React from "react";
import ReactDOM from "react-dom/client";

function Test() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
      }}
    >
      Mobile Test OK
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Test />);
