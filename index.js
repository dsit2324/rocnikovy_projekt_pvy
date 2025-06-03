const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const storage = require("./storage/jsonStorage");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Nový uživatel připojen");

    socket.emit("initMessages", storage.getMessages());

    socket.on("chatMessage", ({ username, message }) => {
        console.log("Nová zpráva:", { username, message });

        storage.addMessage(username, message);

        io.emit("chatMessage", { username, message });
    });

    socket.on("disconnect", () => {
        console.log("Uživatel odpojen");
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/about", (req, res) => {
    res.send("Navštívili jste server: Dominik Svoboda");
});

server.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
});
