const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Duple = require('../../models/duple.js');
const DupleUser = require('../../models/dupleUsers.js');

const leaderValidation = async (leader, interaction, userDuple, teamName, duple) => {

    const dupleUser = await DupleUser.findOne({ where: { idUser: userDuple.id, idDuple: duple.id}});

    const leaderGuildUser = await interaction.guild.members.fetch(leader);

    if(!dupleUser) return interaction.editReply('This user is not in the team');

    const embed = new EmbedBuilder()
            .setTitle(`User ${userDuple.tag} deleted from team ${teamName}`)
            .setDescription(`User deleted by ${interaction.user.tag}`)
            .setThumbnail(userDuple.displayAvatarURL({ size: 4096 }))
            .addFields(
                { name: 'Team Name', value: teamName, inline: true },
                { name: 'Leader', value: leaderGuildUser.user.username, inline: true },
                { name: 'Members', value: duple.userQuantity.toString(), inline: true }
            )
            .setColor('#FF0000');
            if(dupleUser.idUser === leader) {
                if(duple.userQuantity === 2) {
                    console.log('HIIIIIIIIIIIIIIIIIII');
                    await dupleUser.destroy()
                    const newLeader = await DupleUser.findOne({ where: { idDuple: duple.id}});
                    console.log(newLeader);
                    const newLeaderUser = await interaction.guild.members.cache.find(user => user.id === newLeader.idUser)
                    await duple.update({ idLeader:  newLeader.idUser, userQuantity: duple.userQuantity-1})
                    embed.spliceFields(1, 1, { name: 'Leader', value: newLeaderUser.user.username, inline: true });
                    embed.spliceFields(2, 1, { name: 'Members', value: duple.userQuantity.toString(), inline: true });
                    return await interaction.editReply({ embeds: [embed] });
                }

                else{
                    console.log('here');
                    await dupleUser.destroy();
                    await duple.destroy();

                    const embed = new EmbedBuilder()
                        .setTitle(`Team ${teamName} deleted`)
                        .setDescription(`Team deleted by ${interaction.user.tag}`)
                        .setThumbnail(interaction.user.displayAvatarURL({ size: 4096 }))
                        .addFields(
                            { name: 'Team Name', value: teamName, inline: true },
                            { name: 'Leader', value: leaderGuildUser.user.username, inline: true },
                        )
                        .setColor('#FF0000');

                    return await interaction.editReply({ embeds: [embed] });
                }
            }
            console.log('hereofduple');
            await dupleUser.destroy();
            await duple.update({ userQuantity: duple.userQuantity-1})
            embed.spliceFields(2, 1, { name: 'Members', value: duple.userQuantity.toString(), inline: true });

             return await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_member')
        .setDescription('Delete a member from a team')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to delete')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('team_name')
                .setDescription('The team name')
                .setRequired(false)
        ),
    async execute(interaction) {
        try{
            await interaction.deferReply();
            const leader = await interaction.guild.members.fetch(interaction.user.id)
            const userDuple = interaction.options.getUser('user');

            const teamName = interaction.options.getString('team_name');

            if(teamName) {
                console.log('aqui cuando teamName no es undefined');
                const duple = await Duple.findOne({ where: { name: teamName, idGuild: interaction.guild.id}});
                if(!duple) return interaction.editReply('The team does not exist');
                if(duple.idLeader !== userDuple.id) {
                    if(!leader.permissions.has(PermissionFlagsBits.Administrator)) return interaction.editReply('You need to be an administrator to delete a member from a team');
                    const dupleUser = await DupleUser.findOne({ where: { idUser: userDuple.id, idDuple: duple.id}});
                    if(!dupleUser) return interaction.editReply('This user is not in the team');
                    console.log('aqui cuando no es lider');
                    return await leaderValidation( duple.idLeader, interaction, userDuple, teamName, duple);
                }
                else{
                    console.log('aqui cuando es lider');
                    return await leaderValidation( duple.idLeader, interaction, userDuple, teamName, duple);
                }
            }

            const duple = await Duple.findOne({ where: { idLeader: leader.id, idGuild: interaction.guild.id}});
        
            if(!duple) return interaction.editReply('You are not the leader of any team')

            const ifTeamNameIsUndefined = duple.name

            return await leaderValidation(leader.id, interaction, userDuple, ifTeamNameIsUndefined, duple);

        }
        catch(error){
            console.error(error);
            await interaction.followUp('There was an error trying to delete the member');
        }
    }
}