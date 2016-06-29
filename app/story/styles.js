import { Animated, StyleSheet, View, Text, Dimensions } from 'react-native';

let styles = StyleSheet.create({
  body: {
    backgroundColor: '#eaedf1',
    flex: 1,
  },
  publication: {
    flexDirection: 'row',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 15,
    marginRight: 15,
    backgroundColor: '#323a45',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  publicationText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  headline: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 15,
    paddingBottom: 15,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 11,
    borderBottomColor: '#eaedf1',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5
  },
  headlineText: {
    flex: 1,
    flexWrap: 'wrap',
    color: '#000',
    fontSize: 16
  },
  moodScore: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'column'
  },
  firstRow: {
    flex: 4
  },
  bar: {
    alignSelf: 'flex-end',
    borderRadius: 5,
    height: 4,
    marginRight: 5,
    backgroundColor: '#f55443',
  },
  trendRow: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10
  },
  full: {
    flex: 1
  }
});

export default styles;
