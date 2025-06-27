import React, { Component } from "react";
import { ScrollView, View, Text, StyleSheet, Dimensions, ImageBackground, TouchableOpacity } from "react-native";
import WNall from "./AidScreens/WNall";
import WNmixes from "./AidScreens/WNmixes";
import WNrain from "./AidScreens/WNrain";
import WNasmr from "./AidScreens/WNasmr";
import WNnature from "./AidScreens/WNnature";
import WNanimal from "./AidScreens/WNanimal";
import WNcity from "./AidScreens/WNcity";
import WNspecial from "./AidScreens/WNspecial";

import MusicPage from "./AidScreens/MusicPage";
import StoriesPage from "./AidScreens/StoriesPage";
import Favorites from "./AidScreens/Favorites";
import History from "./AidScreens/History";

const ScreenWidth = Dimensions.get("window").width;
const ScreenHeight = Dimensions.get("window").height;

const mainMenu = ['My Aids', 'White Noise', 'Music', 'Story'];
const myAidsSubMenu = ['Favorites', 'History'];
const whiteNoiseSubMenu = ['All', 'Mixes', 'Rain', 'ASMR', 'Nature', 'Animal', 'City', 'Special'];

// Dynamic height container component
class DynamicPageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentHeight: null
    };
  }

  handleLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    if (height !== this.state.contentHeight && height > 0) {
      this.setState({ contentHeight: height });
      // Notify parent about height change
      this.props.onHeightChange?.(height);
    }
  };

  render() {
    const { children, style, minHeight = ScreenHeight - 100 } = this.props; // Use screen height minus header space
    const { contentHeight } = this.state;
    
    return (
      <View 
        style={[
          styles.dynamicContainer,
          style,
          { minHeight },
          // Use measured height if available, otherwise use calculated minHeight
          contentHeight ? { height: Math.max(contentHeight, minHeight) } : {}
        ]}
        onLayout={this.handleLayout}
      >
        {children}
      </View>
    );
  }
}

