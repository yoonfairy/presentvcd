const express = require("express");

const {
  become_member,
  renderHome,
  renderRent,
  RENT,
  viewRent,
  filterType,
  recentMovie,
  renderOrder,
  orderMovie,
  view_order,
} = require("../controller/customer");

const router = express.Router();

router.route("/recentMovie").get(recentMovie);
router.route("/code").post(become_member);

router.route("/:id").get(renderHome);
// web.com/customer/123123
router.route("/:id/viewRent").get(viewRent);
router.route("/:id/viewOrder").get(view_order);
router.route("/:id/order/:code").get(renderOrder).post(orderMovie);

router.route("/:id/rent/:movieId").get(renderRent).post(RENT);

router.route("/:id/:category").get(filterType);

// .get(getProduct);

// router.route("/dltMovies").post(deleteMovies);
// router.route("/editProduct").post(editProduct);

module.exports = router;
