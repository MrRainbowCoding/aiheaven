const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const port = Number(process.env.PORT) || 3000;
const healthUrl = `http://127.0.0.1:${port}/health`;

function isAppRunning() {
  return new Promise((resolve) => {
    const request = http.get(healthUrl, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        resolve(response.statusCode === 200 && body.includes('"status":"ok"'));
      });
    });
    request.setTimeout(1000, () => request.destroy());
    request.on("error", () => resolve(false));
  });
}

async function start() {
  if (await isAppRunning()) {
    console.log(`Heaven is already running at http://localhost:${port}`);
    return;
  }

  const nodemon = require.resolve("nodemon/bin/nodemon.js");
  const server = spawn(process.execPath, [nodemon, path.join(__dirname, "..", "server.js")], {
    env: process.env,
    stdio: "inherit"
  });

  server.on("error", (error) => {
    console.error("Could not start Heaven.", error);
    process.exitCode = 1;
  });
  server.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exitCode = code ?? 1;
  });
}

start().catch((error) => {
  console.error("Could not check the Heaven server.", error);
  process.exitCode = 1;
});
