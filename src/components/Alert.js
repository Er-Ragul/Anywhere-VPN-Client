import React, { useState, useEffect } from 'react';
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
import { AlertTriangleIcon } from 'lucide-react-native';

export default function Alert({ title, button, message, updateAlert }) {

  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const modalMaxWidth = isTablet ? 'max-w-md' : 'max-w-[360px]';

  return(
      <TouchableWithoutFeedback>
        <View className="flex-1 bg-black/80 justify-center items-center px-5">
          <TouchableWithoutFeedback>
            {/* Modal Dialog Card */}
            <View
              className={`w-full ${modalMaxWidth} bg-[#161B26] border border-[#262D3D] rounded-[32px] p-6 items-center shadow-2xl`}
            >
              {/* Alert Badge Container */}
              <View className="w-16 h-16 rounded-[22px] bg-[#2A1620] border border-[#EF4444]/25 justify-center items-center shadow-lg shadow-red-950/40">
                <AlertTriangleIcon size={28} color="#EF4444" />
              </View>

              {/* Title */}
              <Text className="text-white text-xl font-poppins-bold mt-5 text-center tracking-tight">
                {title}
              </Text>

              {/* Description Body */}
              <Text className="text-[#94A3B8] text-[14px] leading-5 text-center mt-3 mb-6 px-1 font-poppins">
                {message}
                {/* <Text className="text-white font-bold">Local</Text> */}
              </Text>

              {/* Action Buttons */}
              <View className="w-full flex-row gap-3">
                {/* Cancel Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="flex-1 bg-[#222B3B] py-3.5 rounded-2xl items-center justify-center active:bg-[#2C374A]"
                  onPress={() => updateAlert('dismiss')}
                >
                  <Text className="text-white font-poppins text-base">Cancel</Text>
                </TouchableOpacity>

                {/* Disconnect Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  className="flex-1 bg-white py-3.5 rounded-2xl items-center justify-center active:bg-white shadow-md shadow-red-900/50"
                  onPress={() => updateAlert(button)}
                >
                  <Text className="text-black font-poppins text-base">{button}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
  )
}