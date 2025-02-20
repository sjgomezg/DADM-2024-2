import React, { use, useState } from 'react';
import { View, Text, Button, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { supabase } from '../supabaseClient.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [mvCrear, setmvCrear] = useState(false)
  const [mvBuscar, setmvBuscar] = useState(false)
  const [nickName, setNickName] = useState("")
  const [games, setGames] = useState([]);

  const createGame = async () => {
    if(nickName!=""){
        const { data, error } = await supabase
          .from('games')
          .insert([{ player_1: nickName, board: Array(9).fill(null), status: 'waiting', turn: nickName }])
          .select();
        if (error) {
            console.error(error);
            console.log(error)
        }
        else navigation.navigate('OnlineGame', data);
      }
    else{
      alert('Escribe un nombre de jugador')
    }
  };

  async function fetchGames() {
    try {
      // Realizamos la consulta a la tabla 'games'
      const { data, error } = await supabase
        .from('games') // El nombre de la tabla que quieres consultar
        .select('*'); // Obtiene todas las columnas de la tabla
  
      if (error) {
        throw error;
      }
      // Si la consulta es exitosa, devuelve los datos
      setGames(data);
      setmvBuscar(true)
    } catch (error) {
      console.error('Error al obtener los juegos:', error.message);
      return null;
    }
  }
  async function joinGame(gameInfo) {
    if(nickName!=""){
      try {
        await AsyncStorage.setItem('@player_name', nickName);
        const { data, error } = await supabase
          .from('games')
          .update({ player_2: nickName, status: "join" })
          .eq('id', gameInfo.id)
          .select();
        if (error) {
          console.error("Error en Supabase:", error);
        } else if (!data) {
          console.error("Supabase no devolvió datos válidos.");
        } else {
          navigation.navigate('OnlineP2', data);
        }
      } catch (e) {
        console.error('Error al guardar el estado del juego:', e);
      }
    }else{
      alert('Escribe un nombre de jugador')
    } 
    
  }
  return (
    <View style={styles.ViewContainer}>

        <View style={styles.buttonWrapper}>
          <Button title="Solo" onPress={()=>navigation.navigate('Game')}/>
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Buscar partida online" color="#007BFF" onPress={()=>fetchGames()}/>
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Crear Partida online" color="#28A745" onPress={()=>setmvCrear(true)}/>
        </View>


        <Modal
          visible={mvBuscar}
          transparent={true} // Fondo semitransparente
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
            <TextInput
              style={{height: 40, padding: 5, borderRadius:3, borderWidth:3,width:'70%'}}
              placeholder="Nombre de Usuario"
              onChangeText={newText => setNickName(newText)}
              defaultValue={nickName}
            />
              <FlatList
                  data={games}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.gameItem} 
                      onPress={() => joinGame(item)}
                    >
                      <Text style={styles.gameText}>Usuario: {item.player_1}</Text>
                      <Text style={styles.gameText}>ID_Partida:{item.id}</Text>
                    </TouchableOpacity>
                  )}
                />
              <View style={styles.buttonWrapper}>
                <Button title="Cerrar" color="red" onPress={()=>setmvBuscar(false)}/>
              </View>
            </View>
          </View>
        </Modal>


        <Modal
          visible={mvCrear}
          transparent={true} // Fondo semitransparente
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
            <Text>Crear partida online</Text>
            <TextInput
              style={{height: 40, padding: 5, borderRadius:3, borderWidth:3,width:'70%'}}
              placeholder="Nombre de Usuario"
              onChangeText={newText => setNickName(newText)}
              defaultValue={nickName}
            />  
            <View style={styles.buttonWrapper}>
              <Button title="Crear" color="#28A745" onPress={()=>createGame()}/>
            </View> 
            <View style={styles.buttonWrapper}>
              <Button title="Cerrar" color="red" onPress={()=>setmvCrear(false)}/>
            </View> 
            </View>
          </View>
        </Modal>


    </View>
  );
};
const styles = StyleSheet.create({
  ViewContainer: {
    flex: 1,
    justifyContent: "center", // Centra verticalmente
    alignItems: "center", // Centra horizontalmente
    backgroundColor: "#f5f5f5", // Color de fondo opcional
  },
  buttonWrapper: {
    width: 200, // Ancho fijo para los botones
    marginVertical: 10, // Espaciado entre botones
    borderRadius: 10, // Bordes redondeados
    overflow: "hidden", // Para que el botón respete borderRadius
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semitransparente
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center", // Alinea el contenido a la izquierda
  },
  scrollContainer: {
    maxHeight: "90%", // Permite el desplazamiento dentro del modal
  },
  gameItem: {
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    marginVertical: 5,
  },
  gameText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HomeScreen;
