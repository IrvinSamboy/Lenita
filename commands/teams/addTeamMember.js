const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Duple = require('../../models/duple.js');
const DupleUser = require('../../models/dupleUsers.js');

const leaderValidation = async (leader, interaction, userDuple, teamName, duple) => {

    const dupleUser = await DupleUser.findOne({ where: { idUser: userDuple.id, idDuple: duple.id}});

    const leaderGuildUser = await interaction.guild.members.fetch(leader);

    if(dupleUser) return interaction.editReply('This user is in the team');

    const embed = new EmbedBuilder()
            .setTitle(`User ${userDuple.tag} added from team ${teamName}`)
            .setDescription(`User deleted by ${interaction.user.tag}`)
            .setThumbnail(userDuple.displayAvatarURL({ size: 4096 }))
            .addFields(
                { name: 'Team Name', value: teamName, inline: true },
                { name: 'Leader', value: leaderGuildUser.user.username, inline: true },
                { name: 'Members', value: duple.userQuantity.toString(), inline: true }
            )
            .setColor('#FF0000');
            
            console.log('hereofduple');
            await DupleUser.create({ idUser: userDuple.id, idDuple: duple.id});
            await duple.update({ userQuantity: duple.userQuantity+1})
            embed.spliceFields(2, 1, { name: 'Members', value: duple.userQuantity.toString(), inline: true });

             return await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_member')
        .setDescription('Add member to the team')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to add')
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

            const leader = await interaction.guild.members.fetch(interaction.user.id);
            const teamName = interaction.options.getString('team_name');
            const userDuple = interaction.options.getUser('user');

            if(userDuple.bot) return interaction.editReply('You cannot add a bot to a team');
            if(userDuple.id === leader.id) return interaction.editReply('You cannot add yourself to a team');

            if(teamName){
                const duple = await Duple.findOne({ where: { idGuild: interaction.guild.id, name: teamName}});
                if(duple.userQuantity === 2) return interaction.editReply('The team is full');
                if(!duple) return interaction.editReply('The team does not exist');
                if(duple.idLeader !== leader.id) {
                    if(!leader.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply('You need to be an administrator to add member to this team');
                    return await leaderValidation(duple.idLeader, interaction, userDuple, teamName, duple);
                }
                else{
                    return await leaderValidation(leader.id, interaction, userDuple, teamName, duple);
                }
            }

            const duple = await Duple.findOne({ where: { idLeader: leader.id, idGuild: interaction.guild.id}});
            if(!duple) return interaction.editReply('You do not have a team to add member');
            if(duple.userQuantity === 2) return interaction.editReply('The team is full');

            if(duple.idLeader !== leader.id) return interaction.editReply('You need to be the leader of the team to add member to it');

            return await leaderValidation(leader.id, interaction, userDuple, duple.name, duple);
        }
        catch(error){
            console.log(error);
            interaction.editReply('There was an error trying to add member to this team');
        }
    } 
}