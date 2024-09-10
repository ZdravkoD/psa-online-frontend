// src/App.tsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Alert, Container, Grid, } from '@mui/material';
import './App.css';
import MyAppBar from './components/AppBar/AppBar';
import PsaForm from './components/PsaForm/PsaForm';
import TaskProgress from './components/TaskProgress/TaskProgress';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TasksHistory from './components/TasksHistory/TasksHistory';
import { setTaskData } from './store/wsTaskData';


const App: React.FC = () => {
  const dispatch = useDispatch();
  const [wsError, setWsError] = React.useState<string>("");

  useEffect(() => {
    console.debug("Initiating app...")
  }, []);

  const outputs = useAzurePubSubSocket();

  useEffect(() => {
    console.debug("Azure Pub/Sub socket connected...");
    if (outputs.taskData) {
      dispatch(setTaskData(outputs.taskData)); // Dispatch to Redux
    }    
    setWsError(outputs.wsError as string);
    return () => {
      console.debug("Azure Pub/Sub socket disconnected...");
    };
  }, [outputs, dispatch]);

  return (
      <Router>
        <Container maxWidth={false} style={{ padding: 0 }}>
        <MyAppBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start-task" element={<PsaForm />} />
          <Route path="/task-progress/:taskId" element={<TaskProgress />} />
          <Route path="/tasks-history" element={<TasksHistory />} />
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
