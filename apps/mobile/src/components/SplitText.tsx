import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, TextStyle } from 'react-native';

interface SplitTextProps {
  /** The text to animate word-by-word. */
  text: string;
  /** Additional styles applied to each animated word. */
  style?: TextStyle;
  /** Delay in ms between each word's entrance. */
  stagger?: number;
}

/**
 * SplitText — Animated "spoken" word-entrance component.
 *
 * Why useMemo: useRef creates the animatedValues array once on mount 
 * and never resizes. When `text` changes to a string with MORE words 
 * than the initial render, animatedValues[index] is undefined for the 
 * extra words, causing "Cannot read property 'interpolate' of undefined".
 * Deriving from useMemo re-creates the array whenever `text` changes.
 */
export const SplitText: React.FC<SplitTextProps> = ({
  text,
  style,
  stagger = 60,
}) => {
  const words = text.split(' ');

  // Re-create the animation array every time the text (and therefore word count) changes.
  const animatedValues = useMemo(
    () => words.map(() => new Animated.Value(0)),
    [text] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    // Reset all values before starting the new animation sequence.
    animatedValues.forEach((val) => val.setValue(0));

    const animations = animatedValues.map((val, i) =>
      Animated.timing(val, {
        toValue: 1,
        duration: 700,
        delay: i * stagger,
        easing: Easing.out(Easing.poly(4)),
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
  }, [animatedValues, stagger]);

  return (
    <View style={styles.container}>
      {words.map((word, index) => {
        const translateY = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
        });

        return (
          <Animated.Text
            key={`${word}-${index}`}
            style={[
              style,
              {
                opacity: animatedValues[index],
                transform: [{ translateY }],
                marginRight: 8,
              },
            ]}
          >
            {word}
          </Animated.Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
