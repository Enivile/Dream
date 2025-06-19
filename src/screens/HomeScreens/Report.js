import React from "react";
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
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
