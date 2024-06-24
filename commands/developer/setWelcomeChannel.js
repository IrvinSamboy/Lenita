const {SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');
const Guild = require('../../models/guilds.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('setwelcomechannel')
    .setDescription('Set the channel where the bot will send welcome messages')
    .addChannelOption(option =>
        option.setName('channel')
        .setDescription('The channel to send welcome messages to')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addRoleOption(option =>
        option.setName('role')
        .setDescription('The role to give to new members')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

    async execute (interaction) {
        const channel = await interaction.options.getChannel('channel');
        const role = await interaction.options.getRole('role');

        if(interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply('You must be the owner of the server to use this command');
        }

        const [guild] = await Guild.findOrCreate({where: {id: interaction.guild.id}});

        await guild.update({welcomeChannelId: channel.id, welcomeRoleId: role ? role.id : null});

        await interaction.reply(`Welcome channel set to ${channel} and role set to ${role}`);
    }
}