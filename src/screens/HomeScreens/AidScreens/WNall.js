/**
 * WNall.js - White Noise All Sounds Screen
 * 
 * This component displays a grid of all available white noise sounds that users can download
 * and play. It integrates with the MiniPlayerContext to manage sound playback and navigation.
 */

import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For displaying icons
import { streamAndDownloadAudio, checkLocalAudioFile } from "../../../utils/firebaseAudioDownloader";
import * as FileSystem from "expo-file-system"; // For local file operations
import { useNavigation } from "@react-navigation/native"; // For navigation between screens
import { useMiniPlayer } from "../../../context/MiniPlayerContext"; // For managing sound playback

/**
 * Array of sound objects to be displayed in the grid.
 * Each sound has a unique ID, display name, and an icon from Ionicons.
 * 
 * @type {Array<{id: string, name: string, icon: string}>}
 */
const soundData = [
  { id: "1", name: "Birds", icon: "sunny-outline" },
  { id: "2", name: "Brown Noise", icon: "radio-outline" },
  { id: "3", name: "Calmness", icon: "cloudy-night-outline" },
  { id: "4", name: "Campfire", icon: "flame-outline" },
  { id: "5", name: "Cave", icon: "earth-outline" },
  { id: "6", name: "Ceiling Fan", icon: "sunny" },
  { id: "7", name: "Clock", icon: "time-outline" },
  { id: "8", name: "Computer Fan", icon: "desktop-outline" },
  { id: "9", name: "Crickets", icon: "bug-outline" },
  { id: "10", name: "Dreaming", icon: "cloudy-night-outline" },
  { id: "11", name: "Exhaust Fan", icon: "radio-outline" },
  { id: "12", name: "Guitar Meditation", icon: "musical-notes-outline" },
  { id: "13", name: "Hand Dryer", icon: "hand-right-outline" },
  { id: "14", name: "Heavy Rain", icon: "rainy-outline" },
  { id: "15", name: "Highway", icon: "car-outline" },
  { id: "16", name: "Keyboard", icon: "laptop-outline" },
  { id: "17", name: "Light Rain", icon: "rainy-outline" },
  { id: "18", name: "Night Insects", icon: "moon-outline" },
  { id: "19", name: "Ocean Waves", icon: "water-outline" },
  { id: "20", name: "Old Fan", icon: "radio-outline" },
  { id: "21", name: "Owls", icon: "moon-outline" },
  { id: "22", name: "Piano", icon: "musical-notes-outline" },
  { id: "23", name: "Pink Noise", icon: "radio-outline" },
  { id: "24", name: "Play Ground", icon: "people-outline" },
  { id: "25", name: "Rain", icon: "rainy-outline" },
  { id: "26", name: "Rain And Thunder", icon: "thunderstorm-outline" },
  { id: "27", name: "Rain Forest", icon: "leaf-outline" },
  { id: "28", name: "Rain Forest 2", icon: "leaf-outline" },
  { id: "29", name: "Rain In Metal Roof", icon: "home-outline" },
  { id: "30", name: "Rain On Leaves", icon: "leaf-outline" },
  { id: "31", name: "Rain On Tent", icon: "umbrella-outline" },
  { id: "32", name: "River", icon: "water-outline" },
  { id: "33", name: "Seagulls", icon: "sunny-outline" },
  { id: "34", name: "Small Desk Fan", icon: "radio-outline" },
  { id: "35", name: "Train", icon: "train-outline" },
  { id: "36", name: "Underwater", icon: "water-outline" },
  { id: "37", name: "Urban Downpour", icon: "rainy-outline" },
  { id: "38", name: "Vaccum", icon: "radio-outline" },
  { id: "39", name: "Water Stream", icon: "water-outline" },
  { id: "40", name: "Waterfall", icon: "water-outline" },
  { id: "41", name: "White Noise", icon: "radio-outline" },
  { id: "42", name: "Wind", icon: "partly-sunny-outline" },
  { id: "43", name: "Wind Chimes", icon: "musical-note-outline" },
  { id: "44", name: "Yoga Meditation", icon: "body-outline" }
];

/**
 * Mapping of sound names to their corresponding file paths in Firebase Storage.
 * This allows the app to locate and download the correct audio file for each sound.
 * 
 * @type {Object.<string, string>}
 */
