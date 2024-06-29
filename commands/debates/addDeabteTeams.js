const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder} = require('discord.js');
const Debate = require('../../models/debates.js');
const Duple = require('../../models/duple.js');
const DebateDuple = require('../../models/debateDuples.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('add_debate_teams')
    .setDescription('Add teams to a debate')
    .addStringOption(option => 
        option.setName('debate_name')
            .setDescription('The name of the debate')
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('duple_name')
            .setDescription('Name of the duple')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
    async execute(interaction) {
        try{
            const debateName = interaction.options.getString('debate_name');
            const dupleName = interaction.options.getString('duple_name');
            
            const debate = await Debate.findOne({ where: { name: debateName, idGuild: interaction.guild.id } });
            if(!debate) return interaction.reply('This debate does not exist');
            if(debate.active === false) return interaction.reply('This debate is not active');

            const duple = await Duple.findOne({ where: { name: dupleName } });
            if(!duple) return interaction.reply('This duple does not exist');
            
            const debateDuple = await DebateDuple.findOne({ where: { idDebate: debate.id, idDuple: duple.id } });
            if(debateDuple) return interaction.reply('This duple is already in the debate');
    
            await DebateDuple.create({ idDebate: debate.id, idDuple: duple.id });
            await Debate.update({ teamsQuantity: debate.teamsQuantity + 1 }, { where: { id: debate.id } });
    
            const embed = new EmbedBuilder()
                .setTitle(`Duple ${dupleName} added to debate ${debateName}`)
                .setDescription(`Duple added by ${interaction.user.tag}`)
                .setImage(interaction.user.displayAvatarURL({ size: 4096 }))
                .addFields(
                    { name: 'Debate Name', value: debateName, inline: true },
                    { name: 'Duple Name', value: dupleName, inline: true }
                );
    
            interaction.reply({ embeds: [embed] });    
        }
        catch(error){
            console.error(error);
            interaction.reply('There was an error while trying to add teams to the debate');
        }
    }
}