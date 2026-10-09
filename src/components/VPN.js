import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Platform, 
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ShieldX, 
  Server, 
  Power, 
  PowerOff,
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  Clock,
  ShieldPlus, 
  ShieldCheck,
  AlertTriangleIcon
} from 'lucide-react-native';
import axios from 'axios';
import * as Font from 'expo-font';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import WireGuardModule from '../wireguard/WireGuardModule';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateDuration, updateTransfer, updateConnectivity } from '../redux/variableSlice';
import Alert from './Alert';

export default function VPN() {

  let dispatch = useDispatch()
  let connectivity = useSelector((state) => state.variable.connectivity)
  let [network, setNetwork] = useState(null)
  let [transfer, setTransfer] = useState({Rx: [0, 'B'], Tx: [0, 'B']})
  let [duration, setDuration] = useState('0')
  let [alert, setAlert] = useState({state: false, button: '', title: '', message: ''})
  const lastStatsRef = useRef({ rx: 0, tx: 0, timestamp: Date.now() });
  const timerRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const navigation = useNavigation()

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


  useEffect(() => {

    loadNetwork()

    if(!connectivity) return

    const setTime = async() => {
      let time = await AsyncStorage.getItem("startTime");
      if(time !== null){
        timerRef.current = setInterval(() => {
          const diff = Math.floor((Date.now() - Number(time)) / 1000);
          const m = Math.floor(diff / 60).toString().padStart(2, '0');
          const s = (diff % 60).toString().padStart(2, '0');
          setDuration(`${m}:${s}`);
          dispatch(updateDuration(`${m}:${s}`));
        }, 1000);
      } 
      else{
        const now = Date.now();
        await AsyncStorage.setItem("startTime", now.toString());
        timerRef.current = setInterval(() => {
          const diff = Math.floor((Date.now() - now) / 1000);
          const m = Math.floor(diff / 60).toString().padStart(2, '0');
          const s = (diff % 60).toString().padStart(2, '0');
          setDuration(`${m}:${s}`);
          dispatch(updateDuration(`${m}:${s}`));
        }, 1000);
      }
    }

    setTime()

    // Poll stats
    statsIntervalRef.current = setInterval(async () => {
        try {
            const currentStats = await WireGuardModule.getStatistics('Local');
            // getStatistics returns { totalRx: number, totalTx: number }

            const now = Date.now();
            const timeDelta = (now - lastStatsRef.current.timestamp) / 1000;

            if (timeDelta > 0 && currentStats) {
                const rxDiff = currentStats.totalRx - lastStatsRef.current.rx;
                const txDiff = currentStats.totalTx - lastStatsRef.current.tx;

                // Avoid negative spikes on restart or reset
                const rxSpeed = rxDiff > 0 ? rxDiff / timeDelta : 0;
                const txSpeed = txDiff > 0 ? txDiff / timeDelta : 0;

                setTransfer({
                  Rx: [formatSpeed(rxSpeed), getSpeedUnit(rxSpeed)],
                  Tx: [formatSpeed(txSpeed), getSpeedUnit(rxSpeed)]
                })
                dispatch(                updateTransfer({
                  Rx: [formatSpeed(rxSpeed), getSpeedUnit(rxSpeed)],
                  Tx: [formatSpeed(txSpeed), getSpeedUnit(rxSpeed)]
                }))
                // Note: We could save the unit in state too if we want dynamic units

                lastStatsRef.current = {
                    rx: currentStats.totalRx,
                    tx: currentStats.totalTx,
                    timestamp: now
                };
            }
        } catch (e) {
            console.log("Stats error", e);
        }
    }, 1000);

    return () => {
        clearInterval(timerRef.current);
        clearInterval(statsIntervalRef.current);
    };

  }, [connectivity])


  let loadNetwork = async() => {
    let network = await AsyncStorage.getItem('selectedNetwork');
    if(network != null){
      setNetwork(JSON.parse(network))
    }
  }

  let networkConnectivity = async() => {    

    let network = await AsyncStorage.getItem('selectedNetwork');

    if(network != null){
      network = JSON.parse(network)
      let api = network.connected

      await WireGuardModule.disconnect('Local');

      axios.get(`http://${network.address}:5678/webhook-test/${!api ? 'connect' : 'disconnect'}`, {
        headers: {
          'Authorization': `Bearer ${network.token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if(response.data.status == 'success'){
          !api ? connectNetwork(network, response.data) : disconnectNetwork(network)
        }
        else{
          console.log('Connection request failed')
        }
      })
      .catch(error => {
        setAlert({state: true, button: 'Retry', title: 'Oops!', message: 'Connection failed'})
      })
    }
    else{
      setAlert({state: true, button: 'Register', title: 'Server Not Found', message: 'Register your device on a server, then try again.'})
    }
  }

  let connectNetwork = async(network, response) => {
    let networkCopy = network
    networkCopy['connected'] = true 
    await AsyncStorage.setItem('selectedNetwork', JSON.stringify(networkCopy));

    await WireGuardModule.connect('Local', `[Interface]
        PrivateKey = ${response.config.private_key}
        Address = ${response.config.address}
        DNS = ${response.config.dns}

        [Peer]
        PublicKey = ${response.config.public_key}
        AllowedIPs = ${response.config.allowed}
        Endpoint = ${response.config.endpoint}:51820
        PersistentKeepalive = 25`);

    dispatch(updateConnectivity(true))
  }

  let disconnectNetwork = async(network) => {
    let networkCopy = network
    networkCopy['connected'] = false

    await AsyncStorage.setItem('selectedNetwork', JSON.stringify(networkCopy));
    await AsyncStorage.removeItem('startTime')

    dispatch(updateConnectivity(false))
    clearInterval(timerRef.current);
    clearInterval(statsIntervalRef.current);
  }

  let closeAlert = (state) => {
    if(state == 'Register'){
      setAlert({state: false, button: '', title: '', message: ''})
      navigation.navigate('Register')
    }
    else if(state == 'Retry'){
      setAlert({state: false, button: '', title: '', message: ''})     
      networkConnectivity()
    }
    else{
      setAlert({state: false, button: '', title: '', message: ''})
    }
  }

  // Formatted speed
  const formatSpeed = (bytesPerSec) => {
      // Logic below keeps typical "MB/s" format.
      if (bytesPerSec === 0) return '0';
      const k = 1024;
      const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
      return parseFloat((bytesPerSec / Math.pow(k, i)).toFixed(2));
  };

  // Fromatted Unit
  const getSpeedUnit = (bytesPerSec) => {
    if (bytesPerSec === 0) return 'KB/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
    return sizes[i];
  };

  return (
    <LinearGradient
      colors={['#1a1d24', '#0a0b0d']}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <SafeAreaView 
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        {/* 
            HEADER WRAPPER: 
            max-w-2xl and self-center ensures it stays centered on tablets.
        */}
        <View className="w-full max-w-2xl self-center flex-row justify-center items-center px-6 py-4">
          <Text className="text-zinc-400 font-bold tracking-[3px] text-xs uppercase">
            Anywhere
          </Text>
        </View>

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 
              CONTENT WRAPPER:
              All body content is now inside this centering container.
          */}
          <View className="w-full max-w-2xl self-center">
            
            {/* Status Section */}
            <View className="items-center mt-6">
              <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full mb-6">
                <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                <Text className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                  Encrypted
                </Text>
              </View>
              
              <Text className="text-white text-5xl font-bold tracking-tight text-center">
                { connectivity != null && connectivity == true ? 'Connected' : 'Disconnected' }
              </Text>
            </View>

            {/* Power Button */}
            <View className="items-center justify-center my-10">
              <View className="w-72 h-72 rounded-full border border-emerald-500/5 items-center justify-center">
                <View className="w-60 h-60 rounded-full border border-emerald-500/10 items-center justify-center">
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    className={`w-44 h-44 rounded-full ${connectivity != null &&connectivity == true ? 'bg-emerald-500' : 'bg-red-500'} items-center justify-center`}
                    style={{
                      shadowColor: `${connectivity != null && connectivity ? '#10b981' : '#ef4444' }`,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6,
                      shadowRadius: 30,
                      elevation: 15,
                    }}
                    onPress={networkConnectivity}
                  >
                    { 
                      connectivity != null && connectivity == true ? 
                      <Power size={60} color="white" strokeWidth={2.5} /> : <PowerOff size={60} color="white" strokeWidth={2.5} />
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Current Server Card */}
            <View className="px-6 mb-6">
              <TouchableOpacity 
                className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-[16px] flex-row items-center" 
                onPress={() => navigation.navigate('Connection')}
              >
                {
                  network != null ? <ShieldCheck size={32} color="#ffffff" /> : <ShieldX size={32} color="#ffffff" />
                }
                <View className="flex-1 ml-4">
                  <Text className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-0.5">
                    Selected Network
                  </Text>
                  <Text className="text-white text-lg font-bold">
                    { network != null ? network.name : 'Not Found' }
                  </Text>
                </View>

                <View className="bg-zinc-800/80 p-2.5 rounded-full">
                  <ChevronRight size={20} color="#64748b" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View className="flex-row px-5 justify-between">
              <View className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-[16px] p-5 items-center mx-1">
                <View className="bg-zinc-800/50 p-2 rounded-full mb-3">
                  <ArrowUp size={18} color="#94a3b8" />
                </View>
                <Text className="text-white text-2xl font-bold">{transfer.Tx[0]}</Text>
                <Text className="text-zinc-500 text-[10px] font-bold mt-1 tracking-widest uppercase">{transfer.Tx[1]}</Text>
              </View>

              <View className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-[16px] p-5 items-center mx-1">
                <View className="bg-zinc-800/50 p-2 rounded-full mb-3">
                  <ArrowDown size={18} color="#94a3b8" />
                </View>
                <Text className="text-white text-2xl font-bold">{transfer.Rx[0]}</Text>
                <Text className="text-zinc-500 text-[10px] font-bold mt-1 tracking-widest uppercase">{transfer.Rx[1]}</Text>
              </View>

              <View className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-[16px] p-5 items-center mx-1">
                <View className="bg-zinc-800/50 p-2 rounded-full mb-3">
                  <Clock size={18} color="#94a3b8" />
                </View>
                <Text className="text-white text-2xl font-bold">{duration}</Text>
                <Text className="text-zinc-500 text-[10px] font-bold mt-1 tracking-widest uppercase">Time</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Home Indicator Bar */}
        <View className="items-center pb-4">
          <View className="w-32 h-1.5 bg-zinc-800 rounded-full" />
        </View>
      </SafeAreaView>
    <Modal
      transparent
      visible={alert.state}
      animationType="fade"
      statusBarTranslucent
    >
      <Alert title={alert.title} button={alert.button} message={alert.message} updateAlert={closeAlert} />
    </Modal>
    </LinearGradient>
  );
}