import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const VISUALIZER_WIDTH = width * 0.85;
const VISUALIZER_HEIGHT = 160;
const BAR_WIDTH = 4;
const BAR_GAP = 2;
const MAX_BARS = Math.floor(VISUALIZER_WIDTH / (BAR_WIDTH + BAR_GAP));

interface WaveformVisualizerProps {
  rmsLevel: number;
}

/**
 * WaveformVisualizer
 * Renders a high-fidelity real-time waveform based on RMS input.
 * Matches the "black on white card" aesthetic of the RADIO-XO design.
 */
export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ rmsLevel }) => {
  const [bars, setBars] = useState<number[]>(new Array(MAX_BARS).fill(2));
  
  useEffect(() => {
    // Boost sensitivity for better visual feedback (logarithmic-ish)
    // rmsLevel is 0..1, power of 0.5 boosts low values
    const boosted = Math.pow(rmsLevel, 0.4);
    const height = Math.max(4, boosted * VISUALIZER_HEIGHT * 0.8);
    
    setBars(prev => {
      const newBars = [...prev, height];
      if (newBars.length > MAX_BARS) {
        newBars.shift();
      }
      return newBars;
    });
  }, [rmsLevel]);

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        {bars.map((barHeight, index) => (
          <View 
            key={index}
            style={[
              styles.bar,
              { 
                height: barHeight,
                backgroundColor: '#000000',
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: VISUALIZER_WIDTH,
    height: VISUALIZER_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 10,
  },
  bar: {
    width: BAR_WIDTH,
    marginHorizontal: BAR_GAP / 2,
    borderRadius: BAR_WIDTH / 2,
  },
});
