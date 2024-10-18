import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import useFetchInitData from '../../hooks/useFetchInitData';
import redXIcon from '../../assets/icons/red-x-icon.png';
import greenCheckIcon from '../../assets/icons/green-check-icon.png';
import loadingIconGif from '../../assets/icons/loading-icon.gif';

const API_BASE_URL = config.apiBaseUrl;

interface Task {
    id: string;
    file_name: string;
    file_data: string;
    pharmacy_id: string;
    distributors: string[];
    task_type: string;
    status: Record<string, any>;
    report: Record<string, any>;
    date_created: string;
}

const statusTranslations: Record<string, string> = {
    'in progress': 'В процес',
    'success': 'Завършено',
    'error': 'Грешка',
};

const statusIcons: Record<string, any> = {
    'in progress': loadingIconGif,
    'success': greenCheckIcon,
    'error': redXIcon,
};

const TasksHistory: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [skip, setSkip] = useState(0);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    const { pharmacies, distributors, fetchInitDataLoading, fetchInitDataError } = useFetchInitData();

    useEffect(() => {
        if (fetchInitDataLoading) {
          console.debug("Fetching initial data...");
        } else {
          console.debug("Initial data fetched.");
        }
        if (fetchInitDataError) {
          console.error("Failed to fetch initial data:", fetchInitDataError);
        }
      }, [fetchInitDataLoading, fetchInitDataError]);    

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/tasks?skip=${skip}&limit=${limit}&sort=\{"date_created":-1\}`);
                const filteredTasks = response.data.filter((task: Task) => task.status);
                setTasks(prevTasks => [...prevTasks, ...filteredTasks]);
                setHasMore(response.data.length === limit);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [skip, limit]);

    const loadMoreTasks = () => {
        if (hasMore && !loading) {
            setSkip(prevSkip => prevSkip + limit);
        }
    };

    const handleTaskClick = (taskId: string) => {
        navigate(`/task-progress/${taskId}`);
    };

    return (
        <div style={{ paddingLeft: '100px', paddingRight: '100px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <h1>История</h1>
            </div>
            <TableContainer component={Paper} style={{ maxHeight: '70vh', overflow: 'auto' }} onScroll={(e) => {
                const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
                if (bottom) {
                    loadMoreTasks();
                }
            }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow style={{ backgroundColor: '#e0e0e0'}}>
                            <TableCell style={{ width: '5%', backgroundColor: 'inherit' }}>#</TableCell>
                            <TableCell style={{ backgroundColor: 'inherit' }}>Файл</TableCell>
                            <TableCell style={{ backgroundColor: 'inherit' }}>Аптека</TableCell>
                            <TableCell style={{ backgroundColor: 'inherit' }}>Дата</TableCell>
                            <TableCell style={{ backgroundColor: 'inherit' }}>Статус</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task, index) => {
                            return (
                                <TableRow 
                                    key={task.id} 
                                    onClick={() => handleTaskClick(task.id)} 
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
                                >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{task.file_name}</TableCell>
                                    <TableCell>
                                        {pharmacies.find(pharmacy => pharmacy.pharmacy_id === task.pharmacy_id)?.display_name || `Unknown Pharmacy - ${task.pharmacy_id}`}
                                    </TableCell>
                                    <TableCell>{new Date(task.date_created).toLocaleString()}</TableCell>
                                    <TableCell style={{ display: 'flex', alignItems: 'center' }}>
                                        <img src={statusIcons[task.status.status]} style={{ width: '30px', height: 'auto', marginRight: '8px' }} />
                                        {statusTranslations[task.status.status] || task.status.status}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            {loading && <p>Зареждане...</p>}
        </div>
    );
};

export default TasksHistory;