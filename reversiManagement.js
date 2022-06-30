// IMPORTS
const fs = require("fs");
const rawdata = fs.readFileSync("./ReversiGames.json");
const games = JSON.parse(rawdata);
const crypto = require("crypto");

// CONSTANTES
const EMPTY = null;
const PLAY1 = "P1";
const PLAY2 = "P2";


function getOther(player){
    if(player == PLAY1) return PLAY2
    if(player == PLAY2) return PLAY1
    return false;
}

/*--------------------CREAR TABLERO REVERSI-----------------------------------
Genera el tablero incial de reversi. Detalle a implementar:
Reversi puede iniciar con las fichas repartidas de disintas formas aleatoriamente 
*/
function generateBoard(){
    let board = [...Array(8)].map(e => Array(8).fill(EMPTY));
    board[3][3] = PLAY2; board[3][4] = PLAY1; board[4][3] = PLAY1; board[4][4] = PLAY2;
    return board;
}
/*--------------------CREAR IDS-----------------------------------
/*Generar un ID unico de tamaño recibido por parámetro */
function generateId(tamanio) {
    return crypto.randomBytes(tamanio).toString("hex");
}
/* Genera el objeto inicial de keys para una partida y lo retorna */
function newGameKeys() {
    return {
        boardId: generateId(20),
        player1Id: generateId(5),
        player2Id: null,
    };
}

/* ------------------------CREAR PARTIDA-------------------------- 
Devuelve un nuevo objeto game, con la informacion de la partida y actualiza el JSON.
Llama a las funciones newGameKeys() y generateBoard()
*/
function newGame() {
    const game = {
        keys: newGameKeys(),
        turn: null,
        board: generateBoard()
    };
    //Agrega la partida al JSON
    games.push(game);
    fs.writeFileSync("./ReversiGames.json", JSON.stringify(games), (err) => {
        if (err) reject(err);
    });
    return game;
}

/* ------------------------UNIRSE A PARTIDA-------------------------- 
Si encuentra la partida devuelve un objeto game, 
con la informacion de la partida y actualiza el JSON.
Llama a las función generateId()
*/
function joinGame(boardId) {
    //Busca una partida no llena para unirse con la boardId
    const index = games.findIndex(
        (e) => e.keys.boardId == boardId && e.keys.player2Id == null
    );

    //Si existe tal partida
    if (index!=-1) {
        const game = games[index];
        //Genera y guarda el nuevo id del jugador que esta entrando
        game.keys.player2Id = generateId(5);
        // Inicializa los turnos
        game.turn = "P1";
        //Actualiza partida en JSON
        games.splice(index, 1);
        games.push(game);
        fs.writeFileSync("./ReversiGames.json", JSON.stringify(games), (err) => {
            if (err) reject(err);
        });
        return game;
    }
    return false;
}

/* ------------------ACTUALIZAR ESTADO DE PARTIDA----------------- 
Cada movimiento genera un nuevo registro de la partida en el JSON, 
con el tablero nuevo y cambiando el turno 
*/
function updateGame(game){

    //Si existe la partida, guarda el index
    const index = games.findIndex(e => e.keys.boardId == game.keys.boardId);

    if (index!=-1) {

        //Actualiza esta partida en el array 
        const game = games[index];
        games.splice(index, 1);
        games.push(game);

        //Escribir la nueva info al JSON
        fs.writeFileSync("./ReversiGames.json", JSON.stringify(games), (err) => {
            if (err) reject(err);
        });
        return game;
    }
    return false;
}

/* ------------------REALIZAR MOVIMIENTO----------------- 
Validación, gestión de turnos.
Llama a updateGame() si es válido el turno 
*/
function move(boardId, playerId, square){

    let game = getGame(boardId);

    let couldMove = false;


    //Validar el turno, si es valido player indica qué jugador movió
    if(game){
        if ((playerId == game.keys.player1Id && game.turn == PLAY1) && validMove(game.board,square,PLAY1)){
            game.turn = PLAY2;
            couldMove = true;
            game.board = updateBoard(game.board, square, PLAY1);
        } else if ((playerId == game.keys.player2Id && game.turn == PLAY2) && validMove(game.board,square,PLAY2)){
            game.turn = PLAY1;
            couldMove = true;
            game.board = updateBoard(game.board, square, PLAY2);
        }
    }

    if (couldMove) {

        //Solo si pudo mover actualizamos el json
        return updateGame(game);
    }
    return false;
}

function validMove(board,square,play){

    x = parseInt(square[0]);
    y = parseInt(square[1]);

    //
    if(board[x][y] == EMPTY){

    
        if(
            validarEncierra(board,x,y,1,0,play)  ||  
            validarEncierra(board,x,y,1,1,play)  ||
            validarEncierra(board,x,y,0,1,play)  ||
            validarEncierra(board,x,y,-1,1,play) ||
            validarEncierra(board,x,y,-1,0,play) ||
            validarEncierra(board,x,y,-1,-1,play)||
            validarEncierra(board,x,y,0,-1,play) ||
            validarEncierra(board,x,y,1,-1,play)
        ){
            return true;
        }
    }

    return false;

}


