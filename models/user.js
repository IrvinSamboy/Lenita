const Sequalize = require('sequelize');
const sequelize = require('../utils/database.js');

const User = sequelize.define('user', {
    id: {
        type: Sequalize.STRING,
        primaryKey: true,
        allowNull: false
    }
},
{
    freezeTableName: true 
}

)

module.exports = User;