const Guild = require('../models/guilds');
const User = require('../models/user');
const GuildUsers = require('../models/guildUsers');
const { EmbedBuilder, Events, PermissionFlagsBits } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        console.log('Member has joined the server');
        try{
            const guildData = await Guild.findOne({ where: { id: member.guild.id } });

            if(!guildData) return;
            const welcomeRole = guildData.welcomeRoleId;
            const welcomeChannel = guildData.welcomeChannelId;

            if(!welcomeChannel) return;
            const channel = await member.guild.channels.cache.find(channel => channel.id === welcomeChannel);
            const botMember = await member.guild.members.fetch(member.client.user.id);

            const EmbedErr = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('I need the `MANAGE_ROLES` permission to give the welcome role to the new members and the role must be higher than mine. Please check the permissions and the position of the role.');

            if(welcomeRole){
                const role = await member.guild.roles.cache.find(role => role.id === welcomeRole);
                if(!role) return
                if(!botMember.permissions.has(PermissionFlagsBits.ManageRoles) || botMember.roles.highest.comparePositionTo(role) <= 0) {
                    const message = await channel.send({ embeds: [EmbedErr] });
                    wait(60000);
                    return await message.delete();
                }
    
                await member.roles.add(role);
            }

            if(!member.user.bot){
                await User.findOrCreate({ where: { id: member.id } });
                await GuildUsers.create({
                idGuild: member.guild.id,
                idUser: member.id,
                })
            }

            const Embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`¡Welcome to ${member.guild.name}!`)
            .setDescription(`¡Welcome ${member} to ${member.guild.name}! We hope you enjoy your stay on the server!`)
            .setImage(member.user.displayAvatarURL({size: 4096, dynamic: true}))
            .setFooter({ text: `Welcome ${member.user.username}` });

        if(!channel) return;
        await channel.send({ embeds: [Embed] });
        }catch(error){
            console.error('Error in welcome event:', error);
        }
    }
}