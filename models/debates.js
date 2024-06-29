const Sequalize = require('sequelize');
const sequelize = require('../utils/database.js');

const debate = sequelize.define('debate', {
    id: {
        type: Sequalize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequalize.STRING,
        allowNull: false,
    },
    mocion: {
        type: Sequalize.STRING,
        allowNull: false,
    },
    idGuild: {
        type: Sequalize.STRING,
        allowNull: false,
        references: {
            model: 'guilds',
            key: 'id',
        }
    },
    teamsQuantity: {
        type: Sequalize.INTEGER,
        allowNull: false
    },
    active:{
        type: Sequalize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
},
{
    freezeTableName: true   
})

module.exports = debate