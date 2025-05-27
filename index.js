const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("✅ Uživatel připojen");

    socket.on("chatMessage", ({ username, message }) => {
        console.log("💬 Zpráva:", { username, message });
        io.emit("chatMessage", { username, message });
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server běží na http://localhost:${port}`);
});