// Optimized sub-section component
class SubSectionNavigator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSubIndex: 0
    };
    this.subScrollViewRef = React.createRef();
  }

  handleSubMenuPress = (index) => {
    this.setState({ activeSubIndex: index });
    this.subScrollViewRef.current?.scrollTo({ x: index * ScreenWidth, animated: true });
  };

  handleSubScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / ScreenWidth);
    if (currentIndex !== this.state.activeSubIndex) {
      this.setState({ activeSubIndex: currentIndex });
    }
  };

  renderSubMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => this.handleSubMenuPress(index)}
      style={[
        styles.menuItemContainer,
        index === this.state.activeSubIndex && styles.activeMenuItemContainer,
      ]}
    >
      <Text
        style={[
          styles.subItemText,
          index === this.state.activeSubIndex && styles.activeItemText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  renderSubPage = (component, index) => (
    <DynamicPageContainer 
      key={index} 
      style={styles.subPage}
      onHeightChange={this.props.onHeightChange}
    >
      <View style={styles.subPageContent}>
        {component}
      </View>
    </DynamicPageContainer>
  );

  render() {
    const { subMenu, components, onScrollStateChange } = this.props;

    if (subMenu.length === 1) {
      // Single sub-section, render directly without tabs
      return this.renderSubPage(components[0], 0);
    }

    return (
      <View style={styles.subSectionContainer}>
        {/* Sub-menu */}
        <ScrollView
          horizontal
          contentContainerStyle={styles.subMenuContainer}
          showsHorizontalScrollIndicator={false}
          onTouchStart={() => onScrollStateChange?.(false)}
          onMomentumScrollEnd={() => onScrollStateChange?.(true)}
          onScrollEndDrag={() => onScrollStateChange?.(true)}
        >
          {subMenu.map(this.renderSubMenuItem)}
        </ScrollView>

        {/* Sub-pages */}
        <ScrollView
          horizontal
          pagingEnabled
          contentContainerStyle={styles.subPagesContainer}
          onScroll={this.handleSubScroll}
          scrollEventThrottle={16}
          ref={this.subScrollViewRef}
          showsHorizontalScrollIndicator={false}
          onTouchStart={() => onScrollStateChange?.(false)}
          onMomentumScrollEnd={() => onScrollStateChange?.(true)}
          onScrollEndDrag={() => onScrollStateChange?.(true)}
        >
          {components.map(this.renderSubPage)}
        </ScrollView>
      </View>
    );
  }
}

export default class ImprovedAidsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      enabled: true,
      sectionHeights: {} // Track heights of different sections
    };
    this.scrollViewRef = React.createRef();
    this.subSectionRefs = {}; // Store refs to SubSectionNavigator components
  }

  componentDidMount() {
    // Check if we have route params for navigation
    this.handleRouteParams();
  }

  componentDidUpdate(prevProps) {
    // Check if route params have changed
    if (prevProps.route?.params !== this.props.route?.params) {
      this.handleRouteParams();
    }
  }

  handleRouteParams = () => {
    const { route } = this.props;
    if (route?.params) {
      const { section, subSection } = route.params;
      
      // Navigate to main section if specified
      if (section !== undefined && section >= 0 && section < mainMenu.length) {
        this.handleMenuPress(section);
        
        // If this is a section with sub-sections and a subSection is specified
        if ((section === 0 || section === 1) && subSection !== undefined) {
          // We need to wait for the main scroll to complete before scrolling the sub-section
          setTimeout(() => {
            // Find the SubSectionNavigator component and call its handleSubMenuPress method
            const subNavigator = this.subSectionRefs[section];
            if (subNavigator && typeof subNavigator.handleSubMenuPress === 'function') {
              subNavigator.handleSubMenuPress(subSection);
            }
          }, 300); // Small delay to ensure main scroll completes first
        }
      }
    }
  }

  handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / ScreenWidth);
    if (currentIndex !== this.state.activeIndex) {
      this.setState({ activeIndex: currentIndex });
    }
  };

  handleMenuPress = (index) => {
    this.scrollViewRef.current?.scrollTo({ x: index * ScreenWidth, animated: true });
    this.setState({ activeIndex: index });
  };

  handleScrollStateChange = (enabled) => {
    this.setState({ enabled });
  };

  handleSectionHeightChange = (sectionId, height) => {
    this.setState(prevState => ({
      sectionHeights: {
        ...prevState.sectionHeights,
        [sectionId]: height
      }
    }));
  };

  renderMainMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => this.handleMenuPress(index)}
      style={[
        styles.menuItemContainer,
        index === this.state.activeIndex && styles.activeMenuItemContainer,
      ]}
    >
      <Text
        style={[
          styles.itemText,
          index === this.state.activeIndex && styles.activeItemText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  renderMainPage = (content, index, sectionId) => {
    const sectionHeight = this.state.sectionHeights[sectionId];
    
    return (
      <View 
        key={index} 
        style={[
          styles.mainPage,
          // Apply dynamic height if available
          sectionHeight ? { height: sectionHeight } : {}
        ]}
      >
        {content}
      </View>
    );
  };

  render() {
    const myAidsComponents = [<Favorites />, <History />];
    const whiteNoiseComponents = [
      <WNall />, <WNmixes />, <WNrain />, <WNasmr />,
      <WNnature />, <WNanimal />, <WNcity />, <WNspecial />
    ];

    return (
      <View style={styles.mainContainer}>
        <ImageBackground
          source={require('../../../assets/images/banners/aids-main-back.webp')}
          style={styles.mainBannerImage}
          imageStyle={{ height: 200 }}
        >
          {/* Main Menu */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mainScrollContainer}
          >
            {mainMenu.map(this.renderMainMenuItem)}
          </ScrollView>

          {/* Main Pages */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mainPageScrollContainer}
            onScroll={this.handleScroll}
            scrollEventThrottle={16}
            ref={this.scrollViewRef}
            scrollEnabled={this.state.enabled}
          >
            {/* My Aids Page */}
            {this.renderMainPage(
              <SubSectionNavigator
                ref={(ref) => this.subSectionRefs[0] = ref}
                subMenu={myAidsSubMenu}
                components={myAidsComponents}
                onScrollStateChange={this.handleScrollStateChange}
                onHeightChange={(height) => this.handleSectionHeightChange('myAids', height)}
              />,
              0,
              'myAids'
            )}

            {/* White Noise Page */}
            {this.renderMainPage(
              <SubSectionNavigator
                ref={(ref) => this.subSectionRefs[1] = ref}
                subMenu={whiteNoiseSubMenu}
                components={whiteNoiseComponents}
                onScrollStateChange={this.handleScrollStateChange}
                onHeightChange={(height) => this.handleSectionHeightChange('whiteNoise', height)}
              />,
              1,
              'whiteNoise'
            )}

            {/* Music Page */}
            {this.renderMainPage(
              <DynamicPageContainer 
                onHeightChange={(height) => this.handleSectionHeightChange('music', height)}
              >
                <View style={styles.singlePageContent}>
                  <MusicPage />
                </View>
              </DynamicPageContainer>,
              2,
              'music'
            )}

            {/* Story Page */}
            {this.renderMainPage(
              <DynamicPageContainer 
                onHeightChange={(height) => this.handleSectionHeightChange('story', height)}
              >
                <View style={styles.singlePageContent}>
                  <StoriesPage />
                </View>
              </DynamicPageContainer>,
              3,
              'story'
            )}


          </ScrollView>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  mainScrollContainer: {
    paddingHorizontal: 10,
    marginTop: 80,
  },
  menuItemContainer: {
    paddingHorizontal: 10,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
    borderWidth: 1,
    height: 45,
  },
  activeMenuItemContainer: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
  },
  subItemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "gray",
  },
  activeItemText: {
    color: "white",
  },
  mainBannerImage: {
    width: ScreenWidth,
  },
  mainPageScrollContainer: {
    marginTop: 10,
    height: ScreenHeight - 100, // Ensure container has proper height
  },
  mainPage: {
    backgroundColor: 'transparent',
    width: ScreenWidth,
    // Use full available height minus header space
    minHeight: ScreenHeight - 400,
    height: ScreenHeight - 400,
  },
  subSectionContainer: {
    flex: 1,
  },
  subMenuContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 85,
    marginHorizontal: 10,
  },
  subPagesContainer: {
    // Ensure proper height for sub-pages container
    alignItems: 'flex-start',
    height: ScreenHeight - 100, // Account for main menu and sub-menu heights
  },
  subPage: {
    backgroundColor: 'transparent',
    width: ScreenWidth,
    // Use full available height for sub-pages
    minHeight: ScreenHeight - 100, // Account for sub-menu height
  },
  subPageContent: {
    flex: 1,
    paddingBottom: 20,
  },
  singlePageContent: {
    flex: 1,
    paddingBottom: 20,
  },
  dynamicContainer: {
    backgroundColor: 'transparent',
    // Allow dynamic sizing
  },
  emptyPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});