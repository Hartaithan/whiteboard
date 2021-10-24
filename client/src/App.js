import React from "react";
import io from "socket.io-client";

const URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://this-is-whiteboard.herokuapp.com";
const socket = io.connect(URL, {
  transports: ["websocket"],
});

function App() {
  const [isDrawing, setDrawing] = React.useState(false);
  const [settings, setSettings] = React.useState({
    lineCap: "round",
    strokeStyle: "black",
    lineWidth: 1,
  });
  const canvasRef = React.useRef(null);
  const ctxRef = React.useRef(null);

  function setCanvasSettings(settings, ctx) {
    const { lineCap, strokeStyle, lineWidth } = settings;
    ctx.lineCap = lineCap;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
  }

  React.useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctxRef.current = ctx;
    setCanvasSettings(settings, ctxRef.current);

    socket.on("on-start", ({ x, y }) => {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);
    });

    socket.on("on-draw", ({ x, y }) => {
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    });

    socket.on("on-finish", ({ x, y }) => {
      ctxRef.current.closePath();
    });
  }, []); // eslint-disable-line

  React.useEffect(() => {
    if (ctxRef !== null) {
      setCanvasSettings(settings, ctxRef.current);
    }
  }, [settings]);

  const startDrawing = ({ nativeEvent }) => {
    if (nativeEvent.which !== 1) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setDrawing(true);
    socket.emit("start", { x: offsetX, y: offsetY });
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

  const startTouchDrawing = ({ nativeEvent }) => {
    const { pageX, pageY } = nativeEvent.changedTouches[0];
    console.log(pageX, pageY, "startTouchDrawing");
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pageX, pageY);
    setDrawing(true);
    socket.emit("start", { x: pageX, y: pageY });
  };

  const finishTouchDrawing = ({ nativeEvent }) => {
    const { pageX, pageY } = nativeEvent.changedTouches[0];
    console.log(pageX, pageY, "finishTouchDrawings");
    ctxRef.current.closePath();
    setDrawing(false);
    socket.emit("finish", { x: pageX, y: pageY });
  };

  const drawTouch = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { pageX, pageY } = nativeEvent.changedTouches[0];
    console.log(pageX, pageY, "drawTouch");
    ctxRef.current.lineTo(pageX, pageY);
    ctxRef.current.stroke();
    socket.emit("draw", { x: pageX, y: pageY });
  };

  return (
    <div className="app">
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onTouchStart={startTouchDrawing}
        onTouchEnd={finishTouchDrawing}
        onTouchMove={drawTouch}
        ref={canvasRef}
      />
      <div className="tools">
        <button
          onClick={() => setSettings({ ...settings, strokeStyle: "red" })}
        >
          red
        </button>
      </div>
    </div>
  );
}

export default App;
