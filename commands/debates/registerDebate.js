const {SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder} = require('discord.js');
const Debate = require('../../models/debates.js');
const Guild = require('../../models/guilds.js');
const mociones = require('../../utils/mociones.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register_debate')
        .setDescription('Register a debate')
        .addStringOption(option => 
            option.setName('debate_name')
                .setDescription('The name of the debate')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('mocion')
                .setDescription('The motion of the debate')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
        async execute(interaction) {
            try{
                const debateName = interaction.options.getString('debate_name');
                const guildId = interaction.guild.id;
                const mocion = interaction.options.getString('mocion');
                await Guild.findOrCreate({ where: { id: guildId } });
                const debate = await Debate.findOne({ where: { name: debateName, idGuild: guildId }});
                
                if(debate) return interaction.reply('This debate already exists');
                
                const embed = new EmbedBuilder()
                    .setTitle(`Debate ${debateName} created`)
                    .setDescription(`Debate created by ${interaction.user.tag}`)
                    .setImage(interaction.user.displayAvatarURL({ size: 4096 }))
                    .addFields(
                        { name: 'Debate Name', value: debateName, inline: true },
                        { name: 'Motion', value: mocion || "N/A", inline: false},
                        { name: 'Teams Quantity', value: '0', inline: true},
                        { name: 'Status', value: 'Active', inline: true}
                        );

                if(mocion){
                    await Debate.create({name: debateName, idGuild: guildId, teamsQuantity: 0, mocion: mocion});
                    return interaction.reply({embeds: [embed]});
                }
                const randomMocion = mociones[Math.floor(Math.random() * mociones.length)]; 
                await Debate.create({name: debateName, idGuild: guildId, teamsQuantity: 0, mocion: randomMocion.descripcion});
                embed.spliceFields(1, 1, { name: 'Motion', value: randomMocion.descripcion, inline: false });
                return interaction.reply({embeds: [embed]});
                
            } catch(error){
                console.error(error);
                interaction.reply('There was an error while trying to create the debate');
        }
    },
}