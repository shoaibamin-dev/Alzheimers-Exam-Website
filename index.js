var express = require('express');
var bodyParser = require('body-parser')
var { app, db } = require('./fb')
var { ref, set, onValue } = require("firebase/database");
var { v4: uuidv4 } = require('uuid');
var pos = require('pos');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))
// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page



let currentUser = {};
let message = ""

// app.get('/', function (req, res) {
//   res.render('pages/page1');
// });

app.get('/', function (req, res) {

  
  res.render('pages/home');


});

app.get('/stats', function (req, res) {

  const starCountRef = ref(db, 'users');
  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    // let ageAverage = ""
    const array = [];

    Object.keys(data).forEach((key) => {
      const obj = data[key]
      delete obj.message
      array.push(obj);
    });

    var avgs = {}

    avgs = {
      "12-19": [],
      "20-30": [],
      "31-60": [],
      "> 60": []
    }

    array.forEach(obj => {
      var yr = obj["year"]


      var age = new Date().getFullYear() - parseInt(yr)

      // console.log(age,"age")

      if (age >= 12 && age <= 19) {
        avgs["12-19"].push(parseInt(obj["marks"]))
      }
      else if (age >= 20 && age <= 30) {
        avgs["20-30"].push(parseInt(obj["marks"]))
      }
      else if (age >= 31 && age <= 60) {
        avgs["31-60"].push(parseInt(obj["marks"]))
      }
      else if (age > 60) {
        avgs["> 60"].push(parseInt(obj["marks"]))
      }



    })

    if (avgs["12-19"].length === 0) avgs["12-19"] = [0]
    if (avgs["20-30"].length === 0) avgs["20-30"] = [0]
    if (avgs["31-60"].length === 0) avgs["31-60"] = [0]
    if (avgs["> 60"].length === 0) avgs["> 60"] = [0]



    // console.log(avgs,"avgs")

    // console.log(array, "array")
    // console.log(dobs,"dobs")
    res.render('pages/stats', { avgs });

  });
})

app.get('/overview', function (req, res) {
  res.render('pages/overview');
});

app.get('/help', function (req, res) {
  res.render('pages/help');
});

app.get('/page1', function (req, res) {
  res.render('pages/page1');
});



app.get('/page3', function (req, res) {
  if (Object.entries(currentUser).length === 0) return res.render('pages/page1');
  currentUser = {}
  res.render('pages/page3', { message });
});


app.get('/admin', async function (req, res) {
  
  const starCountRef = ref(db, 'users');
  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    // let ageAverage = ""
    const array = [];

    Object.keys(data).forEach((key) => {
      const obj = data[key]
      delete obj.message
      array.push(obj);
    });

    var dobs = {}

    array.forEach(obj => {
      if (dobs[obj["year"]]) {
        dobs[obj["year"]].push(parseInt(obj["marks"]))
      }
      else {
        dobs[obj["year"]] = [parseInt(obj["marks"])]
      }
    })

    console.log(dobs, "dobs")

    var bigObj = {
      array,
      dobs
    }

    console.log(array, "array")
    res.render('pages/admin', { bigObj })
  });
});



app.get('/submitdata', function (req, res) {
  res.render('pages/page1')
});

app.post('/submitdata', function (req, res) {
  currentUser = req.body
  // console.log(currentUser, "currentUser")
  res.render('pages/page2', {
    currentUser
  });
});

const total_marks = 30;

app.post('/completequiz', async function (req, res) {
  var { marks, sentence } = req.body
  console.log(marks, sentence, "REQ")

  var hasVerb = false, hasNoun = false;
  var words = new pos.Lexer().lex(sentence);
  var tagger = new pos.Tagger();
  var taggedWords = tagger.tag(words);
  for (i in taggedWords) {
    var taggedWord = taggedWords[i];
    var tag = taggedWord[1];
    if (tag == "NN" || tag == "NNP" || tag == "NNPS" || tag == "NNS") hasNoun = true
    if (tag == "VB" || tag == "VBD" || tag == "VBG" || tag == "VBN" || tag == "VBP" || tag == "VBZ") hasVerb = true
  }

  if (hasNoun && hasVerb) marks = Number(marks) + 1


  message = `You got ${marks} Marks, You have `
  let verdict = ""

  if (marks > (total_marks - 7)) {
    message += "No Cognitive"
    verdict = "No Cognitive"
  }
  else if (marks > (total_marks - 13)) {
    message += "Mild Cognitive"
    verdict = "Mild Cognitive"
  }
  else {
    message += "Severe Cognitive"
    verdict = "Severe Cognitive"

  }

  message += " Impairment."

  var uid = uuidv4()
  var newUser = { uid, ...currentUser, marks, result: verdict, message, createdAt: new Date().toLocaleString() }
  await set(ref(db, 'users/' + uid), newUser)
  return res.render('pages/page3', { message })


});



app.listen(process.env.PORT || 8080);
console.log('Server is listening on port 8080');