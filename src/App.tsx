// src/App.tsx
import React, { useEffect } from 'react';
import { Container, } from '@mui/material';
import './App.css';
import MyAppBar from './components/AppBar/AppBar';
import PsaForm from './components/PsaForm/PsaForm';


const App: React.FC = () => {

  useEffect(() => {
    console.debug("Initiating app...")
  }, []);

  return (
    <Container maxWidth={false} style={{padding: 0}}>
      <MyAppBar />
      <PsaForm />
    </Container>
  );
}

export default App;
