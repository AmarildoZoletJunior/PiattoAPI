const sequelize = require("sequelize");
const connection = require("../../Connection/connection");

const receitasIngredientes = connection.define("Receitas_has_Ingredientes",{
    id:{
        type: sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    ReceitaId:{
        type: sequelize.INTEGER,
        references: {model: "receitas", key: "id"},
        onDelete: "CASCADE",
        allowNull: false,
    },
    IngredientesId:{
        type: sequelize.INTEGER,
        references: {model: "ingredientes", key: "id"},
        onDelete: "CASCADE",
        allowNull: false,
    },
    UnidadeId:{
        type: sequelize.INTEGER,
        references: {model: "Medidas", key: "id"},
        onDelete: "CASCADE",
        allowNull: false,
    }
})

receitasIngredientes.sync({force:true});

module.exports = receitasIngredientes;