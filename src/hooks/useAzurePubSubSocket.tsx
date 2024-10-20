import { useState, useEffect } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import config from '../config/config';

// Export the TaskData interface
export interface TaskData {
  status: Record<string, any>;
  report: Record<string, any>;
  file_name: string;
  image_urls?: string[];
}

// The hook
function useAzurePubSubSocket() {
  const [taskData, setTaskData] = useState<TaskData>({ status: {}, report: {}, file_name: '', image_urls: [] });
  const [wsError, setWsError] = useState<string | null>(null);

  useEffect(() => {
    async function generateAccessToken(hubName: string, userId: string) {
      const url = `${config.apiBaseUrl}/pubsub-token?hub_name=${encodeURIComponent(hubName)}&user_id=${encodeURIComponent(userId)}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorMessage = `Failed to fetch access token: (${response.status}) - ${response.statusText}`
          setWsError(errorMessage);
          throw new Error(errorMessage);
        }

        setWsError(null);
        return await response.text();
      } catch(error) {
        const errorMessage = 'Failed to fetch access token: ' + (error instanceof Error ? error.message : String(error))
        setWsError(errorMessage);
        throw error;
      }
    }

    async function urlProvider() {
      const hub_name = 'task_status_updates';
      try {
        const accessToken = await generateAccessToken(hub_name, 'only_user');
        return `${config.pubsubUrl}/client/hubs/${hub_name}?access_token=${accessToken}`;  
      } catch (error) {
        console.error('Failed to generate access token:', error);
        const errorMessage = 'Failed to generate access token: ' + (error instanceof Error ? error.message : String(error));
        setWsError(errorMessage);
        return `${config.pubsubUrl}/client/hubs/${hub_name}`;
      }
    };

    const ws = new ReconnectingWebSocket(urlProvider);
    
    ws.onmessage = (event) => {
      setWsError(null);
      const data = JSON.parse(event.data);
      console.debug("Received data: ", data);
      setTaskData({
        status: data.status,
        report: data.report,
        file_name: data.file_name,
        image_urls: data.image_urls,
      });
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    return () => ws.close();
  }, []);

  return { taskData, wsError };
}

export default useAzurePubSubSocket;
