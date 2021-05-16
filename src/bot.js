const { Telegraf, Markup } = require('telegraf');
const { Type } = require('./type');
const moment = require('moment');
const { Position } = require('./position');

const sessions = {};

function initReport(ctx) {
    ctx.reply('Of course, firstly selected type of incident.', Markup.inlineKeyboard([
        [
            Markup.button.callback(Type['PARKING_BICYCLE_ROAD'], 'PARKING_BICYCLE_ROAD'),
            Markup.button.callback(Type['PARKING_PROHIBITED'], 'PARKING_PROHIBITED')
        ],
        [
            Markup.button.callback(Type['RIDE_PROHIBITED'], 'RIDE_PROHIBITED'),
            Markup.button.callback(Type['PLANNING_MISTAKES'], 'PLANNING_MISTAKES')
        ]
    ]))
}

function reportTypeSelected(ctx, type) {
    ctx.reply(`Looks like you want to report ${type}.\nPlease share with me your position.`)
    sessions[ctx.from.id] = {
        incident: {
            'type': type,
            'stage': 'position_sharing',
            'time': moment.now()
        }
    }
}

function locationShared(ctx) {
    if (!sessions[ctx.from.id]) {
        ctx.reply("Sorry, firstly you need to select type of incident. Type /report.");
        return;
    }
    new Position(ctx.message.location).parse().then((position) => {
        if (position.locality === "Tallinn") {
            ctx.reply(`Yes, you are right now in Tallinn.\nYour approximately location: ${position.street} ${position.number}.\nPlace share photo/video of incident.\nKeep in mind, that vehicle registration plate should be visible.`);
        } else {
            ctx.reply("Sorry, but currently our bot is available only in Tallinn. Drop your session or try again.", Markup.inlineKeyboard([
                Markup.button.callback("Drop my session", 'END')
            ]));
        }
    })
}

function deleteSession(ctx) {
    if (sessions[ctx.from.id]) {
        delete sessions[ctx.from.id];
        ctx.reply("Your session successfully deleted.");
    }
}

class Bot {
    constructor(token) {
        this.bot = new Telegraf(token);
        this.bot.start((ctx) => ctx.reply("Welcome! To report invalid usage of city space please type /report."));
        this.bot.command('report', (ctx) => initReport(ctx));
        this.bot.action('PARKING_BICYCLE_ROAD', (ctx) => reportTypeSelected(ctx, Type['PARKING_BICYCLE_ROAD']));
        this.bot.action('PARKING_PROHIBITED', (ctx) => reportTypeSelected(ctx, Type['PARKING_PROHIBITED']));
        this.bot.action('RIDE_PROHIBITED', (ctx) => reportTypeSelected(ctx, Type['RIDE_PROHIBITED']));
        this.bot.action('PLANNING_MISTAKES', (ctx) => reportTypeSelected(ctx, Type['PLANNING_MISTAKES']));
        this.bot.action('END', (ctx) => deleteSession(ctx));
        this.bot.on('location', (ctx) => locationShared(ctx));
    }

    launch() {
        this.bot.launch().then(() => {
            console.log("Bot successfully started.")
            if (this.bot.botInfo.last_name) {
                console.log(`Logged in as ${this.bot.botInfo.first_name} ${this.bot.botInfo.last_name}.`)
            } else {
                console.log(`Logged in as ${this.bot.botInfo.first_name}.`)
            }
        });
    }
}


module.exports = {
    Bot
};