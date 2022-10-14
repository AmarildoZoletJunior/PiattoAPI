const sequelize = require("sequelize");
const connection = require("../../Connection/connection");

const medidas = connection.define("Medidas",{
    id:{
        type: sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    nome:{
        type: sequelize.STRING,
        allowNull: false,
    }
})

medidas.sync({force:false});

module.exports = medidas;