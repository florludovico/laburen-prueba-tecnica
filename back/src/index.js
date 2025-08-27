require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const productsRouter = require("./routes/products.routes");
const cartsRouter = require("./routes/carts.routes");
const { runConversation } = require("./agent");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/products", productsRouter);
app.use("/carts", cartsRouter);

io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado al chat");

  socket.on("chat message", async (msg) => {
    console.log("Mensaje recibido:", msg);
    const response = await runConversation(msg);
    io.emit("chat message", response);
  });

  socket.on("disconnect", () => {
    console.log("Un usuario se ha desconectado");
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res
    .status(status)
    .json({ error: err.message || "Error interno del servidor" });
});

if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`Servidor y chat escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
