const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log("Connected to the database");
}).catch((err) => {
    console.log("Not connected to the database", err);
})



const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
    },
    word1: {
        type: String,
        required: true,
        minlength: 1,
    },
    word2: {
        type: String,
        required: true,
        minlength: 1,
    },
    word3: {
        type: String,
        required: true,
        minlength: 1,
    },
    word4: {
        type: String,
        required: true,
        minlength: 1,
    }
})

const boardSchema = new mongoose.Schema({
    category1: {
        type: categorySchema,
        required: true,
        minlength: 1,
    },
    category2: {
        type: categorySchema,
        required: true,
        minlength: 1,
    },
    category3: {
        type: categorySchema,
        required: true,
        minlength: 1,
    },
    category4: {
        type: categorySchema,
        required: true,
        minlength: 1,
    }
})

const puzzleSchema = new mongoose.Schema({ 
    title: {
        type: String,
        required: true,
        minlength: 1,
    },
    author: {
        type: String,
        required: false
    },
    board: {
        type: boardSchema,
        required: true
    }
})

const Puzzle = mongoose.model("Puzzle", puzzleSchema);

module.exports = {
    Puzzle: Puzzle
}