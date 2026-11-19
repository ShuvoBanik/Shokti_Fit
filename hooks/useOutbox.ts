// Owner: Rafsan Zaman Abir | F8
import { useEffect, useState } from 'react';
import { outbox, OutboxItem } from '../services/outbox';

export function useOutbox() {
  const [items, setItems] = useState<OutboxItem[]>(outbox.snapshot());
  useEffect(() => {
    void outbox.load();
    setItems(outbox.snapshot());
    return outbox.subscribe(() => setItems([...outbox.snapshot()]));
  }, []);
  return {
    items,
    pending: items.filter((i) => i.state !== 'failed'),
    failed: items.filter((i) => i.state === 'failed'),
    retry: outbox.retry,
    discard: outbox.discard,
    flush: () => outbox.flush(true),
  };
}
