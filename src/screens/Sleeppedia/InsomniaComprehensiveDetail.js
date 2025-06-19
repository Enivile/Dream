import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import colors from '../../theme/colors';
import shadows from '../../theme/shadows';

const { width } = Dimensions.get('window');

const InsomniaComprehensiveDetail = () => {
  const navigation = useNavigation();

  const handleSoundscapePress = (soundName) => {
    // Navigate to player with specific sound
    navigation.navigate('PlayerScreen', { soundName });
  };

  const handleSleepToolsPress = () => {
    // Navigate to main player or home screen
    navigation.navigate('Home');
  };

  return (
    <LinearGradient colors={['#121212', '#000000']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerLogo}>
          <Image 
            source={require('../../../assets/images/icons/premium.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Dream App</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Image 
          source={require('../../../assets/images/Blogs/Insomnia 1.jpg')} 
          style={styles.headerImage}
          resizeMode="cover"
        />
        
        <Text style={styles.title}>Understanding Insomnia: Why You Can't Sleep and What to Do About It</Text>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.introText}>
            Insomnia is a common sleep disorder that affects millions, causing difficulty falling or staying asleep. 
            It can be short-term (acute) or persist for months (chronic), impacting both sleep quality and overall well-being.
          </Text>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Causes</Text>
          
          <View style={styles.subSectionContainer}>
            <Text style={styles.subSectionTitle}>Stress & Anxiety:</Text>
            <Text style={styles.bodyText}>Racing thoughts and life stressors disrupt relaxation.</Text>
          </View>
          
          <View style={styles.subSectionContainer}>
            <Text style={styles.subSectionTitle}>Poor Sleep Habits:</Text>
            <Text style={styles.bodyText}>Irregular routines, screen use, or caffeine near bedtime.</Text>
          </View>
          
          <View style={styles.subSectionContainer}>
            <Text style={styles.subSectionTitle}>Medical & Mental Conditions:</Text>
            <Text style={styles.bodyText}>Pain, reflux, depression, PTSD, and more.</Text>
          </View>
          
          <View style={styles.subSectionContainer}>
            <Text style={styles.subSectionTitle}>Medications & Substances:</Text>
            <Text style={styles.bodyText}>Some drugs, alcohol, and nicotine interfere with sleep.</Text>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Common Symptoms</Text>
          
          <View style={styles.bulletPointContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>Trouble falling asleep</Text>
          </View>
          
          <View style={styles.bulletPointContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>Waking often during the night</Text>
          </View>
          
          <View style={styles.bulletPointContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>Fatigue and low energy</Text>
          </View>
          
          <View style={styles.bulletPointContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>Irritability and mood changes</Text>
          </View>
          
          <View style={styles.bulletPointContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>Poor focus and concentration</Text>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Diagnosis & Tracking</Text>
          <Text style={styles.bodyText}>
            Doctors use sleep history, exams, or sleep diaries. Apps like Dream can track patterns and support better habits.
          </Text>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How to Manage Insomnia</Text>
          
          <View style={styles.subSectionContainer}>
            <Text style={styles.subSectionTitle}>Cognitive Behavioral Therapy (CBT-I):</Text>
            <Text style={styles.bodyText}>Addresses the mental and behavioral roots of insomnia.</Text>
          </View>
          
          <View style={styles.subSectionContainer}>
            <Text style={styles.subSectionTitle}>Sleep Hygiene:</Text>
            <Text style={styles.bodyText}>Keep consistent schedules, reduce screen time, and make your bedroom sleep-friendly.</Text>
          </View>
          
          <View style={styles.subSectionContainer}>
            <Text style={styles.subSectionTitle}>Relaxation Techniques:</Text>
            <Text style={styles.bodyText}>Meditation, breathing, and calming sounds aid winding down.</Text>
          </View>
          
          <View style={styles.subSectionContainer}>
            <Text style={styles.subSectionTitle}>Lifestyle Habits:</Text>
            <Text style={styles.bodyText}>Exercise, sunlight exposure, and limiting naps help reset sleep cycles.</Text>
          </View>
          
          <View style={styles.subSectionContainer}>
            <Text style={styles.subSectionTitle}>Medication (short-term only):</Text>
            <Text style={styles.bodyText}>Can help temporarily but has side effects.</Text>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How Dream App Helps</Text>
          <Text style={styles.bodyText}>
            With sleep tracking, personalized routines, soothing sounds, and science-backed insights, 
            Dream App is your companion to better nights and brighter days.
          </Text>
        </View>
        
        {/* Soundscape Banner */}
        <View style={styles.soundscapeBanner}>
          <LinearGradient 
            colors={['rgba(137, 43, 226, 0.2)', 'rgba(29, 185, 84, 0.2)']} 
            style={styles.bannerGradient}
          >
            <Text style={styles.bannerTitle}>Try These Sleep Sounds</Text>
            <Text style={styles.bannerSubtitle}>Scientifically designed to help you fall asleep faster</Text>
            
            <View style={styles.soundscapeButtons}>
              <TouchableOpacity 
                style={styles.soundscapeButton}
                onPress={() => handleSoundscapePress('Soothing Ocean')}
              >
                <Ionicons name="water" size={20} color={colors.whiteText} />
                <Text style={styles.soundscapeButtonText}>Soothing Ocean</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.soundscapeButton}
                onPress={() => handleSoundscapePress('Deep Sleep Mix')}
              >
                <Ionicons name="moon" size={20} color={colors.whiteText} />
                <Text style={styles.soundscapeButtonText}>Deep Sleep Mix</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        
        {/* CTA Section */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={handleSleepToolsPress}
          >
            <LinearGradient 
              colors={[colors.accent, colors.primary]} 
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaButtonText}>Explore Sleep Tools in Dream App</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.whiteText} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            If insomnia persists, consult a healthcare provider. With the right tools and understanding, restful sleep is within reach.
          </Text>
        </View>
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
  },
  logoText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: width,
    height: 250,
    marginBottom: 20,
  },
  title: {
    color: colors.whiteText,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sectionContainer: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: colors.whiteText,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textShadowColor: 'rgba(137, 43, 226, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subSectionContainer: {
    marginBottom: 15,
  },
  subSectionTitle: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  introText: {
    color: colors.softWhite,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'justify',
  },
  bodyText: {
    color: colors.softWhite,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'justify',
  },
  bulletPointContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    color: colors.accent,
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
  },
  bulletText: {
    color: colors.softWhite,
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  soundscapeBanner: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
    ...shadows.medium,
  },
  bannerGradient: {
    padding: 20,
    backgroundColor: 'rgba(35, 35, 35, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bannerTitle: {
    color: colors.whiteText,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: colors.greyText,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  soundscapeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  soundscapeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(137, 43, 226, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  soundscapeButtonText: {
    color: colors.whiteText,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ctaButton: {
    borderRadius: 25,
    overflow: 'hidden',
    ...shadows.medium,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  ctaButtonText: {
    color: colors.whiteText,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  disclaimerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  disclaimerText: {
    color: colors.greyText,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default InsomniaComprehensiveDetail;