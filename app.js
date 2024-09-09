const express = require("express");

const db = require('./database/connection')

const app = express();

app.use((req, res) => res.send("Hello World"));

app.listen(3000);
