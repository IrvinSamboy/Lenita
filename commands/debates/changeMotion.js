const {SlashCommandBuilder, PermissionFlagsBits,  EmbedBuilder} = require('discord.js');
const Debate = require('../../models/debates.js');
const mocion = require('../../utils/mociones.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('change_motion')
    .setDescription('Change the motion of a debate')
    .addStringOption(option =>
        option.setName('debate_name')
            .setDescription('The name of the debate')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('new_motion')
            .setDescription('The new motion of the debate')
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
    async execute (interaction) {
        try{
            const debateName = interaction.options.getString('debate_name');
            const newMotion = interaction.options.getString('new_motion') 
            const randomMotion = mocion[Math.floor(Math.random() * mocion.length)];

            const debate = await Debate.findOne({ where: { name: debateName, idGuild: interaction.guild.id } });
            if(!debate) return interaction.reply('This debate does not exist');
            if(debate.active === false) return interaction.reply('This debate is not active');

            const embed = new EmbedBuilder()
                .setTitle(`Debate ${debateName} motion changed`)
                .setDescription(`Debate motion changed by ${interaction.user.tag}`)
                .setImage(interaction.user.displayAvatarURL({ size: 4096 }))
                .addFields(
                    { name: 'Debate Name', value: debateName, inline: true },
                    { name: 'Old Motion', value: debate.mocion, inline: false },
                    { name: 'New Motion', value: newMotion || randomMotion.descripcion, inline: false },
                    { name: 'Teams Quantity', value: debate.teamsQuantity.toString(), inline: true },
                    { name: 'Status', value: 'Active', inline: true },
                );

            if(newMotion){
                await Debate.update({ mocion: newMotion }, { where: { id: debate.id } });
                return interaction.reply({ embeds: [embed] });
            }
            await Debate.update({ mocion: randomMotion.descripcion }, { where: { id: debate.id } });
            return interaction.reply({ embeds: [embed] });
        }
        catch(error){
            console.error(error);
            interaction.reply('There was an error while trying to change the motion of the debate');
    }
}
}