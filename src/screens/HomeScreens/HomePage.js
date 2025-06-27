import React, { useState, useRef, useEffect } from "react";
import { View, Image, StyleSheet, Dimensions, Animated, TouchableOpacity, FlatList, Text, ScrollView, Alert, ActivityIndicator, ImageBackground } from "react-native";
import Swiper from 'react-native-swiper';
import { StatusBar } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { downloadAudioFromFirebase } from "../../utils/firebaseAudioDownloader";
import * as FileSystem from "expo-file-system";
import { useMiniPlayer } from "../../context/MiniPlayerContext";
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get("window").width;

const HomePage = () => {
    const glowAnim = useRef(new Animated.Value(0)).current; // Initialize animated value
    const navigation = useNavigation();
    const [loadingIds, setLoadingIds] = useState([]);
    const { miniPlayerSounds, updateMiniPlayerSounds, showMiniPlayer } = useMiniPlayer();

    const handleDownload = async (item) => {
      if (!item.firebasePath) {
        navigation.navigate(item.screen);
        return;
      }

      const fileName = item.firebasePath.split("/").pop();
      const localUri = FileSystem.documentDirectory + fileName;

      try {
        setLoadingIds((prev) => [...prev, item.id]);
        
        // Check if this sound is already in the mini player
        const isAlreadyAdded = miniPlayerSounds.some((s) => s.id === item.id);
        if (isAlreadyAdded) {
          // Sound is already playing, no need to add it again
          setLoadingIds((prev) => prev.filter((id) => id !== item.id));
          return;
        }
        
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        let uri = localUri;
        
        if (!fileInfo.exists) {
          uri = await downloadAudioFromFirebase(item.firebasePath, fileName);
        }

        // Add the sound to the mini player and show it (without navigating to MainPlayer)
        const updatedSounds = [...miniPlayerSounds, { ...item, uri }];
        updateMiniPlayerSounds(updatedSounds);
        showMiniPlayer(updatedSounds);
        
      } catch (error) {
        Alert.alert("Download failed", error.message || "An error occurred while downloading.");
      } finally {
        setLoadingIds((prev) => prev.filter((id) => id !== item.id));
      }
    };

    useEffect(() => { 
    Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false, // Animation on styles requires useNativeDriver: false
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }, []);
    
    const shadowInterpolation = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100], // Change this range to adjust the glow intensity
    });

    const icons = [
      { id: "1", source: require("../../../assets/images/icons/list.png"), label: "My List" },
      { id: "2", source: require("../../../assets/images/icons/music.png"), label: "Music" },
      { id: "3", source: require("../../../assets/images/icons/noise.png"), label: "White Noise" },
      { id: "4", source: require("../../../assets/images/icons/premium.png"), label: "Premium" },
    ];



    const data = [
      { 
        id: '1', 
        row1: { id: 'rain1', name: 'Rain', category: 'Rain', icon: 'rainy-outline', screen: 'WNrain', firebasePath: 'whiteNoises/Rain.mp3' }, 
        row2: { id: 'nature1', name: 'Nature', category: 'Nature', icon: 'leaf-outline', screen: 'WNnature', firebasePath: 'whiteNoises/Rain_Forest.mp3' } 
      },
      { 
        id: '2', 
        row1: { id: 'city1', name: 'City', category: 'Urban', icon: 'business-outline', screen: 'WNcity', firebasePath: 'whiteNoises/Highway.mp3' }, 
        row2: { id: 'train1', name: 'Train', category: 'Transport', icon: 'train-outline', screen: 'WNspecial', firebasePath: 'whiteNoises/Pink_Noise.mp3' } 
      },
      { 
        id: '3', 
        row1: { id: 'mixes1', name: 'Mixes', category: 'Mixed', icon: 'musical-notes-outline', screen: 'WNmixes' }, 
        row2: { id: 'Piano', name: 'Piano', category: 'Musical', icon: 'apps-outline', screen: 'WNall' , firebasePath: 'whiteNoises/Piano.mp3' } 
      }
    ];


    return (
      <ScrollView style={styles.containerMain}>
        <StatusBar 
        barStyle="light-content" // Changes text/icons to white
        translucent={true} // Makes status bar transparent
        backgroundColor="transparent" // Keeps background transparent
        />
        <View style={styles.container}>
          <Image source={require('../../../assets/images/homebg1.webp')} style={[styles.image, { width: screenWidth }]} />
          <Animated.Text style={[styles.text, {textShadowRadius: shadowInterpolation}]}>DREAM</Animated.Text>
        </View>

        {/* -------------------------------------------------------------------------------------------------------------------------------------- */}

        <FlatList
          data={icons}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.iconContainer}
              onPress={() => {
                if (item.label === 'Music') {
                  navigation.navigate('AidsScreen', { section: 2 });
                } else if (item.label === 'White Noise') {
                  navigation.navigate('AidsScreen', { section: 1 });
                } else if (item.label === 'My List') {
                  navigation.navigate('AidsScreen', { section: 0, subSection: 0 });
                }
              }}
            >
              <Image source={item.source} style={styles.icon} />
              <Text style={styles.iconText}>{item.label}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.carousel}
          snapToInterval={screenWidth / 4} // Ensures snapping to 4 items per screen width
          decelerationRate="fast" // Smooth scrolling
        />

        {/* -------------------------------------------------------------------------------------------------------------------------------------- */}

        <View style={styles.sliderMainContainer}>
          <View style={styles.sliderSubContainer}>
            <Swiper
              loop
              autoplay
              autoplayTimeout={3}
              showsPagination={true}
              showsButtons={false}
              dotColor="#FFFFFF"
              activeDotColor="#9b9b9e"
              paginationStyle={styles.paginationStyle}
            >
              <View style={styles.sliderItem}>
                <Image source={require('../../../assets/images/banners/swiper-1.webp')} style={styles.sliderImage} />
              </View>
              <View style={styles.sliderItem}>
                <Image source={require('../../../assets/images/banners/swiper-2.webp')} style={styles.sliderImage} />
              </View>
              <View style={styles.sliderItem}>
                <Image source={require('../../../assets/images/banners/swiper-3.webp')} style={styles.sliderImage} />
              </View>
            </Swiper>
          </View>
        </View>

        {/* -------------------------------------------------------------------------------------------------------------------------------------- */}


        {/* -------------------------------------------------------------------------------------------------------------------------------------- */}

        <View style={styles.noiseContainer}>
          {/* Header Section */}
          <View style={styles.noiseHeaderContainer}>
            <Text style={styles.noiseHeader}>White Noise</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AidsScreen', { section: 1, subSection: 0 })}>
              <Text style={styles.noiseSeeAll}>See All</Text>
            </TouchableOpacity>
          </View>
    
          {/* Horizontal Scroll List */}
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={ ({ item }) => (
              <View style={styles.noiseItemContainer}>
                {/* Row 1 */}
                <TouchableOpacity 
                  style={styles.noiseRow} 
                  onPress={() => handleDownload(item.row1)}
                  disabled={loadingIds.includes(item.row1.id)}
                >
                  <View style={styles.noiseIconContainer}>
                    {loadingIds.includes(item.row1.id) ? (
                      <ActivityIndicator size={24} color="#fff" />
                    ) : (
                      <Ionicons name={item.row1.icon} size={24} color="#fff" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.noiseTitle}>{item.row1.name}</Text>
                    <Text style={styles.noiseCategory}>{item.row1.category}</Text>
                  </View>
                </TouchableOpacity>
                {/* Row 2 */}
                <TouchableOpacity 
                  style={styles.noiseRow} 
                  onPress={() => item.row2.firebasePath ? handleDownload(item.row2) : navigation.navigate(item.row2.screen)}
                  disabled={loadingIds.includes(item.row2.id)}
                >
                  <View style={styles.noiseIconContainer}>
                    {loadingIds.includes(item.row2.id) ? (
                      <ActivityIndicator size={24} color="#fff" />
                    ) : (
                      <Ionicons name={item.row2.icon} size={24} color="#fff" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.noiseTitle}>{item.row2.name}</Text>
                    <Text style={styles.noiseCategory}>{item.row2.category}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            horizontal
            contentContainerStyle={styles.noiseListContainer}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* -------------------------------------------------------------------------------------------------------------------------------------- */}

        <View style={styles.storyContainer}>
          {/* Header Section */}
          <View style={styles.storyHeader}>
            <Text style={styles.storyTitle}>Stories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AidsScreen', { section: 3 })}>
              <Text style={styles.storySeeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {/* Carousel Section */}
          <FlatList
          data={[
            {
              id: 1,
              title: 'The Whispering Stars With Music',
              category: 'Bedtime Story',
              image: require('../../../assets/images/Stories/The_Whispering_Stars with Music.jpeg'),
              duration: '15 MIN',
              audioPath: 'Stories/The_Whispering_Stars_With_Music.mp3',
            },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.storySlide}
              onPress={() => navigation.navigate('StoryPlayer', { story: item })}
              activeOpacity={0.8}
            >
                <Image
                  source={item.image}
                  style={styles.storyCarousel2Image}
                  resizeMode="cover"
                />
                <View style={styles.storyTextContainer}>
                  <Text style={styles.storyCategory}>{item.category}</Text>
                  <Text style={styles.storyEntryTitle}>{item.title}</Text>
                  <Text style={styles.storyEntryDetails}>{item.duration}</Text>
                </View>
              </TouchableOpacity>
          )}
          contentContainerStyle={styles.storyCarousel}
          decelerationRate='normal' // Smooth scrolling
        />
        </View>

        {/* -------------------------------------------------------------------------------------------------------------------------------------- */}

        
        {/* -------------------------------------------------------------------------------------------------------------------------------------- */}

        <View style={styles.sleeppediaContainer}>
          {/* Header Section */}
          <View style={styles.sleeppediaHeader}>
            <Text style={styles.sleeppediaTitle}>Sleeppedia</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Sleeppedia')}>
              <Text style={styles.sleeppediaSeeAll}>Show All</Text>
            </TouchableOpacity>
          </View>
          {/* Blog Cards Section - Vertical Layout */}
          <View style={styles.sleeppediaVerticalContainer}>
            {[
              {
                id: '1',
                title: 'Insomnia',
                image: require('../../../assets/images/Blogs/Insomnia 1.jpg'),
                route: 'InsomniaDetail'
              },
              {
                id: '2',
                title: 'Hypersomnia',
                image: require('../../../assets/images/Blogs/Insomnia 1.jpg'),
                route: 'HypersomniaDetail'
              },
              {
                id: '3',
                title: 'Snoring',
                image: require('../../../assets/images/Blogs/Insomnia 2.jpg'),
                route: 'SnoringDetail'
              }
            ].map((blog) => (
              <TouchableOpacity 
                key={blog.id}
                style={styles.sleeppediaBlogCardVertical}
                onPress={() => navigation.navigate(blog.route)}
                activeOpacity={0.8}
              >
                <ImageBackground 
                  source={blog.image} 
                  style={styles.sleeppediaBlogImage}
                  imageStyle={styles.sleeppediaBlogImageStyle}
                >
                  <LinearGradient 
                    colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.1)']} 
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.sleeppediaBlogGradient}
                  >
                    <View style={styles.sleeppediaBlogContent}>
                      <Text style={styles.sleeppediaBlogTitle}>{blog.title}</Text>
                      <Ionicons name="chevron-forward" size={24} color="#FFF" />
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Spacer to prevent content from being hidden behind navbar */}
        <View style={styles.navbarSpacer} />
      </ScrollView>
    );
};

const styles = StyleSheet.create({
  // Sleeppedia Section Styles
  sleeppediaContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sleeppediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sleeppediaTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sleeppediaSeeAll: {
    color: '#6200EE',
    fontSize: 14,
  },
  sleeppediaVerticalContainer: {
    width: '100%',
    backgroundColor: 'rgba(43, 43, 43, 0.3)',
    borderRadius: 12,
    padding: 10,
    // Add glass-like effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sleeppediaBlogCardVertical: {
    width: '100%',
    height: 60,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(43, 43, 43, 0.76)',
  },
  sleeppediaBlogImage: {
    width: '100%',
    height: '100%',
  },
  sleeppediaBlogImageStyle: {
    borderRadius: 12,
  },
  sleeppediaBlogGradient: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
  },
  sleeppediaBlogContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sleeppediaBlogTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  containerMain: {
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000000",
    position: "relative",
    height: 200,
  },
  image: {
    height: 200,
    position: "absolute",
    resizeMode: 'cover',
  },
  text: {
    color: "#f1e6c9",
    fontSize: 34,
    fontWeight: "bold",
    position: "absolute",
    transform: [{ translateY: 50 }], // Center the text
    textShadowColor: "#f1e6c9", // Glow color
    textShadowOffset: { width: 0, height: 0 }, // No offset
    textShadowRadius: 10, // Initial shadow radius
    padding: 20,
  },
  carousel: {
    paddingHorizontal: 10,
    // paddingVertical: 20,
    backgroundColor: "#000000",
    marginTop: 10,
  },
  iconContainer: {
    width: screenWidth / 4, // Width to fit 4 icons per screen
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(43, 43, 43, 0.76)", // Background color with 76% opacity
    borderRadius: 15, // Rounded corners
    borderWidth: 0, // Border thickness
    borderColor: "#6200EE", // Border color
    padding: 10, // Add some padding inside the box
    marginHorizontal: 5, // Space between the boxes
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 5, // Shadow blur
    elevation: 5, // Shadow for Android
  },
  icon: {
    width: 30,
    height: 30,
    // resizeMode: "contain",
  },
  iconText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 5,
  },

  // -----------------------------------------------------------------------------------------------------------------------------
  
  sliderMainContainer: {
    width: "100%",
    height: 170,
    backgroundColor: "#000000",
  },
  sliderSubContainer: {
    alignSelf: "center",
    width: "90%",
    flex: 1,
    borderRadius: 10,
    margin: 15,
    backgroundColor: "#000000",
  },
  sliderImage: {
    width: "100%",
    height: "100%",
    padding: 15,
    borderRadius: 10,
  },
  paginationStyle: {
    position: "absolute",
    bottom: -15,
    alignSelf: "center",
    flexDirection: "row",
  },

  // -----------------------------------------------------------------------------------------------------

  storyContainer: {
    marginVertical: 20,

    backgroundColor: '#000', // Matches your homepage theme
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  storySeeAll: {
    fontSize: 14,
    color: '#1E90FF',
    fontWeight: '600',
  },
  storyCarousel: {
    paddingHorizontal: 10,
    // paddingVertical: 20,
    backgroundColor: "#000000",
    // marginTop: 10,
  },
  storySlide: {
    width: (screenWidth/2), // Keeps spacing consistent with paddingHorizontal
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(51, 51, 51, 0.8)', // Slightly darker for better contrast
    alignSelf: 'center',
    marginHorizontal: 10,
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
  storyCarousel2Image: {
    width: '100%',
    height: 120,
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
  storyEntryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 5, // Added margin for better spacing
  },
  storyEntryDetails: {
    fontSize: 12,
    color: '#CCC',
  },
  noiseContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  noiseHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  noiseHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  noiseSeeAll: {
    fontSize: 14,
    color: '#58a6ff',
  },
  noiseListContainer: {
    paddingHorizontal: 16,
  },
  noiseItemContainer: {
    width: 140, // Adjust width for each column
    marginRight: 16,
  },
  noiseCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50, // Circular effect
    padding: 16,
    width: 100, // Circular size
    height: 100, // Circular size
    alignSelf: 'center',
  },
  noiseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  noiseIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noiseTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noiseCategory: {
    color: '#aaa',
    fontSize: 12,
  },
  buttonPlayer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#58a6ff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 50,
  },
  buttonPlayerIcon: {
    fontSize: 24,
    color: '#fff',
  },

  navbarSpacer: {
    height: 65, // Same height as the navbar
  },
});

export default HomePage;
