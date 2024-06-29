const Sequalize = require('sequelize');
const sequelize = require('../utils/database.js');

const debateDuples = sequelize.define('debateDuples', {
    id: {
        type: Sequalize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idDebate: {
        type: Sequalize.INTEGER,
        allowNull: false,
        references: {
            model: 'debate',
            key: 'id',
        }
    },
    idDuple: {
        type: Sequalize.INTEGER,
        allowNull: false,
        references: {
            model: 'duple',
            key: 'id',
        }
    }
})

module.exports = debateDuples