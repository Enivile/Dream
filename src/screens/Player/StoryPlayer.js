/**
 * StoryPlayer.js
 * 
 * A dedicated player component for bedtime stories. This component handles:
 * - Displaying the story image and title
 * - Playing/pausing the story audio
 * - Showing playback progress
 * - Downloading the story audio from Firebase if not already cached
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { checkLocalAudioFile, streamAndDownloadAudio } from "../../utils/firebaseAudioDownloader";

const StoryPlayer = ({ navigation, route }) => {
  // Extract story data from route params
  const { story } = route.params || {};
  
  // Player state
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Refs
  const positionUpdateInterval = useRef(null);
  const downloadResumable = useRef(null);

  // Load and set up the audio when component mounts
  useEffect(() => {
    loadAudio();
    
    // Clean up resources when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, []);

  // Function to load the audio file with progressive playback
  const loadAudio = async () => {
    try {
      setIsLoading(true);
      
      // Set up audio mode for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Check if the file is already downloaded
      const localFileName = `story_${story.title.replace(/\s+/g, '_')}.mp3`;
      const { exists, uri } = await checkLocalAudioFile(localFileName);
      
      if (exists) {
        // Use the cached file
        console.log("Using cached audio file");
        const { sound: soundObject } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }, // Auto-play cached file
          onPlaybackStatusUpdate
        );
        
        setSound(soundObject);
        setIsLoading(false);
      } else {
        // Stream and download simultaneously
        setIsDownloading(true);
        setIsStreaming(true);
        
        const firebasePath = `Stories/${story.title.replace(/\s+/g, '_')}.mp3`;
        
        // Use streamAndDownloadAudio to get streaming URL and start background download
        const { streamingUrl, localUri } = await streamAndDownloadAudio(
          firebasePath,
          localFileName,
          (progress) => {
            setDownloadProgress(progress);
          },
          (completedUri) => {
            console.log("Download completed:", completedUri);
            setIsDownloading(false);
          }
        );
        
        // Create and load the sound object with the streaming URL
        const { sound: soundObject } = await Audio.Sound.createAsync(
          { uri: streamingUrl },
          { shouldPlay: true }, // Auto-play when streaming
          onPlaybackStatusUpdate
        );
        
        setSound(soundObject);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading audio:", error);
      setIsLoading(false);
      setIsDownloading(false);
      setIsStreaming(false);
    }
  };

  // Callback function for playback status updates
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
      
      // Track buffering state - don't set to true if user is seeking
      if (status.isBuffering !== undefined && !isSeeking) {
        setIsBuffering(status.isBuffering);
      }
      
      // If playback reaches the end
      if (status.didJustFinish) {
        // Reset position
        setPosition(0);
      }
    } else if (status.error) {
      console.error(`Playback error: ${status.error}`);
    }
  };

  // Function to toggle play/pause
  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  // Add a state to track when user is seeking
  const [isSeeking, setIsSeeking] = useState(false);

  // Function to seek to a specific position
  const seekTo = async (value) => {
    if (sound) {
      // Set seeking state to true before seeking
      setIsSeeking(true);
      await sound.setPositionAsync(value);
      // Set seeking state back to false after a short delay
      // This delay ensures the UI doesn't flicker during quick operations
      setTimeout(() => setIsSeeking(false), 300);
    }
  };

  // Function to format time in MM:SS format
  const formatTime = (millis) => {
    if (!millis) return "00:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Function to skip forward 10 seconds
  const skipForward = async () => {
    if (sound) {
      const newPosition = Math.min(position + 10000, duration);
      await sound.setPositionAsync(newPosition);
    }
  };

  // Function to skip backward 10 seconds
  const skipBackward = async () => {
    if (sound) {
      const newPosition = Math.max(position - 10000, 0);
      await sound.setPositionAsync(newPosition);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#121212", "#000000"]}
        style={styles.background}
      />
      
      {/* Header with back button */}
      <Animatable.View animation="fadeIn" duration={1000} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      {/* Main content */}
      <Animatable.View animation="fadeInUp" duration={1200} style={styles.content}>
        {/* Story image */}
        <Image 
          source={story.image} 
          style={styles.storyImage} 
          resizeMode="cover"
        />
        
        {/* Story title */}
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.category}>{story.category}</Text>
        
        {/* Playback controls */}
        <View style={styles.controls}>
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Slider
              style={styles.progressBar}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingStart={() => setIsSeeking(true)}
              onSlidingComplete={(value) => seekTo(value)}
              minimumTrackTintColor="#6C63FF"
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor="#6C63FF"
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          
          {/* Playback buttons */}
          <View style={styles.playbackButtons}>
            <TouchableOpacity onPress={skipBackward} style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={togglePlayPause} 
              style={styles.playPauseButton}
              disabled={isLoading || (isBuffering && !isSeeking)}
            >
              <LinearGradient
                colors={["#6C63FF", "#4F46E5"]}
                style={styles.playPauseGradient}
              >
                {isLoading || (isBuffering && !isSeeking) ? (
                  <ActivityIndicator size="large" color="#FFF" />
                ) : (
                  <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="#FFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={skipForward} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Animatable.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  storyImage: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    marginBottom: 30,
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  category: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  loadingText: {
    color: "#FFF",
    marginTop: 10,
    fontSize: 16,
  },
  controls: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
  },
  progressBar: {
    flex: 1,
    height: 40,
  },
  timeText: {
    color: "#FFF",
    fontSize: 12,
    width: 50,
    textAlign: "center",
  },
  playbackButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  controlButton: {
    padding: 15,
  },
  playPauseButton: {
    marginHorizontal: 30,
    borderRadius: 40,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  playPauseGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default StoryPlayer;