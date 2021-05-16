const { Bot } = require("./src/bot");
require('dotenv').config();

const bot = new Bot(process.env.TELEGRAM_TOKEN);
bot.launch();

