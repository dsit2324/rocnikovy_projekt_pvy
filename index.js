const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const storage = require("./storage/jsonStorage");
const userStorage = require("./storage/userStorage");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "tajny-klic",
    resave: false,
    saveUninitialized: true,
}));

// Middleware pro kontrolu přihlášení
function requireLogin(req, res, next) {
    if (!req.session.username) {
        return res.redirect("/login.html");
    }
    next();
}

// ROUTES

// Přihlašovací stránka (formulář je v login.html)
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = userStorage.verifyUser(username, password);
    if (!user) {
        return res.send("Špatné přihlašovací údaje. <a href='/login.html'>Zpět</a>");
    }
    req.session.username = username;
    res.redirect("/");
});

// Registrace
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (userStorage.getUsers().some(u => u.username === username)) {
        return res.send("Uživatel už existuje. <a href='/register.html'>Zpět</a>");
    }
    userStorage.addUser({ username, password });
    res.redirect("/login.html");
});

// Odhlášení
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});

// Chatová stránka – jen pro přihlášené
app.get("/", requireLogin, (req, res) => {
    const fs = require("fs");
    let indexHtml = fs.readFileSync(path.join(__dirname, "public", "index.html"), "utf8");
    // Vložíme přihlášené jméno do HTML
    indexHtml = indexHtml.replace("<%= username %>", req.session.username);
    res.send(indexHtml);
});

// Socket.IO
io.on("connection", (socket) => {
    console.log("Uživatel připojen");

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

server.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
});
