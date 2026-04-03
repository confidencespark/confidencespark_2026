import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  selectedSituation: null,
  selectedMood: null,
  currentStep: 0,
  sessionData: null,
  isOnboardingComplete: false,
  theme: 'light',
};

/**
 * App Slice
 *
 * Manages general application state and session data.
 *
 * State:
 * - selectedSituation/selectedMood: Temporary state for the confidence flow.
 * - currentStep: Workflow coordination.
 * - theme: UI theme preference.
 */
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSelectedSituation: (state, action) => {
      state.selectedSituation = action.payload;
    },
    setSelectedMood: (state, action) => {
      state.selectedMood = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    nextStep: state => {
      state.currentStep += 1;
    },
    previousStep: state => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    setSessionData: (state, action) => {
      state.sessionData = action.payload;
    },
    completeOnboarding: state => {
      state.isOnboardingComplete = true;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    resetSession: state => {
      state.selectedSituation = null;
      state.selectedMood = null;
      state.currentStep = 0;
      state.sessionData = null;
    },
  },
});

export const {
  setSelectedSituation,
  setSelectedMood,
  setCurrentStep,
  nextStep,
  previousStep,
  setSessionData,
  completeOnboarding,
  setTheme,
  resetSession,
} = appSlice.actions;

export default appSlice.reducer;
