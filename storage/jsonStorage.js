/* Připojení modulu pro práci se soubory */
const fs = require('fs');
/* Modul pro práci s cestami */
const path = require('path');
const filePath = path.join(__dirname, 'messages.json');

function getMessages() {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf-8');    
        return data ? JSON.parse(data) : [];
    } catch(error) {
        console.error(error);
        return [];
    }
}

function addMessage(username,  message) {
    const messages = getMessages();
    console.log(messages);
    const newMessage = { username, message, timestamp: new Date().toISOString() }
    messages.push(newMessage);
    try {
        fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8');
    } catch(error) {
        console.error(error);
    }
}

module.exports = { addMessage, getMessages }