function validarEncierra(board,x,y,xDir,yDir,play){

    let encierra = false;

    
    if((board[x + xDir] != undefined) && (board[x + xDir][y + yDir] != undefined)){
        //Si esta ficha adyacente es del adversario, debemos seguir en esa direccion para verificar si podemos encerrarla
        if((board[x + xDir][y + yDir] != null) && (board[x + xDir][y + yDir] != play)){

        
            //Mientras las fichas del recorrido sean del adversario
            while((board[x + xDir][y + yDir] != null) && !encierra){

                x += xDir;  y += yDir;

                if(board[x][y] == play){
                    encierra = true;
                }
                
            }

        }
    }
    
    return encierra;
}
function updateBoard(board, square, player){

    x = parseInt(square[0]);    y = parseInt(square[1]);
    
    //Modifica el casillero clickeado
    board[x][y] = player;

    let ActualizoAlIterar = true
    let counter = 0

    //Iterar hasta que una iteracion no actualice ningun casillero
    while(ActualizoAlIterar){

        ActualizoAlIterar = false;
        counter++;

        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                if(validateEveryDirection(board,i,j,player)) {
                    board[i][j] = player;
                    ActualizoAlIterar = true;
                }
            }
        }
        //Modificar todos los casilleros encerrados

        console.log('iteraciones actualizando las fichas: ',counter)
    }

    return board;
}

function validateVertical(board,x,y,player){

    let fromTop = false; let fromBottom = false;

    //Si esta encerrado por arriba
    let i = x + 1

    while(i < 8 && !fromTop){
        
        if(board[i][y] == null){
            break
        }


        if(board[i][y] == player){
            fromTop = true;
        }

        i++
    }

    /*for (let i = y+1; i < 8; i++) {
        if((board[x][i] != null) && (board[x][i] != player)){
            fromTop = true;
        }
    }*/
    i = x - 1
    while(i >= 0 && !fromBottom){
        
        if(board[i][y] == null){
            break
        }


        if(board[i][y] == player){
            fromBottom = true;
        }

        i--
    }
    //Si esta encerrado por abajo
    /*for (let i = y-1; i >= 0; i--) {
        if((board[x][i] != null) && (board[x][i] != player)){
            fromBottom = true;
        }
    }*/
    console.log("/n")
    console.log(`X: ${x}    Y: ${y}`)
    console.log("/n")
        console.log((fromTop && fromBottom))
        console.log(fromBottom)
        console.log(fromTop)
    console.log("/n")

    if(fromTop && fromBottom) return true; else return false;
}
function validateHorizontal(board,x,y,player){

    let fromRight = false, fromLeft = false

    //Si esta encerrado por la derecha
    for (let i = x; i < 8; i++) {
        if((board[i][y] != null) && (board[i][y] != player)){
            fromRight = true;
        }
    }

    //Si esta encerrado por la izquierda
    for (let i = x; i >= 0; i--) {
        if((board[i][y] != null) && (board[i][y] != player)){
            fromLeft = true;
        }
    }

    if(fromRight && fromLeft) return true; else return false;
}
function validateDiagonals(board,x,y,player){

    let fromTopLeft = false, fromBottomRight = false
    let fromTopRight = false, fromBottomLeft = false

    //Si esta encerrado por la diagonal desde arriba a la izquierda
    for (let cant = 0; cant < 8; cant++) {
        if((board[x-cant] != undefined) && (board[x-cant][y+cant] != undefined )){
            if((board[x-cant][y+cant] != null) && (board[x-cant][y+cant] != player))
                fromTopLeft = true;
        }
    }
    //Si esta encerrado por la diagonal desde abajo a la derecha
    for (let cant = 0; cant < 8; cant++) {
        if((board[x+cant] != undefined) && (board[x+cant][y-cant] != undefined)){
            if((board[x+cant][y-cant] != null) && (board[x+cant][y-cant] != player))
                fromBottomRight = true;
        }
    }


    //Si esta encerrado por la diagonal desde arriba a la derecha
    for (let cant = 0; cant < 8; cant++) {
        if((board[x+cant] != undefined) && (board[x+cant][y+cant] != undefined)){
            if((board[x+cant][y+cant] != null) && (board[x+cant][y+cant] != player))
                fromTopRight = true;
        }
    }
    //Si esta encerrado por la diagonal desde abajo a la izqierda
    for (let cant = 0; cant < 8; cant++) {
        if((board[x-cant] != undefined) && (board[x-cant][y-cant] != undefined)){
            if((board[x-cant][y-cant] != null) && (board[x-cant][y-cant] != player))
                fromBottomLeft = true;
        }
    }
    if((fromTopLeft && fromBottomRight) || (fromTopRight && fromBottomLeft)) return true; else return false;
}

//Esta funcion recibe un casillero y comprueba si esta encerrado por fichas del color contrario, si asi sucede retorna true
function validateEveryDirection(board,x,y,player){
    if(board[x][y] == getOther(player)){
        if(validateVertical(board,x,y,player) /*|| validateHorizontal(board,x,y,player) || validateDiagonals(board,x,y,player)*/)
            return true; 
    }
    return false
}

/* ------------------OBTENER ESTADO DE LA PARTIDA----------------- 
Retorna el estado de la partida si es existente, sino retorna false
*/
function getGame(boardId){
    //Busca el juego por boardId
    return games.find((e) => e.keys.boardId == boardId);
}

module.exports = {
    newGame,
    joinGame,
    getGame,
    move
};
