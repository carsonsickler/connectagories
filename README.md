# Puzzle API Documentation

## Overview

This documentation provides details about the Puzzle API, which allows users to manage and interact with puzzle data. The API supports basic CRUD operations (Create, Read, Update, Delete) for puzzles, as well as a special endpoint for guessing words in a puzzle.

## Resource: Puzzle

The primary resource of this API is the "Puzzle" entity, representing a puzzle with a specific title, author, and board configuration.

### Attributes

- `title` (String, required): The title of the puzzle.
- `author` (String, optional): The author of the puzzle.
- `board` (Object, required): The puzzle board configuration, consisting of four categories with four words each.

### Data Model/Schema

#### Puzzle

```javascript
{
  title: String,
  author: String,
  board: {
    category1: {
      title: String,
      word1: String,
      word2: String,
      word3: String,
      word4: String
    },
    category2: {
      title: String,
      word1: String,
      word2: String,
      word3: String,
      word4: String
    },
    category3: {
      title: String,
      word1: String,
      word2: String,
      word3: String,
      word4: String
    },
    category4: {
      title: String,
      word1: String,
      word2: String,
      word3: String,
      word4: String
    }
  }
}
```

### REST Endpoints

#### 1. Get All Puzzles

- **Endpoint:** `/puzzles`
- **Method:** GET
- **Description:** Retrieves all puzzles.
- **Response:** Array of puzzle objects.

#### 2. Create a New Puzzle

- **Endpoint:** `/puzzles`
- **Method:** POST
- **Description:** Creates a new puzzle.
- **Request Body:** Puzzle object (excluding the `_id` field).
- **Response:** Success message or validation error details.

#### 3. Guess Words in a Puzzle

- **Endpoint:** `/puzzles/guess/:id`
- **Method:** PUT
- **Description:** Allows users to guess words in a puzzle.
- **Request Parameters:** `id` (Puzzle ID)
- **Request Body:** Array of guessed words.
- **Response:** Object indicating whether the guess is correct, the category, and the words in that category.

#### 4. Delete a Puzzle

- **Endpoint:** `/puzzles/:id`
- **Method:** DELETE
- **Description:** Deletes a puzzle.
- **Request Parameters:** `id` (Puzzle ID)
- **Request Body:** Object with a `password` field (required for authorization).
- **Response:** Success message or error details.

#### 5. Edit a Puzzle

- **Endpoint:** `/puzzles/:id`
- **Method:** PUT
- **Description:** Edits a puzzle.
- **Request Parameters:** `id` (Puzzle ID)
- **Request Body:** Object with updated puzzle.
- **Response:** Success message or error details.

### Additional Information

- The API is hosted on port 8080.
- CORS is enabled for cross-origin requests.
- Static files are served from the "public" directory.

## Running the Server

To run the server, execute the following command:

```bash
node index.js
```

The server will start running on port 8080, and you can access the API using the provided endpoints.
