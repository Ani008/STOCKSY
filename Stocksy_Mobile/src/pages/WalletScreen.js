import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button'; // Adjust path to your component

const WalletScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.allTransactions}>All transactions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.cardLabel}>Your Demo Balance</Text>
          <Text style={styles.mainBalance}>₹10,000,00.00</Text>
          
          <View style={styles.dashedLine} />

          <View style={[styles.row, { marginTop: 20 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Your Wallet</Text>
              <Text style={styles.subText}>
                Add balance for stocks intraday and from demo wallet to your trading wallet. 
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActions}>
        <Button 
          title="Add money" 
          variant="primary" 
          style={styles.flexBtn} 
          onPress={() => {}} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  allTransactions: { color: '#64748B', fontWeight: '600', fontSize: 14, textDecorationLine: 'underline' },
  content: { padding: 20 },
  balanceCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  cardLabel: { textAlign: 'center', color: '#64748B', fontSize: 13, marginBottom: 8 },
  mainBalance: { textAlign: 'center', fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
  decimal: { fontSize: 18, color: '#94A3B8' },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 20,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rowLabel: { fontSize: 15, color: '#475569', fontWeight: '500' },
  rowValue: { fontSize: 15, color: '#1E293B', fontWeight: '600', textDecorationLine: 'underline' },
  subText: { fontSize: 12, color: '#94A3B8', marginTop: 4, lineHeight: 18, paddingRight: 20 },
  addText: { color: '#00D09C', fontWeight: 'bold', fontSize: 14 },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  flexBtn: { flex: 1 },
});

export default WalletScreen;