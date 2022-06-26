const { response } = require("express");
const express = require("express");
const reversiManagement = require("./reversiManagement");
const app = express();


//SETTINGS
//Nombre y Puerto de la app
app.set("appName", "App Juegos");
app.set("port", "3000");


// MIDDLEWARES?
//Setea el motor de views
app.set("view engine", "ejs");


// Setea la carpeta publica que usará la app ;
app.use(express.static("public"));

//Configura la app para interpretar formato json
app.use(express.json({ limit: "1mb" }));



//ROUTES
//Inicio y los juegos
app.get("/", (req, res) => {
    res.render("home", { titulo: "Home" });
});
app.get("/reversi", (req, res) => {
    res.render("reversi", { titulo: "Reversi" });
});
app.get("/battleship", (req, res) => {
    res.render("battleship", { titulo: "Battleship"});
});

/*app.get("/revesi/move/:boardId", (req, res)=>{
    res.render("reversi",{titulo:"Reversi",game:reversiManagement.getGame(boardId)})
})
*/

//Reversi
app.post("/reversi/new", newReversi);
app.patch("/reversi/join", joinReversi);
app.patch("/reversi/move/:boardId", moveReversi);
app.get("/reversi/move/:boardId", moveReversi);
app.get("/reversi/get/:boardId", getReversi);


    //player 1 entro a reversi, le envia la informacion del nuevo tablero
    function newReversi(req, res) {

        //Crea el tablero 
        const board = reversiManagement.newGame();


        //Response
        res.status(200).send(board);
    }

    //Player 2 entro a reversi, le envia la informacion del tablero
    function joinReversi(req, res) {

        //se una a la partida ( creando un nuevo registro) con el ID del player 2, devuelve el game que esta jugando
        const game = reversiManagement.joinGame(req.body.boardId);
        //const player2Id = req.body.keys.player2Id;
        if (game) {
            res.status(200).send(game);
        } else {
            res.status(400).send();
        }
    }


    //el jugador hizo un movimiento, verificamos con su ID si existe su partida y si es su turno
    function moveReversi(req, res){
        console.log('AAA', req.body.boardId)
        //Busca la partida segun el boardId en request params
        let game = reversiManagement.getGame(req.body.boardId);
        console.log(game);
        //Recibe en el body request el ID del player que jugo su turno
        let playerId = req.body.playerId;
        let couldMove = false;


        if(game != false){
            
            let isPlayer1 = (playerId == game.keys.player1Id);

            //Si pudo mover, cambia el turno, sino debe seguir esperando su turno

            //SI ES PLAYER1
            if(isPlayer1){
                if(game.turn == 'P1'){
                    console.log('PLAYER 1 PUDO MOVER');
                    game.turn = 'P2';
                    couldMove = true;
                }
                else if(game.turn == 'P2')
                    console.log('PLAYER 1 NO PUEDE MOVER')
            } else //SI ES PLAYER 2:
            {
                if(game.turn == 'P2'){
                    console.log('PLAYER 2 PUDO MOVER');
                    game.turn = 'P1';
                    couldMove = true;
                }
                else if(game.turn == 'P1')
                    console.log('PLAYER 2 NO PUEDE MOVER')
            }


            /*
            Aqui mannejariamos el cambio del tablero para mandarlo a guardar (game), luego en el respnse de esta peticion alteramos efectivamente el tablero 
            */


            //Solo si pudo mover actualizamos data y enviamos game en el response
            if(couldMove){
                //Manda el game con los turnos actualizados para que salve este nuevo registro del estado de la partida
                game = reversiManagement.updateGame(game)
                res.status(200).send(game);
            } else {
                res.status(400).send();   
            }
            //Sino response vacio
        } else               
        {
            res.status(400).send();
        }
    }

    //Retorna el estado mas reciente de la partida, si es que esta existe
    function getReversi(req, res){


        const game = reversiManagement.getGame(req.params.boardId);
        
        

        if (game) {
            res.status(200).send(game);
        } else {
            res.status(400).send();
        }

    }



//LISTEN
app.listen(app.get('port'), () => {
    console.log(app.get('appName'));
    console.log('Server on port', app.get('port'));
});