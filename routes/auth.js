// importing express
const express = require("express");
// importing router from express
const router = express.Router();
// importing user schema from models
const User = require("../models/User");
// importing express-validator and destructuring body and validationResult
const { body, validationResult } = require("express-validator");
// importing the bcrypt hashing the password
const bcrypt = require("bcryptjs");
// importing jwt token
const jwt = require("jsonwebtoken");
// importing fetchuser from middleware
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "nikhilisagoodboy";

// ROUTE 1: create a user using POST: "/api/auth/createuser"  no login required
router.post(
	"/createuser",
	[
		// validation checks
		body("email", "please enter a valid email").isEmail(),
		body(
			"password",
			"please choose a password with atleast 5 characters"
		).isLength({ min: 5 }),
		body("name", "please enter a name with atleast 3 characters").isLength({
			min: 3,
		}),
	],
	async (req, res) => {
		// if there are errors return errors and bad requests
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		// check weather the user with the same email exists already
		try {
			// checking weather the requested email exists in data base using findOne mongo function -and this returns true
			let user = await User.findOne({ email: req.body.email });
			if (user) {
				return res.status(400).json({ error: "this email id already exists" });
			}
			const salt = await bcrypt.genSalt(10);
			const secPass = await bcrypt.hash(req.body.password, salt);
			// create a new user
			user = await User.create({
				name: req.body.name,
				email: req.body.email,
				password: secPass,
				date: req.body.date,
			});
			const data = {
				user: {
					id: user.id,
				},
			};
			const authtoken = jwt.sign(data, JWT_SECRET);
			// showing authtoken in response json
			res.json({ authtoken });
		} catch (error) {
			console.error(error.message);
			res.status(500).send("error occured");
		}
		// .then((user) => res.json(user)).catch(errrr=>{console.log(errrr)
		// res.json({error: "please enter a unique value for email",message: errrr.message})})
	}
);

// ROUTE 2: authenticate user with post: "/api/auth/login". No login required
router.post(
	"/login",
	[
		body("email", "Enter a valid email").isEmail(),
		body("password", "Password can not be blank").exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { email, password } = req.body;
		try {
			const user = await User.findOne({ email });
			if (!user) {
				return res
					.status(500)
					.json({ error: "Please try to login with correct credentials" });
			}
			const passwordCompare = await bcrypt.compare(password, user.password);
			if (!passwordCompare) {
				return res
					.status(500)
					.json({ error: "Please try to login with correct credentials" });
			}
			const data = {
				user: {
					id: user.id,
				},
			};
			const authtoken = jwt.sign(data, JWT_SECRET);
			// showing authtoken in response json
			res.json({ authtoken });
		} catch (error) {
			console.error(error.message);
			res.status(500).send("Internal server error");
		}
	}
);

// ROUTE 3: authenticate user with post: "/api/auth/getuser". No login required
router.get("/getuser", fetchuser, async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).select("-password");
		res.send(user);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Internal server error");
	}
});

module.exports = router;
