import React from "react";
import io from "socket.io-client";

const URL =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_SOCKET
    : "https://whiteboard-hartaithan.vercel.app";
const socket = io.connect(URL, {
  transports: ["websocket"],
});

function App() {
  const isDrawing = React.useRef(false);
  const [settings, setSettings] = React.useState({
    lineCap: "round",
    strokeStyle: "#000000",
    lineWidth: 2,
  });
  const [isOpen, setOpen] = React.useState(true);
  const [sizes] = React.useState([
    {
      id: 1,
      src: "/icons/size1.svg",
      lineWidth: 2,
    },
    {
      id: 2,
      src: "/icons/size2.svg",
      lineWidth: 6,
    },
    {
      id: 3,
      src: "/icons/size3.svg",
      lineWidth: 10,
    },
  ]);
  const [colors] = React.useState([
    {
      id: 1,
      hex: "#FFFFFF",
    },
    {
      id: 2,
      hex: "#C0C0C0",
    },
    {
      id: 3,
      hex: "#808080",
    },
    {
      id: 4,
      hex: "#000000",
    },
    {
      id: 5,
      hex: "#FF0000",
    },
    {
      id: 6,
      hex: "#800000",
    },
    {
      id: 7,
      hex: "#F7B033",
    },
    {
      id: 8,
      hex: "#FFFF00",
    },
    {
      id: 9,
      hex: "#00FF00",
    },
    {
      id: 10,
      hex: "#008000",
    },
    {
      id: 11,
      hex: "#00FFFF",
    },
    {
      id: 12,
      hex: "#008080",
    },
    {
      id: 13,
      hex: "#0000FF",
    },
    {
      id: 14,
      hex: "#000080",
    },
    {
      id: 15,
      hex: "#FF00FF",
    },
    {
      id: 16,
      hex: "#800080",
    },
  ]);
  const canvasRef = React.useRef(null);
  const ctxRef = React.useRef(null);
  const multiply = 2;

  const setCanvasSettings = (settings, ctx) => {
    const { lineCap, strokeStyle, lineWidth } = settings;
    ctx.lineCap = lineCap;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * multiply;
    canvas.height = window.innerHeight * multiply;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    setCanvasSettings(settings, ctxRef.current);

    socket.on("on-send", (data) => {
      const image = new Image();
      image.src = data;
      image.onload = () => {
        ctxRef.current.drawImage(image, 0, 0);
      };
    });
  }, []); // eslint-disable-line

  React.useEffect(() => {
    if (ctxRef !== null) {
      setCanvasSettings(settings, ctxRef.current);
    }
  }, [settings]);

  const startDrawing = (x, y) => {
    setCanvasSettings(settings, ctxRef.current);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x * multiply, y * multiply);
    isDrawing.current = true;
  };

  const draw = (x, y) => {
    if (!isDrawing.current) {
      return;
    }
    ctxRef.current.lineTo(x * multiply, y * multiply);
    ctxRef.current.stroke();
  };

  const finishDrawing = (x, y) => {
    ctxRef.current.closePath();
    isDrawing.current = false;
    const image = canvasRef.current.toDataURL("image/png");
    socket.emit("send", image);
  };

  const handleMouseDown = ({ nativeEvent }) => {
    // disable right click
    if (nativeEvent.which !== 1) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    startDrawing(offsetX, offsetY);
  };

  const handleMouseMove = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    draw(offsetX, offsetY);
  };

  const handleMouseUp = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    finishDrawing(offsetX, offsetY);
  };

  const handleTouchStart = ({ nativeEvent }) => {
    const { pageX, pageY } = nativeEvent.changedTouches[0];
    startDrawing(pageX, pageY);
  };

  const handleTouchMove = ({ nativeEvent }) => {
    const { pageX, pageY } = nativeEvent.changedTouches[0];
    draw(pageX, pageY);
  };

  const handleTouchEnd = ({ nativeEvent }) => {
    const { pageX, pageY } = nativeEvent.changedTouches[0];
    finishDrawing(pageX, pageY);
  };

  return (
    <div className="app">
      <canvas
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={canvasRef}
      />
      <div className={isOpen ? "tools" : "tools close"}>
        <div className="tools_sizes">
          {sizes.map((size) => {
            return (
              <button
                className={
                  settings.lineWidth === size.lineWidth ? "active" : ""
                }
                key={size.id}
                onClick={() =>
                  setSettings({ ...settings, lineWidth: size.lineWidth })
                }
              >
                <img src={size.src} alt={size.src} />
              </button>
            );
          })}
        </div>
        <div className="divider" />
        <div className="tools_colors">
          {colors.map((color) => {
            return (
              <button
                className={settings.strokeStyle === color.hex ? "active" : ""}
                key={color.id}
                onClick={() =>
                  setSettings({ ...settings, strokeStyle: color.hex })
                }
              >
                <div
                  style={{
                    background: color.hex,
                    border: `1px solid ${
                      color.hex === "#FFFFFF" ? "#000" : color.hex
                    }`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div
        className={isOpen ? "arrow" : "arrow close"}
        onClick={() => setOpen(!isOpen)}
      >
        <button onClick={() => {}}>
          <img src="/icons/arrow.svg" alt="arrow.svg" />
        </button>
      </div>
    </div>
  );
}

export default App;
