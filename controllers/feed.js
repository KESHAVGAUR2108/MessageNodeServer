const { validationResult } = require("express-validator");
const Post = require("../model/Post");
const path = require("path");
const fs = require("fs");
const User = require("../model/User");
const _ = require("lodash");

exports.getPosts = (req, res, next) => {
	let posts;
	Post.find()
		.then((result) => {
			posts = result;
			return User.find();
		})
		.then((usersData) => {
			const users = _.mapKeys(usersData, "_id");
			res.status(200).json({ posts: posts, users: users });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);

	const errorMsg = errors.array();

	if (!errors.isEmpty()) {
		const error = new Error(
			errorMsg[0].msg || "Validation failed, entered data is incorrect!."
		);
		error.statusCode = 422;
		throw error;
	}

	const { title, content } = req.body;
	const userId = req.userId;
	let creator;

	const post = new Post({
		title: title,
		image: req.file.path,
		content: content,
		creator: userId,
	});

	post
		.save()
		.then(() => {
			return User.findById(userId);
		})
		.then((user) => {
			creator = user;
			user.posts.push(post);
			return user.save();
		})
		.then(() => {
			res.status(201).json({
				message: "Post created successfully!.",
				creator: creator,
				post: post,
				status: 201,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;

	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Post Not Found!");
				error.statusCode = 404;
				throw error;
			}

			res.status(200).json({ message: "Post Found", post: post, status: 200 });
		})
		.catch((err) => {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.updatePost = (req, res, next) => {
	const error = validationResult(req);

	if (!error.isEmpty()) {
		const error = new Error("Validation failed, entered data is incorrect!.");
		error.statusCode = 422;
		throw error;
	}

	const postId = req.params.postId;
	const { title, content } = req.body;
	let image;

	if (req.file) {
		image = req.file.path;
	}

	if (!image) {
		const error = new Error("Image Not uploaded!");
		error.statusCode = 422;
		throw error;
	}

	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Post Not Found!");
				error.statusCode = 404;
				throw error;
			}

			if (post.creator.toString() !== req.userId.toString()) {
				const error = new Error("Not Authorized!!");
				error.statusCode = 500;
				clearImage(image);
				throw error;
			}

			post.title = title;
			if (image !== post.image) {
				clearImage(post.image);
			}
			post.image = image;
			post.content = content;

			return post.save();
		})
		.then((result) => {
			return res.status(200).json({
				message: "Post updated successfully",
				post: result,
				status: 200,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (err) => {
		if (err) console.log(err);
	});
};

exports.deletePost = (req, res, next) => {
	Post.findById(req.params.id)
		.then((post) => {
			if (!post) {
				const error = new Error("Post Not Found!");
				error.statusCode = 404;
				throw error;
			}

			if (post.creator.toString() !== req.userId.toString()) {
				const error = new Error("Not Authorized!!");
				error.statusCode = 500;
				throw error;
			}

			clearImage(post.image);

			return Post.deleteOne({ _id: req.params.id });
		})
		.then(() => {
			return User.findById(req.userId);
		})
		.then((user) => {
			user.posts.pull(req.params.id);
			return user.save();
		})
		.then(() => {
			res.status(200).json({
				message: "Post deleted successfully",
				status: 200,
			});
		})
		.catch((err) => next(err));
};
