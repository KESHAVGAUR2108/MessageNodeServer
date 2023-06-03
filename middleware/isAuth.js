const jwt = require("jsonwebtoken");

function errorThrow() {
	const error = new Error("Not Authenticated.");
	error.statusCode = 401;
	throw error;
}

module.exports = (req, res, next) => {
	const authHeader = req.get("Authorization").split(" ")[1];

	if (authHeader) {
		let decodedToken;
		try {
			decodedToken = jwt.verify(authHeader, "suPerSeCretKey");
		} catch (err) {
			const error = new Error("Not Authenticated!");
			error.statusCode = 500;
			error.tokenExpire = true;
			throw error;
		}

		if (!decodedToken) {
			errorThrow();
		}

		req.userId = decodedToken.userId;
		next();
	} else {
		errorThrow();
	}
};
