const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
require("dotenv").config();

let connections = [];

io.on("connect", (socket) => {
  connections.push(socket);
  console.info(
    `${socket.id} has connected, Users online: ${connections.length}`
  );

  socket.on("send", (data) => {
    connections.forEach((con) => {
      if (con.id !== socket.id) {
        con.emit("on-send", data);
      }
    });
  });

  socket.on("disconnect", (reason) => {
    console.info(`${socket.id} is disconnected`);
    connections = connections.filter((con) => con.id !== socket.id);
  });
});

const PORT = process.env.YOUR_PORT || process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

http.listen(PORT, () => console.info(`Server started on port ${PORT}`));
