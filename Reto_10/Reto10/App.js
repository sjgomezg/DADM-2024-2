import { Modal, View, Text, Button, StyleSheet, ScrollView, FlatList } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { useEffect, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';



const URL = 'http://www.datos.gov.co/resource/wwkg-r6te.json'


export default function App() {
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [valueM, setValueM] = useState(null);
  const [isFocusM, setIsFocusM] = useState(false);
  const [departamentos,setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [consulta, setConsulta] = useState([]);
  const [evento, setEvent] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const renderLabel = (label) => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          {label}
        </Text>
      );
    }
    return null;
  };
  const renderLabel2 = (label) => {
    if (valueM || isFocusM) {
      return (
        <Text style={[styles.label, isFocusM && { color: 'blue' }]}>
          {label}
        </Text>
      );
    }
    return null;
  };

  useEffect(()=>{
    fetch('http://www.datos.gov.co/resource/wwkg-r6te.json?$SELECT=departamento,COUNT(*)&$GROUP=departamento', {
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Datos en JSON:', data)
        const formatted = data.map(
          item =>({
            label: `${item.departamento}`,
            value: item.departamento
          })
        )
        setDepartamentos(formatted)
      })
      .catch(error => console.error('❌ Error en fetch:', error));  
  },[])

  const setMunicipiosByDepartamento=(municipio)=>{
    fetch(`http://www.datos.gov.co/resource/wwkg-r6te.json?$select=municipio&$where=departamento='${municipio}'&$group=municipio`, {
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Datos en JSON:', data)
        const formatted = data.map(
          item =>({
            label: `${item.municipio}`,
            value: item.municipio
          })
        )
        setMunicipios(formatted)
      })
      .catch(error => console.error('❌ Error en fetch:', error));    
  }
  const findEvents=()=>{
    fetch(`http://www.datos.gov.co/resource/wwkg-r6te.json?$where=departamento='${value}'&municipio='${valueM}'`, {
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Datos en JSON:', data)
        setConsulta(data)
      })
      .catch(error => console.error('❌ Error en fetch:', error));   

  }
  const setEvento=(item)=>{
      setEvent(item);
      setModalVisible(true);
  }
  return (
    <View style={styles.container}>
      <Text style={{fontSize:22, fontWeight:'bold', marginHorizontal:'auto'}}>Emergencias UNGRD.</Text>
      <View>
      {renderLabel('Departamento')}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={departamentos}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Seleccione un departamento' : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
          setMunicipiosByDepartamento(item.value);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? 'blue' : 'black'}
            name="earth"
            size={20}
          />
        )}
      />
      </View>
      <View>
      {renderLabel2('Municipio')}
      <Dropdown
        style={[styles.dropdown, isFocusM && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={municipios}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocusM ? 'Seleccione un municipio' : '...'}
        searchPlaceholder="Search..."
        value={valueM}
        onFocus={() => setIsFocusM(true)}
        onBlur={() => setIsFocusM(false)}
        onChange={item => {
          console.log(item.value,valueM)
          setValueM(item.value);
          setIsFocusM(false);
          
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocusM ? 'blue' : 'black'}
            name="enviroment"
            size={20}
          />
        )}
      />
      </View>  
      <View>
        <Button title="buscar" onPress={() => findEvents()}/>
      </View>
      <FlatList data={consulta}
          keyExtractor={(item) => item.id}
          renderItem={({item})=>(
            <View style={styles.contactItem}>
              <Text style={styles.contactName}>Departamento: {item.departamento}</Text>
              <Text style={styles.contactName}>Municipio: {item.municipio}</Text>
              <Text style={styles.contactName}>fecha: {item.fecha}</Text>
              <Text style={styles.contactName}>Evento: {item.evento}</Text>
              <View style={{flexDirection: 'row',justifyContent:'space-between'}}>
                <Button title='Ver Mas...' onPress={()=>setEvento(item)}/>            
              </View>
            </View>
          )}
          ListFooterComponent={<View style={{ height: 200}} />}
        >
      </FlatList>
      

      <Modal
        visible={modalVisible}
        transparent={true} // Fondo semitransparente
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.scrollContainer}>
            <Text style={styles.modalTitle}>Detalles del Evento</Text>
              {/* Información General */}
              <Text style={styles.modalText}>📅 Fecha: {evento.fecha}</Text>
              <Text style={styles.modalText}>📍 Departamento: {evento.departamento}</Text>
              <Text style={styles.modalText}>🏙️ Municipio: {evento.municipio}</Text>
              <Text style={styles.modalText}>⚠️ Evento: {evento.evento}</Text>

              {/* Afectaciones */}
              <Text style={styles.sectionTitle}>🔴 Afectaciones</Text>
              <Text style={styles.modalText}>💀 Fallecidos: {evento.fallecidos}</Text>
              <Text style={styles.modalText}>🤕 Heridos: {evento.heridos}</Text>
              <Text style={styles.modalText}>🧍 Personas afectadas: {evento.personas}</Text>
              <Text style={styles.modalText}>🏠 Familias afectadas: {evento.familias}</Text>
              <Text style={styles.modalText}>🏚️ Viviendas destruidas: {evento.viviendas_destruidas}</Text>
              <Text style={styles.modalText}>🏡 Viviendas averiadas: {evento.viviendas_averiadas}</Text>
              <Text style={styles.modalText}>🛣️ Vías averiadas: {evento.vias_averiadas}</Text>
              <Text style={styles.modalText}>🌉 Puentes vehiculares: {evento.puentes_vehiculares}</Text>
              <Text style={styles.modalText}>🚶 Puentes peatonales: {evento.puentes_peatonales}</Text>

              {/* Infraestructura y Daños */}
              <Text style={styles.sectionTitle}>🏗️ Infraestructura y Daños</Text>
              <Text style={styles.modalText}>🚰 Acueducto: {evento.acueducto}</Text>
              <Text style={styles.modalText}>🚽 Alcantarillado: {evento.alcantarillado}</Text>
              <Text style={styles.modalText}>🏥 Centros de salud: {evento.centros_de_salud}</Text>
              <Text style={styles.modalText}>🏫 Centros educativos: {evento.centros_educativos}</Text>
              <Text style={styles.modalText}>🏛️ Centros comunitarios: {evento.centros_comunitarios}</Text>
              <Text style={styles.modalText}>🌿 Hectáreas afectadas: {evento.hectareas}</Text>
              <Text style={styles.modalText}>📌 Otros: {evento.otros_afectacion}</Text>

              {/* Apoyo y Recursos */}
              <Text style={styles.sectionTitle}>💰 Apoyo y Recursos</Text>
              <Text style={styles.modalText}>📦 Subsidio de arriendo: {evento.subsidio_de_arriendo}</Text>
              <Text style={styles.modalText}>🛑 Asistencia no alimentaria: {evento.asistencia_no_alimentaria}</Text>
              <Text style={styles.modalText}>🍽️ Apoyo alimentario: {evento.apoyo_alimentario}</Text>
              <Text style={styles.modalText}>🏗️ Materiales de construcción: {evento.materiales_construccion}</Text>
              <Text style={styles.modalText}>🎒 Kits de aseo: {evento.cantidad_kit_aseo}</Text>
              <Text style={styles.modalText}>🍲 Kits de cocina: {evento.cantidad_kit_cocina}</Text>
              <Text style={styles.modalText}>🛏️ Colchonetas: {evento.cantidad_colchoneta}</Text>
              <Text style={styles.modalText}>🛏️ Frazadas y sobrecamas: {evento.cantidad_frazadas_sobrecamas}</Text>
              <Text style={styles.modalText}>🏕️ Carpas: {evento.cantidad_carpas}</Text>
              <Text style={styles.modalText}>🛠️ Obras de emergencia: {evento.obras_de_emergencia}</Text>
              <Text style={styles.modalText}>🚜 Horas máquina retroexcavadora: {evento.horas_maquina_retroexcavadora}</Text>
              <Text style={styles.modalText}>🚁 Apoyo aéreo/terrestre: {evento.apoyo_aereo_terrestre}</Text>
              <Text style={styles.modalText}>📊 Recursos ejecutados: {evento.recursos_ejecutados}</Text>
              <Text style={styles.modalText}>💵 Valor total de apoyo: {evento.valor_total_apoyo_del_fngrd}</Text>

              <View style={{ height: 20 }} /> {/* Espacio final */}
            </ScrollView>

            {/* Botón de Cerrar */}
            <View style={{ alignSelf: "flex-start", marginTop: 10 }}>
              <Button title="Cerrar" onPress={() => setModalVisible(false)} color="#d9534f" />
            </View>
          </View>
        </View>
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 30,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    margin:10
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semitransparente
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "80%", // Ajusta la altura para mejor visualización
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "flex-start", // Alinea el contenido a la izquierda
  },
  scrollContainer: {
    maxHeight: "90%", // Permite el desplazamiento dentro del modal
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#d9534f",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "left",
  },
});