const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const root = __dirname;

app.disable("x-powered-by");

function parsePromptFile(fileName) {
  const filePath = path.join(root, "prompts", "data", fileName);
  const markdown = fs.readFileSync(filePath, "utf8");
  const headers = [...markdown.matchAll(/^##[ \t]+(data|prompt)[ \t]*$/gim)];
  const dataHeader = headers.find((header) => header[1].toLowerCase() === "data");
  const promptHeader = headers.find((header) => header[1].toLowerCase() === "prompt" && (!dataHeader || header.index > dataHeader.index));
  const dataSection = dataHeader && promptHeader
    ? markdown.slice(dataHeader.index + dataHeader[0].length, promptHeader.index)
    : "";
  const promptSection = promptHeader
    ? markdown.slice(promptHeader.index + promptHeader[0].length).trim()
    : "";
  const data = {};
  dataSection.split("\n").forEach((line) => {
    const match = line.match(/^\s*-\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (match) data[match[1]] = match[2];
  });
  return {
    id: fileName.replace(/\.md$/i, ""),
    name: data.name || fileName.replace(/\.md$/i, ""),
    author: data.author || "",
    categories: (data.categories || "").split(",").map((category) => category.trim()).filter(Boolean),
    profilePicture: data.profile_picture || "",
    description: data.description || "",
    prompt: promptSection
  };
}

app.get("/api/prompts", (_request, response, next) => {
  const dataDirectory = path.join(root, "prompts", "data");
  try {
    const prompts = fs.readdirSync(dataDirectory)
      .filter((fileName) => fileName.toLowerCase().endsWith(".md"))
      .map(parsePromptFile);
    response.json(prompts);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(root, { index: "index.html" }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

module.exports = app;
