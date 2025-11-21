/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Lighten a hex color by a percentage
 * @param hex - Hex color code (e.g., "#A82A50")
 * @param percent - Lightness increase (0-100). Default is 60
 * @param opacity - Opacity percentage (0-100). Default is 30 (very light/transparent)
 * @returns Lightened hex color with opacity
 */
export function lightenColor(hex: string, percent: number = 60, opacity: number = 30): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Increase RGB values to make it lighter (60-70% lighter)
  let r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * (percent / 100)));
  let g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * (percent / 100)));
  let b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * (percent / 100)));

  // Convert opacity percentage to hex (30% = 0x4D)
  const opacityHex = Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, "0");

  return rgbToHex(r, g, b) + opacityHex;
}

/**
 * Generate primary light color from primary color
 * @param primaryColor - Primary hex color
 * @returns Much lighter version of primary color with 30% opacity (very light & transparent)
 */
export function getPrimaryLight(primaryColor: string): string {
  return lightenColor(primaryColor, 60, 30); // 60% lighter, 30% opacity
}
