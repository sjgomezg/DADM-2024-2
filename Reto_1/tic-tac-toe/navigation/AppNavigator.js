import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen.js';
import DetailsScreen from '../screens/DetailsScreen.js';
import Game from '../screens/Game.js'
import OnlineGame from '../screens/OnlineGame.js'
import OnlineP2 from '../screens/OnlineP2.js'

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="OnlineGame" component={OnlineGame} />
        <Stack.Screen name="OnlineP2" component={OnlineP2} />
        <Stack.Screen name="Game" component={Game}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
