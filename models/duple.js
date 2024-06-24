const Sequalize = require('sequelize');
const sequelize = require('../utils/database.js');

const duple = sequelize.define('duple', {
    id: {
        type: Sequalize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequalize.STRING,
        allowNull: false
    },
    idGuild: {
        type: Sequalize.STRING,
        allowNull: false,
        references: {
            model: 'guilds',
            key: 'id',
        }
    },
    idLeader: {
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
    },
    userQuantity: {
        type: Sequalize.INTEGER,
        defaultValue: 1
    }
},
{
    freezeTableName: true   
}
)

module.exports = duple;