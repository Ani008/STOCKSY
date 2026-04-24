import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

/**
 * @component TopStockCard
 * React Native version with Touchable interaction
 */
const TopStockCard = ({ symbol, name, price, change, logoColor }) => {
  const isPositive = change >= 0;

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={tw`bg-white rounded-[32px] p-5 mr-4 w-[180px] border border-gray-100 shadow-sm`}
    >
      {/* Header: Logo and Symbol Info */}
      <View style={tw`flex-row justify-between items-start mb-6`}>
        {/* Logo Circle */}
        <View style={tw`w-12 h-12 ${logoColor} rounded-full items-center justify-center`}>
          <Text style={tw`text-white font-bold text-lg`}>
            {symbol[0]}
          </Text>
        </View>

      </View>

      {/* Label */}
      <Text numberOfLines={1} style={tw`text-[16px] text-black`}>{name}</Text>

      {/* Price and Percentage Row */}
      <View style={tw`flex-row items-end justify-between`}>
        <Text style={tw`font-bold text-lg text-gray-900`}>₹{price}</Text>
        
        <Text style={tw`text-xs font-medium mb-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TopStockCard;