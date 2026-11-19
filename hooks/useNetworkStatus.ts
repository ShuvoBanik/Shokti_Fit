// Owner: Rafsan Zaman Abir | F8
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { mockControl } from '../services/mock/control';
import { USE_MOCK } from '../services/api';
import { outbox } from '../services/outbox';

/** Online = device connected AND (in mock mode) the demo "offline" switch is off. Flushes the outbox on reconnect. */
export function useNetworkStatus() {
  const [deviceOnline, setDeviceOnline] = useState(true);
  const [mockOffline, setMockOffline] = useState(mockControl.isOffline());
  useEffect(() => NetInfo.addEventListener((s) => setDeviceOnline(s.isConnected !== false && s.isInternetReachable !== false)), []);
  useEffect(() => mockControl.subscribe(() => setMockOffline(mockControl.isOffline())), []);
  const online = deviceOnline && !(USE_MOCK && mockOffline);
  useEffect(() => {
    if (online) void outbox.flush(true);
  }, [online]);
  return { online };
}
