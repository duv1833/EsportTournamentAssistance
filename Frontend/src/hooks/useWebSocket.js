import { useEffect, useState } from 'react';

export function useWebSocket(url) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // STOMP WebSocket client connection logic placeholder
    setConnected(true);
    return () => setConnected(false);
  }, [url]);

  return { connected };
}
