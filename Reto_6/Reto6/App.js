import {Alert, FlatList, StyleSheet, Text, View, TextInput, Button, Modal } from 'react-native';
import {initDataBase, createContact, updateContact, deleteContact, getAll} from './db.js'
import { useEffect, useState } from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox'


  

export default function App() { 
  const [contacts, setContacts] = useState([]);
  const [filterContacts, setFilterContacts] = useState([]);
  const [showContacts, setShowContacts] = useState([])
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [URL, setURL] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [pys, setPys] = useState('')
  const [clasificacion, setClasificacion] = useState('')

  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);

  const [clasificacionBox,setClasificacionBox] = useState({
    consultoria: false,
    desarrollo: false,
    fabrica: false
  });
  const toggleCheckBox = (key) => {
    setClasificacionBox((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [clFilterBox,setClFilterBox] = useState({
    consultoria: false,
    desarrollo: false,
    fabrica: false
  });
  const toggleFilterBox = (key) => {
    setClFilterBox((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [search, setSearch] = useState('');


  useEffect(()=>{
    const setupBD = async()=>{
      await initDataBase();
      loadContacts();
    }
    setupBD();
  },[]);

  const loadContacts = async() =>{
    const data = await getAll();
    setContacts(data);
    setShowContacts(data);
    console.log(data);    
  }
  const handleAddContact = async () => {
    if (!nombre || !email || !tel || !URL || !pys) {
      alert('Por favor, ingresa todos los datos');
      return;
    }

    const cl = []
    if (clasificacionBox.consultoria) cl.push("Consultoria");
    if (clasificacionBox.desarrollo) cl.push("Desarrollo a la medida");
    if (clasificacionBox.fabrica) cl.push( "Fabrica de software");
        
    const newContact = { nombre: nombre, email: email, tel:tel, URL:URL, pys:pys, clasificacion:cl.join(";") };
    const result = await createContact(newContact);
    if (result){
      clear();
      loadContacts();
      alert('Contacto creado');
      setModalVisible(false);
    }
    else{
      alert('Error al crear el contacto')
    }
  };

  function deleteContactWarning(nombre,id) {
    Alert.alert(`Eliminar ${id}`, `¿Estás seguro que deseas eliminar a ${nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => eraseContact(id)},
    ]);
    loadContacts();
  }

  const eraseContact = async(id)=>{
    await deleteContact(id);
    loadContacts()
  }

  const cancelModal= () =>{
    clear();
    setModalVisible(false);
    setModalEditVisible(false)
  }

  const edit = (item) =>{
    setId(item.id);
    setNombre(item.nombre);
    setEmail(item.email);
    setTel(item.tel);
    setURL(item.URL);
    setClasificacion(item.clasificacion);
    setPys(item.pys);
    setClasificacionBox({
      consultoria: item.clasificacion.includes("Consultoria"),
      desarrollo: item.clasificacion.includes("Desarrollo"),
      fabrica: item.clasificacion.includes("Fabrica"),
    });
    setModalEditVisible(true);
  }

  const update = async()=>{
    const cl = []
    if (clasificacionBox.consultoria) cl.push("Consultoria");
    if (clasificacionBox.desarrollo) cl.push("Desarrollo a la medida");
    if (clasificacionBox.fabrica) cl.push( "Fabrica de software");
    const newContact = { id: id, nombre: nombre, email: email, tel:tel, URL:URL, pys:pys, clasificacion:cl.join(";") };
    const result = await updateContact(newContact);
    console.log(result)
    if(result){
      alert('Contacto actualizado');
      setModalEditVisible(false);
      loadContacts();
      clear();
    }
    else alert('Error al actualizar');
  }

  const clear = ()=>{
    setNombre('');
    setEmail('');
    setTel('');
    setURL('');
    setClasificacion('');
    setPys('');
    setClasificacionBox({
      consultoria: false,
      desarrollo: false,
      fabrica: false,
    });
  }

  const Search = () => {
    setFilterContacts([]);
    if(clFilterBox.consultoria||clFilterBox.desarrollo||clFilterBox.fabrica){    
      const selectedClasifications = []
      if(clFilterBox.consultoria) selectedClasifications.push('consultoria')
      if(clFilterBox.desarrollo) selectedClasifications.push('desarrollo')
      if(clFilterBox.fabrica) selectedClasifications.push('fabrica')
      const filtered = contacts.filter((contact) => {
        const matchName = contact.nombre.toLowerCase().includes(search.toLowerCase());  
        const contactClasifications = contact.clasificacion.toLowerCase();   
        const matchClasification = selectedClasifications.some(cl => 
          contactClasifications.includes(cl.toLowerCase())
        );
        return matchName && matchClasification;
      });
      setFilterContacts(filtered);
      setShowContacts(filtered);
    }
    else{
      const filtered = contacts.filter((contact) => {
        const matchName = contact.nombre.toLowerCase().includes(search.toLowerCase());            
        return matchName;
      });
      setFilterContacts(filtered);
      setShowContacts(filtered);
    }
    
  };
  

  return (
    <View style={styles.container}>
      
        <Text style={styles.title}>Lista de contactos</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Buscar"
          value={search}
          onChangeText={setSearch}
        />
        
        <BouncyCheckbox
          text="Consultoría"
          isChecked={clFilterBox.consultoria}
          onPress={(isChecked) => toggleFilterBox('consultoria', isChecked)}
          textStyle={{textDecorationLine:'none'}}
        />

        <BouncyCheckbox
          text="Desarrollo a la medida"
          isChecked={clFilterBox.desarrollo}
          onPress={(isChecked) => toggleFilterBox('desarrollo', isChecked)}
          textStyle={{textDecorationLine:'none'}}
        />

        <BouncyCheckbox
          text="Fábrica de software"
          isChecked={clFilterBox.fabrica}
          onPress={(isChecked) => toggleFilterBox('fabrica', isChecked)}
          textStyle={{textDecorationLine:'none'}}
        />
        <View style={{flexDirection:'row'}}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <Button title="Buscar" onPress={Search} />
          </View>
          <View style={{ flex: 1, marginLeft: 5 }}>
            <Button title="Reset" onPress={loadContacts} />
          </View>
        </View>      
        <FlatList data={showContacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item})=>(
            <View style={styles.contactItem}>
              <Text style={styles.contactName}>Nombre: {item.nombre}</Text>
              <Text style={styles.contactName}>URL: {item.URL}</Text>
              <Text style={styles.contactName}>Telefono: {item.tel}</Text>
              <Text style={styles.contactName}>Correo: {item.email}</Text>
              <Text style={styles.contactName}>Productos y Servicios: {item.pys}</Text>
              <Text style={styles.contactName}>Clasificación: {item.clasificacion}</Text>
              <View style={{flexDirection: 'row',justifyContent:'space-between'}}>
                <Button title='Eliminar' onPress={()=>deleteContactWarning(item.nombre,item.id)}/>
                <Button title='Editar' onPress={()=>edit(item)}/>              
              </View>
            </View>
          )}
        ></FlatList>
      <Modal
          visible={modalVisible}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput 
                style={styles.input} 
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
              />
              <TextInput 
                style={styles.input} 
                placeholder="URL"
                value={URL}
                onChangeText={setURL}
                keyboardType='url'
              />
              <TextInput 
                style={styles.input} 
                placeholder="Teléfono"
                value={tel}
                onChangeText={setTel}
                keyboardType="numeric"
              />
              <TextInput 
                style={styles.input} 
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />  
              
              <TextInput 
                style={styles.input} 
                placeholder="Productos y servicios"
                value={pys}
                onChangeText={setPys}
              />            
            </View>
            <View>
              <Text>Clasificación:</Text>

              <BouncyCheckbox
                text="Consultoría"
                isChecked={clasificacion.consultoria}
                onPress={(isChecked) => toggleCheckBox('consultoria', isChecked)}
                textStyle={{textDecorationLine:'none'}}
              />

              <BouncyCheckbox
                text="Desarrollo a la medida"
                isChecked={clasificacion.desarrollo}
                onPress={(isChecked) => toggleCheckBox('desarrollo', isChecked)}
                textStyle={{textDecorationLine:'none'}}
              />

              <BouncyCheckbox
                text="Fábrica de software"
                isChecked={clasificacion.fabrica}
                onPress={(isChecked) => toggleCheckBox('fabrica', isChecked)}
                textStyle={{textDecorationLine:'none'}}
              />

            </View>
            <Button title="Guardar" onPress={handleAddContact} />
            <Button title="Cancelar" onPress={cancelModal} />
          </View>
        </Modal>
       

        <Modal
          visible={modalEditVisible}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setModalEditVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput 
                style={styles.input} 
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
              />
              <TextInput 
                style={styles.input} 
                placeholder="URL"
                value={URL}
                onChangeText={setURL}
                keyboardType='url'
              />
              <TextInput 
                style={styles.input} 
                placeholder="Teléfono"
                value={tel}
                onChangeText={setTel}
                keyboardType="numeric"
              />
              <TextInput 
                style={styles.input} 
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />  
              
              <TextInput 
                style={styles.input} 
                placeholder="Productos y servicios"
                value={pys}
                onChangeText={setPys}
              />
              <View>
                <Text>Clasificación:</Text>

                <BouncyCheckbox
                  text="Consultoría"
                  isChecked={clasificacionBox.consultoria}
                  onPress={(isChecked) => toggleCheckBox('consultoria', isChecked)}
                  textStyle={{textDecorationLine:'none'}}
                />

                <BouncyCheckbox
                  text="Desarrollo a la medida"
                  isChecked={clasificacionBox.desarrollo}
                  onPress={(isChecked) => toggleCheckBox('desarrollo', isChecked)}
                  textStyle={{textDecorationLine:'none'}}
                />

                <BouncyCheckbox
                  text="Fábrica de software"
                  isChecked={clasificacionBox.fabrica}
                  onPress={(isChecked) => toggleCheckBox('fabrica', isChecked)}
                  textStyle={{textDecorationLine:'none'}}
                />

              </View>
              
            </View>
            <Button title="Actualizar" onPress={()=>update()} />
            <Button title="Cancelar" onPress={()=>setModalEditVisible(false)} />
          </View>
        </Modal>
      <Button title="Agregar Contacto" onPress={() => setModalVisible(true)} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    width: '100%',
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  }
});