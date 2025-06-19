/**
 * TimerSliderSelector.js
 * 
 * A modern horizontal slider timer selector component using @react-native-community/slider.
 * Replaces the problematic radial timer with a proven, reliable solution.
 * Features:
 * - Smooth horizontal slider interface
 * - Visual feedback with gradient styling
 * - Center display of selected time
 * - Glass-like aesthetic matching app design
 * - Snap points for precise time selection
 * - Expo SDK 52 compatible
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import colors from '../theme/colors';
import shadows from '../theme/shadows';

const { width: screenWidth } = Dimensions.get('window');

const TimerSliderSelector = ({
  initialValue = 30,
  minValue = 0,
  maxValue = 120,
  snapInterval = 5,
  onValueChange,
  onSelectionComplete,
  size = 280,
  ...props
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);

  // Handle value changes during sliding
  const handleValueChange = (value) => {
    // Snap to nearest interval
    const snappedValue = Math.round(value / snapInterval) * snapInterval;
    const clampedValue = Math.max(minValue, Math.min(maxValue, snappedValue));
    
    // Only update internal state during dragging, don't call onValueChange
    setCurrentValue(clampedValue);
    // We'll call onValueChange only when sliding is complete
  };

  // Handle sliding start
  const handleSlidingStart = () => {
    setIsDragging(true);
  };

  // Handle sliding complete
  const handleSlidingComplete = (value) => {
    setIsDragging(false);
    
    // Final snap to interval
    const snappedValue = Math.round(value / snapInterval) * snapInterval;
    const clampedValue = Math.max(minValue, Math.min(maxValue, snappedValue));
    
    setCurrentValue(clampedValue);
    
    // Now that sliding is complete, call both callbacks
    if (onValueChange) {
      onValueChange(clampedValue);
    }
    
    if (onSelectionComplete) {
      onSelectionComplete(clampedValue);
    }
  };

  // Generate tick marks for visual reference
  const renderTickMarks = () => {
    const ticks = [];
    const majorTickInterval = 15; // Major ticks every 15 minutes
    const sliderWidth = size * 0.8;
    
    for (let value = minValue; value <= maxValue; value += snapInterval) {
      const isMajorTick = value % majorTickInterval === 0;
      const position = ((value - minValue) / (maxValue - minValue)) * sliderWidth;
      
      ticks.push(
        <View
          key={value}
          style={[
            styles.tickMark,
            {
              left: position,
              height: isMajorTick ? 12 : 6,
              backgroundColor: isMajorTick ? colors.primary : colors.softWhite,
              opacity: isMajorTick ? 0.9 : 0.6,
            },
          ]}
        />
      );
      
      // Add labels for major ticks
      if (isMajorTick && value > 0) {
        ticks.push(
          <Text
            key={`label-${value}`}
            style={[
              styles.tickLabel,
              {
                left: position - 10, // Center the label
              },
            ]}
          >
            {value}
          </Text>
        );
      }
    }
    
    return ticks;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Center display */}
      <View style={styles.centerDisplay}>
        <Text style={styles.timeValue}>{currentValue}</Text>
        <Text style={styles.timeUnit}>min</Text>
      </View>
      
      {/* Slider container */}
      <View style={styles.sliderContainer}>
        {/* Tick marks */}
        <View style={[styles.tickContainer, { width: size * 0.8 }]}>
          {renderTickMarks()}
        </View>
        
        {/* Main slider */}
        <Slider
          style={[styles.slider, { width: size * 0.8 }]}
          minimumValue={minValue}
          maximumValue={maxValue}
          value={currentValue}
          step={snapInterval}
          onValueChange={handleValueChange}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={isDragging ? colors.activeGreen : colors.primary}
          maximumTrackTintColor={colors.semiTransparentWhite}
          thumbTintColor={isDragging ? colors.whiteText : colors.primary}
          tapToSeek={true}
        />
        
        {/* Value labels */}
        <View style={styles.labelContainer}>
          <Text style={styles.minLabel}>{minValue} min</Text>
          <Text style={styles.maxLabel}>{maxValue} min</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.modalBackground,
    borderRadius: 60,
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: colors.semiTransparentWhite,
    marginBottom: 40,
    ...shadows.medium,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.whiteText,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timeUnit: {
    fontSize: 14,
    color: colors.softWhite,
    marginTop: -4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sliderContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  tickContainer: {
    height: 20,
    position: 'relative',
    marginBottom: 10,
  },
  tickMark: {
    position: 'absolute',
    width: 2,
    bottom: 0,
    borderRadius: 1,
  },
  tickLabel: {
    position: 'absolute',
    bottom: -20,
    fontSize: 10,
    color: colors.softWhite,
    width: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  slider: {
    height: 40,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  minLabel: {
    fontSize: 12,
    color: colors.softWhite,
    opacity: 0.8,
  },
  maxLabel: {
    fontSize: 12,
    color: colors.softWhite,
    opacity: 0.8,
  },
});

export default TimerSliderSelector;