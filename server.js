const { str } = require("ajv");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

// Sign up
app.post("/signup", (req, res) => {
  const { userHandle, password } = req.body;

  if (!userHandle || !password) {
    res.status(400).send("Invalid request body");
    return;
  }
  if (userHandle.length < 6 || password.length < 6) {
    res
      .status(400)
      .send("User handle and password must be at least 6 characters long");
    return;
  }
  res.status(201).send("User created");
});

// Login
app.post("/login", (req, res) => {
  const { userHandle, password } = req.body;
  const correctUserHandle = "DukeNukem";
  const correctPassword = "123456";
  const allowedFields = ["userHandle", "password"];
  const requestFields = Object.keys(req.body);

  const token = jwt.sign({ userHandle, password }, "SecretKey");

  const hasUnexpectedFields = requestFields.some(
    (field) => !allowedFields.includes(field)
  );

  if (hasUnexpectedFields) {
    res.status(400).json({ error: "Request contains invalid fields" });
    return;
  }

  if (!userHandle || !password) {
    res.status(400).send("Invalid request body");
    return;
  }

  if (typeof password !== "string" || typeof userHandle !== "string") {
    res.status(400).send("Invalid or missing password");
    return;
  }

  if (userHandle !== correctUserHandle || password !== correctPassword) {
    res.status(401).send("Invalid user handle or password");
    return;
  }

  if (userHandle == correctUserHandle && password == correctPassword) {
    res.status(200).json({ jsonWebToken: token });
    return;
  }
});

app.get("/login", (req, res) => {
  res.status(404).send("Not found");
});

// Highscore
const inputHighScores = [];

app.post("/high-scores", (req, res) => {
  const { level, userHandle, score, timestamp } = req.body;
  inputHighScores.push({ level, userHandle, score, timestamp });

  if (!req.headers.authorization) {
    res.status(401).send("Unauthorized");
    return;
  }
  const token = req.headers.authorization.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, "SecretKey");
  } catch (err) {
    res.status(401).send("Unauthorized");
    return;
  }

  if (!decoded) {
    res.status(401).send("Unauthorized");
    return;
  }

  if (!level || !userHandle || !score || !timestamp) {
    res.status(400).send("Invalid request body");
    return;
  }
  res.status(201).send("High score created");
  console.log(inputHighScores);
});

app.get("/high-scores", (req, res) => {
  const { level, page = 1 } = req.query;

  if (!level) {
    res.status(400).send("Level query parameter is required");
    return;
  }

  const filteredHighScores = inputHighScores
    .filter((score) => score.level === level)
    .sort((a, b) => b.score - a.score);

  const pageSize = 20;

  if (page) {
    const startIndex = (parseInt(page) - 1) * pageSize;
    const paginatedHighScores = filteredHighScores.slice(startIndex, startIndex + pageSize);
    res.status(200).json(paginatedHighScores);
    return;
  }

  res.status(200).json(filteredHighScores);
});

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
