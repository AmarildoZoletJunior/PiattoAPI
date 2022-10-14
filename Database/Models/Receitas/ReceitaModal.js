const sequelize = require("sequelize");
const connection = require("../../Connection/connection");
const ingredientes = require("../Ingredientes/Ingredientes");

const receita = connection.define("Receitas",{
    id:{
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    nome:{
        type: sequelize.STRING,
        allowNull: false,
    },
    modo_de_preparo:{
        type: sequelize.TEXT,
        allowNull: false,
    },
    rendimento:{
        type: sequelize.STRING,
        allowNull: false,
    }
});

receita.belongsToMany(ingredientes,{through: "receita_has_ingredientes"});

receita.sync({force:true});

module.exports = receita;