const fs = require("fs"); // Modul pro práci se soubory
const path = require("path"); // Modul pro práci s cestami
const filePath = path.join(__dirname, "messages.json"); // Cesta k souboru se zprávami

// Funkce pro získání všech zpráv ze souboru
function getMessages() {
    if (!fs.existsSync(filePath)) return []; // Pokud soubor neexistuje, vrací prázdné pole
    // Načte obsah souboru messages.json a převede JSON text na objekt (pole zpráv)
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Funkce pro přidání nové zprávy
function addMessage(username, message) {
    const messages = getMessages(); // Načteme aktuální seznam zpráv
    messages.push({ username, message }); // Přidáme novou zprávu do pole
    // Zapíšeme aktualizované pole zpráv zpět do souboru ve formátu JSON s odsazením pro přehlednost
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
}

module.exports = { getMessages, addMessage }; // Export funkcí pro použití v jiných souborech
