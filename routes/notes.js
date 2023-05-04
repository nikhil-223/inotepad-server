const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");

// ROUTE 1: Add a note using POST: "/api/notes/addnote"  no login required
router.post(
	"/addnote",
	fetchuser,
	[
		// validation checks
		body("title", "please use title with atleast 3 characters").isLength({
			min: 3,
		}),
		body(
			"description",
			"please use description with atleast 3 characters"
		).isLength({ min: 3 }),
	],
	async (req, res) => {
		// if there are errors return errors and bad requests

		try {
			const { title, description, tag } = req.body;
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			// create a new note
			const note = new Note({
				title,
				description,
				tag,
				user: req.user.id,
			});
			const savedNotes = await note.save();
			res.json(savedNotes);
		} catch (error) {
			console.error(error.message);
			res.status(500).send("error occured");
		}
	}
);
// ROUTE 2: fetch notes using GET: "/api/notes/fetchnotes"  no login required
router.get("/fetchnotes", fetchuser, async (req, res) => {
	try {
		const notes = await Note.find({ user: req.user.id });
		res.json(notes);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("error nbg occured");
	}
});

// ROUTE 3: Update note using PUT: "/api/notes/updatenote"  no login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {

	try {   
		const {title,description,tag}=req.body;
		// create a new note object 
		const newNote= {};
		if(title){newNote.title=title}
		if(description){newNote.description = description;}
		if(tag){newNote.tag = tag;}

		// find the note to be updated 
		let note= await Note.findById(req.params.id)
		if(!note){return res.status(404).send('not found')}

		// checking the user is same in notes and logged in
		if(note.user.toString() !== req.user.id){
			return res.status(401).send('not allowed')
		}
		note= await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true})
		res.send(note)
	} catch (error) {
		console.error(error.message);
		res.status(500).send("error occured");
	}
})
// ROUTE 3: delete note using DELETE: "/api/notes/deletenote"  no login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
	try {
		// find the note to be deleted
		let note = await Note.findById(req.params.id);
		if (!note) {
			return res.status(404).send("not found");
		}
		// checking the user is same in notes and logged in
		if (note.user.toString() !== req.user.id) {
			return res.status(401).send("not allowed");
		}
		note = await Note.findByIdAndDelete(req.params.id);
		res.json({"success":"success note has been deleted", note:note} );
	} catch (error) {
		console.error(error.message);
		res.status(500).send("error occured");
	} 
});

module.exports = router;
