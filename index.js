const express = require("express");
const cors = require("cors");
const { Puzzle } = require("./model.js");
const https = require("https");



const port = 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(https.enforce.HTTPS({ trustProtoHeader: true }));
app.use(express.static("public"));

app.get("/puzzles", async (req, res) => {
    try {
        const puzzles = await Puzzle.find();
        //todo: don't send categories
        res.send(puzzles);
        console.log(puzzles);
    } catch (err) {
        let errorMessage = {};
        if (err.errors){
            errorMessage.details = {};
            Object.keys(err.errors).forEach((key) => {
                errorMessage.details[key] = err.errors[key].message;
            });
            res.status(422).json(errorMessage);
        };
    }
});


app.post("/puzzles", function (req, res) {
    console.log("Request body: " + req.body);
    console.log("Request body title: " + req.body.title);
    console.log("Request body author: " + req.body.author);

    const newPuzzle = new Puzzle({
        title: req.body.title,
        author: req.body.author,
        board: req.body.board
    })



    newPuzzle.save().then(() => {
        res.status(201).send("New puzzle saved!");
    }).catch((err) => {
        let errorMessage = {};
        if (err.errors) {
            errorMessage.details = {};
            Object.keys(err.errors).forEach((key) => {
                errorMessage.details[key] = err.errors[key].message;
            });
            res.status(422).json(errorMessage);
        } 
    });
})


app.put("/puzzles/guess/:id", async function (req, res) {
    let guessWords = req.body;
    let puzzleId = req.params.id;
    let puzzle = await Puzzle.findById(puzzleId);
    let board = puzzle.board.toObject();
    let foundCategory = null;
    let categories = [];

    // Iterate over each category in the board
    for (let category in board) {
        if (category === '_id') continue;
        
        let title = board[category].title;

        let wordsInCategory = Object.values(board[category]).filter(word => typeof word === "string");

        categories[title] = wordsInCategory;
    }
    // Check if all guessed words are in the category
    let firstWord = guessWords[0];
    for (let category in categories) {
        // Check if the array of words in the category includes the word
        if (categories[category].includes(firstWord)) {
            // If the word is found, save the category and break the loop
            foundCategory = category;
            break;
        }
    }
    console.log("Found category: " + foundCategory);

    if (foundCategory === null) {
        return res.status(400).send("Word not found in puzzle, server error.")
    }

    for (let i = 1; i < guessWords.length; i++) {
        let word = guessWords[i];
        console.log("Checking word: " + word);
        if (categories[foundCategory].includes(word)) {
            console.log("Word" + i + "in category")
        } else {
            console.log("Word" + i + "not in category")
            return res.status(200).send({guess: false})
        }
    }
    console.log("All words in category")
    let result = {guess: true, category: foundCategory, words: categories[foundCategory]}
    return res.status(200).send(result);

})

app.delete("/puzzles/:id", async function (req, res) {
    let puzzleId = req.params.id;
    let password;
    try {
        password = req.body.password;
    } catch (err) {
        return res.status(401).send(err.message);
    }
    console.log("Password: " + password);
    if (password !== "iHateWordle1084!") {
        return res.status(401).send("Unauthorized");
    } else {
        let puzzle = await Puzzle.findById(puzzleId);
        if (!puzzle) {
            return res.status(404).send("Puzzle not found");
        }
        puzzle.deleteOne().then(() => {
            res.status(200).send("Puzzle deleted");
        }).catch((err) => {
            res.status(500).send("Server error");
        })
    }
})


app.listen(8080, function () {
    console.log("Server is running on port " + port)
})