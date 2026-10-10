import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';

function subscribe(notify) {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}

const getSnapshot = () => window.matchMedia(query).matches;
const getServerSnapshot = () => true;

// Keep the UI in sync if the preference changes while the page is open.
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
