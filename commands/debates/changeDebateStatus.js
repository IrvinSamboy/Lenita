const {SlashCommandBuilder, PermissionFlagsBits,  EmbedBuilder} = require('discord.js');
const Debate = require('../../models/debates.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('change_debate_status')
    .setDescription('Change the status of a debate')
    .addStringOption(option =>
        option.setName('debate_name')
            .setDescription('The name of the debate')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
    async execute (interaction) {
        try{
            const debateName = interaction.options.getString('debate_name');
            const debate = await Debate.findOne({ where: { name: debateName, idGuild: interaction.guild.id } });

            if(!debate) return interaction.reply('This debate does not exist');
            const newStatus = !debate.active;

            await Debate.update({ active: newStatus }, { where: { id: debate.id } });

            const status = newStatus ? 'Active' : 'Inactive';
            const embed = new EmbedBuilder()
                .setTitle(`Debate ${debateName} status changed`)
                .setDescription(`Debate status changed by ${interaction.user.tag}`)
                .setImage(interaction.user.displayAvatarURL({ size: 4096 }))
                .addFields(
                    { name: 'Debate Name', value: debateName, inline: true },
                    { name: 'Motion', value: debate.mocion, inline: false },
                    { name: 'Teams Quantity', value: debate.teamsQuantity.toString(), inline: true },
                    { name: 'Status', value: status, inline: true },
                    
                );

            interaction.reply({ embeds: [embed] });
        }
        catch(error){
            console.error(error);
            interaction.reply('There was an error while trying to change the status of the debate');
        }
    }
}