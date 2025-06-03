const express = require("express"); // Import frameworku Express pro webový server
const http = require("http"); // Modul HTTP pro vytvoření serveru
const { Server } = require("socket.io"); // Import Socket.IO pro real-time komunikaci
const path = require("path"); // Modul pro práci s cestami k souborům
const session = require("express-session"); // Middleware pro správu relací (session)
const storage = require("./storage/jsonStorage"); // Modul pro uložení zpráv
const userStorage = require("./storage/userStorage"); // Modul pro správu uživatelů

const app = express(); // Inicializace Express aplikace
const server = http.createServer(app); // Vytvoření HTTP serveru
const io = new Server(server); // Inicializace Socket.IO na serveru
const port = 3000; // Port, na kterém poběží server

app.use(express.static("public")); // Statické soubory z adresáře public
app.use(express.urlencoded({ extended: true })); // Middleware pro parsování formulářových dat

// Nastavení session middleware s tajným klíčem
app.use(session({
    secret: "tajny-klic", // Tajný klíč pro šifrování session cookie
    resave: false,         // Nepřepisovat session pokud se nezměnila
    saveUninitialized: false, // Nesaveovat session, pokud není inicializovaná
}));

// Zpracování registrace uživatele
app.post("/register", (req, res) => {
    const { username, password } = req.body; // Získání uživatelského jména a hesla z formuláře
    if (!username || !password) return res.send("Invalid data."); // Kontrola, jestli jsou zadány
    if (!userStorage.addUser(username, password)) { // Přidání uživatele do úložiště, pokud už existuje, vrátí false
        return res.send("The user is already existin.");
    }
    res.redirect("/login.html"); // Přesměrování na přihlášení po úspěšné registraci
});

// Zpracování přihlášení uživatele
app.post("/login", (req, res) => {
    const { username, password } = req.body; // Získání dat z formuláře
    if (userStorage.authenticate(username, password)) { // Ověření uživatele
        req.session.username = username; // Uložení jména do session
        res.redirect("/index.html"); // Přesměrování na hlavní stránku
    } else {
        res.send("Wrong username or password."); // Chybová zpráva při neúspěšném přihlášení
    }
});

// Zpracování odhlášení uživatele
app.post("/logout", (req, res) => {
    req.session.destroy(err => { // Zničení session
        if (err) {
            return res.status(500).send("Cannot log out"); // Chyba při ničení session
        }
        res.clearCookie('connect.sid'); // Vymazání cookie s ID session
        res.sendStatus(200); // Úspěšné odhlášení
    });
});

// API endpoint pro získání informací o přihlášeném uživateli
app.get("/api/user", (req, res) => {
    if (req.session && req.session.username) { // Kontrola, zda je uživatel přihlášen
        res.json({ username: req.session.username }); // Vrácení uživatelského jména v JSON
    } else {
        res.status(401).json({ error: "Not logged in" }); // Pokud není přihlášen, chyba 401
    }
});

// Socket.IO obsluha připojení klientů
io.on("connection", (socket) => {
    console.log("New user connected");
    socket.emit("initMessages", storage.getMessages()); // Poslání historie zpráv novému uživateli

    // Příjem nové zprávy od klienta
    socket.on("chatMessage", ({ username, message }) => {
        storage.addMessage(username, message); // Uložení zprávy do úložiště
        io.emit("chatMessage", { username, message }); // Poslání zprávy všem připojeným klientům
    });

    socket.on("disconnect", () => {
        console.log("User disconnected"); // Informace o odpojení uživatele
    });
});

// Výchozí cesta – přesměrování na přihlašovací stránku
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Spuštění serveru na zvoleném portu
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
