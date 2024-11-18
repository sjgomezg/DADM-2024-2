import React, { useState , useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

function Square({ value, onSquareClick }) {
  return (
    <TouchableOpacity style={styles.square} onPress={onSquareClick}>
      <Text style={styles.squareText}>{value}</Text>
    </TouchableOpacity>
  );
}




function Board({ xIsNext, squares, onPlay ,resetGame}) {
  const [pX,setPX] = useState(0);
  const [pO,setPO] = useState(0);
  const [ties,setTies] = useState(0);

  function reset(){
    resetGame();
  }

  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
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
  
  useEffect(() => {
    if (squares.every(square => square !== null) && !winner) {
      setTies(prevTies => prevTies + 1); // Incrementar el contador de empates solo si no hay ganador
    }
  },[squares]);

  useEffect(() => {
    if (winner) {
      if (winner === 'X') {
        setPX(prevPX => prevPX + 1);
      } else if (winner === 'O') {
        setPO(prevPO => prevPO + 1);
      } else {
        setTies(prevTies => prevTies + 1); 
      }
    }
  }, [winner]);

  if (winner) {
    status = 'Ganador: ' + winner;
  } else if (squares.every(square=> square !== null)){
    status = 'Empate';
  }else{
    status = 'Siguiente Jugador: ' + (xIsNext ? 'X' : 'O');
  }
  console.log(winner)
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
      <TouchableOpacity style={styles.resetButton} onPress={reset}>
        <Text style={styles.resetButtonText}>Reiniciar Juego</Text>
      </TouchableOpacity>
      <Text>X: {pX} ties: {ties} O: {pO}</Text>
    </View>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]); 
    setCurrentMove(0);
  }

  return (
    <View style={styles.container}>
      <View style={styles.gameBoard}>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}  resetGame={resetGame}/>
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
});
