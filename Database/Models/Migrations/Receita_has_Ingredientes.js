const sequelize = require("sequelize");
const connection = require("../../Connection/connection");

const receitasIngredientes = connection.define("receitas_has_ingredientes",{
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
        references: {model: "medidas", key: "id"},
        onDelete: "CASCADE",
        allowNull: false,
    }
})

receitasIngredientes.sync({force:false});

module.exports = receitasIngredientes;