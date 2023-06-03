const express = require("express");
const { body } = require("express-validator");

const User = require("../model/User");
const authController = require("../controllers/auth");

const router = express.Router();

router.put("/signup", [
	body("email")
		.trim()
		.isEmail()
		.custom((value, { req }) => {
			return User.findOne({ email: value }).then((userDoc) => {
				if (userDoc) {
					return Promise.reject("E-Mail address already exist.");
				}
			});
		})
		.normalizeEmail(),
	body("password")
		.trim()
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long."),
	body("name").trim().not().isEmpty(),
	authController.signup,
]);

router.post(
	"/signin",
	[
		body("email")
			.trim()
			.isEmail()
			.withMessage("Please enter a valid email!.")
			.normalizeEmail(),
	],
	authController.signin
);

module.exports = router;
