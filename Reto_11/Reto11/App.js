import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator, ScrollView } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function App() {
  const [messages, setMessages] = useState([]); // Array para almacenar los mensajes del chat
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const scrollViewRef = useRef(); // Referencia al ScrollView

  const genAI = new GoogleGenerativeAI('AIzaSyDmWFPFA5JlkPOFanFQjQDhkTPI9o8FecE');
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  useEffect(() => {
    const initialPrompt = "Hola";
    request(initialPrompt);
  }, []);

  const request = async (prompt) => {
    setIsLoading(true);
    setCanSend(false);
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Actualiza el array de mensajes con el mensaje del usuario y la respuesta
      setMessages([
        ...messages,
        { text: prompt, sender: 'user' },
        { text: responseText, sender: 'bot' },
      ]);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setMessages([
        ...messages,
        { text: prompt, sender: 'user' },
        { text: "Error al obtener la respuesta.", sender: 'bot' },
      ]);
    } finally {
      setIsLoading(false);
      setCanSend(true);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() !== '' && canSend) {
      request(message);
      setMessage('');
    }
  };

  // Función para scroll al final del ScrollView
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // Llama a scrollToBottom después de que se actualizan los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        <ScrollView
          ref={scrollViewRef} // Asigna la referencia al ScrollView
          contentContainerStyle={styles.scrollViewContent} // Estilos para el contenido del ScrollView
        >
          {messages.map((msg, index) => (
            <View key={index} style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
              <Text>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          onChangeText={(text) => setMessage(text)}
          value={message}
          multiline={true}
          numberOfLines={3}
          onSubmitEditing={handleSendMessage}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Button
            title="Enviar"
            onPress={handleSendMessage}
            disabled={!canSend}
          />
        )}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  chatContainer: {
    flex: 1, // El chat ocupa la mayor parte del espacio
    marginBottom: 20, // Espacio entre el chat y el input
  },
  scrollViewContent: {
    padding: 10, // Padding para el contenido del ScrollView
  },
  userMessage: {
    alignSelf: 'flex-end', // Alinea los mensajes del usuario a la derecha
    backgroundColor: '#DCF8C6', // Color de fondo para los mensajes del usuario
    borderRadius: 10,
    padding: 10,
    marginVertical: 5, // Margen vertical entre mensajes
  },
  botMessage: {
    alignSelf: 'flex-start', // Alinea los mensajes del bot a la izquierda
    backgroundColor: '#E5E7EB', // Color de fondo para los mensajes del bot
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 10
  },
});