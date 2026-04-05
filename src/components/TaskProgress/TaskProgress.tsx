import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Container, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Button, Tooltip, Alert, Chip, Paper, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UnboughtProductsTable from './UnboughtProductsTable';
import BoughtProductsTable from './BoughtProductsTable';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useParams } from 'react-router-dom';
import { apiGet, apiGetBlob, apiPost, buildApiUrl } from '../../api/client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import * as XLSX from 'xlsx';
import excelLogo from '../../assets/icons/excel-logo.png';
import downloadIcon from '../../assets/icons/download-file-icon.png';
import debugIcon from '../../assets/icons/debug-icon.png';
import { setTaskData } from '../../store/tasks';
import { Task } from '../../types/task';
import { AllPharmacyProductInfos, BoughtProduct } from '../../types/product';
import useFetchInitData from '../../hooks/useFetchInitData';
import {
    buildBoughtProductsExportRows,
    buildUnboughtProductsExportRows,
    getBoughtProductsExportHeaders,
    getDistributorNames,
} from '../../utils/report';
import { groupTaskImages } from '../../utils/taskImages';

const TaskProgress: React.FC = () => {
    const dispatch = useDispatch();
    const { taskId } = useParams<{ taskId: string }>();
    const [inputFilename, setInputFilename] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [imagesExpanded, setImagesExpanded] = useState(false);
    const [retryLoading, setRetryLoading] = useState(false);
    const [retryError, setRetryError] = useState<string | null>(null);
    const [savedAmount, setSavedAmount] = useState(0);
    const taskData: Task | null = useSelector((state: RootState) => taskId ? state.output.data[taskId] : null);
    const reportDistributors = getDistributorNames(
        taskData?.distributors,
        taskData?.report?.bought_products ?? []
    );
    const imageSummary = groupTaskImages(taskData?.image_urls ?? []);

    // Fetch pharmacy data using the useFetchInitData hook
    const { pharmacies } = useFetchInitData();

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const data = await apiGet<Task>(`/task/${taskId}`);
                setInputFilename(data.file_name);
                dispatch(setTaskData(data));
            } catch (error) {
                console.error('Error fetching task details:', error);
            }
        };

        fetchTaskDetails();
    }, [taskId, dispatch]);

    useEffect(() => {
        if (!taskData?.report || !taskData.report.bought_products) {
            return;
        }
        const calculateSavedAmount = (products: BoughtProduct[]) => {
            return products.reduce((total: number, product: BoughtProduct) => {
                const prices = product.all_pharmacy_product_infos.map((info: AllPharmacyProductInfos) => info.price).filter((price: number) => price !== undefined);
                if (prices.length > 1) {
                    const maxPrice = Math.max(...prices);
                    const minPrice = Math.min(...prices);
                    return total + (maxPrice - minPrice);
                }
                return total;
            }, 0);
        };

        const savedAmount = calculateSavedAmount(taskData.report.bought_products);
        setSavedAmount(savedAmount);
    }, [taskData?.report]);

    const safeProgress = Math.min(100, Math.max(0, taskData?.status.progress ? taskData.status.progress : 0));

    const handleErrorMessageExpandClick = () => {
        setExpanded(!expanded);
    };

    const exportToExcel = () => {
        if (!taskData?.report) return;

        const boughtProducts = taskData.report.bought_products || [];
        const unboughtProducts = taskData.report.unbought_products || [];

        const boughtProductsData = buildBoughtProductsExportRows(
            boughtProducts,
            reportDistributors
        );
        const unboughtProductsData = buildUnboughtProductsExportRows(unboughtProducts);
        const exportHeaders = getBoughtProductsExportHeaders(reportDistributors);
        const worksheet = XLSX.utils.json_to_sheet(boughtProductsData, { header: exportHeaders });
        // Set column widths to 210 pixels
        const columnWidths = exportHeaders.map(() => ({ wpx: 210 }));
        worksheet['!cols'] = columnWidths;

        // Insert an empty row between the two tables
        const emptyRow = [{}];
        XLSX.utils.sheet_add_json(worksheet, emptyRow, { origin: -1, skipHeader: true });

        XLSX.utils.sheet_add_json(worksheet, unboughtProductsData, { origin: -1, header: ["Списък с некупени продукти"] });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        const currentDateTime = new Date().toLocaleString().replace(/[/:]/g, '-');
        const fileName = `report_${currentDateTime}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const retryTask = async () => {
        if (!taskData?.file_name || !taskData.pharmacy_id) {
            setRetryError('Липсват данни за повторно стартиране на задачата.');
            return;
        }

        setRetryLoading(true);
        setRetryError(null);

        try {
            const inputFileBlob = await apiGetBlob(
                `/input-file/${encodeURIComponent(taskData.file_name)}`
            );
            const file = new File([inputFileBlob], taskData.file_name, {
                type: inputFileBlob.type || 'application/octet-stream',
            });
            const formData = new FormData();

            formData.append('file', file);
            formData.append('pharmacy_id', taskData.pharmacy_id);
            formData.append('distributors', JSON.stringify(taskData.distributors));

            const newTask = await apiPost<{ id: string }>('/task', formData);
            window.location.href = `/task-progress/${newTask.id}`;
        } catch (error) {
            setRetryError(
                error instanceof Error
                    ? error.message
                    : 'Неуспешен опит за повторно стартиране на задачата.'
            );
        } finally {
            setRetryLoading(false);
        }
    };

    return (
        <Container>
            <Container maxWidth="sm">
                <Box sx={{ width: '100%', mb: 2 }}>
                    {inputFilename && (
                        <Box display="flex" justifyContent="center" mb={2} flexDirection="row" alignItems="center">
                            <Typography variant="h5" gutterBottom>
                                Начален файл: <strong>{inputFilename}</strong>
                            </Typography>
                            <Box ml={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => window.location.href = buildApiUrl(`/input-file/${encodeURIComponent(inputFilename)}`)}
                                    startIcon={<img src={downloadIcon} alt="Download file" style={{ width: 24, height: 'auto' }} />}
                                >
                                    Свали
                                </Button>
                            </Box>
                        </Box>
                    )}
                    {taskData?.pharmacy_id && (
                        <Typography variant="h6" gutterBottom>
                            Аптека: <strong>{pharmacies.find(pharmacy => pharmacy.pharmacy_id === taskData.pharmacy_id)?.display_name || "Неизвестна аптека"}</strong>
                        </Typography>
                    )}
                    <Typography variant="h6" gutterBottom>
                        {taskData?.status.status === "in progress" ? "Прогрес на задачата" : "Резултат от задачата"}
                    </Typography>
                    {taskData?.status.status === 'error' ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {taskData.status.message}
                        </Alert>
                    ) : (
                        <Typography variant="body1" gutterBottom>
                            {taskData?.status.message}
                        </Typography>
                    )}
                    <Box display="flex" alignItems="center">
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={taskData?.status.progress ? taskData.status.progress : 0} />
                        </Box>
                        <Box minWidth={35}>
                            <Typography variant="body2" color="text.secondary">{`${safeProgress}%`}</Typography>
                        </Box>
                    </Box>
                    {taskData?.status.detailed_error_message && (
                        <Accordion expanded={expanded} onChange={handleErrorMessageExpandClick}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography color="error">Детайли за грешката</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="error" style={{ whiteSpace: 'pre-wrap' }}>
                                    {taskData?.status.detailed_error_message}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    )}
                    {taskData?.status.status === 'error' && (
                        <Box mt={2}>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={retryTask}
                                startIcon={<RefreshIcon />}
                                disabled={retryLoading}
                            >
                                {retryLoading ? 'Повторно стартиране...' : 'Опитай отново'}
                            </Button>
                        </Box>
                    )}
                    {retryError && (
                        <Box mt={2}>
                            <Alert severity="error">{retryError}</Alert>
                        </Box>
                    )}
                    {taskData?.status.status !== "success" && !taskData?.status.detailed_error_message && !taskData?.report && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            <CircularProgress />
                        </div>
                    )}
                </Box>
            </Container>

            <Container maxWidth="lg">
                {taskData?.status.status === "success" && taskData?.report ? (
                    <>
                        <Box display="flex" justifyContent="center" mb={2}>
                            <Button variant="contained" color="primary" onClick={exportToExcel} startIcon={<img src={excelLogo} alt="Excel Logo" style={{ width: 24, height: 'auto' }} />}>
                                Експорт към Excel
                            </Button>
                        </Box>
                        <BoughtProductsTable
                            products={taskData.report.bought_products}
                            distributors={reportDistributors}
                        />
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <Tooltip title="Това е общата сума на спестените пари от закупуване на продукти на най-ниската налична цена от различни дистрибутори.">
                                <Typography variant="body1" color="text.primary">
                                    Обща сума на спестените пари: <strong>{savedAmount.toFixed(2)} €</strong>
                                </Typography>
                            </Tooltip>
                        </Box>
                        <UnboughtProductsTable products={taskData.report.unbought_products} />
                    </>
                ) : (
                    taskData?.status.status === "success" && (
                        <Typography variant="body1" color="text.secondary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'top', height: '100vh' }}>
                            Задачата е завършена, но липсва отчет.
                        </Typography>
                    )
                )}
                {taskData?.image_urls && taskData.image_urls.length > 0 && (
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<img src={debugIcon} alt="Debug Icon" style={{ width: 24, height: 'auto' }} />}
                            onClick={() => setImagesExpanded(!imagesExpanded)}
                        >
                            Показване на изображения
                        </Button>
                    </Box>
                )}
                {imagesExpanded && taskData?.image_urls && taskData.image_urls.length > 0 && (
                    <Box mt={2}>
                        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Хронология на изображенията
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Първо изображение: {imageSummary.firstImage?.provider || 'Няма'} {imageSummary.firstImage ? `(${imageSummary.firstImage.capturedAtLabel})` : ''}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Последно изображение: {imageSummary.lastImage?.provider || 'Няма'} {imageSummary.lastImage ? `(${imageSummary.lastImage.capturedAtLabel})` : ''}
                            </Typography>
                        </Paper>
                        {imageSummary.groups.map((group) => (
                            <Paper key={group.provider} elevation={3} sx={{ p: 2, mb: 3 }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2} flexWrap="wrap">
                                    <Typography variant="h6">
                                        {group.provider}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        color="primary"
                                        label={`${group.images.length} screenshots`}
                                    />
                                </Stack>
                                {group.images.map((image) => (
                                    <Box
                                        key={`${image.sequence}-${image.url}`}
                                        mb={3}
                                        sx={{
                                            border: '1px solid #cfd8dc',
                                            borderRadius: 2,
                                            p: 2,
                                            backgroundColor: '#fafafa',
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap">
                                            <Chip
                                                size="small"
                                                label={`#${image.sequence} в общата поредица`}
                                            />
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label={image.kind}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {image.capturedAtLabel}
                                            </Typography>
                                            {group.images[0]?.url === image.url && (
                                                <Chip size="small" color="success" label={`Първо в ${group.provider}`} />
                                            )}
                                            {group.images[group.images.length - 1]?.url === image.url && (
                                                <Chip size="small" color="warning" label={`Последно в ${group.provider}`} />
                                            )}
                                        </Stack>
                                        <img
                                            src={image.url}
                                            alt={`${group.provider} screenshot ${image.sequence}`}
                                            style={{
                                                width: '100%',
                                                marginBottom: '10px',
                                                border: '1px solid #b0bec5',
                                                borderRadius: '6px',
                                                display: 'block',
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Paper>
                        ))}
                    </Box>
                )}

            </Container>
        </Container>
    );
};

export default TaskProgress;
