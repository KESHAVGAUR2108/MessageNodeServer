const User = require("../model/User");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = new Error("Validation failed!.");
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}

	const { email, password, name } = req.body;

	bcrypt
		.hash(password, 12)
		.then((hashedPw) => {
			const user = new User({ email: email, password: hashedPw, name: name });
			return user.save();
		})
		.then((result) => {
			return res.status(201).json({
				message: "User created successfully.",
				userId: result._id,
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

exports.signin = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		console.log(errors);
		const error = new Error();
		error.statusCode = 422;
		throw error;
	}

	const { email, password } = req.body;
	let loadedUser;

	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				const error = new Error("User Not Found!");
				error.statusCode = 401;
				throw error;
			}

			loadedUser = user;

			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new Error("Incorrect password!");
				error.statusCode = 401;
				throw error;
			}

			const token = jwt.sign(
				{
					userId: loadedUser._id.toString(),
					email: loadedUser.email,
				},
				"suPerSeCretKey",
				{ expiresIn: "1h" }
			);

			return res.status(200).json({
				status: 200,
				token: token,
				userId: loadedUser._id.toString(),
			});
		})
		.catch((error) => {
			if (!error.statusCode) {
				error.statusCode = 401;
			}
			next(error);
		});
};
