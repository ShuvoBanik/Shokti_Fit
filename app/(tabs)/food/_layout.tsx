// Owner: Swarna Sikder | F5, F6
import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../theme/tokens';

export default function StackLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
