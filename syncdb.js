// Importa los modelos
const Guild = require('./models/guilds.js');
const User = require('./models/user.js');
const GuildUser = require('./models/guildUsers.js');
const sequelize = require('./utils/database.js');

// Definir las relaciones

// Sincronizar modelos
sequelize.sync({ alter: true }).then(() => {
    console.log('Database & tables created!');
}).catch(error => {
    console.error('Error creating database & tables:', error);
});