const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const storage = require("./storage/jsonStorage");

const app = express();
const port = 3000;
let age;

let messages = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/send", (req, res) => {
    const { username, message } = req.body;
    messages.push({ username, message });
    storage.addMessage(username, message);
    console.log("Nová zpráva:", { username, message });
    res.redirect("/");

});
app.get("/messages", (req, res) => {
    const allMessages = storage.getMessages();
    res.json(allMessages);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/about", (req, res) => {
    res.send("Navštívili jste server: Dominik Svoboda");
});

app.listen(port, () => {
    console.log(`✅ Server běží na http://localhost:${port}`);
});

age = document.getElementById("age");
if (age < 18){
    alert("You have to be atleast 18 to enter this chat.")
}
