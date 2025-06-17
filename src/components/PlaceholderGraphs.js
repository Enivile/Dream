import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const ScreenWidth = Dimensions.get('window').width;

// Sleep Quality Graph Component
export const SleepQualityGraph = () => {
  const data = [7, 8, 6, 9, 7, 8, 9]; // Sample sleep hours
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...data);

  return (
    <View style={styles.graphContainer}>
      <View style={styles.graphHeader}>
        <Text style={styles.graphTitle}>Sleep Quality</Text>
        <Text style={styles.graphSubtitle}>Hours per night</Text>
      </View>
      
      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {[10, 8, 6, 4, 2, 0].map((value, index) => (
            <Text key={index} style={styles.yAxisLabel}>{value}h</Text>
          ))}
        </View>
        
        {/* Chart bars */}
        <View style={styles.barsContainer}>
          {data.map((value, index) => (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: (value / maxValue) * 120,
                      backgroundColor: index === 3 ? '#4ECDC4' : '#2C3E50'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.xAxisLabel}>{days[index]}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>7.6h</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>9h</Text>
          <Text style={styles.statLabel}>Best</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>6h</Text>
          <Text style={styles.statLabel}>Lowest</Text>
        </View>
      </View>
    </View>
  );
};

// Dream Frequency Graph Component
export const DreamFrequencyGraph = () => {
  const data = [3, 5, 2, 7, 4, 6, 8];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...data);

  return (
    <View style={styles.graphContainer}>
      <View style={styles.graphHeader}>
        <Text style={styles.graphTitle}>Dream Frequency</Text>
        <Text style={styles.graphSubtitle}>Dreams recorded per day</Text>
      </View>
      
      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {[10, 8, 6, 4, 2, 0].map((value, index) => (
            <Text key={index} style={styles.yAxisLabel}>{value}</Text>
          ))}
        </View>
        
        {/* Line chart simulation */}
        <View style={styles.lineChartContainer}>
          {data.map((value, index) => (
            <View key={index} style={styles.linePoint}>
              <View 
                style={[
                  styles.point,
                  { 
                    bottom: (value / maxValue) * 120,
                    backgroundColor: index === 6 ? '#E74C3C' : '#9B59B6'
                  }
                ]} 
              />
              {index < data.length - 1 && (
                <View 
                  style={[
                    styles.line,
                    {
                      bottom: (value / maxValue) * 120 + 4,
                      transform: [{
                        rotate: `${Math.atan2(
                          (data[index + 1] - value) / maxValue * 120,
                          (ScreenWidth * 0.8) / 7
                        )}rad`
                      }]
                    }
                  ]}
                />
              )}
            </View>
          ))}
        </View>
        
        {/* X-axis labels */}
        <View style={styles.xAxisContainer}>
          {days.map((day, index) => (
            <Text key={index} style={styles.xAxisLabel}>{day}</Text>
          ))}
        </View>
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5.0</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>+60%</Text>
          <Text style={styles.statLabel}>This week</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>35</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
    </View>
  );
};

// Mood Tracking Pie Chart Component
export const MoodTrackingGraph = () => {
  const moodData = [
    { label: 'Happy', value: 40, color: '#F39C12' },
    { label: 'Calm', value: 30, color: '#3498DB' },
    { label: 'Anxious', value: 20, color: '#E74C3C' },
    { label: 'Neutral', value: 10, color: '#95A5A6' }
  ];

  return (
    <View style={styles.graphContainer}>
      <View style={styles.graphHeader}>
        <Text style={styles.graphTitle}>Mood Distribution</Text>
        <Text style={styles.graphSubtitle}>This week's emotional state</Text>
      </View>
      
      <View style={styles.pieChartContainer}>
        {/* Simple pie chart representation */}
        <View style={styles.pieChart}>
          {moodData.map((item, index) => (
            <View 
              key={index}
              style={[
                styles.pieSlice,
                {
                  backgroundColor: item.color,
                  width: `${item.value}%`,
                  height: 8,
                  marginVertical: 2
                }
              ]}
            />
          ))}
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
          {moodData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
              <Text style={styles.legendValue}>{item.value}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  graphContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  graphHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  graphTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  graphSubtitle: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  chartArea: {
    flexDirection: 'row',
    height: 150,
    marginBottom: 20,
  },
  yAxis: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 10,
    width: 40,
  },
  yAxisLabel: {
    color: '#888',
    fontSize: 12,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 5,
  },
  xAxisLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  lineChartContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'relative',
  },
  linePoint: {
    position: 'relative',
    width: 8,
    height: 120,
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  line: {
    width: (ScreenWidth * 0.8) / 7,
    height: 2,
    backgroundColor: '#9B59B6',
    position: 'absolute',
    left: 4,
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: -20,
    left: 40,
    right: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  pieChart: {
    width: '100%',
    marginBottom: 20,
  },
  pieSlice: {
    borderRadius: 4,
  },
  legend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  legendValue: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
});