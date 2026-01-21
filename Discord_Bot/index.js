const Bot = require("./bot");
const fs = require("fs");

// Discord Bot setup
const token = fs.readFileSync(".token").toString().trim();
const bot = new Bot(token);
bot.run();