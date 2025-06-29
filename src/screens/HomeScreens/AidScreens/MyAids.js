import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

const MyAids = () => {
  return ( 
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuItem}>My Aids</Text>
      </View>
      {/* Spacer to prevent content from being hidden behind navbar */}
      <View style={styles.navbarSpacer} />
    </ScrollView>)

};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  menuItemContainer: {
    paddingHorizontal: 20,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
    borderWidth: 1,
    height: 50,
  },
  menuItem: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
    },
  navbarSpacer: {
    height: 105, // Same height as the navbar
  },
});
export default MyAids