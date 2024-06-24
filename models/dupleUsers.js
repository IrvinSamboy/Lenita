const Sequalize = require('sequelize');
const sequelize = require('../utils/database.js');

const dupleUsers = sequelize.define('dupleUsers', {
    id: {
        type: Sequalize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idDuple: {
        type: Sequalize.STRING,
        allowNull: false,
        references: {
            model: 'duple',
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
},
{
    freezeTableName: true 
})

module.exports = dupleUsers;