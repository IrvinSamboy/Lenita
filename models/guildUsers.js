const Sequalize = require('sequelize');
const sequelize = require('../utils/database.js');

const GuildUsers = sequelize.define('guildUsers', {
    id: {
        type: Sequalize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idGuild: {
        type: Sequalize.STRING,
        allowNull: false,
        references: {
            model: 'guilds',
            key: 'id',
        }
    },
    idUser: {
        type: Sequalize.STRING,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id',
        }
    },
    xp: {
        type: Sequalize.INTEGER,
        defaultValue: 0
    }
},
{
    freezeTableName: true 
}
)


module.exports = GuildUsers;