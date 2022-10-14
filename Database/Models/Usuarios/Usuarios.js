const Sequelize = require("sequelize");
const connection = require("../../Connection/connection");

const Usuarios = connection.define("Usuarios",{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    nome:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    senha:{
        type: Sequelize.STRING,
        allowNull: false,
    }
})


Usuarios.sync({force:false});

module.exports = Usuarios;