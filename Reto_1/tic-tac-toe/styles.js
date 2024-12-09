import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    containerPortrait: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center', // Centrado vertical
      alignItems: 'center', // Centrado horizontal
      padding: 20,
    },
    containerLandscape:{
        flex:1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,

    },
    controlsPortrait: {
        flexDirection: 'row',
        marginTop: 20,
    },
    controlsLandscape: {
        flex: -1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#f0f0f0',
        padding: 15,
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
        height:100,
        width:150,
        flex: 1,
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 5,
        marginVertical: 5,
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

  export default styles;