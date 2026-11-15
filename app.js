const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const root = __dirname;

app.disable("x-powered-by");

function parsePromptFile(fileName) {
  const filePath = path.join(root, "prompts", "data", fileName);
  const markdown = fs.readFileSync(filePath, "utf8");
  const dataSection = markdown.match(/^##\s+data\s*\n([\s\S]*?)(?:\n##\s+prompt\s*\n|$)/i)?.[1] || "";
  const promptSection = markdown.match(/^##\s+prompt\s*\n([\s\S]*)/im)?.[1]?.trim() || "";
  const data = {};
  dataSection.split("\n").forEach((line) => {
    const match = line.match(/^\s*-\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (match) data[match[1]] = match[2];
  });
  return {
    id: fileName.replace(/\.md$/i, ""),
    name: data.name || fileName.replace(/\.md$/i, ""),
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
