const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/isAuth");

router.get("/posts", isAuth, feedController.getPosts);

router.get("/post/:postId", isAuth, feedController.getPost);

router.post(
	"/posts",
	isAuth,
	[
		body("title")
			.trim()
			.isLength({ min: 5 })
			.withMessage("Title must be at least 5 characters long."),
		body("content")
			.trim()
			.isLength({ min: 10 })
			.withMessage("Content must be at least 10 characters long."),
	],
	feedController.createPost
);

router.put(
	"/post/:postId",
	isAuth,
	[
		body("title").trim().isLength({ min: 5 }),
		body("content").trim().isLength({ min: 7 }),
	],
	feedController.updatePost
);

router.delete("/delete-post/:id", isAuth, feedController.deletePost);

module.exports = router;
