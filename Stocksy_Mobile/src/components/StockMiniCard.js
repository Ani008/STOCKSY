import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';


const StockMiniCard = ({ logoColor, symbol, name, change }) => {
  // We handle the dynamic text color for the percentage change here
  const changeColor = change >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <View style={tw`bg-white border border-gray-100 rounded-2xl p-3 mr-3 flex-row items-center w-[160px]`}>
      
      {/* Logo Circle - Note: logoColor needs to be a valid Tailwind bg-class like 'bg-blue-500' */}
      <View style={tw`w-10 h-10 ${logoColor} rounded-full items-center justify-center mr-3`}>
        <Text style={tw`text-white font-bold text-xs`}>
          {symbol[0]}
        </Text>
      </View>

      {/* Stock Info */}
      <View style={tw`flex-1`}>
        <Text numberOfLines={1} style={tw`font-bold text-gray-800 text-sm`}>
          {symbol}
        </Text>
        <Text numberOfLines={1} style={tw`text-gray-400 text-xs`}>
          {name}
        </Text>
      </View>

      {/* Percentage Change */}
      <View style={tw`ml-2`}>
        <Text style={tw`text-[10px] font-bold ${changeColor}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
        </Text>
      </View>
    </View>
  );
};

export default StockMiniCard;