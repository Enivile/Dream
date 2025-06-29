import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { downloadAudioFromFirebase } from "../../../utils/firebaseAudioDownloader";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import { useMiniPlayer } from "../../../context/MiniPlayerContext";

const soundData = [
  { id: "14", name: "Light Rain", icon: "rainy-outline" },
  { id: "23", name: "Rain", icon: "rainy-outline" },
  { id: "24", name: "Rain And Thunder", icon: "thunderstorm-outline" },
  { id: "25", name: "Rain Forest", icon: "leaf-outline" },
  { id: "26", name: "Rain Forest 2", icon: "leaf-outline" },
  { id: "27", name: "Rain In Metal Roof", icon: "home-outline" },
  { id: "28", name: "Rain On Leaves", icon: "leaf-outline" },
  { id: "29", name: "Rain On Tent", icon: "umbrella-outline" },
  { id: "36", name: "Urban Downpour", icon: "rainy-outline" }
];

const firebasePathMap = {
  "Light Rain": "whiteNoises/Light_Rain.mp3",
  "Rain": "whiteNoises/Rain.mp3",
  "Rain And Thunder": "whiteNoises/Rain_And_Thunder.mp3",
  "Rain Forest": "whiteNoises/Rain_Forest.mp3",
  "Rain Forest 2": "whiteNoises/Rain_Forest_2.mp3",
  "Rain In Metal Roof": "whiteNoises/Rain_In_Metal_Roof.mp3",
  "Rain On Leaves": "whiteNoises/Rain_On_Leaves.mp3",
  "Rain On Tent": "whiteNoises/Rain_On_Tent.mp3",
  "Urban Downpour": "whiteNoises/Urban_Downpour.mp3"
};

const WNrain = () => {
  const [loadingIds, setLoadingIds] = useState([]);
  const navigation = useNavigation();
  const { miniPlayerSounds, updateMiniPlayerSounds, showMiniPlayer } = useMiniPlayer();

  const handleDownload = async (item) => {
    const firebasePath = firebasePathMap[item.name];
    if (!firebasePath) {
      Alert.alert("Not available", "No Firebase path mapped for this sound.");
      return;
    }

    const fileName = firebasePath.split("/").pop();
    const localUri = FileSystem.documentDirectory + fileName;

    try {
      setLoadingIds((prev) => [...prev, item.id]);
      
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      let uri = localUri;
      
      if (!fileInfo.exists) {
        uri = await downloadAudioFromFirebase(firebasePath, fileName);
      }

      const isAlreadyAdded = miniPlayerSounds.some((s) => s.id === item.id);
      if (!isAlreadyAdded) {
        const updatedSounds = [...miniPlayerSounds, { ...item, uri }];
        updateMiniPlayerSounds(updatedSounds);
        showMiniPlayer(updatedSounds);
      }

      navigation.navigate("MainPlayer");
    } catch (error) {
      Alert.alert("Download failed", error.message || "An error occurred while downloading.");
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  return (
    <View style={styles.gridContainer}>
      <FlatList
        data={soundData}
        keyExtractor={(item) => item.id}
        numColumns={4}
        renderItem={({ item }) => (
          <View style={styles.gridItemContainerMain}>
            <TouchableOpacity
              style={styles.gridItemContainer}
              onPress={() => handleDownload(item)}
              disabled={loadingIds.includes(item.id)}
            >
              {loadingIds.includes(item.id) ? (
                <ActivityIndicator size={25} color="white" />
              ) : (
                <Ionicons name={item.icon} size={25} color="white" />
              )}
            </TouchableOpacity>
            <Text style={styles.gridText}>{item.name}</Text>
          </View>
        )}
        contentContainerStyle={styles.gridListContainer}
        ListFooterComponent={<View style={styles.navbarSpacer} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexGrow: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  gridItemContainerMain: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  gridItemContainer: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  gridText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 5,
  },
  navbarSpacer: {
    height: 105, // Same height as the navbar
  },
});

export default WNrain;