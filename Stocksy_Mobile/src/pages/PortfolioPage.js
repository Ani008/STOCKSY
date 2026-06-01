// src/pages/PortfolioPage.js
// ─────────────────────────────────────────────────────────────────────────────
// Fully dynamic portfolio screen.
// Data flows:  useMarketData (WebSocket) → usePortfolio (enriches positions)
//                                        → this page (renders live)
// Every field — prices, P&L, allocation — updates in real-time.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, SafeAreaView, StatusBar, ActivityIndicator,
  Animated, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useMarketData from '../hooks/useMarketData';
import { usePortfolio, SECTOR_COLORS } from '../hooks/usePortfolio';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  blue:        '#1A56DB',
  blueDark:    '#1240A8',
  blueLight:   '#3B82F6',
  green:       '#059669',
  greenBg:     '#D1FAE5',
  red:         '#DC2626',
  redBg:       '#FEE2E2',
  amber:       '#D97706',
  bg:          '#F0F4FF',
  white:       '#FFFFFF',
  textPri:     '#0F172A',
  textSec:     '#64748B',
  textTer:     '#94A3B8',
  border:      '#E2E8F0',
  cardShadow:  'rgba(15,23,42,0.06)',
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return '—';
  return '₹' + Math.abs(n).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(n) {
  if (n == null || isNaN(n)) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function sign(n) {
  return n >= 0 ? 'pos' : 'neg';
}

// ─── Reusable: PnlText — colour + optional prefix arrow ──────────────────────
function PnlText({ value, pct, style, size = 13 }) {
  const isPos = value >= 0;
  const color = isPos ? C.green : C.red;
  return (
    <Text style={[{ fontSize: size, fontWeight: '600', color }, style]}>
      {isPos ? '+' : '-'}{fmt(value)}
      {pct != null ? `  (${fmtPct(pct)})` : ''}
    </Text>
  );
}

// ─── Reusable: StatTile — small metric card ────────────────────────────────
function StatTile({ label, value, sub, subColor, icon, iconColor }) {
  return (
    <View style={styles.tile}>
      {icon && (
        <View style={[styles.tileIconWrap, { backgroundColor: (iconColor ?? C.blue) + '18' }]}>
          <Ionicons name={icon} size={16} color={iconColor ?? C.blue} />
        </View>
      )}
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
      {sub != null && (
        <Text style={[styles.tileSub, { color: subColor ?? C.textSec }]}>{sub}</Text>
      )}
    </View>
  );
}

// ─── Reusable: SectionCard ────────────────────────────────────────────────────
function SectionCard({ title, action, onAction, children }) {
  return (
    <View style={styles.card}>
      {(title || action) && (
        <View style={styles.cardHeader}>
          {title && <Text style={styles.cardTitle}>{title}</Text>}
          {action && (
            <TouchableOpacity onPress={onAction}>
              <Text style={styles.cardAction}>{action}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

// ─── Reusable: HoldingRow — live flashing price on change ─────────────────────
function HoldingRow({ position, onPress }) {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const prevLtp   = useRef(position.ltp);

  useEffect(() => {
    if (prevLtp.current !== position.ltp && position.ltp != null) {
      prevLtp.current = position.ltp;
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      ]).start();
    }
  }, [position.ltp]);

  const flashBg = flashAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      'rgba(0,0,0,0)',
      position.unrealisedPnl >= 0 ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
    ],
  });

  const isPos = position.unrealisedPnl >= 0;
  // Sector colour dot
  const dotColor = SECTOR_COLORS[position.sector] ?? SECTOR_COLORS.Other;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={[styles.holdingRow, { backgroundColor: flashBg }]}>
        {/* Sector dot */}
        <View style={[styles.sectorDot, { backgroundColor: dotColor }]} />

        <View style={styles.holdingInfo}>
          <Text style={styles.holdingSymbol}>{position.symbol ?? position.instrument_key}</Text>
          <Text style={styles.holdingMeta} numberOfLines={1}>{position.name}</Text>
        </View>

        <View style={styles.holdingQty}>
          <Text style={styles.holdingQtyText}>{position.qty} shares</Text>
          <Text style={styles.holdingAvg}>Avg {fmt(position.avgCost)}</Text>
        </View>

        <View style={styles.holdingRight}>
          <Text style={styles.holdingLtp}>
            {position.ltp != null ? fmt(position.ltp) : '—'}
          </Text>
          <Text style={[styles.holdingPnl, { color: isPos ? C.green : C.red }]}>
            {fmtPct(position.unrealisedPct)}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Reusable: SectorBar ─────────────────────────────────────────────────────
function SectorBar({ allocation }) {
  if (!allocation?.length) return null;
  return (
    <View>
      {/* Segmented bar */}
      <View style={styles.allocBarWrap}>
        {allocation.map((item, i) => (
          <View
            key={item.sector}
            style={[
              styles.allocSegment,
              { flex: item.pct, backgroundColor: item.color },
              i === 0 && { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
              i === allocation.length - 1 && { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
            ]}
          />
        ))}
      </View>
      {/* Legend */}
      <View style={styles.allocLegend}>
        {allocation.map(item => (
          <View key={item.sector} style={styles.allocLegendItem}>
            <View style={[styles.allocDot, { backgroundColor: item.color }]} />
            <Text style={styles.allocLegendText}>{item.sector} {item.pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Reusable: PerformerCard ──────────────────────────────────────────────────
function PerformerCard({ label, position, labelColor }) {
  if (!position) return null;
  const isPos = position.unrealisedPnl >= 0;
  return (
    <View style={[styles.performerCard, { borderLeftColor: labelColor, borderLeftWidth: 3 }]}>
      <Text style={[styles.performerLabel, { color: labelColor }]}>{label}</Text>
      <Text style={styles.performerSymbol}>{position.symbol}</Text>
      <Text style={styles.performerName} numberOfLines={1}>{position.name}</Text>
      <PnlText value={position.unrealisedPnl} pct={position.unrealisedPct} size={12} />
    </View>
  );
}

// ─── Reusable: PnlBreakdownRow ────────────────────────────────────────────────
function PnlBreakdownRow({ label, value, pct, dimmed }) {
  const isPos = value >= 0;
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, dimmed && { color: C.textTer }]}>{label}</Text>
      <View style={styles.breakdownRight}>
        <Text style={[styles.breakdownValue, { color: isPos ? C.green : C.red }]}>
          {isPos ? '+' : '-'}{fmt(value)}
        </Text>
        {pct != null && (
          <Text style={[styles.breakdownPct, { color: isPos ? C.green : C.red }]}>
            {fmtPct(pct)}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PortfolioPage({ navigation }) {
  const { prices } = useMarketData();          // live WS prices
  const {
    positions, totals, sectorAllocation,
    wallets, bestPerformer, worstPerformer,
    loading, error, refresh,
  } = usePortfolio(prices);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.blueLight} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Portfolio</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={C.blue} />
          <Text style={styles.loaderText}>Loading portfolio…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.blueLight} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Portfolio</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loaderWrap}>
          <Ionicons name="cloud-offline-outline" size={40} color={C.textTer} />
          <Text style={styles.errorText}>Couldn't load portfolio</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const noPositions = positions.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.blueLight} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Ionicons name="add" size={22} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* ── Hero: Portfolio Value ── */}
      <View style={styles.heroZone}>
        <Text style={styles.heroLabel}>Portfolio Value</Text>
        <Text style={styles.heroValue}>{fmt(totals.portfolioValue)}</Text>
        <View style={styles.heroRow}>
          {/* Today badge */}
          <View style={[
            styles.badge,
            { backgroundColor: totals.totalToday >= 0 ? 'rgba(5,150,105,0.25)' : 'rgba(220,38,38,0.25)' }
          ]}>
            <Ionicons
              name={totals.totalToday >= 0 ? 'caret-up' : 'caret-down'}
              size={11}
              color={totals.totalToday >= 0 ? '#6EE7B7' : '#FCA5A5'}
            />
            <Text style={[styles.badgeText, {
              color: totals.totalToday >= 0 ? '#6EE7B7' : '#FCA5A5'
            }]}>
              {fmtPct(totals.todayPct)} today
            </Text>
          </View>
          {/* Invested */}
          <Text style={styles.heroSub}>
            Invested {fmt(totals.totalInvested)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.blue}
            colors={[C.blue]}
          />
        }
      >
        {/* ── 4 stat tiles ── */}
        <View style={styles.tileGrid}>
          <StatTile
            label="Today's Return"
            value={(totals.totalToday >= 0 ? '+' : '') + fmt(totals.totalToday)}
            sub={fmtPct(totals.todayPct)}
            subColor={totals.totalToday >= 0 ? C.green : C.red}
            icon="today-outline"
            iconColor={totals.totalToday >= 0 ? C.green : C.red}
          />
          <StatTile
            label="Lifetime Return"
            value={(totals.totalLifetime >= 0 ? '+' : '') + fmt(totals.totalLifetime)}
            sub={fmtPct(totals.lifetimePct)}
            subColor={totals.totalLifetime >= 0 ? C.green : C.red}
            icon="trending-up-outline"
            iconColor={totals.totalLifetime >= 0 ? C.green : C.red}
          />
          <StatTile
            label="Unrealised"
            value={(totals.totalUnrealised >= 0 ? '+' : '') + fmt(totals.totalUnrealised)}
            sub={fmtPct(totals.unrealisedPct)}
            subColor={totals.totalUnrealised >= 0 ? C.green : C.red}
            icon="stats-chart-outline"
            iconColor={C.blue}
          />
          <StatTile
            label="Cash Balance"
            value={fmt(totals.cashBalance)}
            sub={`${totals.positionCount} position${totals.positionCount !== 1 ? 's' : ''}`}
            icon="wallet-outline"
            iconColor={C.amber}
          />
        </View>

        {/* ── P&L Breakdown ── */}
        <SectionCard title="P&L Breakdown">
          <PnlBreakdownRow
            label="Unrealised P&L"
            value={totals.totalUnrealised}
            pct={totals.unrealisedPct}
          />
          <PnlBreakdownRow
            label="Realised P&L"
            value={totals.totalRealised}
          />
          <View style={styles.breakdownDivider} />
          <PnlBreakdownRow
            label="Total Lifetime P&L"
            value={totals.totalLifetime}
            pct={totals.lifetimePct}
          />
        </SectionCard>

        {/* ── Best / Worst performer ── */}
        {(bestPerformer || worstPerformer) && (
          <View style={styles.performerRow}>
            <PerformerCard label="Best" position={bestPerformer} labelColor={C.green} />
            <PerformerCard label="Worst" position={worstPerformer} labelColor={C.red} />
          </View>
        )}

        {/* ── Holdings ── */}
        <SectionCard
          title={`Holdings (${positions.length})`}
          action={positions.length > 5 ? 'See all' : null}
        >
          {noPositions ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="briefcase-outline" size={36} color={C.textTer} />
              <Text style={styles.emptyText}>No open positions</Text>
            </View>
          ) : (
            positions.map(pos => (
              <HoldingRow
                key={pos.instrument_key}
                position={pos}
                onPress={() => {}}
              />
            ))
          )}
        </SectionCard>

        {/* ── Sector Allocation ── */}
        {sectorAllocation.length > 0 && (
          <SectionCard title="Sector Allocation">
            <SectorBar allocation={sectorAllocation} />
            {/* Value breakdown */}
            <View style={{ marginTop: 14, gap: 8 }}>
              {sectorAllocation.map(item => (
                <View key={item.sector} style={styles.sectorRow}>
                  <View style={styles.sectorRowLeft}>
                    <View style={[styles.allocDot, { backgroundColor: item.color }]} />
                    <Text style={styles.sectorName}>{item.sector}</Text>
                  </View>
                  <Text style={styles.sectorValue}>{fmt(item.value)}</Text>
                  <Text style={styles.sectorPct}>{item.pct}%</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        {/* ── Wallets ── */}
        {wallets.length > 0 && (
          <SectionCard title="Wallets">
            {wallets.map((w, i) => (
              <View key={i} style={styles.walletRow}>
                <View style={styles.walletIconWrap}>
                  <Ionicons name="wallet-outline" size={18} color={C.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.walletType}>{w.wallet_type ?? `Wallet ${i + 1}`}</Text>
                  {w.currency && <Text style={styles.walletCurrency}>{w.currency}</Text>}
                </View>
                <Text style={styles.walletBalance}>{fmt(parseFloat(w.balance))}</Text>
              </View>
            ))}
          </SectionCard>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.blueLight },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.white,
    letterSpacing: 0.2,
  },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  heroZone: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.5,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11, fontWeight: '600',
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },

  // Tile grid
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: (SCREEN_W - 42) / 2,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  tileIconWrap: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  tileLabel: { fontSize: 11, color: C.textSec, fontWeight: '500', marginBottom: 3 },
  tileValue: { fontSize: 15, fontWeight: '700', color: C.textPri },
  tileSub:   { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle:  { fontSize: 14, fontWeight: '700', color: C.textPri },
  cardAction: { fontSize: 13, color: C.blue, fontWeight: '500' },

  // Holding row
  holdingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    gap: 10,
    borderRadius: 6,
    paddingHorizontal: 2,
  },
  sectorDot:      { width: 8, height: 8, borderRadius: 4 },
  holdingInfo:    { flex: 2 },
  holdingSymbol:  { fontSize: 13, fontWeight: '700', color: C.textPri },
  holdingMeta:    { fontSize: 10, color: C.textSec, marginTop: 1 },
  holdingQty:     { flex: 2, alignItems: 'flex-start' },
  holdingQtyText: { fontSize: 11, color: C.textSec },
  holdingAvg:     { fontSize: 10, color: C.textTer, marginTop: 1 },
  holdingRight:   { alignItems: 'flex-end' },
  holdingLtp:     { fontSize: 13, fontWeight: '700', color: C.textPri },
  holdingPnl:     { fontSize: 11, fontWeight: '600', marginTop: 1 },

  // P&L breakdown
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: { fontSize: 13, color: C.textSec },
  breakdownRight: { alignItems: 'flex-end' },
  breakdownValue: { fontSize: 13, fontWeight: '700' },
  breakdownPct:   { fontSize: 11, fontWeight: '500', marginTop: 1 },
  breakdownDivider: {
    height: 0.5, backgroundColor: C.border, marginVertical: 4,
  },

  // Best/Worst
  performerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  performerCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: C.border,
    gap: 3,
  },
  performerLabel:  { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  performerSymbol: { fontSize: 14, fontWeight: '800', color: C.textPri, marginTop: 2 },
  performerName:   { fontSize: 10, color: C.textSec, marginBottom: 4 },

  // Sector bar
  allocBarWrap: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 2,
  },
  allocSegment: { height: '100%' },
  allocLegend: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10,
  },
  allocLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  allocLegendText: { fontSize: 11, color: C.textSec },
  allocDot: { width: 8, height: 8, borderRadius: 4 },

  // Sector value list
  sectorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  sectorRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  sectorName:    { fontSize: 12, color: C.textPri, fontWeight: '500' },
  sectorValue:   { fontSize: 12, fontWeight: '600', color: C.textPri },
  sectorPct:     { fontSize: 11, color: C.textSec, width: 36, textAlign: 'right' },

  // Wallets
  walletRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  walletIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.blue + '14',
    alignItems: 'center', justifyContent: 'center',
  },
  walletType:     { fontSize: 13, fontWeight: '600', color: C.textPri },
  walletCurrency: { fontSize: 11, color: C.textSec, marginTop: 1 },
  walletBalance:  { fontSize: 14, fontWeight: '700', color: C.textPri },

  // Loading / error
  loaderWrap: {
    flex: 1,
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loaderText:  { fontSize: 14, color: C.textSec },
  errorText:   { fontSize: 15, fontWeight: '600', color: C.textPri },
  errorSub:    { fontSize: 12, color: C.textSec, textAlign: 'center', paddingHorizontal: 40 },
  retryBtn: {
    marginTop: 8, paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: C.blue, borderRadius: 20,
  },
  retryText: { color: C.white, fontWeight: '600', fontSize: 14 },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 13, color: C.textTer },
});