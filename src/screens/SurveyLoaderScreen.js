import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useBackgroundMusic } from '../context/BackgroundMusicContext';

const SurveyLoaderScreen = ({ route }) => {
  const navigation = useNavigation();
  const { stopBackgroundMusic } = useBackgroundMusic();
  const [percentage, setPercentage] = useState(0);
  const animationValue = useRef(new Animated.Value(0)).current;
  
  // Duration of the loading animation in milliseconds (adjust as needed)
  const ANIMATION_DURATION = 3000; // 3 seconds
  const PAUSE_DURATION = 400; // 0.4 seconds pause

  useEffect(() => {
    // Create a sequence of animations with pauses at 40% and 64%
    Animated.sequence([
      // Animate from 0% to 40%
      Animated.timing(animationValue, {
        toValue: 40,
        duration: ANIMATION_DURATION * 0.4, // 40% of total duration
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      
      // Pause at 40%
      Animated.delay(PAUSE_DURATION),
      
      // Animate from 40% to 64%
      Animated.timing(animationValue, {
        toValue: 64,
        duration: ANIMATION_DURATION * 0.24, // 24% of total duration
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      
      // Pause at 64%
      Animated.delay(PAUSE_DURATION),
      
      // Animate from 64% to 100%
      Animated.timing(animationValue, {
        toValue: 100,
        duration: ANIMATION_DURATION * 0.36, // 36% of total duration
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();

    // Update the percentage state as animation progresses
    const listener = animationValue.addListener(({ value }) => {
      setPercentage(Math.floor(value));
    });

    // Calculate total animation time including pauses
    const totalDuration = ANIMATION_DURATION + (PAUSE_DURATION * 2) + 200;

    // Navigate to Main screen when animation completes
    const timer = setTimeout(() => {
      // Stop background music before navigating to Main screen
      stopBackgroundMusic();
      navigation.navigate('Main');
    }, totalDuration); // Add a small delay after animation completes

    // Clean up
    return () => {
      animationValue.removeListener(listener);
      clearTimeout(timer);
    };
  }, []);

  // Calculate the circle's circumference
  const circleSize = 200;
  const radius = circleSize / 2 - 15; // Accounting for stroke width
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the stroke dashoffset based on percentage
  const strokeDashoffset = Animated.multiply(
    Animated.subtract(100, animationValue),
    circumference / 100
  );

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/images/Survey_Back.webp')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient overlay for smooth fade from top to bottom */}
        <LinearGradient 
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']} 
          style={styles.gradientOverlay}
        />
        
        <View style={styles.loaderContainer}>
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
            <View style={styles.circleContainer}>
              {/* Background circle */}
              <View style={[styles.circleBackground, { width: circleSize, height: circleSize }]} />
              
              {/* Progress ring track */}
              <View style={[styles.progressTrack, { width: circleSize, height: circleSize }]} />
              
              {/* Animated progress ring */}
              <Animated.View 
                style={[
                  styles.progressRing, 
                  { 
                    width: circleSize, 
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    borderWidth: 12,
                    borderColor: 'transparent',
                    borderTopColor: '#6200EE',
                    borderRightColor: '#6200EE',
                    transform: [{ 
                      rotate: Animated.multiply(animationValue, 3.6).interpolate({
                        inputRange: [0, 360],
                        outputRange: ['-90deg', '270deg']
                      }) 
                    }]
                  }
                ]}
              />
              
              {/* Spinning animation overlay */}
              <Animated.View 
                style={[
                  styles.spinningRing, 
                  { 
                    width: circleSize + 20, 
                    height: circleSize + 20,
                    borderRadius: (circleSize + 20) / 2,
                    borderWidth: 2,
                    borderColor: 'transparent',
                    borderTopColor: 'rgba(98, 0, 238, 0.3)',
                    transform: [{ 
                      rotate: Animated.multiply(animationValue, 10).interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '3600deg']
                      }) 
                    }]
                  }
                ]}
              />
              
              {/* Percentage text */}
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageText}>{percentage}%</Text>
                <Text style={styles.percentageLabel}>Complete</Text>
              </View>
            </View>
            
            <Text style={styles.messageText}>Analyzing your sleep profile...</Text>
            <Text style={styles.subMessageText}>Creating personalized recommendations</Text>
          </BlurView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  loaderContainer: {
    width: 320,
    height: 400,
    borderRadius: 25,
    overflow: 'hidden',
    zIndex: 2,
    // Enhanced glass-like effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  circleContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  circleBackground: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  progressTrack: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 12,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressRing: {
    position: 'absolute',
  },
  spinningRing: {
    position: 'absolute',
  },

  percentageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  percentageText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  percentageLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  messageText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subMessageText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SurveyLoaderScreen;