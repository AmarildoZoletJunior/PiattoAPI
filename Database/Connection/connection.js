//Importando bibliotecas
const Sequelize = require("sequelize");

//Config dot
require('dotenv').config();

//Configurações do servidor
const connection = new Sequelize(process.env.NOME_TABELA,process.env.USUARIO,process.env.SENHA_BANCO,{
    host: "localhost",
    dialect: "mysql",
    timezone: "-03:00",
})

//Autenticando servidor com banco
connection.authenticate().then(()=>{
    console.log("Conectado ao banco com sucesso");
}).catch((erro)=>{
    console.log("Ocorreu um erro ao conectar com o banco de dados: " + erro);
})

//Exportando módulo
module.exports = connection;