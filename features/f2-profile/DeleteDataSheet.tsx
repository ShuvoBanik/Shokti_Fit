// Owner: Mahbub Hasnain | F2
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ConfirmSheet } from '../../components/ui';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';
import { useSnackbar } from '../../context/SnackbarContext';

/** FR-19/FR-20: confirmation, DELETE /api/profiles, clear token + cache, back to Welcome. */
export function DeleteDataSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t, reset } = useSettings();
  const { deleteAll } = useProfile();
  const router = useRouter();
  const snack = useSnackbar();
  const [busy, setBusy] = useState(false);
  return (
    <ConfirmSheet
      visible={visible}
      title={t('del.title')}
      body={t('del.body')}
      confirmLabel={busy ? t('common.saving') : t('del.confirm')}
      cancelLabel={t('del.keep')}
      danger
      onCancel={onClose}
      onConfirm={async () => {
        if (busy) return;
        setBusy(true);
        try {
          await deleteAll();
          reset();
          onClose();
          router.replace('/welcome');
        } catch {
          snack.show({ kind: 'error', text: t('err.network') });
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}
