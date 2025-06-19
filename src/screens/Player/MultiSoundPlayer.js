// src/screens/Player/MultiSoundPlayer.js

/**
 * MultiSoundPlayer Component
 * 
 * This component provides a full-screen interface for playing and controlling multiple sounds
 * simultaneously. It serves as the main player UI in the application's audio playback system.
 * 
 * Key features:
 * - Displays a list of all currently playing sounds
 * - Provides individual volume controls for each sound
 * - Allows removing sounds from the player
 * - Offers global play/pause functionality
 * - Supports minimizing to the MiniPlayer component
 * - Allows adding sounds to favorites
 * 
 * The component integrates with MiniPlayerContext to manage sound playback state
 * and synchronize with the mini player when minimized.
 */

import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, ScrollView, Dimensions, Animated } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useMiniPlayer } from "../../context/MiniPlayerContext";
import { useAuth } from "../../context/AuthContext";
import { addToFavorites, checkIsFavorite } from "../../utils/favoritesHistoryService";
import { useNavigation } from "@react-navigation/native";
import colors from "../../theme/colors";
import shadows from "../../theme/shadows";
import RadialTimerSelector from "../../components/RadialTimerSelector";


/**
 * MultiSoundPlayer Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.sounds - Array of sound objects to display and control
 * @param {Function} props.onRemoveSound - Callback function when a sound is removed
 * @param {Function} props.onClose - Callback function when the player is closed
 * @returns {React.ReactElement} The rendered component
 */
