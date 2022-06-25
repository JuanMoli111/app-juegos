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


//Reversi
app.post("/reversi/new", newReversi);
app.patch("/reversi/join", joinReversi);
app.patch("/reversi/move/:boardId", moveReversi);
app.get("/reversi/move/:boardId", moveReversi);
app.get("/reversi/get/:boardId", getReversi);


    //player 1 entro a reversi, le envia la informacion del nuevo tablero
    function newReversi(req, res) {


        console.log('ZZZZZZZZ   NEW REVERSI')
        console.log(req.params)
        console.log('ZZZZZZZZ')
        console.log(req.body)
        console.log('ZZZZZZZZ')

        const board = reversiManagement.newGame();

        const player1Id = board.keys.player1Id;

        console.log(board);
        res.status(200).send(board);
    }

    //Player 2 entro a reversi, le envia la informacion del tablero
    function joinReversi(req, res) {

        console.log('ZZZZZZZZ   JOIN REVERSI')
        console.log(req.params)
        console.log('ZZZZZZZZ')
        console.log(req.body)
        console.log('ZZZZZZZZ')
        const board = reversiManagement.joinGame(req.body.boardId);
        //const player2Id = req.body.keys.player2Id;

        if (board) {
            res.status(200).send(board);
        } else {
            res.status(400).send();
        }
    }


    //el jugador hizo un movimiento, verificamos con su ID si existe su partida y si es su turno
    function moveReversi(req, res){

        //Busca la partida segun el boardId en request params
        const game = reversiManagement.getGame(req.params.boardId);
        
        

        console.log('MOVED, REQ BODY:')
        console.log(req.body);
        console.log('REQ PARAMS:')
        console.log(req.params);

        reversiManagement.updateGame(req.params.boardId)

        if(game){
            res.status(200).send(game);
        } else {
            res.status(400).send();
        }
    }

    //Retorna el estado de la partida constantemente si es existente
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