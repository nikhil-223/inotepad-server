const jwt = require("jsonwebtoken");
const JWT_SECRET = "nikhilisagoodboy";

const fetchuser = (req, res, next) => {
	// get the user from the jwt token
	const token = req.header("auth-token");
	if (!token) {
		res.status(401).json({ error: "Please authanticate using a valid token" });
	}
	try {
		const data = jwt.verify(token, JWT_SECRET);
		req.user = data.user;
		next();
	} catch (error) {
		return res
			.status(401)
			.json({ error: "Please authanticate using a valid token" });
	}
};
module.exports = fetchuser;
