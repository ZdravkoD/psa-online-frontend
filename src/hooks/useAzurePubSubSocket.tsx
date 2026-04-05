import { useState, useEffect } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { apiGetText } from '../api/client';
import config from '../config/config';
import { Task } from '../types/task';


// The hook
function useAzurePubSubSocket() {
  const [task, setTask] = useState<Task | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  useEffect(() => {
    async function generateAccessToken(hubName: string, userId: string) {
      try {
        const accessToken = await apiGetText('/pubsub-token', {
          hub_name: hubName,
          user_id: userId,
        });
        setWsError(null);
        return accessToken;
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
    }

    const ws = new ReconnectingWebSocket(urlProvider);
    
    ws.onmessage = (event) => {
      try {
        setWsError(null);
        const data = JSON.parse(event.data) as Task;
        console.debug("Received data: ", data);
        setTask(data);
      } catch (error) {
        setWsError(
          'Failed to parse websocket message: ' +
            (error instanceof Error ? error.message : String(error))
        );
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    return () => ws.close();
  }, []);

  return { task, wsError };
}

export default useAzurePubSubSocket;
