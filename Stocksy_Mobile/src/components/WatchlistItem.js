import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

/**
 * @component WatchlistItem
 * React Native version using twrnc
 */
const WatchlistItem = ({ symbol, name, price, change, logoColor }) => {
  const isPositive = change >= 0;

  return (
    <TouchableOpacity 
      activeOpacity={0.6}
      style={tw`flex-row items-center justify-between mb-6`}
    >
      {/* Left side: Logo and Name Info */}
      <View style={tw`flex-row items-center`}>
        {/* Rounded square icon container */}
        <View style={tw`w-12 h-12 ${logoColor} rounded-2xl items-center justify-center mr-4`}>
          <Text style={tw`text-white font-bold text-lg`}>
            {symbol[0]}
          </Text>
        </View>
        
        <View>
          <Text style={tw`text-[16px] text-black`}>{name}</Text>
        </View>
      </View>

      {/* Right side: Price and Change */}
      <View style={tw`items-end`}>
        <Text style={tw`font-bold text-lg text-gray-800`}>₹{price}</Text>
        <Text style={tw`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default WatchlistItem;