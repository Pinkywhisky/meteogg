export const theme = {
  modes: {
    light: {
      background: '#EEF6FF',
      backgroundAccent: '#DDEFFF',
      surface: '#FFFFFF',
      surfaceMuted: '#F6FAFF',
      primary: '#0B6EFD',
      primaryDark: '#084A9E',
      primaryMuted: '#7CAEF7',
      primarySoft: '#DDEBFF',
      success: '#1E8E5A',
      danger: '#C43D3D',
      border: '#D8E2F0',
      textPrimary: '#102033',
      textSecondary: '#3C516B',
      textMuted: '#71839A',
      white: '#FFFFFF',
    },
    dark: {
      background: '#111827',
      backgroundAccent: '#172033',
      surface: '#1F2937',
      surfaceMuted: '#263244',
      primary: '#78AFFF',
      primaryDark: '#A8CAFF',
      primaryMuted: '#6C86AA',
      primarySoft: '#223759',
      success: '#7DD3A8',
      danger: '#FCA5A5',
      border: '#334155',
      textPrimary: '#F8FAFC',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
      white: '#FFFFFF',
    },
  },
  colors: {
    background: '#EEF6FF',
    backgroundAccent: '#DDEFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F6FAFF',
    primary: '#0B6EFD',
    primaryDark: '#084A9E',
    primaryMuted: '#7CAEF7',
    primarySoft: '#DDEBFF',
    success: '#1E8E5A',
    danger: '#C43D3D',
    border: '#D8E2F0',
    textPrimary: '#102033',
    textSecondary: '#3C516B',
    textMuted: '#71839A',
    white: '#FFFFFF',
  },
  weatherThemes: {
    sunny: {
      background: '#E7F5FF',
      accent: '#BFE4FF',
      hero: '#FFFFFF',
      tile: '#F4FBFF',
      border: '#B8DCF6',
      primary: '#0A6ACB',
      soft: '#D8ECFF',
    },
    cloudy: {
      background: '#ECF2F7',
      accent: '#D4DFE9',
      hero: '#FFFFFF',
      tile: '#F5F8FB',
      border: '#C7D4DF',
      primary: '#496A88',
      soft: '#E1EAF2',
    },
    rainy: {
      background: '#E4EEF7',
      accent: '#C9DCEB',
      hero: '#FFFFFF',
      tile: '#F3F8FC',
      border: '#BFD3E2',
      primary: '#2F668D',
      soft: '#D7E7F3',
    },
    storm: {
      background: '#E6EBF1',
      accent: '#CDD5DF',
      hero: '#FFFFFF',
      tile: '#F5F7FA',
      border: '#BBC6D2',
      primary: '#33485F',
      soft: '#DDE5EE',
    },
    snow: {
      background: '#F2FAFF',
      accent: '#D7F0FF',
      hero: '#FFFFFF',
      tile: '#F8FDFF',
      border: '#C7E5F4',
      primary: '#2F7EA8',
      soft: '#E1F4FF',
    },
    fog: {
      background: '#EFF3F5',
      accent: '#DCE4E8',
      hero: '#FFFFFF',
      tile: '#F7FAFB',
      border: '#CBD6DC',
      primary: '#5B6F7E',
      soft: '#E6EDF1',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    xxl: 36,
    xxxl: 48,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 18,
    pill: 999,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 13,
      md: 16,
      lg: 20,
      xl: 24,
      display: 34,
      hero: 86,
      temperature: 64,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  shadows: {
    card: {
      elevation: 3,
      shadowColor: '#102033',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    soft: {
      elevation: 1,
      shadowColor: '#102033',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
  },
};

export function getWeatherIcon(weather = {}) {
  const code = weather.weatherCode;
  const condition = String(weather.condition || '').toLowerCase();

  if ([95, 96, 99].includes(code) || condition.includes('orage')) {
    return '⛈️';
  }

  if ([71, 73, 75, 77, 85, 86].includes(code) || condition.includes('neige')) {
    return '❄️';
  }

  if ([45, 48].includes(code) || condition.includes('brouillard')) {
    return '🌫️';
  }

  if ([51, 53, 55, 56, 57].includes(code) || condition.includes('bruine')) {
    return '🌦️';
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code) || condition.includes('pluie')) {
    return '🌧️';
  }

  if (code === 1 || condition.includes('dégagé')) {
    return '🌤️';
  }

  if ([2, 3].includes(code) || condition.includes('nuage')) {
    return '☁️';
  }

  return '☀️';
}

export function getWeatherTheme(weather = {}) {
  const code = weather.weatherCode;
  const condition = String(weather.condition || '').toLowerCase();

  if ([95, 96, 99].includes(code) || condition.includes('orage')) {
    return theme.weatherThemes.storm;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code) || condition.includes('neige')) {
    return theme.weatherThemes.snow;
  }

  if ([45, 48].includes(code) || condition.includes('brouillard')) {
    return theme.weatherThemes.fog;
  }

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code) ||
    condition.includes('pluie') ||
    condition.includes('bruine')
  ) {
    return theme.weatherThemes.rainy;
  }

  if ([2, 3].includes(code) || condition.includes('nuage')) {
    return theme.weatherThemes.cloudy;
  }

  return theme.weatherThemes.sunny;
}

export function getAppTheme(colorScheme) {
  return colorScheme === 'dark' ? theme.modes.dark : theme.modes.light;
}
