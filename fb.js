const { initializeApp } = require('firebase/app');
const { getDatabase } = require("firebase/database");

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHo65c6u4BbFO6CQgCSSBV1df01B3L4gg",
  authDomain: "alzheimer-quiz-app2.firebaseapp.com",
  databaseURL: "https://alzheimer-quiz-app2-default-rtdb.firebaseio.com",
  projectId: "alzheimer-quiz-app2",
  storageBucket: "alzheimer-quiz-app2.appspot.com",
  messagingSenderId: "940364960937",
  appId: "1:940364960937:web:ab038ae01fa66f799345b8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = {
  app,
  db
};