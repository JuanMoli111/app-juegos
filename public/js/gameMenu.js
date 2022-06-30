
/*  
-----------------------------CREAR PARTIDA-------------------------
newGame() crea una partida (player1).
Llama a startGame().
*/
function newGame(){
    const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        }
    }
    fetch('/reversi/new',options)
    .then(response => response.json())
    .then(gameData => startGame(gameData))
    .catch(err => console.log(err));
}

/*  
----------------------------UNIRSE A PARTIDA--------------------------
joinGame() se une a una partida (player2).
Llama a startGame() y a pollGame() en caso de poder unirse.
*/
function joinGame(){
    //Envia la boardId ingresada por el cliente
    const data = {
        boardId: document.getElementById("joinId").value,
    }
    const options = {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    fetch('/reversi/join',options)
    .then(response => {
        if (response.ok) {
            return response.json()
        } else{
            throw new Error ("ID de tablero inválida.");
        }
    })
    .then(gameData => {
        // Si se unió comienza el juego y escucha el estado de la partida
        startGame(gameData)
        pollGame(gameData)
    })
    .catch(err => console.log(err));
}

/*  
----------------------------EMPEZAR PARTIDA--------------------------
startGame() se ejecuta cuando un cliente crea o se suma a una partida,
elimina el menu y muestra el juego, inicializa variables de sessionStorage.
*/
function startGame(gameData){
    //Oculta el menu
    console.log(gameData);
    document.getElementById("game-menu").style.display = 'none';
    document.getElementById("menu").style.display = 'none';
    //Muestra el juego
    const gameElement = document.getElementById("game");
    gameElement.style.display = 'flex';
    //Muestro qué player es, inicializo variables en sessionStorage
    const player = document.getElementById("player-data");
    sessionStorage.clear();
    sessionStorage.setItem('boardId',gameData.keys.boardId);
    /* Si el player2Id es null es una partida recién creada y es el P1. 
       Si el player2Id no es null es el P2 uniéndose a una partida */
    if (gameData.keys.player2Id == null){
        sessionStorage.setItem('playerId', gameData.keys.player1Id);
        player.innerHTML = `Jugador 1`
    } else{
        sessionStorage.setItem('playerId', gameData.keys.player2Id);
        player.innerHTML = `Jugador 2`       
    }
    player.innerHTML += `<br> Id del tablero: ${gameData.keys.boardId}`;
    
    updateBoard(gameData);

}

/*  
-----------------------------HACER UN MOVIMIENTO------------------------
fetchTurn() se ejecuta cuando un jugador mueve su turno.
Llama a updateBoard() y a pollGame() en caso de haber podido realizar el movimiento 
(es decir si existe la partida y es su turno).
*/
function fetchTurn(square){

    console.log('fetchTurn recibe el casillero tal ',square);


    //Envía la playerId que movió
    const data = {
        playerId: sessionStorage.getItem('playerId'),
        square: square
    }

    const options = {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    fetch(`/reversi/move/${sessionStorage.getItem('boardId')}`,options)
    .then(response => {
        if (response.ok) {
            console.log('Pude mover');
            return response.json()
        } else{
            throw new Error ("No es posible hacer el movimiento.");
        }
    })
    .then(gameData => {
        /* Si pudo mover, se actualiza el tablero 
        y se reinicia el loop de pollGame() */

        updateBoard(gameData);
        pollGame(gameData);
    })
    .catch(err => console.log(err));

}

/*  
-----------------------OBTENER ESTADO DEL TABLERO--------------------
pollGame() realiza un fetch para recibir el estado de partida cada dos segundos: 
Comienza cuando se realiza movimiento.
Se detiene cuando se reciben cambios. 
LLama a updateBoard() si se realizaron cambios en la partida
*/
function pollGame(currentGame){
    let idInterval = setInterval(function() { 
        fetch(`/reversi/get/${currentGame.keys.boardId}`)
        .then(response => {
            if (response.ok) {
                return response.json()
            } else{
                throw new Error ("No es posible obtener el estado de la partida.");
            }
        })
        .then(latestGame => {
            /* Si recibo cambios actualizo el juego 
            y es mi turno, por lo que dejo de obtener el estado de la partida */
            if(currentGame.turn == latestGame.turn){
                console.log('NADA CAMBIO SIGAMOS FETCHIANDO')
            } else{
                console.log('EL OTRO PLAYER MOVIO!!!')
                updateBoard(latestGame);
                clearInterval(idInterval);
            } 
            
        })
        .catch(err => console.log(err))
    }, 2000);
}

/*  
-----------------------------ACTUALIZAR TABLERO------------------------
updateBoard() Actualiza el tablero con la información recibida
*/
function updateBoard(gameData){


    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){

            let id = `${i}${j}`;
            let button = document.getElementById(id);

            button.textContent = `   ${gameData.board[i][j]}  `
        
        }
    }


}