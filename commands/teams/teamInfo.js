const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Duple = require('../../models/duple.js');
const DupleUser = require('../../models/dupleUsers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team_info')
        .setDescription('Get team information')
        .addStringOption(option =>
            option.setName('team_name')
                .setDescription('The team name')
                .setRequired(false)
        ),
    async execute(interaction) {
        try{
            const teamName = interaction.options.getString('team_name');

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Team Information')
                .setDescription(`Information about the team`)
                .addFields(
                    { name: 'Team Name', value: 'N/A', inline: true },
                    { name: 'Leader', value: 'N/A', inline: true },
                    { name: 'Members', value: '0', inline: true },
                    { name: 'Team Experience', value: '0', inline: true}
                )
                .setTimestamp();

            if(teamName){
                const duple = await Duple.findOne({ where: { idGuild: interaction.guild.id, name: teamName}});
                if(!duple) return interaction.reply('The team does not exist');
                const leader = await interaction.guild.members.fetch(duple.idLeader);
                embed.spliceFields(0, 1, { name: 'Team Name', value: teamName, inline: true })
                embed.spliceFields(1, 1, { name: 'Leader', value: leader.user.username, inline: true })
                embed.spliceFields(2, 1, { name: 'Members', value: duple.userQuantity.toString(), inline: true })
                embed.spliceFields(3, 1, { name: 'Team Experience', value: duple.xp.toString(), inline: true })
                return await interaction.reply({ embeds: [embed] });
            }

            const duples = await Duple.findAll({ where: { idGuild: interaction.guild.id }});
            let duple
            let userDuple

            for(const d of duples){
                userDuple = await DupleUser.findOne({ where: { idUser: interaction.user.id, idDuple: d.id }});
                if(userDuple){
                    duple = d;
                    break;
                }
            }
            if(!duple) return interaction.reply('You are not in a team');
            const leader = await interaction.guild.members.fetch(duple.idLeader);
            
            embed.spliceFields(0, 1, { name: 'Team Name', value: duple.name, inline: true })
            embed.spliceFields(1, 1, { name: 'Leader', value: leader.user.username, inline: true })
            embed.spliceFields(2, 1, { name: 'Members', value: duple.userQuantity.toString(), inline: true })
            embed.spliceFields(3, 1, { name: 'Team Experience', value: duple.xp.toString(), inline: true })
            
            return await interaction.reply({ embeds: [embed] });

        }
        catch(error){
            console.log(error);
            await interaction.reply('There was an error trying to execute that command!');
        }
    }
}