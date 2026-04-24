import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';
// Note: Ensure you installed lucide-react-native
import { 
  Bell, 
  Eye, 
  PlusSquare, 
  ArrowDownSquare, 
  Home as HomeIcon, 
  PieChart, 
  Repeat, 
  BarChart2, 
  User 
} from 'lucide-react-native';
import tw from 'twrnc';

import StockMiniCard from '../components/StockMiniCard';
import ActionButton from '../components/ActionButton';
import TopStockCard from '../components/TopStockCard';
import WatchlistItem from '../components/WatchlistItem';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <StatusBar barStyle="light-content" />
      
      {/* Main Scrollable Content */}
      <ScrollView 
        style={tw`flex-1`} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-32`}
      >
        {/* Blue Header Section */}
        <View style={tw`bg-[#3B59E9] pt-16 pb-36 px-6 rounded-b-[48px]`}>
          <View style={tw`flex-row justify-between items-center mb-8`}>
            <View>
              <Text style={tw`text-blue-100`}>Good Morning!</Text>
              <Text style={tw`text-white text-2xl font-bold`}>Hi, Jessica H</Text>
            </View>
            
            <TouchableOpacity style={tw`bg-white/20 p-3 rounded-full`}>
              <Bell color="white" size={24} />
              <View style={tw`absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#3B59E9]`} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Asset Card - Floating Overlap */}
        {/* In Native, we use negative margins to create the overlap effect */}
        <View style={tw`bg-white rounded-[32px] p-6 shadow-xl mx-6 -mt-24 border border-gray-100`}>
          <Text style={tw`text-gray-400 font-medium mb-1`}>Total Assets</Text>
          
          <View style={tw`flex-row items-center justify-between mb-6`}>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-3xl font-bold text-gray-900`}>₹27,170.01</Text>
              <TouchableOpacity style={tw`ml-3 p-1`}>
                <Eye size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
            <View style={tw`bg-green-50 px-3 py-1.5 rounded-xl flex-row items-center`}>
              <Text style={tw`text-green-500 font-bold text-sm`}>▲ 3.87%</Text>
              <Text style={tw`text-gray-400 text-[10px] ml-1`}>(24h)</Text>
            </View>
          </View>

          {/* Horizontal Stock Glance */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`-mx-1`}>
            <StockMiniCard symbol="AMZN" name="Amazon, Inc" change={1.76} logoColor="bg-black" />
            <StockMiniCard symbol="AAPL" name="Apple, Inc" change={0.85} logoColor="bg-gray-800" />
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={tw`px-6 flex-row mt-8 mb-10`}>
          <ActionButton title="Deposit" icon={PlusSquare} variant="primary" />
          <ActionButton title="Withdraw" icon={ArrowDownSquare} variant="secondary" />
        </View>

        {/* Top Stocks Section */}
        <View style={tw`px-6 mb-10`}>
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <Text style={tw`text-xl font-bold text-gray-900`}>Top Stocks</Text>
            <TouchableOpacity><Text style={tw`text-[#3B59E9] font-bold text-base`}>See All</Text></TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`-mx-1`}>
            <TopStockCard symbol="TSLA" name="Tesla" price="131.46" change={2.13} logoColor="bg-red-600" />
            <TopStockCard symbol="MSFT" name="Microsoft" price="120.32" change={-0.45} logoColor="bg-blue-500" />
            <TopStockCard symbol="RELI" name="Reliance" price="2,945.00" change={1.2} logoColor="bg-blue-900" />
          </ScrollView>
        </View>

        {/* Watchlist Section */}
        <View style={tw`px-6`}>
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <Text style={tw`text-xl font-bold text-gray-900`}>Watchlist</Text>
            <TouchableOpacity><Text style={tw`text-[#3B59E9] font-bold text-base`}>Add</Text></TouchableOpacity>
          </View>
          
          <WatchlistItem symbol="MSFT" name="Microsoft" price="716.21" change={1.33} logoColor="bg-blue-500" />
          <WatchlistItem symbol="TATA" name="Tata Motors" price="954.00" change={2.10} logoColor="bg-blue-800" />
          <WatchlistItem symbol="ZOMT" name="Zomato" price="192.45" change={-1.52} logoColor="bg-red-500" />
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4 pb-8 flex-row justify-between items-center`}>
        <NavIcon icon={HomeIcon} label="Home" active={activeTab === 'home'} onPress={() => setActiveTab('home')} />
        <NavIcon icon={PieChart} label="Portfolio" active={activeTab === 'portfolio'} onPress={() => setActiveTab('portfolio')} />
        <NavIcon icon={Repeat} label="Exchange" active={activeTab === 'exchange'} onPress={() => setActiveTab('exchange')} />
        <NavIcon icon={BarChart2} label="Markets" active={activeTab === 'markets'} onPress={() => setActiveTab('markets')} />
        <NavIcon icon={User} label="Profile" active={activeTab === 'profile'} onPress={() => setActiveTab('profile')} />
      </View>
    </View>
  );
}

const NavIcon = ({ icon: Icon, label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={tw`items-center`}>
    <View style={tw`p-1`}>
      <Icon size={24} color={active ? '#3B59E9' : '#9CA3AF'} strokeWidth={active ? 2.5 : 2} />
    </View>
    <Text style={tw`text-[10px] mt-1 font-semibold ${active ? 'text-[#3B59E9]' : 'text-gray-400'}`}>
      {label}
    </Text>
    {active && <View style={tw`w-1 h-1 bg-[#3B59E9] rounded-full mt-1`} />}
  </TouchableOpacity>
);
