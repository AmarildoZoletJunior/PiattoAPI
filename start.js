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
const UsuariosReceitas = require("./Database/Models/Migrations/UsuarioReceita/Usuarios_has_Receitas");
const ReceitasIngredientes = require("./Database/Models/Migrations/ReceitaIngrediente/Receita_has_Ingredientes");

//Configurações
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());


//Deletar dos favoritos
app.delete("/favoritos/:id",(req,res)=>{
    let id = req.params.id;
    let idUsuario = req.body.idUsuario;

    UsuariosReceitas.destroy({
        where:{ReceitaId:id,UsuarioId:idUsuario}
    }).then((resposta)=>{
        console.log(resposta)
    })
})

//Adicionar aos favoritos
app.post("/favoritos/:id",(req,res)=>{
    let id = req.params.id;
    let idUsuario = req.body.idUsuario;
    UsuariosReceitas.create({
        UsuarioId: idUsuario,
        ReceitaId:id
    }).then((resposta)=>{
        console.log("criado")
    })

})

//Listar favoritos de um usuario
app.get("/favoritos/:id",(req,res)=>{
    let id = req.params.id;
    UsuariosReceitas.findAll({where:{UsuarioId:id},raw:true}).then(async (resposta)=>{
        let array = [];
        await resposta.forEach(function(resp){
             array.push(resp.ReceitaId);
        });
        console.log(array)
        await Receitas.findAll({where:{id:{[Op.and]:[array]}},raw:true}).then((resposta)=>{
             res.json(resposta)
             console.log(resposta)
        });
    });
})


//Receita Solo
app.get("/receita/:id",async (req,res)=>{
    let id = req.params.id;
    let array = [];
    await Receitas.findAll({where:{id:id}}).then(async(resposta)=>{
        resposta.forEach(function(retorno){
            ReceitasIngredientes.findAll({where:{ReceitaId:retorno.id}}).then(async (resposta)=>{
            await resposta.forEach(function(retorno){
                    array.push(retorno.IngredientesId);
                });
            })
        })

        setTimeout(()=>{     
        ReceitasIngredientes.findAll({where:{ReceitaId:id}}).then((resposta2)=>{
            res.json({Receita: resposta,ingredientes:resposta2});
            console.log(resposta);
        })
     },1500)
    }).catch((erro)=>{
        console.log(erro)
    })
})


//Função postar receita
app.post("/receita",async (req,res)=>{
    let idUsuario = req.body.idUsuario;
    let nomeReceita = req.body.nome;
    let modoPreparo = req.body.preparo;
    let rendimento = req.body.rendimento;
    let ingredientes = req.body.ingredientes;
    let quantidade = req.body.quantidade;
    let medida = req.body.medida;


    let ArrayIngredientes = ingredientes.split(",");
    let arrayNovoIngredientes = await ArrayIngredientes.reduce(function(pV,cv){
        let novo = Number(cv);
        pV.push(novo);
        return pV;
       },[]);
    let ArrayQuantidade = quantidade.split(",");
    let arrayNovoQuantidade = await ArrayQuantidade.reduce(function(pV,cv){
        let novo = Number(cv);
        pV.push(novo);
        return pV;
       },[]);
    

   await Receitas.create({
        nome:nomeReceita,
        modo_de_preparo:modoPreparo,
        rendimento: rendimento,
        UserId: idUsuario,
    }).then(async(res)=>{
        for(let i = 0; i < arrayNovoIngredientes.length; i++ ){
            ReceitasIngredientes.create({
                ReceitaId:res.id,
                IngredientesId:arrayNovoIngredientes[i],
                MedidaId:medida,
                Quantidade:arrayNovoQuantidade[i],
            }).then(()=>{
                console.log("Criado os ingredientes")
            })
        }
    }).catch((err)=>{
        console.log(err)
    })
})

