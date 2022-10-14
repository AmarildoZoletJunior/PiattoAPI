const sequelize = require("sequelize");
const connection = require("../../Connection/connection");
const ingredientes = require("../Ingredientes/Ingredientes")
const receita = connection.define("receitas", {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    nome: {
        type: sequelize.STRING,
        allowNull: false,
    },
    modo_de_preparo: {
        type: sequelize.TEXT,
        allowNull: false,
    },
    rendimento: {
        type: sequelize.STRING,
        allowNull: false,
    },
    UserId:{
        type: sequelize.INTEGER,
        references: {model: "usuarios", key: "id"},
        onDelete: "CASCADE",
        allowNull: false,
    }
});

//Criação n para n entre ingredientes e receita
receita.belongsToMany(ingredientes, {
    through: "receitas_has_ingredientes",
    as: "ReceitasIng",
    foreignKey:"ReceitaId",
});

ingredientes.belongsToMany(receita, {
    through: "receitas_has_Ingredientes",
    as: "IngredientRec",
    foreignKey:"IngredientesId",
});
receita.sync({ force: false });

module.exports = receita;