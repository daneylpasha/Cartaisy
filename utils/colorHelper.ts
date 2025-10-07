/**
 * Converts a color name to its hex value
 * @param colorName - The name of the color (e.g., "Rose Gold", "Black", "Navy Blue")
 * @returns The hex color code (e.g., "#B76E79")
 */
export const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    // Basic colors
    black: "#000000",
    white: "#FFFFFF",
    red: "#FF0000",
    blue: "#0000FF",
    green: "#008000",
    yellow: "#FFFF00",
    purple: "#800080",
    pink: "#FFC0CB",
    orange: "#FFA500",
    brown: "#A52A2A",
    grey: "#808080",
    gray: "#808080",

    // Metallic colors
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    "rose gold": "#B76E79",
    rosegold: "#B76E79",

    // Variations
    navy: "#000080",
    "navy blue": "#000080",
    "light blue": "#ADD8E6",
    "dark blue": "#00008B",
    beige: "#F5F5DC",
    cream: "#FFFDD0",
    maroon: "#800000",
    olive: "#808000",
    teal: "#008080",
    cyan: "#00FFFF",
    magenta: "#FF00FF",
    lime: "#00FF00",
    indigo: "#4B0082",
    violet: "#EE82EE",
    turquoise: "#40E0D0",
    coral: "#FF7F50",
    salmon: "#FA8072",
    khaki: "#F0E68C",
    lavender: "#E6E6FA",
    mint: "#98FF98",
  };

  const normalizedName = colorName.toLowerCase().trim();
  return colorMap[normalizedName] || "#808080"; // Default to gray if not found
};
