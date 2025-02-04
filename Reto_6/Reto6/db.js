import * as SQLite from 'expo-sqlite';

const openDB = async () =>{
    try{
        const db = await SQLite.openDatabaseAsync('contacts.db');
        console.log('Base de datos abierta correctamente');
        return db;
    }
    catch(error){
        console.error('Error al abrir la bd',error)
    }
}

let db;

const initDataBase = async () =>{
    db =  await openDB();
    try{
        await db.execAsync(
            'CREATE TABLE IF NOT EXISTS Contacts ( id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, URL TEXT, tel INTEGER,email TEXT,pys TEXT,clasificacion TEXT);'
        );
        console.log('Tabla creada')
    }catch(error){
        console.error('Error al crear la tabla')
    }    
}

const createContact = async(contact) =>{
    try{
        const result = await db.runAsync('INSERT INTO Contacts (nombre, URL, tel, email, pys, clasificacion) VALUES (?,?,?,?,?,?)',
                [contact.nombre, contact.URL, contact.tel, contact.email, contact.pys, contact.clasificacion]
            )
        console.log('contacto creado',result)
        return 1;
    }catch(error){
        console.error('error al crear el contacto',error)
        return 0;
    }
}

const updateContact = async(contact) => {
    if (!contact.id) {
      console.error('ID es obligatorio para actualizar el contacto');
      return 0;
    }

    try{
        const result = await db.runAsync(
            `UPDATE Contacts SET nombre = ?, URL = ?, tel = ?, email = ?, pys = ?, clasificacion = ?  WHERE id = ?;`,
            [contact.nombre, contact.URL, contact.tel, contact.email, contact.pys, contact.clasificacion, contact.id]
        )
        console.log('contacto actualizado',result)
        return 1;
    }catch(error){
        console.error('error al actualizar el contacto',error)
        return 0;
    }
  };

const deleteContact = async(id)=>{
    try {
        // Verificar que el id no sea undefined ni null
        if (!id) {
          console.error('El ID proporcionado es inválido:', id);
          return;
        }
    
        console.log(`Intentando eliminar el contacto con ID: ${id}`);
        
        // Ejecutar la consulta SQL
        const result = await db.runAsync(
          'DELETE FROM Contacts WHERE id = ?;',
          [id]  
        );
    
        // Verificar el resultado
        if (result.rowsAffected > 0) {
          console.log(`Contacto con ID ${id} eliminado exitosamente.`);
        } else {
          console.log(`No se encontró un contacto con ID ${id} para eliminar.`);
        }
    
    } catch (error) {
    // Capturar y mostrar cualquier error
    console.error('Error al eliminar el contacto:', error);
    }
};

const getAll = async() =>{
    try{
        const allRows = await db.getAllAsync('SELECT * FROM Contacts');
            for (const row of allRows) {
                console.log(row.id, row.value, row.intValue);
        }
        console.log('contactos:',allRows)
        return allRows
    }catch(error){
        console.error('error al obtener los datos',error)
    }
}

const demoContacts = async() =>{
    try{
        const newUser ={nombre: 'Santiago', URL: 'www.santiago.com', tel: '1234', email:'santiago@correo.com',pys:'productos y servicios', clasificacion:'nnnn'}
        createContact(newUser);
        getAll();
    }catch(error){
        console.error('error en el demo',error)
    }
}

export { initDataBase, openDB, createContact,deleteContact,updateContact, demoContacts, getAll};