// Owner: Mahbub Hasnain | F1
import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../theme/tokens';

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
