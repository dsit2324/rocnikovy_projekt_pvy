const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "users.json");

// Načti uživatele
function getUsers() {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

// Přidej nového uživatele
function addUser(user) {
    const users = getUsers();
    users.push(user);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

// Ověř uživatele podle jména a hesla
function verifyUser(username, password) {
    const users = getUsers();
    return users.find(u => u.username === username && u.password === password);
}

module.exports = { getUsers, addUser, verifyUser };
