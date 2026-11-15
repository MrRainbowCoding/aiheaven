const express = require("express");
const path = require("path");

const app = express();
const root = __dirname;

app.disable("x-powered-by");
app.use(express.static(root, { index: "index.html" }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

module.exports = app;
