import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
// Note the "-native" at the end of the import
import { PlusSquare } from 'lucide-react-native'; 
import tw from 'twrnc';

const ActionButton = ({ title, icon: Icon, variant = 'primary' }) => {
  // Logic for dynamic styles
  const containerStyle = variant === 'primary' 
    ? 'bg-blue-600 shadow-lg' 
    : 'bg-white border border-gray-200';
    
  const textStyle = variant === 'primary' 
    ? 'text-white' 
    : 'text-blue-600';

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={tw`flex-1 flex-row items-center justify-center py-4 rounded-3xl mx-1 ${containerStyle}`}
    >
      {/* Icon color needs to be passed as a prop in Native */}
      <Icon 
        size={20} 
        color={variant === 'primary' ? 'white' : '#2563eb'} 
        style={tw`mr-2`} 
      />
      <Text style={tw`font-bold ${textStyle}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default ActionButton;