require('dotenv').config()
const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db');
const UserModel = require('./models');
const token = process.env.TELEGRAM_TOKEN

const bot = new TelegramApi(token, {polling: true})

const chats = {};



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Guess a number 0 - 9');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Try to guess...', gameOptions)
}


const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('DB connection broken')
    }

    bot.setMyCommands([
        {command: '/start', description: 'First greetings'},
        {command: '/info', description: 'Info about bot'},
        {command: '/game', description: 'Davai poigraem'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
       
        try {

            if(text === '/start'){
                await UserModel.create({chatId})
                return bot.sendMessage(chatId, `Hi ${msg.from.first_name}, welcome to getitgrownchat`);
                
            }
            if(text === '/info'){
                const user = await UserModel.findOne({chatId})
                await bot.sendMessage(chatId, `Your name is ${msg.from.first_name}, your rank is ${user.right}`);
                return bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp' )
            }
            if (text ==='/game'){
                return startGame(chatId);
            }
            
        } catch (e) {
            return bot.sendMessage(chatId, 'Something went wrong')
        }
    
    
        return bot.sendMessage(chatId, 'Sorry, do not understand you');
    })

    bot.on('callback_query', async msg=> {
        const data = msg.data;
        const chatId = msg.message.chat.id;       
        if (data === '/again'){
            return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})

        if (data == chats[chatId]){
            user.right += 1;
            await  bot.sendMessage(chatId, `You are right, number is ${data}`, againOptions);
        } else {
            user.wrong += 1;
            await  bot.sendMessage(chatId, `You are not right, number was ${chats[chatId]}`, againOptions);
        }
        await user.save();
    })

}

start()