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
import RecentlyUpdatedPage from "./AidScreens/RecentlyUpdatedPage";
import MusicPage from "./AidScreens/MusicPage";
import Favorites from "./AidScreens/Favorites";
import History from "./AidScreens/History";

const ScreenWidth = Dimensions.get("window").width;
const ScreenHeight = Dimensions.get("window").height;

const mainMenu = ['My Aids', 'White Noise', 'Music', 'Story', 'Recent Updates'];
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
    const { children, style, minHeight = 200 } = this.props;
    const { contentHeight } = this.state;
    
    return (
      <View 
        style={[
          styles.dynamicContainer,
          style,
          { minHeight },
          // Use measured height if available, otherwise use minHeight
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
      <ScrollView 
        contentContainerStyle={styles.subPageContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={index === this.state.activeSubIndex}
      >
        {component}
      </ScrollView>
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
      <ScrollView contentContainerStyle={styles.mainContainer}>
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
                <ScrollView contentContainerStyle={styles.singlePageContent}>
                  <MusicPage />
                </ScrollView>
              </DynamicPageContainer>,
              2,
              'music'
            )}

            {/* Story Page */}
            {this.renderMainPage(
              <DynamicPageContainer 
                onHeightChange={(height) => this.handleSectionHeightChange('story', height)}
              >
                <ScrollView contentContainerStyle={styles.singlePageContent}>
                  <View style={styles.emptyPage}>
                    <Text style={styles.emptyText}>Coming Soon</Text>
                  </View>
                </ScrollView>
              </DynamicPageContainer>,
              3,
              'story'
            )}

            {/* Recent Updates Page */}
            {this.renderMainPage(
              <DynamicPageContainer 
                onHeightChange={(height) => this.handleSectionHeightChange('recentUpdates', height)}
              >
                <ScrollView contentContainerStyle={styles.singlePageContent}>
                  <RecentlyUpdatedPage />
                </ScrollView>
              </DynamicPageContainer>,
              4,
              'recentUpdates'
            )}
          </ScrollView>
        </ImageBackground>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
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
    // Remove flexGrow: 0 to allow dynamic sizing
  },
  mainPage: {
    backgroundColor: 'transparent',
    width: ScreenWidth,
    // Remove fixed height constraints
    minHeight: 200,
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
    // Remove flexGrow: 0 and alignItems to allow dynamic sizing
    alignItems: 'flex-start',
  },
  subPage: {
    backgroundColor: 'transparent',
    width: ScreenWidth,
    // Remove fixed height constraints
  },
  subPageContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  singlePageContent: {
    flexGrow: 1,
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