// Owner: Shared (led by Mahbub Hasnain) | shell
import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { TabBar } from '../../components/TabBar';
import { useProfile } from '../../context/ProfileContext';
import { colors } from '../../theme/tokens';

export default function TabsLayout() {
  const { ready, onboarded } = useProfile();
  if (ready && !onboarded) return <Redirect href="/welcome" />;
  return (
    <Tabs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tabBar={(props) => <TabBar {...(props as any)} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="workouts" />
      <Tabs.Screen name="food" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
