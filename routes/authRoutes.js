const { Router } = require("express");
const authController = require("../controllers/authControllers");
const { checkLogin } = require("../middleware/authMiddleware");

const router = Router();

router.get("/signup", checkLogin, authController.signup_get);
router.post("/signup", checkLogin, authController.signup_post);
router.get("/login", checkLogin, authController.login_get);
router.post("/login", checkLogin, authController.login_post);
router.post("/verify", authController.verify_post);
router.get("/logout", authController.logout_get);
router.get("/delete", authController.delete_get);
router.post("/forgotPassword", authController.forgotPassword_post);

module.exports = router;
