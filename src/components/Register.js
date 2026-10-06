import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield, 
  Server, 
  ServerCog,
  Satellite,
  ScanQrCode
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

export default function Register(){

  const navigation = useNavigation()
  let [server, setServer] = useState(null)
  let [name, setName] = useState(null)
  let [loader, setLoader] = useState(false)

  let registerDevice = async() => {
    if(server != null && name != null){
      if(server.length > 0 && name.length > 0){
        axios.get(`http://${server}:5678/webhook-test/register`, {
          params: {
            name, server
          }
        })
        .then(response => {
          if(response.data.status == 'success'){
            saveNetwork(response.data.token, server)
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
      }
      else{
        console.log("Don't leave any fields empty!")
      }
    }
    else{
      console.log("Don't leave any fields empty!")
    }
  }

  let saveNetwork = async(token, address) => {
    let localdb = await AsyncStorage.getItem('networks');
    if(localdb != null){
      let signatures = JSON.parse(localdb)
      let data = {
        id: signatures.length,
        name: name,
        token: token,
        address: address
      }
      signatures.push(data)
      await AsyncStorage.setItem('networks', JSON.stringify(signatures));
      navigation.navigate('Connection')
    }
    else{
      let signatures = [{
        id: 0,
        name: name,
        token: token,
        address: address
      }]
      await AsyncStorage.setItem('networks', JSON.stringify(signatures));
      navigation.navigate('Connection')
    }
  }

  if(loader){
    return(
      <View className="flex-1 bg-[#0a0a0b">
        <LinearGradient
          colors={['#1f2128', '#0a0a0b']}
          className="absolute inset-0"
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
        />
        <SafeAreaView className="flex-1 max-w-3xl self-center">
          <View className="flex-1 justify-center px-10 py-10">
                {/* Logo Section */}
                <View className="items-center">
                  <LottieView
                    autoPlay={true}
                    style={{
                      width: 400,
                      height: 400,
                    }}
                    source={require('../../assets/loading.json')}
                  />
                </View>
            </View>
        </SafeAreaView>
      </View>
    )
  }
  else{
    return (
      <View className="flex-1 bg-[#0a0a0b]">
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <LinearGradient
          colors={['#1f2128', '#0a0a0b']}
          className="absolute inset-0"
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
        />

        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'android' ? StatusBar.currentHeight : 0}
          >
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* 
                UPDATED CONTAINER: 
                1. w-full: Ensures it takes full width on phones.
                2. max-w-md: Limits width on tablets (approx 448px). 
                3. self-center: Centers the container horizontally in the ScrollView.
              */}
              <View className="flex-1 justify-center px-7 py-10 w-full max-w-md self-center">
                
                {/* Logo Section */}
                <View className="items-center mb-10">
                  <View className="w-28 h-28 bg-[#1a1b21] rounded-[32px] border border-zinc-800/50 items-center justify-center shadow-2xl">
                    <View className="relative">
                      <Shield size={44} color="#f4f4f5" strokeWidth={1.5} />
                      <View className="absolute inset-0 items-center justify-center pt-1">
                        <Satellite size={18} color="#f4f4f5" strokeWidth={2.5} />
                      </View>
                    </View>
                  </View>
                  
                  <Text className="text-white text-4xl font-bold mt-10 tracking-tight text-center">
                    Anywhere Hub
                  </Text>
                  <Text className="text-zinc-500 text-lg mt-2 text-center font-medium">
                    Register your device on your private network
                  </Text>
                </View>

                {/* Form Section */}
                <View className="gap-y-6">
                  {/* Server Input */}
                  <View>
                    <Text className="text-zinc-500 text-[10px] font-bold tracking-[2px] uppercase mb-3 ml-1">
                      SERVER FQDN / IP
                    </Text>
                    <View className="flex-row items-center bg-[#131418] border border-zinc-800/60 rounded-2xl px-5">
                      <Server size={20} color="#52525b" />
                      <TextInput
                        value={server}
                        placeholder="Ex: vpn.anywhere.in"
                        placeholderTextColor="#3f3f46"
                        className="flex-1 text-white h-16 ml-3 text-base"
                        autoCapitalize="none"
                        underlineColorAndroid="transparent"
                        onChangeText={(value) => setServer(value)}
                      />
                    </View>
                  </View>

                  {/* Nick Name */}
                  <View>
                    <Text className="text-zinc-500 text-[10px] font-bold tracking-[2px] uppercase mb-3 ml-1">
                      Server Name / Location
                    </Text>
                    <View className="flex-row items-center bg-[#131418] border border-zinc-800/60 rounded-2xl px-5">
                      <ServerCog size={20} color="#52525b" />
                      <TextInput
                        value={name}
                        placeholder="Ex: India"
                        placeholderTextColor="#3f3f46"
                        className="flex-1 text-white h-16 ml-3 text-base"
                        underlineColorAndroid="transparent"
                        onChangeText={(value) => setName(value)}
                      />
                    </View>
                  </View>

                  {/* Connect Button */}
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    className="bg-white h-[56px] rounded-[24px] flex-row items-center justify-center mt-4 shadow-lg shadow-white/10"
                    onPress={registerDevice}
                  >
                    <Text className="text-black text-xl font-black mr-2">Register</Text>
                    <Satellite size={22} color="black" strokeWidth={3} />
                  </TouchableOpacity>

                  {/* Divider */}
                  <View className="flex-row items-center my-4 px-4">
                      <View className="flex-1 h-[1px] bg-zinc-800/50" />
                      <Text className="text-zinc-600 mx-4 font-bold text-[10px] tracking-widest">OR</Text>
                      <View className="flex-1 h-[1px] bg-zinc-800/50" />
                  </View>

                  {/* Connect Button */}
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    className="bg-white h-[56px] rounded-[24px] flex-row items-center justify-center mt-2 shadow-lg shadow-white/10"
                  >
                    <Text className="text-black text-xl font-black mr-2">QR-Register</Text>
                    <ScanQrCode size={22} color="black" strokeWidth={3} />
                  </TouchableOpacity>

                </View>

                {/* Version Info */}
                <View className="mt-12 items-center">
                  <Text className="text-zinc-700 text-xs font-semibold">
                    Version 1.0.0
                  </Text>
                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }
}