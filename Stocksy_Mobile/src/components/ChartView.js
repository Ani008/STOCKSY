import React, { useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { WebView } from "react-native-webview";

import { Colors, fontScale, moderateScale } from "../theme";

/**
 * ChartView — TradingView Lightweight Charts — Line chart, transparent bg.
 * Credit: https://www.tradingview.com/lightweight-charts/
 *
 * Props:
 *   candles     array    — [{ time, open, high, low, close }]
 *   livePrice   number   — current ltp, updates line in real time
 *   isPositive  boolean  — true = green line, false = red line
 *   loading     boolean  — show spinner
 *   height      number   — chart height (default 220)
 */
const ChartView = ({
  candles = [],
  livePrice = null,
  isPositive = true,
  loading = false,
  height = 220,
}) => {
  const lineColor    = isPositive ? Colors.success : Colors.danger;
  const areaTopColor = isPositive ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)";
  const areaBotColor = isPositive ? "rgba(16,185,129,0.0)"  : "rgba(239,68,68,0.0)";

  // Convert OHLC candles → close-only line data for Lightweight Charts
  const lineJSON = useMemo(() => {
    const points = candles.map((c) => ({ time: c.time, value: c.close }));
    return JSON.stringify(points);
  }, [candles]);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <style>
    * { margin: 0; padding: 0; box-sizing:border-box; }
    html, body {
      width:100%; height:100vh;
      background:transparent;
      overflow:hidden;
    }
    #chart { width:100%; height:100%; }
    #msg {
      display:flex; align-items:center; justify-content:center;
      height:100%; font-family:sans-serif; font-size:13px;
      color:#94A3B8; text-align:center; padding:16px;
    }
  </style>
</head>
<body>
  <div id="msg">Loading chart...</div>
  <div id="chart" style="display:none"></div>

  <script src="https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js"></script>

  <script>
    var pollCount = 0;
    var poll = setInterval(function() {
      pollCount++;
      if (typeof LightweightCharts !== 'undefined') {
        clearInterval(poll);
        init();
      } else if (pollCount > 60) {
        clearInterval(poll);
        document.getElementById('msg').innerText = 'Chart library failed to load.';
      }
    }, 150);

    function init() {
      try {
        var lineData = ${lineJSON};

        if (!lineData || lineData.length === 0) {
          document.getElementById('msg').innerText = 'No data yet. Market may be closed.';
          return;
        }

        document.getElementById('msg').style.display = 'none';
        document.getElementById('chart').style.display = 'block';

        var chart = LightweightCharts.createChart(document.getElementById('chart'), {
          width: window.innerWidth,
          height: window.innerHeight,
          layout: {
            background: { type: 'solid', color: 'transparent' },
            textColor: '#94A3B8',
            fontSize: 10,
          },
          grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
          },
          crosshair: {
            mode: LightweightCharts.CrosshairMode.Magnet,
            vertLine: {
              color: '${lineColor}',
              width: 1,
              style: LightweightCharts.LineStyle.Dashed,
              labelBackgroundColor: '${lineColor}',
            },
            horzLine: {
              color: '${lineColor}',
              width: 1,
              style: LightweightCharts.LineStyle.Dashed,
              labelBackgroundColor: '${lineColor}',
            },
          },
          rightPriceScale: {
            borderVisible: false,
            scaleMargins: { top: 0.15, bottom: 0.1 },
            textColor: '#94A3B8',
          },
          timeScale: {
            borderVisible: false,
            textColor: '#94A3B8',
            timeVisible: true,
            secondsVisible: false,
            fixLeftEdge: true,
            fixRightEdge: true,
          },
          handleScale: true,
          handleScroll: true,
        });

        // Area series = line + gradient fill underneath (exactly like Groww)
        var areaSeries = chart.addAreaSeries({
          lineColor: '${lineColor}',
          lineWidth: 2,
          topColor: '${areaTopColor}',
          bottomColor: '${areaBotColor}',
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          crosshairMarkerBorderColor: '${lineColor}',
          crosshairMarkerBackgroundColor: '${lineColor}',
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineColor: '${lineColor}',
          priceLineWidth: 1,
          priceLineStyle: LightweightCharts.LineStyle.Dashed,
        });

        areaSeries.setData(lineData);
        chart.timeScale().fitContent();

        // Live price update from React Native
        window.updatePrice = function(price) {
          if (!price || !lineData.length) return;
          try {
            var last = lineData[lineData.length - 1];
            areaSeries.update({ time: last.time, value: price });
          } catch(e) {}
        };

        window.addEventListener('resize', function() {
          chart.applyOptions({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        });

      } catch(err) {
        document.getElementById('msg').style.display = 'flex';
        document.getElementById('msg').innerText = 'Chart error: ' + err.message;
      }
    }
  </script>
</body>
</html>`;

  const injectedJS = livePrice
    ? `(function(){ if(window.updatePrice) window.updatePrice(${livePrice}); })(); true;`
    : null;

  if (loading) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ height, width: "100%" }}>
      <WebView
        source={{ html }}
        style={{ flex: 1, backgroundColor: "transparent" }}
        mixedContentMode="always"
        originWhitelist={["*"]}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScript={injectedJS}
        allowsInlineMediaPlayback
        onError={(e) => console.warn("ChartView error:", e.nativeEvent)}
      />
      <Text style={styles.credit}>Charts by TradingView</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  credit: {
    position: "absolute",
    bottom: 4,
    right: 8,
    fontSize: fontScale(9),
    color: Colors.borderLight,
  },
});

export default ChartView;
