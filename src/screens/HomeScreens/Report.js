import React from "react";
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SleepQualityGraph, DreamFrequencyGraph, MoodTrackingGraph } from '../../components/PlaceholderGraphs';

const ScreenWidth = Dimensions.get("window").width;

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
const selectedDayIndex = 3; // Example: "Thursday" is selected

const Report = () => {
  return (
    <View
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.mainContainer}
    >
      {/* Top Bar with Day Selection */}
      <View style={styles.topBar}>
        <Text style={styles.dateText}>Thu. Nov 18</Text>
        <View style={styles.daySelector}>
          {daysOfWeek.map((day, index) => (
            <TouchableOpacity key={index} style={styles.dayButton}>
              <View
                style={[
                  styles.dayCircle,
                  index === selectedDayIndex && styles.selectedDayCircle,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    index === selectedDayIndex && styles.selectedDayText,
                  ]}
                >
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView style={styles.scrollContainer}>
        {/* Placeholder Message */}
        <View style={styles.placeholderMessageContainer}>
          <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
            <LinearGradient
              colors={['rgba(78, 205, 196, 0.2)', 'rgba(44, 62, 80, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientContainer}
            >
              <Ionicons name="information-circle" size={24} color="#4ECDC4" style={styles.infoIcon} />
              <Text style={styles.placeholderMessageText}>
                These are placeholder graphs. Once you use the tracker for the first time, this section will display your actual sleep results.
              </Text>
            </LinearGradient>
          </BlurView>
        </View>
        
        {/* Sleep Quality Graph */}
        <SleepQualityGraph />

        {/* Dream Frequency Graph */}
        <DreamFrequencyGraph />

        {/* Mood Tracking Graph */}
        <MoodTrackingGraph />
        
        {/* Spacer to prevent content from being hidden behind navbar */}
        <View style={styles.navbarSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  navbarSpacer: {
    height: 65, // Same height as the navbar
  },
  mainContainer: {
    paddingVertical: 10,
    backgroundColor: "#121212",
  },
  scrollContainer: {
    backgroundColor: "#121212",
    marginBottom: 100,
  },
  placeholderMessageContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 15,
  },
  gradientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
  },
  infoIcon: {
    marginRight: 10,
  },
  placeholderMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  topBar: {
    backgroundColor: "#121212",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  dateText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 30,
  },
  daySelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  dayButton: {
    padding: 5,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayCircle: {
    borderColor: "#007bff", // Blue border for selected day
  },
  dayText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedDayText: {
    color: "#007bff", // Blue text for selected day
  },

});

export default Report;
