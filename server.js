const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
const secretKey = "my super secret key";
const jwt = require("jsonwebtoken");
const { expressjwt: jwtMW } = require("express-jwt");

const jwtMWInstance = jwtMW({
  secret: secretKey,
  algorithms: ["HS256"],
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = [
  { id: 1, username: "user1", password: "pass1" },
  { id: 2, username: "user2", password: "pass2" },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username },
      secretKey,
      { expiresIn: "3m" }
    );
    res.json({ success: true, err: null, token });
  } else {
    res.status(401).json({
      success: false,
      err: "Username or password is incorrect",
      token: null,
    });
  }
});

app.get("/api/dashboard", jwtMWInstance, (req, res) => {
  res.json({
    success: true,
    myContent: "Secret content that only logged in people can see!!!!",
  });
});


app.get("/api/settings", jwtMWInstance, (req, res) => {
  res.json({ success: true, myContent: "Settings page - only for logged in users!" });
});


app.get("/api/prices", jwtMWInstance, (req, res) => {
  res.json({
    success: true,
    myContent: "This is the price $3.99.",
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(function (err, req, res, next) {
  console.log(err.name === "UnauthorizedError");
  console.log(err);
  if (err.name === "UnauthorizedError") {
    res.status(401).json({
      success: false,
      officialError: err,
      err: "Username or password is incorrect or your session has expired. Please log in again.",
    });
  } else {
    next(err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
