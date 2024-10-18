import React from 'react';
import { Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartTask = () => {
    navigate('/start-task');  // Navigate to the start-task page
  };

  return (
    <div>
      <Container maxWidth="sm" style={{ marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Добре дошли в Pharmacy Stock Automation!
        </Typography>
        <Typography variant="body1" gutterBottom style={{ paddingBottom: '10px' }}>
          Натиснете по-долу, за да управлявате вашите задачи.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleStartTask}>
          Стартирай нова поръчка
        </Button>
      </Container>
    </div>
  );
};

export default HomePage;
