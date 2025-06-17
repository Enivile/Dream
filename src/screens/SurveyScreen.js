import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Platform, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { firestore } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useBackgroundMusic } from '../context/BackgroundMusicContext';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons'; // Added Ionicons import

const { width, height } = Dimensions.get('window');

// Survey questions and options
const surveyQuestions = [
  {
    id: 1,
    question: 'How much sleep do you usually get at night?',
    options: [
      { id: 'a', text: '6 hours or less' },
      { id: 'b', text: '6–8 hours' },
      { id: 'c', text: '8–10 hours' },
      { id: 'd', text: 'More than 10 hours' },
    ],
  },
  {
    id: 2,
    question: 'How satisfied are you with your sleep?',
    options: [
      { id: 'a', text: 'Very satisfied' },
      { id: 'b', text: 'Neutral' },
      { id: 'c', text: 'Unsatisfied' },
      { id: 'd', text: 'Very Unsatisfied' },
    ],
  },
  {
    id: 3,
    question: 'How long after getting in bed do you usually fall asleep?',
    options: [
      { id: 'a', text: 'Immediately' },
      { id: 'b', text: '10–15 minutes' },
      { id: 'c', text: '20–40 minutes' },
      { id: 'd', text: 'Hard to fall asleep' },
    ],
  },
  {
    id: 4,
    question: 'Do you snore? Has anyone ever seen you stop breathing in your sleep?',
    options: [
      { id: 'a', text: 'I don\'t know' },
      { id: 'b', text: 'No, I don\'t snore' },
      { id: 'c', text: 'Yes, I snore but nothing more' },
      { id: 'd', text: 'My partner has witnessed me stop breathing' },
    ],
  },
  {
    id: 5,
    question: 'Do you ever wake in the night and have trouble getting back to sleep?',
    options: [
      { id: 'a', text: 'Never' },
      { id: 'b', text: 'Every once in a while' },
      { id: 'c', text: 'Pretty often' },
      { id: 'd', text: 'Most nights' },
    ],
  },
  {
    id: 6,
    question: 'How often do you wake up in the morning still feeling tired?',
    options: [
      { id: 'a', text: 'Always' },
      { id: 'b', text: 'Usually' },
      { id: 'c', text: 'Sometimes' },
      { id: 'd', text: 'Rarely' },
    ],
  },
  {
    id: 7,
    question: 'How worried are you about your sleep?',
    options: [
      { id: 'a', text: 'Not at all' },
      { id: 'b', text: 'A little' },
      { id: 'c', text: 'Somewhat' },
      { id: 'd', text: 'Very much' },
    ],
  },
  {
    id: 8,
    question: 'Does lack of sleep affect your daily life?',
    options: [
      { id: 'a', text: 'Not at all' },
      { id: 'b', text: 'A little' },
      { id: 'c', text: 'Somewhat' },
      { id: 'd', text: 'Very much' },
    ],
  },
  {
    id: 9,
    question: 'Have you been diagnosed with any of the following?',
    options: [
      { id: 'a', text: 'Sleep apnea' },
      { id: 'b', text: 'Restless legs syndrome' },
      { id: 'c', text: 'Narcolepsy' },
      { id: 'd', text: 'None' },
    ],
  },
];

const SurveyScreen = () => {
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const { playBackgroundMusic, stopBackgroundMusic } = useBackgroundMusic();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim, setFadeAnim] = useState('fadeIn');

  // Play background music when the survey screen mounts
  useEffect(() => {
    playBackgroundMusic();
    
    // Stop background music when the component unmounts
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  // Check if survey was already completed
  useEffect(() => {
    const checkSurveyStatus = async () => {
      try {
        const surveyCompleted = await AsyncStorage.getItem('surveyCompleted');
        if (surveyCompleted === 'true') {
          navigation.navigate('Main');
        }
      } catch (error) {
        console.error('Error checking survey status:', error);
      }
    };

    checkSurveyStatus();
  }, [navigation]);

  const handleAnswer = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < surveyQuestions.length - 1) {
        handleNext();
      } else if (!isSubmitting) {
        // If it's the last question, submit the survey
        submitSurvey();
      }
    }, 500); // 500ms delay before advancing
  };

  const handleNext = () => {
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setFadeAnim('fadeOut');
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setFadeAnim('fadeIn');
      }, 300);
    } else {
      submitSurvey();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setFadeAnim('fadeOut');
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev - 1);
        setFadeAnim('fadeIn');
      }, 300);
    }
  };

  const submitSurvey = async () => {
    try {
      setIsSubmitting(true);
      
      // Format survey responses
      const surveyData = {
        completed: true,
        completedAt: new Date().toISOString(),
        responses: Object.entries(answers).reduce((acc, [questionId, optionId]) => {
          const question = surveyQuestions.find(q => q.id === parseInt(questionId));
          const option = question.options.find(o => o.id === optionId);
          
          acc[`question_${questionId}`] = {
            question: question.question,
            answer: option.text,
            optionId: optionId
          };
          
          return acc;
        }, {})
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('surveyCompleted', 'true');
      await AsyncStorage.setItem('surveyResponses', JSON.stringify(surveyData));
      
      // If user is logged in, upload to Firebase
      if (currentUser) {
        await setDoc(doc(firestore, 'users', currentUser.uid, 'surveys', 'sleepSurvey'), surveyData);
      }
      
      // Navigate to loader screen instead of main app flow
      navigation.navigate('SurveyLoader');
    } catch (error) {
      console.error('Error completing survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === surveyQuestions.length - 1;
  const isAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/images/Survey_Back.webp')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient overlay for smooth fade from top to bottom */}
        <LinearGradient 
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']} 
          style={styles.gradientOverlay}
        />
        
        {/* Back button at top-left */}
        {currentQuestionIndex > 0 && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        
        <View style={styles.progressContainer}>
          {surveyQuestions.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.progressDot, 
                index === currentQuestionIndex ? styles.activeDot : 
                index < currentQuestionIndex ? styles.completedDot : {}
              ]}
            />
          ))}
        </View>
        
        <Animatable.View 
          animation={fadeAnim} 
          duration={300} 
          style={styles.content}
        >
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1} of {surveyQuestions.length}
          </Text>
          
          <Text style={styles.question}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  answers[currentQuestion.id] === option.id && styles.selectedOption
                ]}
                onPress={() => handleAnswer(currentQuestion.id, option.id)}
              >
                <BlurView intensity={80} tint="dark" style={styles.blurView}>
                  <Text style={[
                    styles.optionText,
                    answers[currentQuestion.id] === option.id && styles.selectedOptionText
                  ]}>
                    {option.text}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>
        
        {/* Removed the navigation container with back/next buttons */}
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
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    marginTop: 20,
    paddingBottom: 20,
    zIndex: 2,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6200EE',
  },
  completedDot: {
    backgroundColor: 'rgba(98, 0, 238, 0.5)',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    zIndex: 2,
  },
  questionNumber: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
    textAlign: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    marginBottom: 16,
    borderRadius: 15,
    overflow: 'hidden',
    // Glass-like effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  blurView: {
    padding: 20,
    borderRadius: 15,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#6200EE',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ?  60 : 40, // Adjusted to be below status bar
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(98, 0, 238, 0.5)',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SurveyScreen;