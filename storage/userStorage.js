const fs = require("fs"); // Modul pro práci se soubory
const path = require("path"); // Modul pro práci s cestami
const filePath = path.join(__dirname, "users.json"); // Cesta k souboru s uživateli

// Funkce pro získání všech uživatelů ze souboru
function getUsers() {
    if (!fs.existsSync(filePath)) return []; // Pokud soubor neexistuje, vrací prázdné pole
    // Načte obsah souboru users.json a převede JSON text na objekt (pole uživatelů)
    return JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
}

// Funkce pro přidání nového uživatele
function addUser(username, password) {
    const users = getUsers(); // Načteme aktuální seznam uživatelů
    if (users.some(u => u.username === username)) return false; // Pokud už uživatel existuje, vrátíme false
    users.push({ username, password }); // Přidáme nového uživatele do pole
    // Zapíšeme aktualizované pole uživatelů zpět do souboru ve formátu JSON s odsazením pro přehlednost
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    return true; // Přidání bylo úspěšné
}

// Funkce pro ověření uživatele podle uživatelského jména a hesla
function authenticate(username, password) {
    const users = getUsers(); // Načteme uživatele
    // Vrací true, pokud najde uživatele s odpovídajícím jménem a heslem
    return users.some(u => u.username === username && u.password === password);
}

module.exports = { getUsers, addUser, authenticate }; // Export funkcí pro použití v jiných souborech
