const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Duple = require('../../models/duple.js');
const DupleUser = require('../../models/dupleUsers.js');
const GuildUsers = require('../../models/guildUsers.js');
const user = require('../../models/user.js');
const Guild = require('../../models/guilds.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register_team')
        .setDescription('Create a new team')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to create the team for')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('The name of the team')
                .setRequired(true)
        ),
    async execute(interaction) {
        try{
            const leader = interaction.user;
            const userDuple = interaction.options.getUser('user');
            
            if(userDuple.bot) return interaction.reply('You cannot create a team with a bot');
            if(userDuple.id === leader.id) return interaction.reply('You cannot create a team with yourself');
            const teamName = interaction.options.getString('team_name');
            
            await Guild.findOrCreate({ where: { id: interaction.guild.id } })
            await user.findOrCreate({ where: { id: leader.id } });
            await user.findOrCreate({ where: { id: userDuple.id } });

        
            await GuildUsers.findOrCreate({ where: { idUser: leader.id, idGuild: interaction.guild.id } });
            await GuildUsers.findOrCreate({ where: { idUser: userDuple.id, idGuild: interaction.guild.id } });

            const duple = await Duple.findOne({ where: { name: teamName, idGuild: interaction.guild.id}});
            
            if(duple) return interaction.reply('This team already exists');
            
            const dupleUser = await DupleUser.findOne({ where: { idUser: userDuple.id }});
            const dupleLeader = await DupleUser.findOne({ where: { idUser: leader.id }});

            if(dupleUser || dupleLeader){
                const duple = await Duple.findOne({ where: { id: dupleLeader? Number(dupleLeader.idDuple) : Number(dupleUser.idDuple), idGuild: interaction.guild.id}});
                if(duple) return dupleUser? interaction.reply(`This user is already in a team ${duple.name}`) : interaction.reply(`You already on a team ${duple.name}`);
            }

            const newDuple = await Duple.create({name: teamName, idLeader: leader.id, idGuild: interaction.guild.id, userQuantity: 2});
            await DupleUser.create({idDuple: newDuple.id, idUser: leader.id});
            await DupleUser.create({idDuple: newDuple.id, idUser: userDuple.id});

            const embed = new EmbedBuilder()
                .setTitle(`Team ${teamName} created`)
                .setDescription(`Team created by ${leader.tag}`)
                .setThumbnail(leader.displayAvatarURL({ size: 4096 }))
                .addFields(
                    { name: 'Team Name', value: teamName, inline: true },
                    { name: 'Leader', value: leader.tag, inline: true },
                    { name: 'Member', value: userDuple.tag, inline: true },
                    { name: 'Members', value: newDuple.userQuantity.toString(), inline: true}
                )
                .setColor('Random')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
        catch(err){
            console.log(err);
            await interaction.reply('An error occurred while creating the team');
        }
    }
}