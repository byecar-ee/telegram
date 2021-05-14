require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

function report(ctx) {
    ctx.reply('Of course, firstly selected type of incident.', Markup.inlineKeyboard([
        [
            Markup.button.callback('🚲 Parking on bicycle road', 'parking_bicycle_road'),
            Markup.button.callback('🚫 Parking in prohibited area', 'parking_prohibited')
        ],
        [
            Markup.button.callback('🚘 Car ride in prohibited area', 'prohibited_area'),
            Markup.button.callback('🌆 Mistakes in urban planning', 'planning_mistakes')
        ]
    ]))
}

function requestForLocation(ctx) {
    ctx.reply('Share with me your location.');
}

function locationIsShared(ctx) {
    const location = ctx.message.location;
    const latitude = location.latitude;
    const longitude = location.longitude;

    axios.get('http://api.positionstack.com/v1/reverse', {
        params: {
            'access_key': process.env.POSITIONSTACK_TOKEN,
            'query': `${latitude},${longitude}`
        }
    }).then((response) => {
        const city = response.data.data[0].locality;
        if (city === "Tallinn") {
            ctx.reply("Yes, your are right now in Tallinn!\nPlace share photo/video of incident and it will be sent to the city council.");
        } else {
            ctx.reply("Sorry, you done some shit.");
        }
    })
}

function parkingBicycleRoad(ctx) {
    requestForLocation(ctx);
}

bot.start((ctx) => ctx.reply("Welcome!"));
bot.command('report', (ctx) => report(ctx));
bot.action('parking_bicycle_road', (ctx) => parkingBicycleRoad(ctx));
bot.on('location', (ctx) => locationIsShared(ctx));

bot.launch().then(() => {
    console.log("Bot successfully started.")
});