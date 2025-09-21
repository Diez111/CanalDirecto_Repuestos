// Sistema de colores consistente para la aplicación
// Modo Claro: Espectro de blancos elegantes
// Modo Oscuro: Espectro de negros AMOLED elegantes

export interface ColorScheme {
  // Fondos principales
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Textos
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Bordes
  border: string;
  borderSecondary: string;
  borderFocus: string;
  
  // Componentes
  card: string;
  cardHover: string;
  button: string;
  buttonHover: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  
  // Estados
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Overlays
  overlay: string;
  modal: string;
  
  // Específicos para gráficos
  chartColors: string[];
}

export const lightTheme: ColorScheme = {
  // Fondos - Espectro de blancos elegantes
  background: 'bg-white',
  backgroundSecondary: 'bg-gray-50',
  backgroundTertiary: 'bg-gray-100',
  
  // Textos - Grises elegantes
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  textTertiary: 'text-gray-500',
  
  // Bordes - Grises suaves
  border: 'border-gray-200',
  borderSecondary: 'border-gray-300',
  borderFocus: 'border-blue-500',
  
  // Componentes - Blancos y grises suaves
  card: 'bg-white',
  cardHover: 'bg-gray-50',
  button: 'bg-blue-500',
  buttonHover: 'bg-blue-600',
  buttonSecondary: 'bg-gray-100',
  buttonSecondaryHover: 'bg-gray-200',
  
  // Estados - Colores suaves
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  
  // Overlays
  overlay: 'bg-black bg-opacity-50',
  modal: 'bg-white',
  
  // Colores para gráficos - Paleta suave
  chartColors: [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#F97316', // orange-500
    '#84CC16', // lime-500
    '#EC4899', // pink-500
    '#6B7280'  // gray-500
  ]
};

export const darkTheme: ColorScheme = {
  // Fondos - Espectro de negros AMOLED
  background: 'bg-black',
  backgroundSecondary: 'bg-gray-900',
  backgroundTertiary: 'bg-gray-800',
  
  // Textos - Blancos y grises claros
  textPrimary: 'text-white',
  textSecondary: 'text-gray-300',
  textTertiary: 'text-gray-400',
  
  // Bordes - Grises oscuros
  border: 'border-gray-700',
  borderSecondary: 'border-gray-600',
  borderFocus: 'border-blue-400',
  
  // Componentes - Negros y grises oscuros
  card: 'bg-gray-900',
  cardHover: 'bg-gray-800',
  button: 'bg-blue-600',
  buttonHover: 'bg-blue-700',
  buttonSecondary: 'bg-gray-700',
  buttonSecondaryHover: 'bg-gray-600',
  
  // Estados - Colores oscuros con contraste
  success: 'bg-green-900 text-green-300 border-green-700',
  warning: 'bg-yellow-900 text-yellow-300 border-yellow-700',
  error: 'bg-red-900 text-red-300 border-red-700',
  info: 'bg-blue-900 text-blue-300 border-blue-700',
  
  // Overlays
  overlay: 'bg-black bg-opacity-75',
  modal: 'bg-gray-900',
  
  // Colores para gráficos - Paleta vibrante para AMOLED
  chartColors: [
    '#60A5FA', // blue-400
    '#34D399', // emerald-400
    '#FBBF24', // amber-400
    '#F87171', // red-400
    '#A78BFA', // violet-400
    '#22D3EE', // cyan-400
    '#FB923C', // orange-400
    '#A3E635', // lime-400
    '#F472B6', // pink-400
    '#9CA3AF'  // gray-400
  ]
};

export const getColorScheme = (isDark: boolean): ColorScheme => {
  return isDark ? darkTheme : lightTheme;
};

// Funciones de utilidad para aplicar colores
export const getBackgroundClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.background : lightTheme.background;
};

export const getTextClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.textPrimary : lightTheme.textPrimary;
};

export const getSubTextClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.textSecondary : lightTheme.textSecondary;
};

export const getCardClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.card : lightTheme.card;
};

export const getBorderClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.border : lightTheme.border;
};

export const getButtonClasses = (isDark: boolean, variant: 'primary' | 'secondary' = 'primary'): string => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200';
  
  if (variant === 'primary') {
    return `${baseClasses} ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`;
  }
  
  return `${baseClasses} ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`;
};

export const getInputClasses = (isDark: boolean): string => {
  const baseClasses = 'w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
  return `${baseClasses} ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`;
};

export const getSelectClasses = (isDark: boolean): string => {
  const baseClasses = 'w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
  return `${baseClasses} ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
};

export const getModalClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.modal : lightTheme.modal;
};

export const getOverlayClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.overlay : lightTheme.overlay;
};

// Colores específicos para estados
export const getSuccessClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.success : lightTheme.success;
};

export const getWarningClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.warning : lightTheme.warning;
};

export const getErrorClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.error : lightTheme.error;
};

export const getInfoClasses = (isDark: boolean): string => {
  return isDark ? darkTheme.info : lightTheme.info;
};

// Colores para gráficos
export const getChartColors = (isDark: boolean): string[] => {
  return isDark ? darkTheme.chartColors : lightTheme.chartColors;
};
