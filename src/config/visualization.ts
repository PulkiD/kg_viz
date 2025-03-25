// Default colors in case environment variable is not set
const DEFAULT_NODE_COLORS = {
  gene: '#FF6B6B',      // bright coral red
  disease: '#4ECDC4',   // bright turquoise
  drug: '#45B7D1',      // bright blue
  pathway: '#96CEB4',   // bright sage green
};

// Parse node colors from environment variable or use defaults
export const getNodeColors = (): { [key: string]: string } => {
  try {
    const envColors = process.env.NEXT_PUBLIC_NODE_COLORS;
    if (!envColors) {
      return DEFAULT_NODE_COLORS;
    }
    
    // Remove any surrounding quotes if they exist
    const cleanJson = envColors.replace(/^['"]|['"]$/g, '');
    const parsedColors = JSON.parse(cleanJson);
    
    return {
      ...DEFAULT_NODE_COLORS,  // Keep defaults as fallback
      ...parsedColors,         // Override with environment values
    };
  } catch (error) {
    console.error('Error parsing node colors from environment:', error);
    return DEFAULT_NODE_COLORS;
  }
}; 