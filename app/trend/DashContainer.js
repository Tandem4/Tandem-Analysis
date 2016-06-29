import React, { Component, PropTypes } from 'react';
import { Animated, StyleSheet, View, Text, Dimensions, WebView, TouchableHighlight } from 'react-native';
import styles from '../assets/styles.js';

import Trend from './Trend';

const DashContainer = (trend) => {
  return (
    <View style={styles.card} >
      <Text style={styles.trendRow} >{trend.trend_name}</Text>
    </View>
  );
}

export default DashContainer;
