import './global.css'
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';

import VPN from "./src/components/VPN";
import Connections from "./src/components/Connections";
import Configuration from "./src/components/Configuration";
import Register from "./src/components/Register";
import Profiles from './src/components/Profiles';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'VPN',
  screenOptions: {
    headerShown: false
  },
  screens: {
    VPN: VPN,
    Connection: Connections,
    Configuration: Configuration,
    Register: Register,
    Profile: Profiles
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
}