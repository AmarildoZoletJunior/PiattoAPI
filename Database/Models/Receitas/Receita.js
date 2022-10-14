const sequelize = require("sequelize");
const connection = require("../../Connection/connection");
const ingredientes = require("../Ingredientes/Ingredientes");
const Usuarios = require("./../Usuarios/Usuarios")
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

// Criação n para n entre ingredientes e receita
receita.belongsToMany(ingredientes, {
    through: "receitas_has_ingredientes",
    as: "ReceitasIng",
    foreignKey:"ReceitaId",
});

ingredientes.belongsToMany(receita, {
    through: "receitas_has_ingredientes",
    as: "IngredientRec",
    foreignKey:"IngredientesId",
});








Usuarios.belongsToMany(receita, {
    through: "usuario_has_receitas",
    as: "User_Receita",
    foreignKey: 'UserId',
});

receita.belongsToMany(Usuarios, {
    through: "usuario_has_receitas",
    as: "User_Receit",
    foreignKey: 'ReceitaId',
});

ingredientes.sync({force:false});
Usuarios.sync({force:false})
receita.sync({ force: false });

module.exports = receita;