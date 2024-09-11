const { Router } = require("express");

const controllers = require("../controllers/car.controller");
const middlewares = require("../middlewares/car.middleware");

const router = Router();

router.param("id", middlewares.checkID);

router
  .route("/cars")
  .get(controllers.findAll)
  .post(middlewares.checkRequiredFields, controllers.save);
router
  .route("/cars/:id")
  .get(controllers.findByID)
  .patch(controllers.patchCar)
  .delete(controllers.deleteCar);

module.exports = router;