const firebasePathMap = {
  "Birds": "whiteNoises_1.0/Birds.wav",
  "Brown Noise": "whiteNoises_1.0/Brown_Noise.wav",
  "Calmness": "whiteNoises_1.0/Calmness.mp3",
  "Campfire": "whiteNoises_1.0/Campfire.wav",
  "Cave": "whiteNoises_1.0/Cave.wav",
  "Ceiling Fan": "whiteNoises_1.0/Ceiling_Fan.wav",
  "Clock": "whiteNoises_1.0/Clock.wav",
  "Computer Fan": "whiteNoises_1.0/Computer_Fan.wav",
  "Crickets": "whiteNoises_1.0/Crickets.wav",
  "Dreaming": "whiteNoises_1.0/Dreaming.wav",
  "Exhaust Fan": "whiteNoises_1.0/Exhaust_Fan.wav",
  "Guitar Meditation": "whiteNoises_1.0/Guitar_Meditation.wav",
  "Hand Dryer": "whiteNoises_1.0/Hand_Dryer.wav",
  "Heavy Rain": "whiteNoises_1.0/Heavy_Rain.wav",
  "Highway": "whiteNoises_1.0/Highway.wav",
  "Keyboard": "whiteNoises_1.0/Keyboard.wav",
  "Light Rain": "whiteNoises_1.0/Light_Rain.wav",
  "Night Insects": "whiteNoises_1.0/Night_Insects.wav",
  "Ocean Waves": "whiteNoises_1.0/Ocean_Waves.wav",
  "Old Fan": "whiteNoises_1.0/Old_Fan.wav",
  "Owls": "whiteNoises_1.0/Owls.wav",
  "Piano": "whiteNoises_1.0/Piano.mp3",
  "Pink Noise": "whiteNoises_1.0/Pink_Noise.wav",
  "Play Ground": "whiteNoises_1.0/Play_Ground.wav",
  "Rain": "whiteNoises_1.0/Rain.wav",
  "Rain And Thunder": "whiteNoises_1.0/Rain_And_Thunder.wav",
  "Rain Forest": "whiteNoises_1.0/Rain_Forest.wav",
  "Rain Forest 2": "whiteNoises_1.0/Rain_Forest_2.wav",
  "Rain In Metal Roof": "whiteNoises_1.0/Rain_In_Metal_Roof.wav",
  "Rain On Leaves": "whiteNoises_1.0/Rain_On_Leaves.wav",
  "Rain On Tent": "whiteNoises_1.0/Rain_On_Tent.wav",
  "River": "whiteNoises_1.0/River.wav",
  "Seagulls": "whiteNoises_1.0/Seagulls.wav",
  "Small Desk Fan": "whiteNoises_1.0/Small_Desk_Fan.wav",
  "Train": "whiteNoises_1.0/Train.wav",
  "Underwater": "whiteNoises_1.0/Underwater.wav",
  "Urban Downpour": "whiteNoises_1.0/Urban_Downpour.wav",
  "Vaccum": "whiteNoises_1.0/Vaccum.wav",
  "Water Stream": "whiteNoises_1.0/Water_Stream.wav",
  "Waterfall": "whiteNoises_1.0/Waterfall.wav",
  "White Noise": "whiteNoises_1.0/White_Noise.wav",
  "Wind": "whiteNoises_1.0/Wind.wav",
  "Wind Chimes": "whiteNoises_1.0/Wind_Chimes.wav",
  "Yoga Meditation": "whiteNoises_1.0/Yoga_Meditation.wav"
};

/**
 * WNall Component - Displays a grid of all available white noise sounds
 * 
 * @returns {React.ReactElement} The rendered component
 */
