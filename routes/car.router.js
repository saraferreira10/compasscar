const { Router } = require("express");

const controllers = require("../controllers/car.controller");
const middlewares = require("../middlewares/car.middleware")

const router = Router();

router.route("/cars").get(controllers.findAll).post(controllers.save);
router
  .route("/cars/:id")
  .get(middlewares.checkID, controllers.findByID)
  .patch(controllers.patchCar)
  .delete(controllers.deleteCar);

module.exports = router;
