const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

const feedRoutes = require("../routes/feed");
const authRoutes = require("../routes/auth");

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now().toString() + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jfif" ||
		file.mimetype === "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(bodyParser.json());
app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
	next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
	const message = error.message;
	const errorData = error.data;
	const statusCode = error.statusCode || 500;
	return res.status(statusCode).json({
		error: true,
		message: message,
		errorData: errorData,
		error: error,
	});
});

mongoose
	.connect(
		"mongodb+srv://keshavgaur679:kFlNeiqvACx87aBX@cluster0.dukcnrc.mongodb.net/Messages"
	)
	.then(() => app.listen(8080))
	.catch((err) => console.log(err));
