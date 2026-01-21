const { Client, GatewayIntentBits } = require('discord.js');
const edtParsing = require('./edtParsing');
const ListGroup = require('./listGroup');
const group = require('./group');
const fs = require('fs');
const console = require('console');

class Bot{
    constructor(token){
        this.token = token;
        this.listAuthors = new Map();
        this.client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages
        ],
    });
    }
    run(){
        this.client.once('clientReady', () => {
        this.ready();        
        });

        this.client.on('messageCreate', message => {
        if (message.author.bot) return;
        if (message.channel.name === 'edt') {
            if (message.content.toLowerCase().includes('hello')) {
                message.reply('Hello there! 😊');
            }
            if (!this.listAuthors.has(message.author.tag)){
                this.listAuthors.set(message.author.tag, new ListGroup());
            }
            edtParsing.parseEdt(message.content, message.author.tag, message);
        }
        else if (message.channel.name === 'debug'){
            this.debug(message);
        }
        else if (message.guild === null) {
            // message.reply('Mdr tu m\'as DM moi ! 😂\ntu m\'aime c\'est ca');
            message.reply("TEST MP");
            console.log("MP received");
        }
        console.log(`Message from ${message.author.tag}: ${message.content}`);
    });

        this.client.login(this.token);
    }
    
    ready(){
        console.log(`Bot ${this.client.user.tag} is online!`);
        // Récupérer le salon "général" (remplace "général" par le nom de ton salon)
        const channel = this.client.channels.cache.find(ch => ch.name === 'edt');
            
        // Vérifier si le salon existe et si le bot a la permission d'y écrire
          if (channel && channel.isTextBased()) {
            console.log("Bot connected to ",channel.recipients);    
          } else {
            console.error("Salon 'edt' introuvable ou inaccessible.");
          }
    }
    debug(message){
        console.log("Debug message received:", message.content);
        if (message.content.toLowerCase().includes('view listauthors')){
            let rep = '';
            fs.readFileSync(`src/${message.author.tag}.edt`, 'utf-8').split('\n').forEach(line => {
                if (line.trim() !== '') {
                    rep += `- ${line}\n`;
                }
            });
            message.channel.send(`List of authors and their groups:\n${rep}`);
        }
    }

}

module.exports = Bot;