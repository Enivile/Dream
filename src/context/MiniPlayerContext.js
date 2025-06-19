/**
 * MiniPlayerContext.js
 * 
 * This file implements a React Context for managing audio playback throughout the application.
 * It provides a centralized state management system for playing multiple sounds simultaneously,
 * controlling their volumes individually, and managing the visibility of player UI components.
 * 
 * The context handles:
 * - Loading and unloading audio files
 * - Playing/pausing multiple sounds simultaneously
 * - Individual volume control for each sound
 * - Managing mini player and main player visibility states
 * - Cleaning up audio resources when components unmount
 */

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Audio } from "expo-av";
import { addToHistory } from "../utils/favoritesHistoryService";
import { useAuth } from "./AuthContext";

/**
 * Create the context object that will hold all player-related state and functions
 */
const MiniPlayerContext = createContext();

/**
 * Custom hook to access the MiniPlayerContext from any component
 * @returns {Object} The MiniPlayerContext value object containing all state and functions
 */
export const useMiniPlayer = () => useContext(MiniPlayerContext);

/**
 * MiniPlayerProvider Component
 * 
 * This provider component manages the state and logic for audio playback throughout the app.
 * It should wrap components that need access to audio playback functionality.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to this context
 * @returns {React.ReactElement} Provider component with context value
 */
