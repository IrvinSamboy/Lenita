const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Duple = require('../../models/duple.js');
const DupleUser = require('../../models/dupleUsers.js');

const leaderValidation = async (leader, interaction, teamName, duple) => {

    const dupleUsers = await DupleUser.findAll({ where: { idDuple: duple.id}});

    const leaderGuildUser = await interaction.guild.members.fetch(leader);

    const embed = new EmbedBuilder()
            .setTitle(`Team ${teamName} deleted`)
            .setDescription(`Team deleted by ${interaction.user.tag}`)
            .addFields(
                { name: 'Team Name', value: teamName, inline: true },
                { name: 'Leader', value: leaderGuildUser.user.username, inline: true },
                { name: 'Members', value: duple.userQuantity.toString(), inline: true }
            )
            .setColor('#FF0000');

            for(const dupleUser of dupleUsers) {
                await dupleUser.destroy();
            }
            await duple.destroy();

            await interaction.reply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_team')
        .setDescription('Delete team')
        .addStringOption(option =>
            option.setName('team_name')
                .setDescription('The team name')
                .setRequired(false)
        ),
    async execute(interaction) {
        try{
            const leader = await interaction.guild.members.fetch(interaction.user.id);
            const teamName = interaction.options.getString('team_name');

            if(teamName){
                const duple = await Duple.findOne({ where: { idGuild: interaction.guild.id, name: teamName}});
                if(!duple) return interaction.reply('The team does not exist');
                if(duple.idLeader !== leader.id) {
                    if(!leader.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply('You need to be an administrator to delete this team');
                    return await leaderValidation(duple.idLeader, interaction, teamName, duple);
                }
                else{
                    return await leaderValidation(leader.id, interaction, teamName, duple);
                }
            }

            const duple = await Duple.findOne({ where: { idLeader: leader.id, idGuild: interaction.guild.id}});
            if(!duple) return interaction.reply('You do not have a team to delete');

            if(duple.idLeader !== leader.id) return interaction.reply('You need to be the leader of the team to delete it');

            return await leaderValidation(leader.id, interaction, duple.name, duple);

        }
        catch(error){
            console.error(error);
            await interaction.reply('There was an error trying to delete the member');
        }
    }
}