const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Replies with user info!')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to show info for')
                .setRequired(false)
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);

        const embed = new EmbedBuilder()
            .setTitle(`${targetUser.username}'s info`)
            .setThumbnail(targetUser.displayAvatarURL({ size: 4096 }))
            .addFields(
                { name: 'User ID', value: targetUser.id, inline: false },
                { name: 'Account Created', value: targetUser.createdAt.toDateString(), inline: false },
                { name: 'Account Joined', value: member.joinedAt ? member.joinedAt.toDateString() : 'N/A', inline:false }
            
            )
            .setTimestamp() // Current time
            .setColor('Random'); // Random color

        await interaction.reply({ embeds: [embed] });
    }
};