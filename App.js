import './global.css'
import React, { useEffect } from 'react';
import * as Font from 'expo-font';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';

import VPN from "./src/components/VPN";
import Connections from "./src/components/Connections";
import Register from "./src/components/Register";

const RootStack = createNativeStackNavigator({
  initialRouteName: 'VPN',
  screenOptions: {
    headerShown: false
  },
  screens: {
    VPN: VPN,
    Connection: Connections,
    Register: Register
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Poppins-Black': require('./assets/fonts/Poppins-Black.ttf'),
          'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
          'Poppins-Light': require('./assets/fonts/Poppins-Light.ttf'),
          'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
          'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf')
        });
      } catch (e) {
        console.warn(e);
      } finally {
        console.log('Fonts loaded successfully');
      }
    }
    loadFonts();
  }, [])

  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
}