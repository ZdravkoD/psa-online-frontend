import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Container, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Button, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UnboughtProductsTable from './UnboughtProductsTable';
import BoughtProductsTable from './BoughtProductsTable';
import { useParams } from 'react-router-dom';
import config from '../../config/config';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import * as XLSX from 'xlsx';
import excelLogo from '../../assets/icons/excel-logo.png';
import downloadIcon from '../../assets/icons/download-file-icon.png';
import debugIcon from '../../assets/icons/debug-icon.png';
import { setTaskData } from '../../store/wsTaskData';


const API_BASE_URL = config.apiBaseUrl;

const TaskProgress: React.FC = () => {
    const dispatch = useDispatch();
    const { taskId } = useParams<{ taskId: string }>();
    const [progress, setProgress] = useState(0);
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [report, setReport] = useState<Record<string,any> | null>(null);
    const [detailedErrorMessage, setDetailedErrorMessage] = useState('');
    const [inputFilename, setInputFilename] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [imagesExpanded, setImagesExpanded] = useState(false);
    const [savedAmount, setSavedAmount] = useState(0);
    const taskData = useSelector((state: RootState) => state.output.data);

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/task/${taskId}`);
                const data = await response.json();
                setProgress(data.status.progress);
                setDescription(data.status.message);
                setStatus(data.status.status);
                setReport(data.report);
                setDetailedErrorMessage(data.status.detailed_error_message || '');
                setInputFilename(data.file_name);
                console.log("Setting taskData: ", data);
                dispatch(setTaskData(data));
            } catch (error) {
                console.error('Error fetching task details:', error);
            }
        };

        fetchTaskDetails();
    }, [taskId, dispatch]);

    useEffect(() => {
        console.log('TaskData:', taskData);
        if (!taskData) {
            return;
        }
        setProgress(taskData.status.progress);
        setDescription(taskData.status.message);
        setStatus(taskData.status.status);
        setReport(taskData.report);
        setDetailedErrorMessage(taskData.status.detailed_error_message || '');
    }, [taskData]);

    useEffect(() => {
        if (!report || !report["bought_products"]) {
            return;
        }
        const calculateSavedAmount = (products: any[]) => {
            return products.reduce((total: number, product: any) => {
                const prices = product.all_pharmacy_product_infos.map((info: any) => info.price).filter((price: number) => price !== undefined);
                if (prices.length > 1) {
                    const maxPrice = Math.max(...prices);
                    const minPrice = Math.min(...prices);
                    return total + (maxPrice - minPrice);
                }
                return total;
            }, 0);
        };

        const savedAmount = calculateSavedAmount(report["bought_products"]);
        setSavedAmount(savedAmount);
    }, [report]);

    const safeProgress = Math.min(100, Math.max(0, progress ? progress : 0));

    console.debug(
        `TaskProgress: progress=${progress}, description=${description}, status=${status}, detailed_error_message=${detailedErrorMessage}`
    );

    const handleErrorMessageExpandClick = () => {
        setExpanded(!expanded);
    };

    let descriptionObject: Record<string, any> | null = null;
    try {
        descriptionObject = JSON.parse(description) as Record<string, any>;
    } catch (error) {
        console.debug("Error parsing description to JSON: ", error);
    }

    const exportToExcel = () => {
        if (!report) return;

        const boughtProducts = report["bought_products"] || [];
        const unboughtProducts = report["unbought_products"] || [];

        const boughtProductsData = boughtProducts.map((product: any) => ({
            "Продукт": product.original_product_name,
            "Sting - име на продукт": product.all_pharmacy_product_infos.filter((info: any) => info.distributor === "Sting")[0]?.name,
            "Sting - цена на продукт": product.all_pharmacy_product_infos.filter((info: any) => info.distributor === "Sting")[0]?.price,
            "Phoenix - име на продукт": product.all_pharmacy_product_infos.filter((info: any) => info.distributor === "Phoenix")[0]?.name,
            "Phoenix - цена на продукт": product.all_pharmacy_product_infos.filter((info: any) => info.distributor === "Phoenix")[0]?.price,
            "Добавен в количката на": product.bought_from_distributor,
        }));

        const unboughtProductsData = unboughtProducts.map((product: any) => ({
            "Списък с некупени продукти": product.product_name,
        }));

        const worksheet = XLSX.utils.json_to_sheet(boughtProductsData, { header: ["Продукт", "Sting - име на продукт", "Sting - цена на продукт", "Phoenix - име на продукт", "Phoenix - цена на продукт", "Добавен в количката на"] });
        // Set column widths to 210 pixels
        const columnWidths = [
            { wpx: 210 }, // Продукт
            { wpx: 210 }, // Sting - име на продукт
            { wpx: 210 }, // Sting - цена на продукт 
            { wpx: 210 }, // Phoenix - име на продукт
            { wpx: 210 }, // Phoenix - цена на продукт
            { wpx: 210 }, // Добавен в количката на
        ];
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

    return (
        <Container>
            <Container maxWidth="sm">
                <Box sx={{ width: '100%', mb: 2 }}>
                    {inputFilename && (
                        <Box display="flex" justifyContent="center" mb={2}>
                            <Typography variant="h5" gutterBottom>
                                Начален файл: <strong>{inputFilename}</strong>
                            </Typography>
                            <Box ml={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => window.location.href = `${API_BASE_URL}/input-file/${inputFilename}`}
                                    startIcon={<img src={downloadIcon} alt="Download file" style={{ width: 24, height: 'auto' }} />}
                                >
                                    Свали
                                </Button>
                            </Box>
                        </Box>
                    )}
                    <Typography variant="h6" gutterBottom>
                        {status === "in progress" ? "Прогрес на задачата" : "Резултат от задачата"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {descriptionObject ? descriptionObject["original_product_name"] : description}
                    </Typography>
                    <Box display="flex" alignItems="center">
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={progress ? progress : 0} />
                        </Box>
                        <Box minWidth={35}>
                            <Typography variant="body2" color="text.secondary">{`${safeProgress}%`}</Typography>
                        </Box>
                    </Box>
                    {detailedErrorMessage && (
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
                                    {detailedErrorMessage}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    )}
                    {status !== "success" && !detailedErrorMessage && !report && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            <CircularProgress />
                        </div>
                    )}
                </Box>
            </Container>

            <Container maxWidth="lg">
                {status === "success" && report ? (
                    <>
                        <Box display="flex" justifyContent="center" mb={2}>
                            <Button variant="contained" color="primary" onClick={exportToExcel} startIcon={<img src={excelLogo} alt="Excel Logo" style={{ width: 24, height: 'auto' }} />}>
                                Експорт към Excel
                            </Button>
                        </Box>
                        <BoughtProductsTable products={report["bought_products"]} />
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <Tooltip title="Това е общата сума на спестените пари от закупуване на продукти на най-ниската налична цена от различни дистрибутори.">
                                <Typography variant="body1" color="text.primary">
                                    Обща сума на спестените пари: <strong>{savedAmount.toFixed(2)} лв.</strong>
                                </Typography>
                            </Tooltip>
                        </Box>
                        <UnboughtProductsTable products={report["unbought_products"]} />
                    </>
                ) : (
                    status === "success" && (
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
                        {taskData.image_urls.map((image_url, index) => (
                            <img
                                key={index}
                                src={image_url}
                                alt=""
                                style={{ width: '100%', marginBottom: '10px' }}
                            />
                        ))}
                    </Box>
                )}

            </Container>
        </Container>
    );
};

export default TaskProgress;