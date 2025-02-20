import React, { useState , useEffect} from 'react';
import { Dimensions, View, Text, TouchableOpacity, Alert, Button, Modal, BackHandler , Image} from 'react-native';
import {Audio} from 'expo-av';
import styles from '../styles.js';
import XImage from '../assets/XImage.png';
import OImage from '../assets/OImage.png';
import { supabase } from '../supabaseClient.js';




//Funcion para asignar la imagen en cada cuadro
function Square({ value, onSquareClick }) {
  return (
    <TouchableOpacity style={styles.square} onPress={onSquareClick}>
      {value === 'X' && <Image source={XImage} style={styles.squareImage} />}
      {value === 'O' && <Image source={OImage} style={styles.squareImage} />}
      {value === null && <Text style={{ color: 'transparent' }}> </Text>}
    </TouchableOpacity>
  );
}

// Generador y controlador del tablero
function Board({  squares, onPlay , pX, pO, ties, isBoardLocked,turn,player1, player2}) {
  
  function handleClick(i) {
    if (isBoardLocked || calculateWinner(squares) || squares[i]) {
      console.log('Tablero 1 bloqueado');
    }else{
      const nextSquares = squares.slice();
      if (turn === player1) {
        nextSquares[i] = 'X';      
      } else {
        nextSquares[i] = 'O';      
      }
      onPlay(nextSquares);
    }
    
  }

  const winner = calculateWinner(squares);
  let status;

  if(turn === player1) status = 'Tu turno';
  else status = 'Turno de ' + player2;
  
  if (winner) {
    if (winner === 'X') status = '¡Ganaste!';
    if (winner === 'O') {
      status = 'Perdiste =(';
      Alert.alert('Juego termninado', 'Gano: ' + turn, [
        { text: '', style: 'cancel' },
        { text: 'Salir', onPress: () => BackHandler.exitApp() },
      ]);
    };
  } else if (squares.every(square => square !== null)) {
    status = 'Empate';
  }
  
  return (
    <View style={styles.boardContainer}>
      <Text style={styles.status}>{status}</Text>
      <View style={styles.boardRow}>
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </View>
      <View style={styles.boardRow}>
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </View>
      <View style={styles.boardRow}>
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </View>
      <Text style={styles.text}>X: {pX} ties: {ties} O: {pO} </Text>
    </View>
  );
}

// funcion general del juego
const Game = (gameInfo) => {
    const player1 = gameInfo.route.params[0].player_1;
    const [player2, setPlayer2] = useState(null)
    const id = gameInfo.route.params[0].id
    const [boardSquares, setBoardSquares] = useState(Array(9).fill(null));    
    const [turn, setTurn] = useState("");    
    const [pX,setPX] = useState(0);
    const [pO,setPO] = useState(0);
    const [ties,setTies] = useState(0);
    const [isBoardLocked, setBoardLocket] = useState(true);
    const[sound, setSound]= useState(null);
    const rutas = {
        w: require("../assets/win.mp3"),
        l: require("../assets/lose.mp3"),
        t: require("../assets/tie.mp3"),
        T: require('../assets/tap.mp3')
    }
    const [gameStatus,setGameStatus] = useState('waiting')
    // Deteccion de la orientacion de la pantalla
    const [orientation, setOrientation] = useState('portrait');


    useEffect(() => {        
        setTurn(gameInfo.route.params[0].turn)
        supabase
            .channel('partida:'+ gameInfo.route.params[0].id)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games' }, handleInserts)
            .subscribe()
        const updateOrientation = () =>{
        const {width, height} = Dimensions.get('window');
        setOrientation(width > height ? 'landscape' : 'portrait');
        };
        const subscription = Dimensions.addEventListener('change',updateOrientation);
        updateOrientation();
        return () => subscription?.remove();
    },[]);
  
    useEffect(() => {
        return () => {
        // Limpiar el sonido cuando el componente se desmonta
        if (sound) {
            sound.unloadAsync();
        }
        };
    }, [sound]);
  
    async function playSound(r,sound) {
        try {
        
        const { sound: newSound, status } = await Audio.Sound.createAsync(rutas[r]);
        
        // Verificar si el sonido se cargó correctamente
        if (status.isLoaded) {
            setSound(newSound);
            await newSound.playAsync(); // Reproducir sonido
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
        } else {
            console.error('El sonido no se cargó correctamente');
        }
        } catch (error) {
        console.error('Error al reproducir el sonido:', error);
        }
    }
    const finish=(player)=>{
      Alert.alert('Juego termninado', 'Gano: ' + player, [
        { text: '', style: 'cancel' },
        { text: 'Salir', onPress: () => BackHandler.exitApp() },
      ]);
    }

    async function handlePlay(nextSquares) {
        setBoardSquares(nextSquares);
        if (turn == player1) await playSound('T',sound);
            const winner = calculateWinner(nextSquares);
        if (winner) {
            if (winner === 'X') {
                await playSound('w',sound);
                setPX(prevPX => prevPX + 1);
                finish(player1);
            } else if (winner === 'O') {
                await playSound('l',sound);
                setPO(prevPO => prevPO + 1);
                finish(player2);
            }
        } else if (nextSquares.every(square => square !== null)) {
            setTies(prevTies => prevTies + 1); 
            await playSound('t',sound);      
        }
        updateGame(id, nextSquares, player2, gameStatus);
        setTurn(player2)

    }
    const updateGame = async (id, squares, turn, status)=>{
      setBoardLocket(true)
      const{data, error} = await supabase
      .from('games')
      .update({
        board: squares,
        turn: turn,
        status: status,
      })
      .eq('id', id)
    }
    

    function newGame(){
        setHistory([Array(9).fill(null)]); 
        setBoardLocket(false);
    }

    function resetGame() {
        setHistory([Array(9).fill(null)]); 
        setBoardLocket(false);
    }
    

  function exitApp() {
    Alert.alert('Salir', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: () => {
        BackHandler.exitApp()
      } },
    ]);
  }

  const handleInserts = (payload) => {
    console.log('Change received!', payload.new.turn, payload.new.status)
    console.log(payload.new.status === "ready")
    if(payload.new.turn===player1 && payload.new.status==='ready'){
        if(!player2) setPlayer2(payload.new.player_2)
        setBoardSquares(payload.new.board);
        setTurn(payload.new.turn); 
        setGameStatus(payload.new.status);
        setBoardLocket(false)
    }
    
  }  
  return (
    <View style={orientation === 'portrait'? styles.containerPortrait: styles.containerLandscape}>
      {/*tablero*/}
      
      <View style={styles.gameBoard}>
        <Board  squares={boardSquares} onPlay={handlePlay}  resetGame={resetGame} 
            pX = {pX} pO={pO} ties={ties} setPX = {setPX} setPO={setPO} turn={turn}
          setTies = {setTies} isBoardLocked={isBoardLocked} player1={player1} player2={player2}
        />
      </View>
      {/*botones*/}
      <View style={orientation === 'portrait'? styles.controlsPortrait: styles.controlsLandscape}>
        <TouchableOpacity style={styles.bottomButton} onPress={exitApp}>
        <Image 
            style={styles.tinyLogo}
            source={require('../assets/exit.png')}
          />
          <Text style={styles.buttonText}>Salir</Text>
        </TouchableOpacity>
      </View>    
      <Text>{gameStatus}</Text>  
    </View>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default Game;