const Sequalize = require('sequelize');
const sequelize = require('../utils/database.js');
const { time } = require('discord.js');

const Guild = sequelize.define('guilds', {
    id: {
        type: Sequalize.STRING,
        primaryKey: true,
    },
    welcomeChannelId: {
        type: Sequalize.STRING,
        allowNull: true,
    },
    welcomeRoleId: {
        type: Sequalize.STRING,
        allowNull: true,
    },
},
{
    freezeTableName: true 
}
)

module.exports = Guild;