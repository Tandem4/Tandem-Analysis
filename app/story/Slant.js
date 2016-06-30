import React, { Component, PropTypes, TouchableHighlight } from 'react';
import { Animated, StyleSheet, View, Text, Dimensions, WebView } from 'react-native';
import styles from './styles.js';

const Slant = (props) => {
  return(
    <View>
      <Animated.View style={styles.bar} />
    </View>
	)
}


export default Slant;