const WNall = () => {
  // State to track which sounds are currently being downloaded
  const [loadingIds, setLoadingIds] = useState([]);
  
  // Hook for navigation between screens
  const navigation = useNavigation();
  
  // Access mini player context functions and state
  const { miniPlayerSounds, updateMiniPlayerSounds, showMiniPlayer, removeSoundFromMiniPlayer } = useMiniPlayer();
  
  // Ref to keep track of the current miniPlayerSounds for use in callbacks
  const miniPlayerSoundsRef = useRef(miniPlayerSounds);
  
  // Update the ref whenever miniPlayerSounds changes
  useEffect(() => {
    miniPlayerSoundsRef.current = miniPlayerSounds;
  }, [miniPlayerSounds]);

  /**
   * Handles the streaming and background download of a selected sound
   * 
   * This function:
   * 1. Checks if the sound exists locally
   * 2. If local, plays from local file
   * 3. If not local, streams immediately while downloading in background
   * 4. Adds the sound to the mini player and shows the mini player
   * 
   * @param {Object} item - The sound item that was selected
   * @param {string} item.id - Unique identifier for the sound
   * @param {string} item.name - Display name of the sound
   * @param {string} item.icon - Icon name from Ionicons
   */
  const handleDownload = async (item) => {
    // Get the Firebase storage path for this sound
    const firebasePath = firebasePathMap[item.name];
    if (!firebasePath) {
      Alert.alert("Not available", "No Firebase path mapped for this sound.");
      return;
    }

    // Extract the filename from the path
    const fileName = firebasePath.split("/").pop();
    
    try {
      // Add this sound's ID to the loading state to show loading indicator
      setLoadingIds((prev) => [...prev, item.id]);
      
      // Check if this sound is already in the mini player
      const isAlreadyAdded = miniPlayerSounds.some((s) => s.id === item.id);
      if (isAlreadyAdded) {
        // Sound is already playing, no need to add it again
        setLoadingIds((prev) => prev.filter((id) => id !== item.id));
        return;
      }
      
      // Check if the file exists locally
      const { exists, uri: localUri } = await checkLocalAudioFile(fileName);
      
      if (exists) {
        // File exists locally, play from local storage
        const updatedSounds = [...miniPlayerSounds, { ...item, uri: localUri }];
        updateMiniPlayerSounds(updatedSounds);
        showMiniPlayer(updatedSounds);
      } else {
        // File doesn't exist locally, stream and download in background
        const { streamingUrl, localUri } = await streamAndDownloadAudio(
          firebasePath,
          fileName,
          null, // No progress callback
          // Completion callback
          (finalUri) => {
            // Use the ref to get the current sounds list
            const currentSounds = miniPlayerSoundsRef.current;
            
            // Only update if the sound is still in the player
            if (currentSounds.some(sound => sound.id === item.id)) {
              // Update the sound in the player with the local URI once download completes
              const updatedSounds = currentSounds.map(sound => 
                sound.id === item.id ? { ...sound, uri: finalUri } : sound
              );
              updateMiniPlayerSounds(updatedSounds);
            }
          }
        );
        
        // Add the sound to the mini player with the streaming URL for immediate playback
        const updatedSounds = [...miniPlayerSounds, { ...item, uri: streamingUrl }];
        updateMiniPlayerSounds(updatedSounds);
        showMiniPlayer(updatedSounds);
      }
    } catch (error) {
      Alert.alert("Playback failed", error.message || "An error occurred while playing the sound.");
    } finally {
      // Remove this sound's ID from loading state
      setLoadingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  /**
   * Render the component UI
   */
  return (
    <View style={styles.gridContainer}>
      <FlatList
        data={soundData}
        keyExtractor={(item) => item.id}
        numColumns={4} // Display sounds in a 4-column grid
        renderItem={({ item }) => (
          <View style={styles.gridItemContainerMain}>
            <TouchableOpacity
              style={styles.gridItemContainer}
              onPress={() => handleDownload(item)}
              disabled={loadingIds.includes(item.id)} // Disable button while loading
            >
              {loadingIds.includes(item.id) ? (
                // Show loading indicator when downloading
                <ActivityIndicator size={25} color="white" />
              ) : (
                // Show sound icon when not loading
                <Ionicons name={item.icon} size={25} color="white" />
              )}
            </TouchableOpacity>
            <Text style={styles.gridText}>{item.name}</Text>
          </View>
        )}
        contentContainerStyle={styles.gridListContainer}
      />
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  gridContainer: {
    flexGrow: 0,
    justifyContent: 'flex-start',
    backgroundColor: "#121212", // Dark background for the screen
    paddingTop: 0,
  },
  gridListContainer: {
    paddingHorizontal: 10, // Add horizontal padding to the grid
  },
  gridItemContainerMain: {
    width: '25%', // Fixed width for 4 columns
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15, // Space between grid rows
    height: 100, // Fixed height for each grid item
  },
  gridItemContainer: {
    width: 60, // Fixed width for icon container
    height: 60, // Fixed height for icon container
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1E1E", // Slightly lighter than background for buttons
    borderRadius: 50, // Circular buttons
    padding: 15,
    overflow: "hidden", // Ensure progress bar doesn't overflow the circle
  },
  gridText: {
    color: "white", // White text for readability on dark background
    marginTop: 5, // Space between icon and text
    fontSize: 12, // Small font size for sound names
    textAlign: "center", // Center text
    width: 70, // Fixed width for text container
    height: 30, // Fixed height for text area
  },

});

/**
 * Export the WNall component as the default export
 */
export default WNall;
