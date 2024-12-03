import React, { useState , useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Button, Modal, BackHandler , Image} from 'react-native';
import {Audio} from 'expo-av';
import XImage from './assets/XImage.png';
import OImage from './assets/OImage.png'


function Square({ value, onSquareClick }) {
  return (
    <TouchableOpacity style={styles.square} onPress={onSquareClick}>
      {value === 'X' && <Image source={XImage} style={styles.squareImage} />}
      {value === 'O' && <Image source={OImage} style={styles.squareImage} />}
      {value === null && <Text style={{ color: 'transparent' }}> </Text>}
    </TouchableOpacity>
  );
}

function Board({ xIsNext, squares, onPlay , pcMove, df, pX, pO, ties, isBoardLocked}) {
  
  useEffect(() => {
    if (!xIsNext && !calculateWinner(squares) && !isBoardLocked) {
      pcMove(df);
    }
  }, [xIsNext, squares, pcMove, df, isBoardLocked]);

  function handleClick(i) {
    if (isBoardLocked || calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';      
    } else {
      nextSquares[i] = 'O';      
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;

  if(xIsNext) status = 'Tu turno';
  else status = 'Turno de la maquina';
  
  if (winner) {
    if (winner === 'X') status = '¡Ganaste!';
    if (winner === 'O') status = 'Perdiste =(';
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
      <Text style={styles.text}>Dificultad: {df}</Text>
    </View>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [difficulty, setDifficulty] = useState('Facil');
  const [modalVisible, setModalVisible] = useState(false);
  const [pX,setPX] = useState(0);
  const [pO,setPO] = useState(0);
  const [ties,setTies] = useState(0);
  const [isBoardLocked, setBoardLocket] = useState(false);
  const[sound, setSound]= useState(null);
  const rutas = {
    w: require("./assets/win.mp3"),
    l: require("./assets/lose.mp3"),
    t: require("./assets/tie.mp3"),
    T: require('./assets/tap.mp3')
  }
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

  async function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    if (xIsNext) await playSound('T',sound);
    const winner = calculateWinner(nextSquares);
    if (winner) {
      if (winner === 'X') {
        await playSound('w',sound);
        setPX(prevPX => prevPX + 1);
      } else if (winner === 'O') {
        await playSound('l',sound);
        setPO(prevPO => prevPO + 1);
      }
    } else if (nextSquares.every(square => square !== null)) {
      await playSound('t',sound);
      setTies(prevTies => prevTies + 1); 
    }
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function newGame(){
    setHistory([Array(9).fill(null)]); 
    setCurrentMove(0);
    setBoardLocket(false);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]); 
    setCurrentMove(0);
    setPX(0);
    setPO(0);
    setTies(0);
    setBoardLocket(false);
  }

  function findBestMove(squares) {
    const squaresCopy = [...squares]; // Crear una copia del tablero
    let bestScore = -Infinity;
    let move = null;
  
    for (let i = 0; i < 9; i++) {
      if (!squaresCopy[i]) { // Casilla vacía
        squaresCopy[i] = 'O'; // Simular movimiento
        const score = minimax(squaresCopy, false); // Llamar a minimax
        squaresCopy[i] = null; // Revertir movimiento
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  function minimax(squares, isMaximizing) {
    const squaresCopy = [...squares]; // Crear una copia para evitar mutación
    const winner = calculateWinner(squaresCopy);
  
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    if (squaresCopy.every(square => square !== null)) return 0;
  
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squaresCopy[i]) {
          squaresCopy[i] = 'O'; // Simular movimiento
          const score = minimax(squaresCopy, false); // Llamada recursiva
          squaresCopy[i] = null; // Revertir movimiento
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squaresCopy[i]) {
          squaresCopy[i] = 'X'; // Simular movimiento
          const score = minimax(squaresCopy, true); // Llamada recursiva
          squaresCopy[i] = null; // Revertir movimiento
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function pcMove(df){
    const nextSquares = currentSquares.slice(); 
    setBoardLocket(true);
    await delay(2000);
    await playSound('T',sound);
    if(df=='Experto'){
      const bestMove = findBestMove(nextSquares);
      nextSquares[bestMove] = 'O';      
      handlePlay(nextSquares);
      setBoardLocket(false);
      return;
    }
    
    if(df=='Difícil'){
      for (let i = 0; i < 9; i++) {
        if (!nextSquares[i]) {
          const cpySquares = nextSquares.slice();
          cpySquares[i] = 'O';
          if (calculateWinner(cpySquares)) {            
            handlePlay(cpySquares); 
            setBoardLocket(false);
            return;
          }
        }
      }

      for (let i = 0; i < 9; i++) {
        if (!nextSquares[i]) {
          const cpySquares = nextSquares.slice();
          cpySquares[i] = 'X';
          if (calculateWinner(cpySquares)) {
            nextSquares[i] = 'O';            
            handlePlay(nextSquares);
            setBoardLocket(false);
            return;
          }
        }
      }
    }

    const emptySquares = nextSquares
      .map((value, index) => (value === null ? index : null))
      .filter(index => index !== null);

    const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    nextSquares[randomIndex] = 'O';
    
    handlePlay(nextSquares);
    setBoardLocket(false);
  }

  function exitApp() {
    Alert.alert('Salir', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: () => BackHandler.exitApp() },
    ]);
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.gameBoard}>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}  resetGame={resetGame} 
          pcMove={pcMove} df={difficulty} pX = {pX} pO={pO} ties={ties} setPX = {setPX} setPO={setPO} setTies = {setTies} isBoardLocked={isBoardLocked}
        />
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomButton} onPress={newGame}>
        <Image 
            style={styles.tinyLogo}
            source={require('./assets/newGame.png')}
          />
          <Text style={styles.buttonText}>Juego Nuevo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => setModalVisible(true)}>
          <Image 
            style={styles.tinyLogo}
            source={require('./assets/df.png')}
          />      
          <Text style={styles.buttonText}>Cambiar Dificultad</Text>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona Dificultad</Text>
              <TouchableOpacity onPress={() => { setDifficulty('Fácil'); setModalVisible(false); resetGame();}}>
                <Text style={styles.option}>Fácil</Text>
              </TouchableOpacity>            
              <TouchableOpacity onPress={() => { setDifficulty('Difícil'); setModalVisible(false); resetGame();}}>
                <Text style={styles.option}>Difícil</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setDifficulty('Experto'); setModalVisible(false); resetGame();}}>
                <Text style={styles.option}>Experto</Text>
              </TouchableOpacity>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={styles.bottomButton} onPress={exitApp}>
        <Image 
            style={styles.tinyLogo}
            source={require('./assets/exit.png')}
          />
          <Text style={styles.buttonText}>Salir</Text>
        </TouchableOpacity>        
      </View>      
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centrado vertical
    alignItems: 'center', // Centrado horizontal
    padding: 20,
  },
  gameBoard: {
    marginBottom: 20,
  },
  boardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  boardRow: {
    flexDirection: 'row',
  },
  square: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    margin: 2,
    borderRadius: 5,
  },
  squareText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  status: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameInfo: {
    marginTop: 20,
  },
  moveText: {
    fontSize: 16,
    color: '#007BFF',
    marginVertical: 5,
  },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  bottomButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 18,
    marginVertical: 10,
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
  },
  tinyLogo: {
    width: 40, // Ajusta el ancho según el diseño
    height: 40, // Ajusta la altura según el diseño
    resizeMode: 'contain', // Mantiene la proporción de la imagen
  },
  squareImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Para que la imagen no se deforme
  },

});
