//Importando bibliotecas
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Op } = require("sequelize");

//Iniciando banco e express
const connection = require("./Database/Connection/connection");
const app = express();

//Importando models
const Usuarios = require("./Database/Models/Usuarios/Usuarios")
const Receitas = require("./Database/Models/Receitas/Receita")
const ingredientes = require("./Database/Models/Ingredientes/Ingredientes");
const Medidas = require("./Database/Models/Medidas/Medidas");
const UsuariosReceitas = require("./Database/Models/Migrations/Usuarios_has_Receitas");
const ReceitasIngredientes = require("./Database/Models/Migrations/Receita_has_Ingredientes");

//Configurações
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

app.post("/",(req,res)=>{
    UsuariosReceitas.create({
        UsuarioId:50,
        ReceitaId: 10,
    })
})


//Sera obrigado mandar o id do usuario para esta requisição
app.get("/favoritos",(req,res)=>{
    let id = req.body.id;
    UsuariosReceitas.findAll({where:{UsuarioId:id},raw:true}).then(async (resposta)=>{
        let array = [];
        await resposta.forEach(function(resp){
            array.push(resp.ReceitaId);
        });
        console.log(array)
        await Receitas.findAll({where:{id:{[Op.and]:[array]}},raw:true}).then((resposta)=>{
             res.json(resposta)
             console.log(resposta)
        })
    });
})





//Start server.
app.listen(PORT,()=>{
    try{
    console.log("Servidor iniciado em: http://localhost:3000");
    } catch(erro){
        console.log("Ocorreu um erro no servidor: " + erro);
    }
})