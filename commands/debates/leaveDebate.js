const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const Debate = require('../../models/debates.js');
const Duple = require('../../models/duple.js');
const DebateDuple = require('../../models/debateDuples.js');
const DupleUser = require('../../models/dupleUsers.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('leave_debate')
    .setDescription('Leave a debate')
    .addStringOption(option =>
        option.setName('debate_name')
            .setDescription('The name of the debate')
            .setRequired(true)
    ),
    async execute (interaction) {
        try{
            const user = interaction.user;
            const debateName = interaction.options.getString('debate_name');

            const debate = await Debate.findOne({ where: { name: debateName, idGuild: interaction.guild.id } });
            if(!debate) return interaction.reply('This debate does not exist');
            if(debate.active === false) return interaction.reply('This debate is not active');
            
            const duples = await Duple.findAll({ where: { idGuild: interaction.guild.id} });

            const dupleUsers = await DupleUser.findAll({ where: { idUser: user.id } });

            let duple

            for(const d of duples){
                for(const du of dupleUsers){
                    if(d.id == du.idDuple){
                        duple = d
                        break
                    }
                }
            }

            if(!duple) return interaction.reply('You are not in any teams');
            if(duple.idLeader !== user.id) return interaction.reply('You are the leader of this team, you cannot leave the debate');
            const debateDuple = await DebateDuple.findOne({ where: { idDebate: debate.id, idDuple: duple.id } });
            if(!debateDuple) return interaction.reply('You are not in this debate');

            await DebateDuple.destroy({ where: { idDebate: debate.id, idDuple: duple.id } });
            await Debate.update({ teamsQuantity: debate.teamsQuantity - 1 }, { where: { id: debate.id } });

            const embed = new EmbedBuilder()
                .setTitle(`Team ${duple.name} deleted from debate ${debateName}`)
                .setDescription(`Team deleted by ${interaction.user.tag}`)
                .setImage(interaction.user.displayAvatarURL({ size: 4096 }))
                .addFields(
                    { name: 'Debate Name', value: debateName, inline: true },
                    { name: 'Team Name', value: duple.name, inline: true }
                );

            interaction.reply({ embeds: [embed] });
        }
        catch(error){
            console.error(error);
            interaction.reply('There was an error while trying to leave the debate');

        }
    }
}