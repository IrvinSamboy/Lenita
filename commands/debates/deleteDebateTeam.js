const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder} = require('discord.js');
const Debate = require('../../models/debates.js');
const Duple = require('../../models/duple.js');
const DebateDuple = require('../../models/debateDuples.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('delete_debate_teams')
    .setDescription('Delete teams from a debate')
    .addStringOption(option => 
        option.setName('debate_name')
            .setDescription('The name of the debate')
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('team_name')
            .setDescription('Name of the duple')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
    async execute(interaction) {
        try{

            const debateName = interaction.options.getString('debate_name');
            const team_name = interaction.options.getString('team_name');
    
            const debate = await Debate.findOne({ where: { name: debateName, idGuild: interaction.guild.id } });
            if(!debate) return interaction.reply('This debate does not exist');
            if(debate.active === false) return interaction.reply('This debate is not active');

            const team = await Duple.findOne({ where: { name: team_name } });
            if(!team) return interaction.reply('This team does not exist');
    
            const debateTeam = await DebateDuple.findOne({ where: { idDebate: debate.id, idDuple: team.id } });
            if(!debateTeam) return interaction.reply('This team is not in the debate');
    
            await DebateDuple.destroy({ where: { idDebate: debate.id, idDuple: team.id } });
            await Debate.update({ teamsQuantity: debate.teamsQuantity - 1 }, { where: { id: debate.id } });
    
            const embed = new EmbedBuilder()
                .setTitle(`Team ${team_name} deleted from debate ${debateName}`)
                .setDescription(`Team deleted by ${interaction.user.tag}`)
                .setImage(interaction.user.displayAvatarURL({ size: 4096 }))
                .addFields(
                    { name: 'Debate Name', value: debateName, inline: true },
                    { name: 'Team Name', value: team_name, inline: true }
                );
    
            interaction.reply({ embeds: [embed] });
    
        }        
        catch(error){
            console.error(error);
            interaction.reply('There was an error while trying to delete teams from the debate');
        }
}
}