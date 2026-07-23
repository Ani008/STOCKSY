import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, StatusBar, Image, ScrollView 
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

const BLUE = Colors.primary;
const GREEN = Colors.gain;
const RED = Colors.dangerDark;
const BG = Colors.surfaceAlt;
const WHITE = Colors.white;
const TEXT_PRI = Colors.text;
const TEXT_SEC = Colors.textSecondary;
const BORDER = Colors.borderLight;

const renderMiniChart = (points, color) => {
  const width = 60;
  const height = 30;
  const path = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${(i * (width / (points.length - 1)))} ${height - (p * height)}`
  ).join(' ');

  return (
    <Svg width={width} height={height}>
      <Path d={path} fill="none" stroke={color} strokeWidth="2" />
    </Svg>
  );
};

const BASKETS = [
  {
    id: '1',
    name: 'Rakesh Jhunjhunwala',
    image: 'https://imgs.search.brave.com/VP8RK4a4AEXi6NhtgZqrOjuhAE4GmBhmrnSd1Fe06ao/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi9lL2VhL1No/cmlfUmFrZXNoX1Jh/ZGhleXNoeWFtX0po/dW5qaHVud2FsYS5q/cGcvNTEycHgtU2hy/aV9SYWtlc2hfUmFk/aGV5c2h5YW1fSmh1/bmpodW53YWxhLmpw/Zw',
    desc: 'The Big Bull’s top long-term picks.',
    returns: '14.2%',
    holdings: [
      { id: 's1', ticker: 'TITAN', name: 'Titan Company', price: '3,450', change: '+1.2%', isPositive: true, chart: [0.2, 0.5, 0.4, 0.8, 0.7, 0.9] },
      { id: 's2', ticker: 'TATAMOTORS', name: 'Tata Motors', price: '920', change: '-0.5%', isPositive: false, chart: [0.8, 0.7, 0.8, 0.5, 0.4, 0.3] },
    ]
  },
  {
    id: '2',
    name: 'Radhakishan Damani',
    image: 'https://tradebrains-wp.s3.ap-south-1.amazonaws.com/wp-content/uploads/2025/10/RK-Damani-1-1080x675.jpg', // Professional Profile
    desc: 'Retail king and founder of DMart; focused on value and cash flow.',
    returns: '12.8%',
    holdings: [
      { id: 'rd1', ticker: 'DMART', name: 'Avenue Supermarts', price: '4,443', change: '+1.7%', isPositive: true, chart: [0.3, 0.5, 0.7, 0.6, 0.8, 1.0] },
      { id: 'rd2', ticker: 'VSTIND', name: 'VST Industries Ltd', price: '256', change: '+0.8%', isPositive: true, chart: [0.2, 0.3, 0.2, 0.4, 0.5, 0.6] },
      { id: 'rd3', ticker: 'UBL', name: 'United Breweries', price: '1,477', change: '-0.4%', isPositive: false, chart: [0.8, 0.7, 0.5, 0.6, 0.4, 0.3] },
      { id: 'rd4', ticker: 'BLUEDART', name: 'Blue Dart Express', price: '7,210', change: '+1.1%', isPositive: true, chart: [0.4, 0.4, 0.6, 0.7, 0.9, 0.8] },
    ]
  },
  {
    id: '3',
    name: 'Vijay Kedia',
    image: 'https://imgs.search.brave.com/mrdpUKgU-S736mqEDpoTS0g7VdzQo25OhK7ihDBpw3k/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi9lL2UzL1Zp/amF5S2VkaWEuanBn/LzUxMnB4LVZpamF5/S2VkaWEuanBn', // Official Gallery Image
    desc: 'Specialist in high-growth small and mid-cap "SMILE" stocks.',
    returns: '22.1%',
    holdings: [
      { id: 'vk1', ticker: 'ELECON', name: 'Elecon Engineering', price: '512', change: '+5.7%', isPositive: true, chart: [0.1, 0.4, 0.3, 0.7, 0.8, 1.0] },
      { id: 'vk2', ticker: 'WEBELSOLAR', name: 'Websol Energy System', price: '106', change: '+10.0%', isPositive: true, chart: [0.2, 0.2, 0.5, 0.8, 0.9, 1.0] },
      { id: 'vk3', ticker: 'ATULAUTO', name: 'Atul Auto Ltd', price: '645', change: '-2.7%', isPositive: false, chart: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4] },
      { id: 'vk4', ticker: 'TAC', name: 'TAC Infosec Ltd', price: '450', change: '+3.6%', isPositive: true, chart: [0.3, 0.4, 0.5, 0.7, 0.8, 0.9] },
    ]
  },
  {
  id: '4',
  name: 'Ashish Kacholia',
  image: 'https://imgs.search.brave.com/sNmTYWLx2MBcS5h5vxNBEv_l-CG33dIQ8wBWiXw-LMg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jbXMt/cmVzb3VyY2VzLnBv/Y2tldGZ1bC5pbi9i/bG9nL3dwLWNvbnRl/bnQvdXBsb2Fkcy8y/MDI1LzEyL0FzaGlz/aC1LYWNob2xpYS1Q/b3J0Zm9saW8uanBn', // High-quality profile placeholder
  desc: 'The "Big Whale" focusing on high-growth small and mid-cap gems.',
  returns: '18.5%',
  holdings: [
    { id: 'ak1', ticker: 'SHAILY', name: 'Shaily Engineering', price: '2,503', change: '+2.1%', isPositive: true, chart: [0.3, 0.4, 0.6, 0.5, 0.8, 0.9] },
    { id: 'ak2', ticker: 'BETADRUGS', name: 'Beta Drugs Ltd', price: '1,336', change: '+1.4%', isPositive: true, chart: [0.2, 0.3, 0.5, 0.4, 0.6, 0.7] },
    { id: 'ak3', ticker: 'SAFARI', name: 'Safari Industries', price: '1,470', change: '-0.8%', isPositive: false, chart: [0.8, 0.7, 0.7, 0.6, 0.5, 0.4] },
    { id: 'ak4', ticker: 'XPROINDIA', name: 'Xpro India Ltd', price: '1,024', change: '+0.5%', isPositive: true, chart: [0.4, 0.5, 0.4, 0.6, 0.7, 0.8] },
    { id: 'ak5', ticker: 'KMEW', name: 'Knowledge Marine', price: '1,675', change: '+3.2%', isPositive: true, chart: [0.1, 0.3, 0.5, 0.7, 0.9, 1.0] },
  ]
}
];

export default function App() {
  const [view, setView] = useState('baskets'); 
  const [selectedBasket, setSelectedBasket] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);

  const handleBack = () => {
    if (view === 'details') setView('holdings');
    else if (view === 'holdings') setView('baskets');
  };

  const renderBasketItem = ({ item }) => (
    <TouchableOpacity style={styles.basketCard} onPress={() => { setSelectedBasket(item); setView('holdings'); }}>
      <View style={styles.basketHeader}>
        <Image source={{ uri: item.image }} style={styles.profileImg} />
        <View style={styles.returnsBadge}><Text style={styles.returnsText}>{item.returns}</Text></View>
      </View>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDesc}>{item.desc}</Text>
    </TouchableOpacity>
  );

  const renderStockItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.stockRow} 
      onPress={() => { setSelectedStock(item); setView('details'); }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.stockTicker}>{item.ticker}</Text>
        <Text style={styles.stockFull}>{item.name}</Text>
      </View>
      <View style={styles.chartContainer}>{renderMiniChart(item.chart, item.isPositive ? GREEN : RED)}</View>
      <View style={styles.stockRight}>
        <Text style={styles.stockPrice}>₹{item.price}</Text>
        <Text style={[styles.stockChange, { color: item.isPositive ? GREEN : RED }]}>{item.change}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStockDetail = () => (
    <ScrollView style={{ flex: 1, backgroundColor: WHITE }}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTicker}>{selectedStock?.ticker} • NSE</Text>
        <Text style={styles.detailName}>{selectedStock?.name}</Text>
        <Text style={styles.detailPrice}>₹{selectedStock?.price}</Text>
        <Text style={[styles.detailChange, { color: selectedStock?.isPositive ? GREEN : RED }]}>
            {selectedStock?.change} (1.88%) <Text style={{color: TEXT_SEC}}>1D</Text>
        </Text>
      </View>

      {/* Placeholder for Candlestick Chart */}
      <View style={styles.mainChartPlaceholder}>
         <Ionicons name="trending-up" size={100} color={BORDER} />
         <Text style={{color: TEXT_SEC}}>Interactive Chart Component</Text>
      </View>

      <View style={styles.performanceCard}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.rowBetween}>
            <View>
                <Text style={styles.label}>Today's Low</Text>
                <Text style={styles.value}>1,362.90</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.label}>Today's High</Text>
                <Text style={styles.value}>1,384.40</Text>
            </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.sipBtn}><Text style={styles.sipText}>SIP</Text></TouchableOpacity>
        <TouchableOpacity style={styles.sellBtn}><Text style={styles.btnText}>Sell</Text></TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn}><Text style={styles.btnText}>Buy</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topHeader}>
        {view !== 'baskets' && (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={WHITE} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
            {view === 'baskets' ? "Investor Baskets" : view === 'holdings' ? "Holdings" : selectedStock?.ticker}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentArea}>
        {view === 'details' ? renderStockDetail() : (
            <FlatList 
                data={view === 'baskets' ? BASKETS : selectedBasket.holdings}
                renderItem={view === 'baskets' ? renderBasketItem : renderStockItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: moderateScale(16) }}
            />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: moderateScale(16), height: 60, marginTop: moderateScale(40) },
  headerTitle: { fontSize: fontScale(Typography.h4), fontWeight: '700', color: WHITE },
  contentArea: { flex: 1, backgroundColor: BG, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  // ... (previous styles)
  basketCard: { backgroundColor: WHITE, padding: moderateScale(20), borderRadius: 20, marginBottom: moderateScale(16), elevation: 2 },
  basketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: moderateScale(12) },
  profileImg: { width: 50, height: 50, borderRadius: 25, backgroundColor: BORDER },
  returnsBadge: { backgroundColor: GREEN + '15', paddingHorizontal: moderateScale(10), borderRadius: 12, height: 26, justifyContent: 'center' },
  returnsText: { color: GREEN, fontWeight: 'bold', fontSize: fontScale(Typography.small) },
  cardTitle: { fontSize: fontScale(Typography.h4), fontWeight: '700', color: TEXT_PRI },
  cardDesc: { color: TEXT_SEC, fontSize: fontScale(Typography.caption), marginTop: moderateScale(4) },
  stockRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, padding: moderateScale(16), borderRadius: 15, marginBottom: moderateScale(10) },
  stockTicker: { fontSize: fontScale(Typography.body), fontWeight: '700' },
  stockFull: { fontSize: fontScale(Typography.tiny), color: TEXT_SEC },
  chartContainer: { marginHorizontal: moderateScale(10) },
  stockRight: { alignItems: 'flex-end', width: 80 },
  stockPrice: { fontSize: fontScale(Typography.body), fontWeight: '700' },
  stockChange: { fontSize: fontScale(Typography.small), fontWeight: '600' },

  // Detail View Styles
  detailHeader: { padding: moderateScale(20) },
  detailTicker: { color: TEXT_SEC, fontSize: fontScale(14), fontWeight: '600' },
  detailName: { fontSize: fontScale(22), fontWeight: '700', color: TEXT_PRI, marginVertical: moderateScale(4) },
  detailPrice: { fontSize: fontScale(Typography.h1), fontWeight: '800', color: TEXT_PRI },
  detailChange: { fontSize: fontScale(Typography.bodyLarge), fontWeight: '600', marginTop: moderateScale(4) },
  mainChartPlaceholder: { height: 250, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderColor: BORDER },
  performanceCard: { padding: moderateScale(20) },
  sectionTitle: { fontSize: fontScale(Typography.h4), fontWeight: '700', marginBottom: moderateScale(15) },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: TEXT_SEC, fontSize: fontScale(Typography.small) },
  value: { fontSize: fontScale(Typography.bodyLarge), fontWeight: '600', marginTop: moderateScale(4) },
  buttonContainer: { flexDirection: 'row', padding: moderateScale(16), borderTopWidth: 1, borderColor: BORDER, gap: moderateScale(10) },
  sipBtn: { flex: 1, height: 50, borderRadius: 10, borderWidth: 1, borderColor: BORDER, justifyContent: 'center', alignItems: 'center' },
  sellBtn: { flex: 2, height: 50, borderRadius: 10, backgroundColor: RED, justifyContent: 'center', alignItems: 'center' },
  buyBtn: { flex: 2, height: 50, borderRadius: 10, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  sipText: { fontWeight: '700', color: TEXT_SEC },
  btnText: { color: WHITE, fontWeight: '700', fontSize: fontScale(Typography.bodyLarge) }
});