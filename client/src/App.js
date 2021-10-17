import React from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000", {
  transports: ["websocket"],
});

function App() {
  const [isDrawing, setDrawing] = React.useState(false);
  const canvasRef = React.useRef(null);
  const ctxRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctxRef.current = ctx;

    socket.on("on-draw", ({ x, y }) => {
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    });

    socket.on("on-finish", ({ x, y }) => {
      ctxRef.current.moveTo(x, y);
    });
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setDrawing(true);
  };

  const finishDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.closePath();
    setDrawing(false);
    socket.emit("finish", { x: offsetX, y: offsetY });
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    socket.emit("draw", { x: offsetX, y: offsetY });
  };

  return (
    <div className="app">
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
      />
    </div>
  );
}

export default App;
