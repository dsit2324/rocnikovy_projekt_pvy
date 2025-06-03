// Načteme potřebné moduly
const express = require("express"); // Webový framework
const session = require("express-session");
const bodyParser = require("body-parser");
const userStorage = require("./storage/userStorage");
const http = require("http"); // HTTP server
const { Server } = require("socket.io"); // WebSocket server (Socket.IO)
const path = require("path"); // Práce s cestami
const storage = require("./storage/jsonStorage"); // Vlastní modul pro ukládání zpráv

// Inicializace aplikace
const app = express(); // Vytvoření instance Express aplikace
const server = http.createServer(app); // Vytvoření HTTP serveru
const io = new Server(server); // Připojení Socket.IO k HTTP serveru
const port = 3000; // Port, na kterém server poběží

// Nastavení statické složky pro veřejné soubory (např. index.html, CSS, JS)
app.use(express.static("public"));

// Událost: nový uživatel se připojil přes WebSocket
io.on("connection", (socket) => {
    console.log("Nový uživatel připojen");

    // Hned po připojení pošleme všechny dosavadní zprávy uživateli
    socket.emit("initMessages", storage.getMessages());

    // Událost: klient poslal novou zprávu
    socket.on("chatMessage", ({ username, message }) => {
        console.log("Nová zpráva:", { username, message });

        // Uložíme zprávu do úložiště
        storage.addMessage(username, message);

        // Pošleme zprávu všem připojeným klientům
        io.emit("chatMessage", { username, message });
    });

    // Událost: uživatel se odpojil
    socket.on("disconnect", () => {
        console.log("Uživatel odpojen");
    });
});

// HTTP GET požadavek na kořenový URL – pošle HTML stránku
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "tajny-klic",
    resave: false,
    saveUninitialized: true,
}));

// Spuštění serveru
server.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
});
