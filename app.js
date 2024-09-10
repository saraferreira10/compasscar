const express = require("express");

const carController = require('./controllers/car.controller')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/cars", carController.save);

app.get("/api/v1/cars/:id", carController.findByID);

app.get("/api/v1/cars", carController.findAll);

app.patch("/api/v1/cars/:id", carController.patchCar);

app.delete("/api/v1/cars/:id", carController.deleteCar);

app.use((req, res) => res.send("Hello World"));

app.listen(3000);
