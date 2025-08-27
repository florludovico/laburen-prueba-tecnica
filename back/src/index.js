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
    origin: ["https://agente-ventas-ia.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['polling', 'websocket'] 
});

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["https://tu-frontend-url.onrender.com", "http://localhost:3000"],
  methods: ["GET", "POST", "PATCH"],
  credentials: true
}));
app.use(express.json());


app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

app.use("/products", productsRouter);
app.use("/carts", cartsRouter);

io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado al chat");

  socket.on("chat message", async (msg) => {
    console.log("Mensaje recibido:", msg);
    try {
      const response = await runConversation(msg);
      io.emit("chat message", response);
    } catch (error) {
      console.error("Error en runConversation:", error);
      socket.emit("chat message", "Lo siento, hubo un error procesando tu mensaje.");
    }
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor y chat escuchando en el puerto ${PORT}`);
});

module.exports = app;