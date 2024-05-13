import { useState, useEffect } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import config from '../config/config';

// Define your task data structure
interface TaskData {
  status: string;
  message: string;
  progress: number;
  detailed_error_message?: string;
}

// The hook
function useAzurePubSubSocket() {
  const [taskData, setTaskData] = useState<TaskData>({ status: '', message: '', progress: 0 });
  const [wsError, setWsError] = useState(null);

  useEffect(() => {
    async function generateAccessToken(hubName, userId) {
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
        const errorMessage = `Failed to fetch access token: ${error.message}`
        setWsError(errorMessage);
        throw error;
      }
    }

    async function urlProvider() {
      const hub_name = 'task_status_updates';
      try {
        const accessToken = await generateAccessToken(hub_name, 'only_user');
        return `wss://psa-pubsub.webpubsub.azure.com/client/hubs/${hub_name}?access_token=${accessToken}`;  
      } catch (error) {
        console.error('Failed to generate access token:', error);
        setWsError('Failed to generate access token: ' + error.message);
        return `wss://psa-pubsub.webpubsub.azure.com/client/hubs/${hub_name}`;
      }
    };

    const ws = new ReconnectingWebSocket(urlProvider);
    
    ws.onmessage = (event) => {
      setWsError(null);
      const data = JSON.parse(event.data);
      console.debug("Received data: ", data);
      setTaskData({
        status: data.status,
        message: data.message,
        progress: data.progress,
        detailed_error_message: data.detailed_error_message,
      });
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    return () => ws.close();
  }, []);

  return [taskData, wsError];
}

export default useAzurePubSubSocket;
