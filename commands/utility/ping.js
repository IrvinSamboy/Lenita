const {SlashCommandBuilder} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply({content: 'Pong! (2 seconds later)', ephemeral: true});
        await wait(2000);
        await interaction.deleteReply();
    }
}