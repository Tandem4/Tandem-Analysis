import React, { Component, PropTypes, TouchableHighlight } from 'react';
import { Animated, StyleSheet, View, Text, Dimensions, WebView } from 'react-native';
import styles from './styles.js';

const Slant = (props) => {
  return(
     <View style={styles.moodScore}>
      <Animated.View style={[styles.bar, {width: props.mood}]} />
    </View>
	)
}


export default Slant;