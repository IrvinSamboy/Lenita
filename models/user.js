const Sequalize = require('sequelize');
const sequelize = require('../utils/database.js');

const User = sequelize.define('user', {
    id: {
        type: Sequalize.STRING,
        primaryKey: true,
        allowNull: false
    },
    xp: {
        type: Sequalize.INTEGER,
        defaultValue: 0
    }
})

module.exports = User;