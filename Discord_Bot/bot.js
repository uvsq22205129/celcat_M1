const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,Events} = require('discord.js');
const edtParsing = require('./edtParsing');
const ListGroup = require('./listGroup');
const group = require('./group');
const fs = require('fs');
const console = require('console');
const InteractePars = require('./interaction');

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
        this.ready(this.client);                
        });

        this.client.on(Events.MessageCreate, async message => {
        if (message.author.bot) return;
        if (message.channel.name === 'edt-beta') {
            if (message.content.toLowerCase().includes('hello')) {
                await message.reply('Hello there! 😊');
            }
            // if (!this.listAuthors.has(message.author.id)){
            //     this.listAuthors.set(message.author.id, new ListGroup());
            // }
            edtParsing.parseEdt(message.content, message.author.id, message);
        }
        else if (message.guild === null) {
            // message.reply('Mdr tu m\'as DM moi ! 😂\ntu m\'aime c\'est ca');
            message.reply("TEST MP");
            console.log("MP received");
        }
        console.log(`Message from ${message.author.tag}: ${message.content}`);
        });

        //pour utiliser les commande slash
        this.client.on(Events.InteractionCreate, async (interaction) =>{
            console.log(interaction.user.tag);
            const inter_parse = new InteractePars(interaction);
            await inter_parse.parse();
        });

        this.client.login(this.token);
    }
    
    async ready(client){
        console.log(`Bot ${this.client.user.tag} is online!`);
        // Récupérer le salon "général" (remplace "général" par le nom de ton salon)
        const channel = this.client.channels.cache.find(ch => ch.name === 'edt-beta');
        // Vérifier si le salon existe et si le bot a la permission d'y écrire
          if (channel && channel.isTextBased()) {
            console.log("Bot connected to ",channel.recipients);    
          } else {
            console.error("Salon 'edt-beta' introuvable ou inaccessible.");
          }
        const commands = [
            new SlashCommandBuilder()
            .setName('menu')
            .setDescription('donne le menu d\'initialisation pour l\'edt'),
        ];

        await client.application.commands.set(commands);
    }
}

module.exports = Bot;