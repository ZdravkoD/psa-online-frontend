import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Container, Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UnboughtProductsTable from './UnboughtProductsTable';
import BoughtProductsTable from './BoughtProductsTable';

interface TaskProgressProps {
    progress: number;
    description: string;
    status: string;  // Adding status to the props
    detailed_error_message?: string;
}

const TaskProgress: React.FC<TaskProgressProps> = ({ progress, description, status, detailed_error_message }) => {
    const safeProgress = Math.min(100, Math.max(0, progress));
    const [expanded, setExpanded] = useState(false);

    console.debug(
        `TaskProgress: progress=${progress}, description=${description}, status=${status}, detailed_error_message=${detailed_error_message}`
    )

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
        console.debug("TaskProgress mounted...");
        return () => {
            console.debug("TaskProgress unmounted...");
        };
    }, []);

    console.info("Typeof description: ", typeof description);
    try {
        description = JSON.parse(description);
    } catch (error) {
        console.debug("Error parsing description to JSON: ", error);
    }
    console.info("Description: ", description);
    console.info("Description bought products: ", description["bought_products"]);
    console.info("Description unbought products: ", description["unbought_products"]);
    console.info("Typeof status: ", typeof status);
    console.info("Status: ", status);
    // console.info("Description bought products: ", JSON.parse(description).bought_products);
    
    return (
        <Container>
            <Container maxWidth="sm">
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {status === "in progress" ? "Прогрес на задачата" : "Резултат от задачата"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {status === "in progress" ? description["original_product_name"] : ""}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {status !== "in progress" && status !== "final report" && description && description !== "" ? description : ""}
                    </Typography>
                    <Box display="flex" alignItems="center">
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={progress} />
                        </Box>
                        <Box minWidth={35}>
                            <Typography variant="body2" color="text.secondary">{`${safeProgress}%`}</Typography>
                        </Box>
                    </Box>
                    {detailed_error_message && (
                        <Accordion expanded={expanded} onChange={handleExpandClick}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography color="error">Детайли за грешката</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="error" style={{ whiteSpace: 'pre-wrap' }}>
                                    {detailed_error_message}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    )}
                    {!detailed_error_message && !description && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            <CircularProgress />
                        </div>
                    )}                    
                </Box>
            </Container>
            <Container maxWidth="md">
                {status === "final report" && description && typeof description === 'object' && (
                    <>
                        {description && <BoughtProductsTable products={description["bought_products"]} />}
                        {description && <UnboughtProductsTable products={description["unbought_products"]} />}
                    </>
                )}
            </Container>    
        </Container>
    );
};

export default TaskProgress;
