import React, { useState, useEffect } from 'react';
import { Platform, Text, View, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [places, setPlaces] = useState([])
  const [radius, setRadius] = useState(2000); // Valor predeterminado en metros (5 km)
  const [region, setRegion] = useState({
    latitude: 4.5709, // Latitud por defecto
    longitude: -74.2973, // Longitud por defecto
    latitudeDelta: 15.0, // Delta por defecto
    longitudeDelta: 20.0, // Delta por defecto
  });


  useEffect(() => {
    async function getCurrentLocation() {
      // Solicitar permisos y obtener ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922, // Ajusta el zoom si es necesario
        longitudeDelta: 0.0421, // Ajusta el zoom si es necesario
      });
      // Consultar los puntos de interés cercanos
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
    }

    async function fetchNearbyPlaces(latitude, longitude) {
      const overpassQuery = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${latitude},${longitude});
          node["tourism"="attraction"](around:${radius},${latitude},${longitude});
          node["amenity"="restaurant"](around:${radius},${latitude},${longitude});
        );
        out body;
      `;

      try {
        const response = await axios.get(OVERPASS_URL, {
          params: {
            data: overpassQuery,
          },
        });
        setPlaces(
          response.data.elements.map((item, index) => ({
            title: item.tags.name || `Punto de Interés ${index + 1}`, // Si no tiene nombre, asigna uno genérico
            location: {
              latitude: item.lat,
              longitude: item.lon
            },
            description: item.tags.amenity || item.tags.tourism || "Sin descripción"
          }))
         ) // Guardar los lugares en el estado
      } catch (error) {
        console.error('Error al obtener puntos de interés:', error);
      }
    }
    getCurrentLocation();

  }, []);

  const handleChangeRadius = (newRadius) => {
    if(radius+newRadius>0)
      setRadius(radius + newRadius * 1000);
    else setRadius(0);
  };
  
  let text = 'Esperando...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitud: ${location.coords.latitude}, Longitud: ${location.coords.longitude}`;
  }

  const getColor=(description)=>{
    switch (description){
      case 'restaurant':
        return 'yellow';
      case 'hospital':
        return 'red';
      case 'attraction':
        return 'blue';
      default:
        return 'gray';
    }
  }

  const showLocationsOfInterest = () =>{
    if (!places || places.length === 0) return null;
    console.log('lugares encontrados',places)
    return places.map((item,index)=>{
      return (
        <Marker
          key={index}
          coordinate={item.location}
          title={item.title}
          description={item.description}
          pinColor={getColor(item.description)}
        />
      )
    })
  }
  const findNearbyPlaces=async()=>{
      // Convertir a metros
      console.log(radius,location)
      const overpassQuery = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${location.coords.latitude},${location.coords.longitude});
          node["tourism"="attraction"](around:${radius},${location.coords.latitude},${location.coords.longitude});
          node["amenity"="restaurant"](around:${radius},${location.coords.latitude},${location.coords.longitude});
        );
        out body;
      `;
      try {
        const response = await axios.get(OVERPASS_URL, {params: {data: overpassQuery}});
        setPlaces(
          response.data.elements.map((item, index) => ({
              title: item.tags.name || `Punto de Interés ${index + 1}`, // Si no tiene nombre, asigna uno genérico
              location: {
                latitude: item.lat,
                longitude: item.lon
              },
              description: item.tags.amenity || item.tags.tourism || "Sin descripción"
            }))
        )
      } catch (error) {
        console.error('Error al obtener puntos de interés:', error);
      }
  }
  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={region}
        region={region}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Tu ubicación"
            description="Ubicación obtenida desde el GPS"
            pinColor='green'
          />
        )}
        {showLocationsOfInterest()}
      </MapView>
      <Text style={styles.paragraph}>{text}</Text>
      <Text style={styles.paragraph}>Radio de búsqueda: {radius / 1000} km</Text>
      <View style={{flex:1, flexDirection:'row'}}>
        <View>
          <Button title="Ajustar radio (+2 km)" onPress={() => handleChangeRadius(2)} />
        </View>
        <View>
          <Button title="Ajustar radio (-2 km)" onPress={() => handleChangeRadius(-2)}/>
        </View>
      </View>
      <Button title="buscar" onPress={() => findNearbyPlaces()} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '70%',
  },
});
