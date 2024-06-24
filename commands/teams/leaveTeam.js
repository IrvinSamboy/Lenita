const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Duple = require('../../models/duple.js');
const DupleUser = require('../../models/dupleUsers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave_team')
        .setDescription('Leave the team you are in'),
    async execute(interaction) {
        try{
        await interaction.deferReply();

        const duple = await Duple.findAll({ where: { idGuild: interaction.guild.id}});
        
        let dupleUser

        for (const d of duple) {
            dupleUser = await DupleUser.findOne({ where: { idUser: interaction.user.id, idDuple: d.id }});
            if (dupleUser) {
                break;
            }
        }
        
        if(!dupleUser) return interaction.editReply('You are not in a team')
        console.log(dupleUser);
        const dupleSpecific = await Duple.findOne({ where: { id: Number(dupleUser.idDuple)}});
        if(!dupleUser) return interaction.editReply('You are not in a team');

        const leaderGuildUser = await interaction.guild.members.fetch(dupleSpecific.idLeader);

        const embed = new EmbedBuilder()
        .setTitle(`User ${interaction.user.tag} leave the team ${dupleSpecific.name}`)
        .setThumbnail(interaction.user.displayAvatarURL({ size: 4096 }))
        .addFields(
            { name: 'Team Name', value: dupleSpecific.name, inline: true },
            { name: 'Leader', value: leaderGuildUser.user.username, inline: true },
            { name: 'Members', value: dupleSpecific.userQuantity.toString(), inline: true }
        )
        .setColor('#FF0000');

        if(dupleUser.idUser === dupleSpecific.idLeader) {
            if(dupleSpecific.userQuantity === 2) {
                console.log('HIIIIIIIIIIIIIIIIIII');
                await dupleUser.destroy()
                const newLeader = await DupleUser.findOne({ where: { idDuple: dupleSpecific.id}});
                const newLeaderUser = await interaction.guild.members.cache.find(user => user.id === newLeader.idUser)
                console.log(newLeaderUser);
                await dupleSpecific.update({ idLeader:  newLeader.idUser, userQuantity: dupleSpecific.userQuantity-1})
                embed.spliceFields(1, 1, { name: 'Leader', value: newLeaderUser.user.username, inline: true });
                embed.spliceFields(2, 1, { name: 'Members', value: dupleSpecific.userQuantity.toString(), inline: true });
                return await interaction.editReply({ embeds: [embed] });
            }

            else{
                console.log('here');
                await dupleUser.destroy();
                await dupleSpecific.destroy();

                const embed = new EmbedBuilder()
                    .setTitle(`Team ${dupleSpecific.name} deleted`)
                    .setDescription(`Team deleted by ${interaction.user.tag}`)
                    .setThumbnail(interaction.user.displayAvatarURL({ size: 4096 }))
                    .addFields(
                        { name: 'Team Name', value: dupleSpecific.name, inline: true },
                        { name: 'Leader', value: leaderGuildUser.user.username, inline: true },
                    )
                    .setColor('#FF0000');

                return await interaction.editReply({ embeds: [embed] });
            }
        }

        await dupleUser.destroy();
        await dupleSpecific.update({ userQuantity: dupleSpecific.userQuantity-1})
        embed.spliceFields(2, 1, { name: 'Members', value: dupleSpecific.userQuantity.toString(), inline: true });
        
        return await interaction.editReply({ embeds: [embed] });
        }
        catch(error){
            console.error(error);
            return await interaction.editReply("PROBLEMA");

        }

    }
}