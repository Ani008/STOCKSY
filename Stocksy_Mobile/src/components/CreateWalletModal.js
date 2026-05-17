import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * CreateWalletModal
 * A bottom-sheet-style modal for creating a new sub-wallet.
 *
 * Props:
 * @param {boolean}   visible          - Controls modal visibility
 * @param {function}  onClose          - Called when the user dismisses the modal
 * @param {function}  onSubmit         - Called with ({ name, amount }) when form is submitted
 * @param {number}    availableBalance - The user's current demoBalance (to show and validate against)
 * @param {boolean}   [loading]        - Shows spinner on the submit button while API call is in flight
 */
const CreateWalletModal = ({ visible, onClose, onSubmit, availableBalance = 0, loading = false }) => {
  const [walletName, setWalletName] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [error, setError] = useState('');

  const formattedAvailable = Number(availableBalance).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleClose = () => {
    setWalletName('');
    setWalletAmount('');
    setError('');
    onClose();
  };

  const handleSubmit = () => {
    setError('');
    const trimmedName = walletName.trim();
    const parsedAmount = parseFloat(walletAmount);

    if (!trimmedName) {
      setError('Please enter a wallet name.');
      return;
    }
    if (!walletAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (parsedAmount > availableBalance) {
      setError(`Amount exceeds your available balance of ₹${formattedAvailable}.`);
      return;
    }

    onSubmit({ name: trimmedName, amount: parsedAmount });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.kvContainer}
          >
            <View style={styles.sheet}>
              {/* Handle bar */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Create Wallet</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Available balance hint */}
              <View style={styles.balanceHint}>
                <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                <Text style={styles.balanceHintText}>
                  Available demo balance: <Text style={styles.balanceValue}>₹{formattedAvailable}</Text>
                </Text>
              </View>

              {/* Wallet Name Input */}
              <Text style={styles.label}>Wallet Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Swing Trading, Long Term"
                placeholderTextColor="#94A3B8"
                value={walletName}
                onChangeText={(t) => { setWalletName(t); setError(''); }}
                autoCapitalize="words"
                returnKeyType="next"
              />

              {/* Amount Input */}
              <Text style={styles.label}>Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10000"
                placeholderTextColor="#94A3B8"
                value={walletAmount}
                onChangeText={(t) => { setWalletAmount(t); setError(''); }}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {/* Inline error */}
              {error ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Submit button */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Wallet</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  kvContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  balanceHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
    gap: 6,
  },
  balanceHintText: {
    fontSize: 12,
    color: '#64748B',
  },
  balanceValue: {
    fontWeight: '700',
    color: '#00D09C',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
    marginTop: -8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: '#00D09C',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CreateWalletModal;
