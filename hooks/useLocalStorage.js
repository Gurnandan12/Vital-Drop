'use client';
import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage
 * ─────────────────────────────────────────────────────────────
 * Custom Hook demonstrating:
 * - useState, useEffect, useCallback
 * - Browser Storage (localStorage)
 * - Cross-component & cross-tab synchronization
 * - Resilient JSON serialization / deserialization
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - Fallback initial value if key does not exist
 */
export function useLocalStorage(key, initialValue) {
  // Initialize state with a lazy initializer to avoid unnecessary localStorage reads
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('Error reading localStorage key ' + key + ':', error);
      return initialValue;
    }
  });

  // Setter function that writes to localStorage and notifies listeners
  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((currentVal) => {
          const valueToStore = typeof value === 'function' ? value(currentVal) : value;

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));

            // Custom event so same-tab components listening to the same key update immediately
            window.dispatchEvent(
              new CustomEvent('vitaldrop_storage_sync', {
                detail: { key, value: valueToStore },
              })
            );
          }

          return valueToStore;
        });
      } catch (error) {
        console.warn('Error setting localStorage key ' + key + ':', error);
      }
    },
    [key]
  );

  // Synchronize across tabs and across same-tab components
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Cross-tab storage event
    const handleStorageEvent = (event) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (e) {
          console.warn('Error parsing storage event for key ' + key + ':', e);
        }
      }
    };

    // Same-tab custom event
    const handleCustomSync = (event) => {
      if (event.detail?.key === key) {
        setStoredValue(event.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('vitaldrop_storage_sync', handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('vitaldrop_storage_sync', handleCustomSync);
    };
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
