import { LayoutAnimation, Platform, UIManager } from "react-native";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Helper function to perform layout animations before state changes
 * Call this before setting state to animate the UI update
 *
 * @example
 * performLayoutAnimation();
 * setIsExpanded(true);
 */
export const performLayoutAnimation = () => {
  LayoutAnimation.configureNext({
    duration: 250,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.scaleXY,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
};

/**
 * Perform a spring animation
 */
export const performSpringAnimation = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
};

/**
 * Perform a linear animation
 */
export const performLinearAnimation = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
};

/**
 * Perform an ease-in-ease-out animation
 */
export const performEaseAnimation = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};
