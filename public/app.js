const dev = true;
const api = "";
// cors
// credentials: 'include' on all fetch requests

Vue.createApp({
  data() {
    return {
      page: "home",
      body: {backgroundColor: 'black'},
      loggedIn: false,
      loginLinkModal: true,
      emailExists: false,
      userId: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      preview: false,
      choose4: false,
      tryAgain: false,
      boxEmpty: false,
      win: false,
      lose: false,
      password: '',
      deleting: false,
      deleted: false,
      alert: false,
      noPassword: false,
      noUpdate: false,
      puzzleId: '',
      confirm: '',
      lives: 4,
      title: '',
      author: '',
      solvedCategories: {},
      categories: Array(4).fill(''),
      words: Array(4).fill().map(() => (Array(4).fill(''))),
      currentPuzzle: {title: '', author: '', board: {}},
      puzzles: [],
      selectedWords: [],
    };
},
  watch: {
    'body.backgroundColor': function(newColor) {
      document.body.style.backgroundColor = newColor;
    }
  },
  mounted() {
    document.body.style.backgroundColor = this.body.backgroundColor;
  },
  methods: {
    clearUser() {
      this.email = "";
      this.password = "";
      this.userId = "";
      this.firstName = "";
      this.lastName = "";
    },
    //Sign up
    signUp() {
      fetch(`${api}/users`, {
          method: "POST",
          credentials: 'include',
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({firstName: this.firstName, lastName: this.lastName, email: this.email, password: this.password}),
      })
      .then(response => {
          if (response.status == 201){
              this.page = "home";
              this.loggedIn = true;
              return response.json();
          } else {
              this.emailExists = true;
              throw new Error('Email already exists');
          }
      })
      .then(data => {
        this.userId = data._id;
      })
      .catch(err => console.log(err));
    },
    //LOGIN
    login() {
      fetch(`${api}/session`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: this.email, password: this.password}),
      }).then(response => {
        if (response.status == 201){
          this.page = "home";
          this.loggedIn = true;
          this.alert = true;
          setTimeout(() => {
            this.alert = false;
          }, 2000);
          return response.json();
        }
        else {
          this.clearAll();
        }
      })
      .then(data => {
        console.log(data);
        this.userId = data._id
        this.firstName = data.firstName;
        this.lastName = data.lastName;
      })
      .catch(err => console.log(err));
    },

    logout() {
      if (this.loggedIn == false) {
        this.page = "home";
        return;
      }
      this.getSession();
      fetch(`${api}/session`, {
        method: "DELETE",
        credentials: 'include',
      }).then(response => {
        console.log(response);
        if (response.status == 200){
          this.clearAll();
          this.clearUser();
          this.loggedIn = false;
          this.page = "home";
          this.alert = true;
          setTimeout(()=> {
            this.alert = false;
          }, 2000)
        }
      }).catch(err => console.log(err));
    },
    getSession() {
      fetch(`${api}/session`, {
        method: "GET",
        credentials: "include"
      }).then(response => response.json())
      .then(data => console.log("Data: ", data))
      .catch(err => console.log("Error: ", err));
    },

    setPuzzleId(id) {
      this.puzzleId = id;
      this.deleting = true;
    },
    getPuzzles() {
      fetch(`${api}/puzzles`, {credentials: "include"}).then(response => response.json()).then(data => {
        this.puzzles = data;
      }).catch(err => console.log(err));
    },
    checkLogin() {
      if (this.loggedIn == false) {
        this.loginLinkModal = true;
        this.page = "home";
      }
    },

    //Home page
    startGame(_id) {
      this.lives = 4;
      this.body = {backgroundColor: 'white'};
      this.categories = [];
      this.words = [];
      this.win = false;
      this.page = "play";
      this.currentPuzzle = this.puzzles.find(puzzle => puzzle._id === _id);
      this.title = this.currentPuzzle.title;
      this.author = this.currentPuzzle.author;
      this.categories = Object.values(this.currentPuzzle.board).map(category => category.title);
      this.categories.pop();
      Object.values(this.currentPuzzle.board).forEach(category => {
        this.words.push(category.word1, category.word2, category.word3, category.word4);
      })
      for (let i = 0; i < 4; i++) {
        this.words.pop();
      }
      // randomize order of words
      this.words = this.words.sort(() => Math.random() - 0.5);
    },
    deletePuzzle(_id) {
      let confirm = this.confirm;
      if (confirm != "confirm") {
        this.noPassword = true;
        setTimeout(() => {
          this.noPassword = false;
        },2000);
        return;
      }
      fetch(`${api}/puzzles/` + _id, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        }).then(response => {
          if (response.status == 404){
            console.log("404")
            this.noDelete = true;
            setTimeout(() => {
              this.noDelete = false;
              this.deleting = false;
            }, 3000);
          } else {
            this.deleted = true
            setTimeout(() => {
              this.deleted = false;
              this.deleting = false;
            })
          }
          this.getPuzzles();
        }).catch(err => console.log(err));
      this.confirm = '';
    },
    
    //Create page
    editPuzzle(_id) {
      if (this.loggedIn == false) {
        this.page = "home";
        this.loginLinkModal = true;
        return;
      }
      this.page = "edit";
      this.categories = [];
      this.words = [];
      this.currentPuzzle = this.puzzles.find(puzzle => puzzle._id === _id);
      this.title = this.currentPuzzle.title;
      this.author = this.currentPuzzle.author;
      for (let category in this.currentPuzzle.board) {
        if (category === '_id') continue;
        this.categories.push(this.currentPuzzle.board[category].title);
      }
      for (let category in this.currentPuzzle.board) {
        if (category === '_id') continue;
        this.words.push([this.currentPuzzle.board[category].word1, this.currentPuzzle.board[category].word2, this.currentPuzzle.board[category].word3, this.currentPuzzle.board[category].word4]);
      }
    },
    clearCategory(i) {
      this.categories[i] = '';
      for (let j = 0; j < 4; j++) {
        this.words[i][j] = '';
      }
    },
    clearAll() {
      this.id = '';
      this.title = '';
      this.author = '';
      this.categories = Array(4).fill('');
      this.words = Array(4).fill().map(() => (Array(4).fill('')));
      this.solvedCategories = {};
      this.body = {backgroundColor: 'black'};
      this.selectedWords = [];
      this.win = false;
      if (this.page == "create"){
        this.author = this.firstName + " " + this.lastName;
      }
    },
    updateGame() {
      let updatedPuzzle = {}
      updatedPuzzle.title = this.title;
      updatedPuzzle.author = this.author;
      updatedPuzzle.board = {};
      for (let i = 0; i < 4; i++) {
        updatedPuzzle.board[`category${i+1}`] = {title: this.categories[i], word1: this.words[i][0], word2: this.words[i][1], word3: this.words[i][2], word4: this.words[i][3]};
      }
      console.log(updatedPuzzle);
      fetch(`${api}/puzzles/` + this.currentPuzzle._id, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPuzzle),
      }).then(response => {
        if (response.status == 401){
          this.noUpdate = true;
          this.alert = true;
          setTimeout(() => {
            this.noUpdate = false;
            this.alert = false;
          }, 2000)
        }
        console.log(response);
        this.getPuzzles();
      }).catch(err => console.log(err));
      this.clearAll();
      this.preview = false;
      this.page = "home";
    },
    createGame() {
      let newPuzzle = {}
      newPuzzle.title = this.title;
      newPuzzle.author = this.author;
      newPuzzle.board = {};
      for (let i = 0; i < 4; i++) {
        newPuzzle.board[`category${i+1}`] = {title: this.categories[i], word1: this.words[i][0], word2: this.words[i][1], word3: this.words[i][2], word4: this.words[i][3]};
      }
      console.log(newPuzzle);
      fetch(`${api}/puzzles`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPuzzle),
      }).then(response => {
        console.log(response);
        this.getPuzzles();
      }).catch(err => console.log(err));

      this.clearAll();
      this.preview = false;
      this.page = "home";
    },
    isFormComplete() {
      console.log(this.title, this.author, this.categories, this.words);
      let complete = this.title && this.author && this.categories.every(category => category) && this.words.every(category => category.every(word => word));
      if (!complete) {
        this.boxEmpty = true;
        setTimeout(() => {
          this.boxEmpty = false;
        }, 2000);
      } else {
        this.preview = true;
      }
    },

    //Play page
    toggleSelection(index) {
      console.log(index);
      if (this.selectedWords.includes(index)) {
        this.selectedWords.splice(this.selectedWords.indexOf(index), 1);
      } else if (this.selectedWords.length < 4) {
        this.selectedWords.push(index);
      }
    },
    isSelected(index) {
      return this.selectedWords.includes(index);
    },
    deselectAll() {
      this.selectedWords = [];
    },
    checkGuess() {
      if (this.win == true) {
        return;
      } 
      if (this.lives == 0) {
        return;
      }

      let guessedWords = this.selectedWords.map(index => this.words[index]);
      if (guessedWords.length !== 4) {
        this.pleaseChooseFour();
        return;
      }
      fetch(`${api}/puzzles/guess/${this.currentPuzzle._id}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guessedWords),
      }).then(response => response.json()).then(data => {
        console.log(data);
        if (data.guess) {
          // add guessedWords to category, remove guessedWords from this.words array, display category with guessedWords above the highest available row
          console.log(data.category);
          let category = data.category;
          this.solvedCategories[category] = [];
          for (let correctWord of guessedWords) {
            this.solvedCategories[category].push(correctWord);
            this.words.splice(this.words.indexOf(correctWord), 1);
          }
          this.selectedWords = [];
          if (Object.keys(this.solvedCategories).length === 4) {
            console.log("You win");
            this.win = true;
          }
        } else {
          // unhighlight guessedWords, lose a life
          this.lives--;
          this.selectedWords = [];
          this.tryAgain = true;
          setTimeout(() => {
            this.tryAgain = false;
          }, 2000);
          // if lives === 0, reveal the rest of the words/categories
          if (this.lives === 0) {
            console.log("You lose");
            this.lose = true;
            console.log(this.currentPuzzle.board);
            this.words = [];
            for (let category in this.currentPuzzle.board) {
              if (category === '_id') continue;
              let title = this.currentPuzzle.board[category].title;
              let wordsInCategory = Object.values(this.currentPuzzle.board[category]).filter(word => typeof word === "string");
              //remove first and last words of wordsinCategory
              wordsInCategory.pop();
              wordsInCategory.shift();
              this.solvedCategories[title] = wordsInCategory;
            }
          }
        }
      }
      ).catch(err => console.log(err));
    },
    pleaseChooseFour() {
      this.choose4 = true;
      setTimeout(() => {
        this.choose4 = false;
      }, 2000);
    },

    shuffle() {
      //fix shuffle so that the selected words change with the shuffle
      this.words = this.words.sort(() => Math.random() - 0.5);
    }, 

  },
  created: function () {
    this.getPuzzles();
  },
}).mount("#app");


// Page types: 
// 1. Home = home
//    - Variables = 
//    - Methods = v-for displaying all the puzzles, v-on:click to play the puzzle, v-on:click to create a new puzzle
//    - Displays a list of puzzles. The list shows the Title, the author, and a button to play that puzzle.
// 2. Create Game = create
//    - Variables = 
//    - Methods = 
//    - Allows the user to create a new puzzle. The user must enter a title, an author, and 4 category titles with corresponding rules.
//    - When the user clicks the create button, a modal will appear with a preview of the puzzle. The user can click the submit button or the cancel button.

// 3. Play Game = play
//    - Variables = 
//    - Methods =
//    - Displays the game. This consists of the title at the top, the author,   and a 4x4 grid of all of the words. The words will be in a randomized order and will be clickable. The user must select 4 and only 4 words and then click the submit button. If the guess is wrong, the words will unhighlight, the user loses a life, and they can try again. If the guess is correct, the words will group into one box on the highest available row with their category name. They have a total of 4 lives. If they run out of lives, they lose the game. If they complete the game, they win the game. They can also click the deselect all button to unhighlight all of the words. *Time permitting their will be a shuffle button that shuffles the order of the words.