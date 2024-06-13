const {Client, Events, GatewayIntentBits, Collection} = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const TOKEN = process.env['TOKEN']
const client = new Client({intents: [GatewayIntentBits.Guilds]})

client.commands = new Collection();
client.cooldowns = new Collection();

const folderpath = path.join(__dirname, 'commands');
const commandsFolder = fs.readdirSync(folderpath);

for (const file of commandsFolder) {
    const commandsPath  = path.join(folderpath, file);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filepath = path.join(commandsPath, file);
        const command = require(filepath);    
        if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
    }
}

const eventFolder = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventFolder).filter(file => file.endsWith('.js'));


for (const file of eventFiles) {
    const filepath = path.join(eventFolder, file);
    const event = require(filepath);
    if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


client.login(TOKEN);