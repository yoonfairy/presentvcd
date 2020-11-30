const express = require("express");

const multer = require("multer");
var storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
  deleteMovies,
  delete_Movies,
  getLogin,
  addCode,
  renderHome,
  viewOrder,
  renderMovie,
  addMovie,
  viewMember,
  viewRent,
  viewOfflineRent,
  renderEdit,
  editMovies,
  renderOfflineRent,
  offlineRent,
  finished,
  ensureLogin,
  login,
  logout,
} = require("../controller/admin");

const router = express.Router();

router.route("/login").get(getLogin).post(login);
router.route("/logout").get(logout);
router.route("/").get(ensureLogin, renderHome);
router.route("/view-order").get(ensureLogin, viewOrder);
router.route("/view-member").get(ensureLogin, viewMember);
router.route("/viewRent").get(ensureLogin, viewRent).post(finished);
router
  .route("/viewOfflineRent")
  .get(ensureLogin, viewOfflineRent)
  .post(finished);

router
  .route("/add")
  .get(ensureLogin, renderMovie)
  .post(upload.single("file"), addMovie);

// router.route("/").post(addMovie);
router.route("/code").post(addCode);
router.route("/edit/:id").get(ensureLogin, renderEdit).post(editMovies);
// .get(getProduct);

//bot
router.route("/dltMovies").post(deleteMovies);

router
  .route("/offlineRent")
  .get(ensureLogin, renderOfflineRent)
  .post(offlineRent);

router.route("/deleteMovies").post(delete_Movies);

// router.route("/editProduct").post(editProduct);

module.exports = router;