const MultiSoundPlayer = ({ sounds, onRemoveSound, onClose }) => {
  // Access required functions and state from the MiniPlayerContext
  const {
    showMiniPlayer,
    hideMiniPlayer,
    toggleMiniPlayerPlay,
    removeSoundFromMiniPlayer,
    volumes,
    handleVolumeChange,
    isMiniPlayerPlaying,
    setMainPlayerVisible,
    updateMiniPlayerSounds,
  } = useMiniPlayer();
  
  // Access authentication context
  const { currentUser, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  
  // State to track favorite status of each sound
  const [favorites, setFavorites] = useState({});
  
  // State for timer functionality
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [timerDuration, setTimerDuration] = useState(null);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [timerRemaining, setTimerRemaining] = useState(null);


  /**
   * Effect hook to synchronize the component with MiniPlayerContext
   * 
   * This effect runs when the component mounts or when the sounds array changes.
   * It updates the context with the current sounds and sets visibility flags.
   * The cleanup function ensures the main player is marked as hidden when unmounted.
   */
  useEffect(() => {
    updateMiniPlayerSounds(sounds || []);
    showMiniPlayer(sounds || []);
    setMainPlayerVisible(true);
    
    // Check favorite status for each sound if user is logged in
    const checkFavorites = async () => {
      if (isAuthenticated && currentUser && sounds) {
        const favoritesStatus = {};
        for (const sound of sounds) {
          try {
            const { isFavorite, favoriteId } = await checkIsFavorite(currentUser.uid, sound.id);
            favoritesStatus[sound.id] = { isFavorite, favoriteId };
          } catch (error) {
            console.error(`Error checking favorite status for sound ${sound.id}:`, error);
          }
        }
        setFavorites(favoritesStatus);
      }
    };
    
    checkFavorites();
    
    return () => {
      setMainPlayerVisible(false);
    };
  }, [sounds, currentUser, isAuthenticated]);
  
  /**
   * Effect hook to manage the timer countdown
   * 
   * This effect runs when timerEndTime changes and handles the countdown
   * logic, stopping playback when the timer expires.
   */
  useEffect(() => {
    let intervalId;
    
    if (timerEndTime) {
      // Start the countdown interval
      intervalId = setInterval(() => {
        const now = new Date().getTime();
        const remaining = timerEndTime - now;
        
        if (remaining <= 0) {
          // Timer expired - stop playback and clear timer
          if (isMiniPlayerPlaying) {
            toggleMiniPlayerPlay(); // Pause playback
          }
          clearInterval(intervalId);
          setTimerEndTime(null);
          setTimerRemaining(null);
          setTimerDuration(null);
          Alert.alert("Timer Ended", "Playback has been stopped.");
        } else {
          // Update remaining time
          setTimerRemaining(remaining);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerEndTime, isMiniPlayerPlaying, toggleMiniPlayerPlay]);

  /**
   * Removes a sound from the player
   * 
   * This function removes a sound from both the context and triggers the parent component's
   * onRemoveSound callback if provided.
   * 
   * @param {string} id - The unique identifier of the sound to remove
   */
  const handleRemove = async (id) => {
    await removeSoundFromMiniPlayer(id);
    if (onRemoveSound) onRemoveSound(id);
  };
  
  /**
   * Adds the current sounds to the user's favorites
   * Requires user to be logged in
   */
  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Login Required", 
        "Please login to save favorites.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => navigation.navigate("Login") }
        ]
      );
      return;
    }
    
    try {
      if (sounds.length > 1) {
        // Create a mix entry for multiple sounds
        const mixData = {
          id: `mix-${Date.now()}`,
          name: "Custom Mix",
          icon: "musical-notes-outline",
          sounds: sounds,
          type: "mix"
        };
        
        await addToFavorites(currentUser.uid, mixData);
        Alert.alert("Success", "Mix added to favorites!");
      } else if (sounds.length === 1) {
        // Add single sound to favorites
        const sound = sounds[0];
        
        // Check if already a favorite
        if (favorites[sound.id]?.isFavorite) {
          Alert.alert("Already in Favorites", "This sound is already in your favorites.");
          return;
        }
        
        const favoriteId = await addToFavorites(currentUser.uid, { ...sound, type: "sound" });
        
        // Update local state
        setFavorites(prev => ({
          ...prev,
          [sound.id]: { isFavorite: true, favoriteId }
        }));
        
        Alert.alert("Success", "Sound added to favorites!");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Alert.alert("Error", "Failed to add to favorites. Please try again.");
    }
  };

  /**
   * Minimizes the player to show the mini player instead
   * 
   * This function updates visibility states in the context and triggers the parent
   * component's onClose callback to handle navigation.
   */
  const handleMinimize = () => {
    setMainPlayerVisible(false);
    showMiniPlayer(sounds);
    if (onClose) onClose();
  };
  
  /**
   * Sets a timer for automatic playback stop
   * 
   * @param {number} minutes - Duration in minutes before playback stops
   */
  const handleSetTimer = (minutes) => {
    // Calculate end time based on current time plus duration
    const now = new Date().getTime();
    const endTime = now + (minutes * 60 * 1000);
    
    setTimerDuration(minutes);
    setTimerEndTime(endTime);
    setTimerRemaining(minutes * 60 * 1000);
    setTimerModalVisible(false);
    
    // Show confirmation to user
    Alert.alert(
      "Timer Set", 
      `Playback will stop in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
    );
  };
  
  /**
   * Updates the timer duration based on timeline scroll position
   * 
   * @param {number} value - Timeline value in minutes
   */
  const handleSliderChange = (value) => {
    // Value is already rounded to nearest 5 minutes in the TimerSlider component
    setTimerDuration(value);
  };
  
  /**
   * Updates the timer duration when timeline scrolling is complete
   * but does NOT start the timer automatically
   */
  const handleSliderComplete = (value) => {
    // Only update the duration, don't start the timer
    if (value || timerDuration) {
      setTimerDuration(value || timerDuration);
    }
  };
  
  /**
   * Cancels the currently active timer
   */
  const handleCancelTimer = () => {
    setTimerEndTime(null);
    setTimerRemaining(null);
    setTimerDuration(null);
    setTimerModalVisible(false);
    
    Alert.alert("Timer Cancelled", "The sleep timer has been cancelled.");
  };
  
  /**
   * Formats milliseconds into a readable time string (MM:SS)
   * 
   * @param {number} ms - Time in milliseconds
   * @returns {string} Formatted time string
   */
  const formatTimeRemaining = (ms) => {
    if (!ms) return "";
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  /**
   * Render the component UI
   */
  return (
    <View style={styles.overlay}>
      {/* Timer Selection Modal */}
      <Modal
        visible={timerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTimerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Timer</Text>
            
            {/* Timer selector */}
            <View style={styles.timerSelectorContainer}>
              <RadialTimerSelector
                onValueChange={handleSliderChange}
                onSelectionComplete={handleSliderComplete}
                initialValue={timerDuration || 30}
                minValue={0}
                maxValue={120}
                snapInterval={5}
                size={260}
              />
            </View>
            
            {/* Start button */}
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => handleSetTimer(timerDuration || 0)}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
            
            {/* Cancel timer button - only shown if timer is active */}
            {timerEndTime && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelTimer}
              >
                <Text style={styles.cancelButtonText}>Cancel Timer</Text>
              </TouchableOpacity>
            )}
            
            {/* Close modal button */}
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setTimerModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Floating header with control buttons outside the player container */}
      <View style={styles.floatingHeader}>
        {/* Back button - returns to previous screen */}
        <TouchableOpacity onPress={onClose} style={styles.floatingButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Right side buttons container */}
        <View style={styles.rightButtonsContainer}>
          {/* Minimize button - switches to mini player */}
          <TouchableOpacity onPress={handleMinimize} style={[styles.floatingButton, styles.rightButton]}>
            <Ionicons name="remove" size={24} color="#fff" />
          </TouchableOpacity>
          
          {/* Close button - completely closes the player and clears sounds */}
          <TouchableOpacity
            onPress={() => {
              hideMiniPlayer(true); // Pass true to clear sounds array
              setMainPlayerVisible(false);
              if (onClose) onClose();
            }}
            style={[styles.floatingButton, styles.rightButton]}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.playerContainer}>
        {/* Header section with just the title */}
        <View style={styles.header}>
          <Text style={styles.title}>Now Playing</Text>
        </View>

        {/* List of sounds with individual volume controls */}
        <FlatList
          data={sounds}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.soundRow}>
              {/* Sound icon */}
              <Ionicons name={item.icon} size={24} color="#fff" style={{ marginRight: 10 }} />
              
              {/* Sound name */}
              <Text style={styles.soundName}>{item.name}</Text>
              
              {/* Volume slider for individual sound control */}
              <Slider
                style={{ flex: 1, marginHorizontal: 10 }}
                minimumValue={0}
                maximumValue={1}
                value={volumes[item.id] ?? 1}
                onSlidingComplete={(value) => handleVolumeChange(item.id, value)}
                minimumTrackTintColor="#0D47A1"
                maximumTrackTintColor="#fff"
                thumbTintColor="#0D47A1"
              />
              
              {/* Remove sound button */}
              <TouchableOpacity onPress={() => handleRemove(item.id)}>
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Footer controls */}
      <View style={styles.footerControls}>
        {/* Add to Favorites button */}
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={handleAddToFavorites}
        >
          <Ionicons 
            name={sounds?.length === 1 && favorites[sounds[0].id]?.isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={sounds?.length === 1 && favorites[sounds[0].id]?.isFavorite ? "#FF3B30" : "#fff"} 
          />
        </TouchableOpacity>
        
        {/* Global play/pause button for controlling all sounds */}
        <TouchableOpacity style={styles.playPauseButton} onPress={toggleMiniPlayerPlay}>
          <Ionicons name={isMiniPlayerPlaying ? "pause" : "play"} size={28} color="#fff" />
        </TouchableOpacity>
        
        {/* Timer button */}
        <TouchableOpacity 
          style={[styles.footerButton, timerRemaining ? styles.activeTimerButton : null]}
          onPress={() => setTimerModalVisible(true)}
        >
          <Ionicons name="timer-outline" size={24} color="#fff" />
          {timerRemaining && (
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>{Math.ceil(timerRemaining / 60000)}m</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(18,18,18,0.98)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  floatingHeader: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 1100,
  },
  rightButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightButton: {
    marginLeft: 10,
  },
  floatingButton: {
    backgroundColor: "rgba(35,35,35,0.8)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.light,
  },
  playerContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: colors.darkBackground,
    borderRadius: 16, // Slightly smaller border radius
    padding: 20,
    ...shadows.medium,
    marginTop: 60, // Add space for the floating header
  },
  header: {
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 10,
  },
  title: {
    color: colors.whiteText,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: colors.lightBackground,
    borderRadius: 12,
    padding: 10,
  },
  soundName: {
    color: colors.whiteText,
    fontSize: 16,
    minWidth: 40,
    marginRight: 0,
  },
  footerControls: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
  },
  playPauseButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButton: {
    backgroundColor: colors.semiTransparentWhite,
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeTimerButton: {
    backgroundColor: colors.activeGreen, // Green tint to indicate active timer
  },
  timerBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 30,
  },
  timerText: {
    color: colors.whiteText,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: colors.modalBackground,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.semiTransparentWhite,
    maxHeight: "85%",
  },
  modalTitle: {
    color: colors.whiteText,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  timerSelectorContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },

  startButton: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
    ...shadows.light,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  startButtonText: {
    color: colors.whiteText,
    fontWeight: "bold",
    fontSize: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cancelButton: {
    backgroundColor: colors.error,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.semiTransparentWhite,
  },
  cancelButtonText: {
    color: colors.whiteText,
    fontWeight: "bold",
  },
  closeModalButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.semiTransparentWhite,
  },
});

export default MultiSoundPlayer;

