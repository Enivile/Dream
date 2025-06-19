/**
 * TimerModeToggle.js
 * 
 * A toggle component that allows users to switch between radial and linear timer modes.
 * Features a glass-like design with smooth animations and visual feedback.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import shadows from '../theme/shadows';

/**
 * TimerModeToggle Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.mode - Current mode: 'radial' or 'linear'
 * @param {Function} props.onModeChange - Callback when mode changes
 * @param {Object} props.style - Additional styles
 * @returns {React.ReactElement} The rendered component
 */
const TimerModeToggle = ({ mode = 'radial', onModeChange, style }) => {
  const handleToggle = () => {
    const newMode = mode === 'radial' ? 'linear' : 'radial';
    if (onModeChange) {
      onModeChange(newMode);
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          mode === 'radial' && styles.activeButton,
        ]}
        onPress={() => mode !== 'radial' && handleToggle()}
        activeOpacity={0.7}
      >
        <Ionicons
          name="radio-button-on-outline"
          size={20}
          color={mode === 'radial' ? colors.whiteText : colors.greyText}
        />
        <Text
          style={[
            styles.buttonText,
            mode === 'radial' && styles.activeButtonText,
          ]}
        >
          Radial
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.toggleButton,
          mode === 'linear' && styles.activeButton,
        ]}
        onPress={() => mode !== 'linear' && handleToggle()}
        activeOpacity={0.7}
      >
        <Ionicons
          name="remove-outline"
          size={20}
          color={mode === 'linear' ? colors.whiteText : colors.greyText}
        />
        <Text
          style={[
            styles.buttonText,
            mode === 'linear' && styles.activeButtonText,
          ]}
        >
          Linear
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(35, 35, 35, 0.6)',
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.light,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(137, 43, 226, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(137, 43, 226, 0.6)',
    ...shadows.light,
  },
  buttonText: {
    color: colors.greyText,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeButtonText: {
    color: colors.whiteText,
  },
});

export default TimerModeToggle;