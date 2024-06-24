const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/user');
const GuildUsers = require('../../models/guildUsers');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('user_info')
        .setDescription('Replies with user info!')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to show info for')
                .setRequired(false)
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);
        const userData = await User.findOne({ where: { id: targetUser.id } });
        const GuildUser = await GuildUsers.findOne({ where: { idUser: targetUser.id, idGuild: interaction.guild.id } });
        if(!userData && !targetUser.user.bot){
            await User.create({ id: targetUser.id });
        }
        if(!GuildUser){
            await GuildUsers.create({
                idGuild: interaction.guild.id,
                idUser: targetUser.id
            })
        }
        const userXP = GuildUser ? GuildUser.xp : 0;

        const embed = new EmbedBuilder()
            .setTitle(`User information for ${targetUser.tag}`)
            .setImage(targetUser.displayAvatarURL({ size: 4096 }))
            .addFields(
                { name: 'Username', value: targetUser.username, inline: true },
                { name: 'User ID', value: targetUser.id, inline: false },
                { name: 'Bot', value: targetUser.bot ? 'Yes' : 'No', inline: true },
                { name: 'XP', value: userXP.toString(), inline: false },
                { name: 'Account Created', value: targetUser.createdAt.toDateString(), inline: false },
                { name: 'Account Joined', value: member.joinedAt ? member.joinedAt.toDateString() : 'N/A', inline:false }
            )
            .setTimestamp() 
            .setColor('Random');

        await interaction.reply({ embeds: [embed] });
    }
};
