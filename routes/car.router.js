const { Router } = require("express");

const controller = require("../controllers/car.controller");
const middleware = require("../middlewares/car.middleware");

const router = Router();

router.param("id", middleware.checkIfCarExist);

router
  .route("/cars")
  .get(controller.findAll)
  .post(
    middleware.checkRequiredFields,
    middleware.checkForIdenticalCar,
    controller.save
  );
router
  .route("/cars/:id")
  .get(controller.findByID)
  .patch(middleware.checkForIdenticalCar, controller.patchCar)
  .delete(controller.deleteCar);

module.exports = router;
