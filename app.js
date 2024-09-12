const express = require("express");

const carRouter = require("./routes/car.router");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", carRouter);

app.use((req, res) => res.send("Hello World"));

app.listen(process.env.PORT || 3000);
