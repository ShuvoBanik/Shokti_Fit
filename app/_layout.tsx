// Owner: Shared (led by Mahbub Hasnain) | shell
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { HindSiliguri_400Regular, HindSiliguri_600SemiBold } from '@expo-google-fonts/hind-siliguri';
import { colors } from '../theme/tokens';
import { SettingsProvider } from '../context/SettingsContext';
import { SnackbarProvider } from '../context/SnackbarContext';
import { ProfileProvider } from '../context/ProfileContext';
import { MealsProvider } from '../context/MealsContext';
import { TrackingProvider } from '../context/TrackingContext';
import { WorkoutProvider } from '../context/WorkoutContext';
import { registerSyncHandlers } from '../services/syncHandlers';
import { outbox } from '../services/outbox';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

registerSyncHandlers();

/** Flushes the outbox on start, on reconnect (useNetworkStatus) and every 60 s while the app is open (TRD 8.2). */
function SyncManager() {
  useNetworkStatus();
  useEffect(() => {
    void outbox.load().then(() => outbox.flush(true));
    const id = setInterval(() => void outbox.flush(), 60000);
    return () => clearInterval(id);
  }, []);
  return null;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Manrope_700Bold, Manrope_800ExtraBold, Inter_400Regular, Inter_600SemiBold, HindSiliguri_400Regular, HindSiliguri_600SemiBold,
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <SettingsProvider>
      <SnackbarProvider>
        <ProfileProvider>
          <MealsProvider>
            <TrackingProvider>
              <WorkoutProvider>
                <SyncManager />
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }} />
              </WorkoutProvider>
            </TrackingProvider>
          </MealsProvider>
        </ProfileProvider>
      </SnackbarProvider>
    </SettingsProvider>
  );
}
