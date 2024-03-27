const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log("Connected to the database");
}).catch((err) => {
    console.log("Not connected to the database", err);
})
const bcrypt = require("bcrypt");
const { resolve } = require( 'path' );




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
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

const Puzzle = mongoose.model("Puzzle", puzzleSchema);

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 1,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true 
    },
    encryptedPassword: {
        type: String,
        required: [true, "Password is required."]
    },
    admin: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: {
        versionKey: false,
        transform: (doc, ret) => {
            delete ret.email,
            delete ret.encryptedPassword
        }
    }
})

// encrypt given plain password and store into model instance
userSchema.methods.setEncryptedPassword = function(plainPassword) {
    //promise is an empty envelope that will eventually contain stuff
    //resolve and reject are functions that are passed into the promise
    var promise = new Promise((resolve, reject) => {
        //resolve is the .then() part of the promise
        //reject is the .catch() part of the promise

        bcrypt.hash(plainPassword, 10).then(hash => {
            // set the encryptedPassword value on the model instance (just saved to that user)
            this.encryptedPassword = hash //this refers to the model instance
            //resolve the promise, eventually...
            resolve()
        }).catch(err => {
            //reject the promise, eventually...
            reject(err)
        })
    })

    return promise
}

userSchema.methods.verifyEncryptedPassword = function(plainPassword) {
    var promise = new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, this.encryptedPassword).then(result => {
            resolve(result)
        })
    })
    return promise
}

const User = mongoose.model("User", userSchema);

module.exports = {
    Puzzle: Puzzle,
    User: User
}