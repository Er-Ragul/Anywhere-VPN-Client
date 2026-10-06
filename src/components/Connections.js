import React, { use, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Platform, 
  StatusBar 
} from 'react-native';
import { 
  Settings, 
  Trash2, 
  Power, 
  Plus, 
  ArrowLeft, 
  SquarePen, 
  PlugZap, 
  Router,
  ArrowDown,
  ArrowUp,
  RefreshCcw
} from 'lucide-react-native';
import WireGuardModule from '../wireguard/WireGuardModule';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { updateButton } from '../redux/variableSlice';

export default function Connections() {

  let navigation = useNavigation()
  let dispatch = useDispatch()
  let [networks, setNetworks] = useState([])
  let [network, setNetwork] = useState(null)
  let duration = useSelector((state) => state.variable.duration)
  let transfer = useSelector((state) => state.variable.transfer)

  useEffect(() => {
    loadNetworks()
  }, [])

  let loadNetworks = async() => {
    let localdb = await AsyncStorage.getItem('networks');
    if(localdb != null){
      setNetworks(JSON.parse(localdb))
    }

    let network = await AsyncStorage.getItem('selectedNetwork')
    if(network != null){
      setNetwork(JSON.parse(network))
    }
  }

  let selectNetwork = async(name, token, address) => {
    let localdb = await AsyncStorage.setItem('selectedNetwork', JSON.stringify({
      name: name,
      token: token,
      connected: false,
      address: address
    }))
    setNetwork({
      name: name,
      token: token,
      connected: false,
      address: address
    })
  }

  let deleteNetwork = async(id) => {
    let localdb = await AsyncStorage.getItem('networks');
    if(localdb != null){
      localdb = JSON.parse(localdb)
      localdb.splice(localdb.id, 1)
      await AsyncStorage.setItem('networks', JSON.stringify(localdb))
      loadNetworks()
    }
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView 
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        {/* 
            CENTRAL CONTAINER: 
            'max-w-3xl' prevents the UI from stretching too wide on tablets.
            'self-center' keeps the column in the middle.
            'w-full' ensures it uses available space on mobile.
        */}
        <View className="flex-1 w-full max-w-3xl self-center">
          
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-4">
            <TouchableOpacity 
              className="w-12 h-12 bg-zinc-800/40 rounded-sm items-center justify-center border border-zinc-700/50" 
              onPress={() => navigation.push('VPN')}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            
            <Text className="text-white text-2xl font-bold tracking-tight">
              Anywhere
            </Text>
            
            <TouchableOpacity 
              className="w-12 h-12 bg-zinc-800/40 rounded-sm items-center justify-center border border-zinc-700/50"
            >
              <RefreshCcw size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 120 }} // Increased for FAB clearance
            showsVerticalScrollIndicator={false}
          >
            {/* Main Connection Card */}
            {network != null && (
              <View className="bg-zinc-800/80 rounded-[10px] p-8 mt-4">
                <View className="flex-row justify-between items-start">
                  <View>
                    {/* Status Badge */}
                    <View className={`flex-row items-center px-3 py-1 rounded-full self-start mb-4 ${network.connected ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                      <View className={`w-2 h-2 rounded-full mr-2 ${network.connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <Text className={`text-[10px] font-bold tracking-widest uppercase ${network.connected ? 'text-emerald-500' : 'text-red-500'}`}>
                        {network.connected ? 'Connected' : 'Disconnected'}
                      </Text>
                    </View>
                    
                    <Text className="text-white text-4xl font-bold">{network.name}</Text>
                    <Text className="text-zinc-500 font-medium mt-1">Connection Profile</Text>
                  </View>

                  {/* Large Toggle Switch */}
                  <TouchableOpacity 
                    className={`bg-white w-20 h-12 rounded-full flex-row items-center px-1 ${network.connected ? 'justify-end' : 'justify-start'}`} 
                    onPress={() => navigation.reset({index: 0, routes:[{name: 'VPN'}]})}
                  >
                    <View className="bg-black w-10 h-10 rounded-full items-center justify-center">
                      <Power size={18} color="white" strokeWidth={3} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Info Grid */}
                <View className="flex-row flex-wrap mt-10 justify-between gap-y-4">
                    <View className="w-[48%] bg-zinc-700/50 rounded-[10px] p-4">
                      <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">INTERNAL IP</Text>
                      <Text className="text-white font-bold">Locked</Text>
                    </View>
                    <View className="w-[48%] bg-zinc-700/50 rounded-[10px] p-4">
                      <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Uptime</Text>
                      <Text className="text-white font-bold">{duration}</Text>
                    </View>
                    <View className="w-[48%] bg-zinc-700/50 rounded-[10px] p-4">
                      <View className="flex-row items-center mb-1">
                        <ArrowDown size={12} color="#94a3b8" className="mr-1" />
                        <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">RX</Text>
                      </View>
                      <Text className="text-white font-bold">{transfer.Rx[0]} {transfer.Rx[1]}</Text>
                    </View>
                    <View className="w-[48%] bg-zinc-700/50 rounded-[10px] p-4">
                      <View className="flex-row items-center mb-1">
                        <ArrowUp size={12} color="#94a3b8" className="mr-1" />
                        <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">TX</Text>
                      </View>
                      <Text className="text-white font-bold">{transfer.Tx[0]} {transfer.Tx[1]}</Text>
                    </View>
                </View>
              </View>
            )}

            {/* Section Header */}
            <View className="flex-row items-center justify-between mt-10 mb-6">
              <Text className="text-white text-xl font-bold">Registered Networks</Text>
              <View className="bg-zinc-800 w-6 h-6 rounded-md items-center justify-center">
                <Text className="text-zinc-400 text-xs font-bold">{networks.length}</Text>
              </View>
            </View>

            {/* Configuration List */}
            {networks.map((network, index) => (
              <TouchableOpacity className="mb-4" key={index} onPress={() => selectNetwork(network.name, network.token, network.address)}>
                <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-[10px] flex-row items-center">
                  <View className="w-12 h-12  items-center justify-center">
                    <Router size={22} color="white" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-white font-bold text-lg">{network.name}</Text>
                    {/* <Text className="text-zinc-500 text-xs font-mono">{profile.address}</Text> */}
                  </View>
                  
                  <View className="flex-row gap-x-2">
                    <TouchableOpacity className="bg-zinc-800 p-2 rounded-[10px]" onPress={() => deleteNetwork(network.id)}>
                      <Trash2 size={20} color="white" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity className="bg-zinc-800 p-2 rounded-[10px]">
                      <SquarePen size={20} color="white" />
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity className="bg-zinc-800 p-2 rounded-[10px]">
                      <PlugZap size={20} color="white" />
                    </TouchableOpacity> */}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Floating Action Button (Now relative to the centered column) */}
          <TouchableOpacity 
            className="absolute bottom-10 right-6 w-16 h-16 bg-white rounded-full items-center justify-center shadow-xl shadow-white/20"
            style={{ elevation: 10 }}
            onPress={() => navigation.navigate('Register')}
          >
            <Plus size={32} color="black" strokeWidth={3} />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}