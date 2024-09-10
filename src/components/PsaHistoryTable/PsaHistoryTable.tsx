import React, { useEffect, useState } from 'react';
import { Container, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

const API_BASE_URL = config.apiBaseUrl;

interface Task {
  task_id: string;
  file_name: string;
  pharmacy_name: string;
  distributors: string[];
  created_at: string;
}

export default function PsaHistoryTable() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/tasks`)
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch tasks:', err);
        setError('Error fetching tasks');
        setLoading(false);
      });
  }, []);

  const handleTaskClick = (taskId: string) => {
    navigate(`/task/${taskId}`);
  };

  return (
    <Container maxWidth="md">
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && tasks.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task ID</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Pharmacy</TableCell>
              <TableCell>Distributors</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.task_id}>
                <TableCell>{task.task_id}</TableCell>
                <TableCell>{task.file_name}</TableCell>
                <TableCell>{task.pharmacy_name}</TableCell>
                <TableCell>{task.distributors.join(', ')}</TableCell>
                <TableCell>{new Date(task.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleTaskClick(task.task_id)}>
                    View Task
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && tasks.length === 0 && <p>No tasks found.</p>}
    </Container>
  );
}
