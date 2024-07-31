// src/App.tsx
import React, { useEffect } from 'react';
import { Alert, Container, Grid, } from '@mui/material';
import './App.css';
import MyAppBar from './components/AppBar/AppBar';
import PsaForm from './components/PsaForm/PsaForm';
import TaskProgress from './components/TaskProgress/TaskProgress';
import useAzurePubSubSocket from './hooks/useAzurePubSubSocket';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';


const App: React.FC = () => {

  const [taskData, setTaskData] = React.useState({
    progress: 0,
    message: '',
    status: '',
    detailed_error_message: ''
  });
  const [wsError, setWsError] = React.useState(null);

  useEffect(() => {
    console.debug("Initiating app...")
  }, []);

  const outputs = useAzurePubSubSocket();

  useEffect(() => {
    console.debug("Azure Pub/Sub socket connected...");
    setTaskData(outputs[0]);
    setWsError(outputs[1]);
    return () => {
      console.debug("Azure Pub/Sub socket disconnected...");
    };
  }, [outputs]);
  // const taskData = outputs[0];
  // const wsError = outputs[1];

  return (
    <Router>
      <Container maxWidth={false} style={{ padding: 0 }}>
        <MyAppBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start-task" element={<PsaForm />} />
          <Route path="/task-progress" element={
            <TaskProgress
              progress={taskData.progress}
              description={taskData.message}
              status={taskData.status}
              detailed_error_message={taskData.detailed_error_message}
            />
          } />
        </Routes>
        <Grid item sx={{ width: '100%', mb: 2 }} style={{ padding: 14 }}>
          {wsError && (
            <Alert severity="error">{wsError}</Alert>
          )}
        </Grid>
      </Container>
    </Router>
  );
}

export default App;
