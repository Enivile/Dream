import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"; 
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

// Stories data
const stories = [
  {
    id: 1,
    title: 'The Whispering Stars With Music',
    category: 'Bedtime Story',
    image: require('../../../../assets/images/Stories/The_Whispering_Stars with Music.jpeg'),
    duration: '15 MIN',
    audioPath: 'Stories/The_Whispering_Stars_With_Music.mp3',
  },
];

const StoriesPage = () => {
  const navigation = useNavigation();
  
  const handleStoryPress = (story) => {
    navigation.navigate('StoryPlayer', { story });
  };
  
  return (
    <View style={styles.storiesContainer}>
      {/* Header Section */}
      <View style={styles.storiesHeader}>
        <Text style={styles.storiesTitle}>Bedtime Stories</Text>
      </View>
      
      {/* Stories List */}
      <FlatList
        data={stories}
        alwaysBounceVertical
        showsVerticalScrollIndicator={true}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.storySlide}
            onPress={() => handleStoryPress(item)}
            activeOpacity={0.8}
          >
            <Image
              source={item.image}
              style={styles.storyImage}
              resizeMode="cover"
            />
            <View style={styles.storyTextContainer}>
              <Text style={styles.storyCategory}>{item.category}</Text>
              <Text style={styles.storyTitle}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.storiesCarousel}
        decelerationRate='normal'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  storiesContainer: {
    marginVertical: 20,
  },
  storiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  storiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  storiesCarousel: {
    paddingHorizontal: 10,
  },
  storySlide: {
    width: screenWidth - 32,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(51, 51, 51, 0.8)', // Slightly darker for better contrast
    alignSelf: 'center',
    marginHorizontal: 10,
    marginBottom: 30,
    // Enhanced shadow for more pronounced glass-like effect
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  storyImage: {
    width: '100%',
    height: 120, // Matching the height in MusicPage
  },
  storyTextContainer: {
    padding: 15, // Increased padding for better spacing
    backgroundColor: 'rgba(51, 51, 51, 0.6)', // Semi-transparent background for glass effect
  },
  storyCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 5, // Added margin for better spacing
  },
  storyDetails: {
    fontSize: 12,
    color: '#CCC',
  },
});

export default StoriesPage;