export const MiniPlayerProvider = ({ children }) => {
  // State for controlling the visibility of the mini player UI
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);
  
  // Array of sound objects currently loaded in the player
  const [miniPlayerSounds, setMiniPlayerSounds] = useState([]);
  
  // Global play/pause state for all sounds
  const [isMiniPlayerPlaying, setIsMiniPlayerPlaying] = useState(true);
  
  // Loading and buffering states for audio
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // Object mapping sound IDs to their volume levels (0.0 to 1.0)
  const [volumes, setVolumes] = useState({});
  
  // State for controlling the visibility of the full-screen player UI
  const [mainPlayerVisible, setMainPlayerVisible] = useState(false);
  
  // Track which sounds have been added to history to prevent duplicates
  const [addedToHistory, setAddedToHistory] = useState({});
  
  // Refs to actual Audio.Sound objects for controlling playback
  const soundRefs = useRef({});
  
  // Get authentication context to check if user is logged in
  const { currentUser } = useAuth();

  /**
   * Effect hook to load sounds when miniPlayerSounds array changes
   * This creates Audio.Sound objects for each sound in the miniPlayerSounds array
   */
  useEffect(() => {
    if (miniPlayerVisible && miniPlayerSounds.length > 0) {
      // Set loading state to true when starting to load sounds
      setIsLoading(true);
      
      // Track successful loads to determine if we should show the player
      let successfulLoads = 0;
      
      // Load sounds (but don't auto-play them)
      const loadPromises = miniPlayerSounds.map(async (sound) => {
        if (!soundRefs.current[sound.id]) {
          try {
            // Validate the URI before attempting to load
            if (!sound.uri) {
              console.error(`Missing URI for sound ${sound.id}`);
              return;
            }
            
            const { sound: soundObj } = await Audio.Sound.createAsync(
              { uri: sound.uri },
              { shouldPlay: false, isLooping: true, volume: volumes[sound.id] ?? 1 },
              // Add status update callback to track buffering
              (status) => {
                if (status.isBuffering) {
                  setIsBuffering(true);
                } else if (!status.isBuffering && status.isLoaded) {
                  setIsBuffering(false);
                }
                
                // Handle playback errors
                if (status.error) {
                  console.error(`Playback error for sound ${sound.id}:`, status.error);
                }
              }
            );
            
            soundRefs.current[sound.id] = soundObj;
            successfulLoads++;
            
            // If playing, start playback
            if (isMiniPlayerPlaying) {
              try {
                await soundObj.playAsync();
              } catch (playError) {
                console.error(`Error playing sound ${sound.id}:`, playError);
                // Continue even if playback fails
              }
            }
          } catch (error) {
            console.error(`Error loading sound ${sound.id}:`, error);
            // Continue with other sounds even if one fails
          }
        } else {
          // Sound already loaded
          successfulLoads++;
        }
      });
      
      // Set loading to false when all sounds are loaded
      Promise.all(loadPromises)
        .then(() => {
          setIsLoading(false);
          
          // If no sounds loaded successfully, hide the mini player
          if (successfulLoads === 0 && miniPlayerSounds.length > 0) {
            console.warn("No sounds loaded successfully, hiding mini player");
            setMiniPlayerVisible(false);
          }
        })
        .catch(error => {
          console.error("Error loading sounds:", error);
          setIsLoading(false);
        });
    }
  }, [miniPlayerSounds, miniPlayerVisible, volumes, isMiniPlayerPlaying]);

  /**
   * Effect hook to handle global play/pause state changes
   * When isMiniPlayerPlaying changes, all sounds are played or paused accordingly
   */
  useEffect(() => {
    // Only proceed if mini player is visible and we have sounds to control
    if (miniPlayerVisible && Object.keys(soundRefs.current).length > 0) {
      // Create an array of promises for each sound operation
      const actions = Object.values(soundRefs.current).map((soundObj) => {
        try {
          // Determine whether to play or pause based on state
          const operation = isMiniPlayerPlaying ? 
            soundObj.playAsync() : 
            soundObj.pauseAsync();
          
          // Return the operation promise
          return operation;
        } catch (error) {
          console.error("Error toggling sound playback:", error);
          return Promise.resolve(); // Return a resolved promise to prevent Promise.all from failing
        }
      });
      
      // Use Promise.race to clear the buffering state as soon as the first operation completes
      // This makes the UI feel more responsive
      Promise.race(actions)
        .then(() => {
          // Clear any pending buffering timeout
          if (bufferingTimeoutRef.current) {
            clearTimeout(bufferingTimeoutRef.current);
            bufferingTimeoutRef.current = null;
          }
          
          // Clear buffering state when at least one operation completes
          setIsBuffering(false);
        })
        .catch(error => {
          console.error("Error in first sound operation:", error);
        });
      
      // Still use Promise.all to ensure all operations complete
      Promise.all(actions)
        .catch(error => {
          console.error("Error toggling mini player sounds:", error);
          setIsBuffering(false);
        });
    } else {
      // If mini player is not visible or no sounds are loaded,
      // make sure we clear any pending buffering state
      setIsBuffering(false);
    }
    
    // Cleanup function to clear any pending timeouts when component unmounts
    // or when dependencies change
    return () => {
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
    };
  }, [isMiniPlayerPlaying, miniPlayerVisible]);

  /**
   * Effect hook to clean up sound resources when mini player is hidden
   * Unloads all Audio.Sound objects to free up memory and system resources
   */
  useEffect(() => {
    if (!miniPlayerVisible) {
      Object.values(soundRefs.current).forEach(async (soundObj) => {
        try {
          await soundObj.unloadAsync();
        } catch (error) {
          console.error('Error unloading mini player sound:', error);
        }
      });
      soundRefs.current = {};
    }
  }, [miniPlayerVisible]);

  /**
   * Shows the mini player with the provided sounds and starts playback
   * Also adds the sounds to the user's play history if they're logged in
   * 
   * @param {Array} sounds - Array of sound objects to play in the mini player
   */
  const showMiniPlayer = (sounds) => {
    setMiniPlayerSounds(sounds);
    setMiniPlayerVisible(true);
    setIsMiniPlayerPlaying(true);
    
    // Add to history if user is logged in and not already added
    if (currentUser) {
      if (sounds.length > 1) {
        // Generate a unique ID for this mix
        const mixId = `mix-${Date.now()}`;
        
        // Check if this exact mix has been added to history recently
        if (!addedToHistory[mixId]) {
          // If multiple sounds, create a mix-like entry
          const mixData = {
            id: mixId,
            name: "Custom Mix",
            icon: "musical-notes-outline",
            sounds: sounds,
            type: "mix"
          };
          
          // Mark as added to history
          setAddedToHistory(prev => ({ ...prev, [mixId]: true }));
          
          addToHistory(currentUser.uid, mixData).catch(error => {
            console.error("Error adding mix to history:", error);
          });
        }
      } else if (sounds.length === 1) {
        const soundId = sounds[0].id;
        
        // Check if this sound has been added to history recently
        if (!addedToHistory[soundId]) {
          // Mark as added to history
          setAddedToHistory(prev => ({ ...prev, [soundId]: true }));
          
          // Single sound
          addToHistory(currentUser.uid, { ...sounds[0], type: "sound" }).catch(error => {
            console.error("Error adding sound to history:", error);
          });
        }
      }
    }
  };

  /**
   * Hides the mini player and stops playback
   * When called from the mini player's close button, it clears the sounds array
   * When called from minimizing the main player, it preserves the sounds array
   * 
   * @param {boolean} clearSounds - Whether to clear the sounds array (default: false)
   */
  const hideMiniPlayer = (clearSounds = false) => {
    // Clear any pending buffering timeout to prevent UI flashing
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = null;
    }
    
    // Clear buffering state immediately
    setIsBuffering(false);
    
    // Update player state
    setMiniPlayerVisible(false);
    setIsMiniPlayerPlaying(false);
    
    // Reset the history tracking when player is hidden
    setAddedToHistory({});
    
    // Clear the sounds array if explicitly requested (e.g., when closing the player)
    if (clearSounds) {
      setMiniPlayerSounds([]);
    }
    // Otherwise, don't clear the sounds array so they can be restored when main player is minimized
  };

  /**
   * Updates the array of sounds in the mini player
   * 
   * @param {Array} sounds - New array of sound objects to replace the current ones
   */
  const updateMiniPlayerSounds = (sounds) => {
    setMiniPlayerSounds(sounds);
  };

  // Ref to store buffering timeout ID
  const bufferingTimeoutRef = useRef(null);
  
  /**
   * Toggles the play/pause state of all sounds in the mini player
   * Uses a delayed buffering indicator to avoid flashing for quick operations
   */
  const toggleMiniPlayerPlay = () => {
    // Clear any existing timeout
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current);
    }
    
    // Only show buffering indicator if operation takes longer than 150ms
    // This prevents the indicator from flashing for quick operations
    bufferingTimeoutRef.current = setTimeout(() => {
      setIsBuffering(true);
      bufferingTimeoutRef.current = null;
    }, 150);
    
    // Toggle the play state immediately
    setIsMiniPlayerPlaying((prev) => !prev);
    
    // Note: The actual play/pause operations are handled in the useEffect
    // that watches for changes to isMiniPlayerPlaying
  };
  
  /**
   * Changes the volume of a specific sound
   * 
   * @param {string} id - The unique identifier of the sound
   * @param {number} value - Volume level between 0.0 and 1.0
   */
  const handleVolumeChange = async (id, value) => {
    setVolumes((prev) => ({ ...prev, [id]: value }));
    const soundObj = soundRefs.current[id];
    if (soundObj) {
      await soundObj.setVolumeAsync(value);
    }
  };
  
  /**
   * Removes a sound from the mini player and unloads its resources
   * If this was the last sound, the mini player is hidden
   * 
   * @param {string} id - The unique identifier of the sound to remove
   */
  const removeSoundFromMiniPlayer = async (id) => {
    const soundObj = soundRefs.current[id];
    if (soundObj) {
      await soundObj.stopAsync();
      await soundObj.unloadAsync();
      delete soundRefs.current[id];
    }
    setMiniPlayerSounds(prev => prev.filter(sound => sound.id !== id));
    if (miniPlayerSounds.length <= 1) {
      hideMiniPlayer();
    }
  };

  /**
   * Provide the context value to all child components
   */
  return (
    <MiniPlayerContext.Provider
      value={{
        miniPlayerVisible,
        miniPlayerSounds,
        isMiniPlayerPlaying,
        isLoading,
        isBuffering,
        showMiniPlayer,
        hideMiniPlayer,
        updateMiniPlayerSounds,
        toggleMiniPlayerPlay,
        handleVolumeChange,
        removeSoundFromMiniPlayer,
        mainPlayerVisible,
        setMainPlayerVisible,
        setMiniPlayerVisible,
        volumes,
        soundRefs,
      }}
    >
      {children}
    </MiniPlayerContext.Provider>
  );
};