import { createSlice } from '@reduxjs/toolkit';
import { THEMES } from '../../config/themes';

const allowedThemes = Object.keys(THEMES);

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'teal';
  const stored = window.localStorage.getItem('app-theme');
  return allowedThemes.includes(stored) ? stored : 'teal';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: getInitialTheme() },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('app-theme', action.payload);
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