//receitas lista principal
app.get("/receitas",async(req,res)=>{
    let decisao = req.body.decisao;
    let arra = req.body.id;
    var final = [];
    //Passa de string para array
    let novo = arra.split(",");
    //Transforma todos os numeros de string Para Number
    let arrayNovo = await novo.reduce(function(pV,cv){
     let novo = Number(cv);
     pV.push(novo);
     return pV;
    },[]);
    //Condição 1 caso pessoa selecione 1 ingrediente retorna todos as receitas que contem aquele ingrediente
    if(await arrayNovo.length === 1){
        //Efetua busca pelo id do ingrediente.
        await ReceitasIngredientes.findAll({where:{IngredientesId:arrayNovo}}).then((resposta)=>{
            let arrayReceita = [];
            resposta.forEach(function await(resposta){
                //Adiciona todas os ids de receitas existente naquela busca
                arrayReceita.push(resposta.ReceitaId);
            })
            //Retorna todas as receitas que tem aquele ingrediente
            Receitas.findAll({where:{id:arrayReceita}}).then((resposta)=>{
                res.json(resposta)
            })
        })  
    
    }else if(arrayNovo.length > 1){  //Condição numero 2 ( Caso a pessoa digite mais de um ingrediente, vai retornar somente receitas com aqueles ingredientes)
        //Procura por todas as receitas que tem aqueles ingredientes
        await ReceitasIngredientes.findAll({where:{IngredientesId:arrayNovo}}).then(async (resposta)=>{
            let arrayReceitas = [];
            await resposta.forEach(function(receitas){
            //Adiciona em um array todas as receitas que achou
            arrayReceitas.push(receitas.ReceitaId)
           })
           let arraySemRepetição = [];
           //Faz a comparação e elimina todos os numeros repetidos do array arrayReceitas
           let aux = arrayReceitas.filter(function async(elemento, i) {
            if(arrayReceitas.indexOf(elemento) === i) {
                arraySemRepetição.push(elemento)
            }
            return arrayReceitas.indexOf(elemento) === i;
        });
        //Inicia leitura do array que contem os numeros sem repetição
        aux.forEach(function(resposta) {
            //Inicia busca no banco de todas as receitas que contem o id passados no array
            ReceitasIngredientes.findAll({where:{ReceitaId:resposta}}).then((r)=>{
                let arra = [];
                //Inicia leitura do array resposta da busca
                r.forEach(function(ra){
                //Adiciona no array o Id de todos os ingredientes que cada receita contem
                    arra.push(ra.IngredientesId);
                });
                //Função de comparação
                const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
                //Se true, inicia uma pesquisa direta com apenas os ingredientes selecionados
                if(decisao){
                    if(equals(arra,arrayNovo)){
                        let arr = [];
                        //iniciando leitura de array r
                          r.forEach(function async(final2){
                            //Adicionando em novo array todos os id daquelas receitas que batem com a condição
                             arr.push(final2.ReceitaId);
                          })
                          let novo = [];
                          //Novamente função de eliminar IDS iguais
                          let aux = arr.filter(function async(elemento, i) {
                            if(arr.indexOf(elemento) === i) {
                                 novo.push(elemento)
                            }
                            return arr.indexOf(elemento) === i;
                        });
                        console.log(aux[0]);
                        //Adicionando id que sobrou no array, em outro array chamado final.
                        final.push(aux[0]);
                    }else{
                        return;
                    }
                }else{   //Se falso ele faz a pesquisa indireta trazendo receitas que contem aqueles ingredientes mais alguns ingredientes
                    if(arrayNovo.every(elemento => arra.includes(elemento))){
                    let arr = [];
                    //iniciando leitura de array r
                      r.forEach(function async(final2){
                        //Adicionando em novo array todos os id daquelas receitas que batem com a condição
                         arr.push(final2.ReceitaId);
                      })
                      let novo = [];
                      //Novamente função de eliminar IDS iguais
                      let aux = arr.filter(function async(elemento, i) {
                        if(arr.indexOf(elemento) === i) {
                             novo.push(elemento)
                        }
                        return arr.indexOf(elemento) === i;
                    });
                    console.log(aux[0]);
                    //Adicionando id que sobrou no array, em outro array chamado final.
                    final.push(aux[0]);
                }else{
                    return;
                }
            }
            })
        })
        //Adicionando tempo para renderizar as buscas
        setTimeout(()=>{
            Receitas.findAll({where:{id:{[Op.and]:[final]}},raw:true}).then((resposta)=>{
                res.json(resposta)
            }).catch((erro)=>{
                console.log(erro)
            })

        },1500)
        }).catch((erro)=>{
    console.log(erro)
        })
    }
})

//Listar receitas criadas pelo usuario
app.get("/receitasCriadas",(req,res)=>{
    let idUsuario = req.body.idUsuario;
    Receitas.findAll({where:{UserId:idUsuario}}).then((resposta)=>{
        console.log(resposta);
        res.json(resposta)
    })
})

//Remover receitas criadas pelo usuario
app.delete("/receitasCriadas",(req,res)=>{
    let idReceita = req.body.idReceita;
    Receitas.destroy({where:{id:idReceita}}).then((resposta)=>{
        console.log("Deletada com sucesso")
    })
})






//Start server.
app.listen(PORT,()=>{
    try{
    console.log("Servidor iniciado em: http://localhost:3000");
    } catch(erro){
        console.log("Ocorreu um erro no servidor: " + erro);
    }
})