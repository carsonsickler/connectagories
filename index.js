const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { Puzzle } = require("./model.js");
const { User } = require("./model.js");
const { request } = require( "http" );
const { stringify } = require( "querystring" );
const port = 8080;
const app = express();
require('dotenv').config();


// EXPRESS MIDDLEWARE SETUP
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        callback(null, true); // avoid using the wildcard origin
    }
}));
app.use(express.static("public"));
app.use(session({
    // you oneway encrypt the data with the secret and you give them the unencrypted data w/o the data
    secret: "k3yb0@rd5m@$h3d!",
    // don't create session until something stored
    saveUninitialized: false,
    resave: false, // don't save session if unmodified
    cookie: { sameSite: 'None'} // secure: true, // fixes Chrome, breaks Postman
}));



// AUTHORIZATION MIDDLEWARE
function authorizeRequest(adminOnly) {
    return function (req, res, next) {
        if (req.session && req.session.user) {
            User.findOne({_id: req.session.user._id}).then(function (user) {
                if (user && (!adminOnly || user.admin)) {
                    req.user = user;
                    next(); // authentication succeeded, proceed to next middleware/route
                } else {
                    res.status(401).send("Not authenticated");
                }     
            })
        } else {
            res.status(401).send("Not authenticated");
        }   
    }
}

// GUEST ROUTES
// retrieve all puzzles
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

    // model.Food.find(filter).populate("user").then((foods) => {
});

// check guess
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

// AUTHENTICATED ROUTES
// create new puzzle
app.post("/puzzles", authorizeRequest(false), function (req, res) {
    console.log("Request body: " + req.body);
    console.log("Request body title: " + req.body.title);
    console.log("Request body author: " + req.body.author);
    console.log(req.session)

    const newPuzzle = new Puzzle({
        title: req.body.title,
        author: req.body.author,
        board: req.body.board,
        user: req.session.user._id
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


// update puzzle from edit
app.put("/puzzles/:id", authorizeRequest(false), async function (req, res) {
    let puzzleId = req.params.id;
    if (req.user.admin) {
        let puzzle = await Puzzle.find({_id: puzzleId});
        if (!puzzle) {
            return res.status(404).send("Puzzle not found");
        }
    }
    let puzzle = await Puzzle.find({_id: puzzleId, user: req.user._id});
    if (!puzzle) {
        return res.status(404).send("Puzzle not found");
    }
    let updatedPuzzle = req.body;
    puzzle.title = updatedPuzzle.title;
    puzzle.author = updatedPuzzle.author;
    puzzle.board = updatedPuzzle.board;
    puzzle.save().then(() => {
        res.status(200).send("Puzzle updated");
    }).catch((err) => {
        let errorMessage = {};
        if (err.errors) {
            errorMessage.details = {};
            Object.keys(err.errors).forEach((key) => {
                errorMessage.details[key] = err.errors[key].message;
            });
            res.status(422).json(errorMessage);
        }
    })
});

// delete puzzle with admin password
app.delete("/puzzles/:id", authorizeRequest(false), async function (req, res) {
    let puzzleId = req.params.id;
    
    //if (req.user._id != req.params.foodId)
    //model.Food.deleteOne({_id: req.params.foodId, user: req.user._id}).then(() => { // only deletes if user is the owner

    if (req.user.admin) {
        let puzzle = await Puzzle.findOne({_id: puzzleId});
        if (!puzzle) {
            return res.status(404).send("Puzzle not found");
        }
        console.log(puzzle)
        puzzle.deleteOne().then(() => {
            res.status(200).send("Puzzle deleted");
        }).catch((err) => {
            res.status(500).send("Server error");
        })
    } else {
        let puzzle = await Puzzle.findOne({_id: puzzleId, user: req.user._id});
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




// SESSION MANAGEMENT

//create user
app.post("/users", function (req, res) {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
        return res.status(400).send("Missing required fields");
    }

    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    })

    // TODO: update to log them in immediately after creating account?

    newUser.setEncryptedPassword(req.body.password).then(function(){
        newUser.save().then(() => {
            req.session.user = newUser;
            res.status(201).send("New user saved!");
        }).catch((err) => {
            let errorMessage = {};
            if (err.errors) {
                errorMessage.details = {};
                Object.keys(err.errors).forEach((key) => {
                    errorMessage.details[key] = err.errors[key].message;
                });
                res.status(422).json(errorMessage);
            } else if (err.code === 11000) {
                errorMessage.details = {email: "User with email already exists"};
                res.status(422).json(errorMessage);
            } else {
                res.status(500).send("Server error");
            }
        });
    })
})



//retrieve user
app.get("/session", function (req, res) {
    if (req.session.user) {
        User.findOne({_id: req.session.user._id}).then(function (user) {
            res.status(200).send(user);
        })
    } else {
        res.status(401).send("Not authenticated");
    }
})

//authentication: create session
app.post("/session", function (req, res) {
    //1. access user's given credentials: req.body.email, req.body.password
    //2. find user from DB using email
    //     if found:
    //     3. compare given password with encryptedPassword in the user found: verifyEncryptedPassword()
    //     if password is verified: respond with 201
    //         else: respond with 401
    //     else: respond with 401
    const email = req.body.email;
    User.findOne({email: email}).then(function (user) {
        if (user) {
            user.verifyEncryptedPassword(req.body.password).then(function (result) {
                if (result) {
                    // TODO: save user's ID into session using express-session
                    req.session.user = user;
                    res.status(201).send("User authenticated");
                } else {
                    res.status(401).send("Unauthorized");
                }
            })
        } else {
            res.status(401).send("Unauthorized");
        }
    })
})

//logout: delete session
app.delete("/session", authorizeRequest(false), function (req, res) {
    req.session.user = null;
    res.status(200).send("Logged out.");
})

app.listen(8080, function () {
    console.log("Server is running on port " + port)
})