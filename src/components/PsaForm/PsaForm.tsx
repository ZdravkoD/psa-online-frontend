import * as React from 'react';
import { Container, Grid, Typography, RadioGroup, Checkbox, FormControl, FormLabel, FormControlLabel, Radio, Button, Box, FormHelperText, Alert, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetchInitData from '../../hooks/useFetchInitData';
import config from '../../config/config';


const API_BASE_URL = config.apiBaseUrl;


export default function PsaForm() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
    const [formError, setFormError] = useState({ file: false, pharmacy: false, suppliers: false });
    const [httpError, setHttpError] = useState(null);
    
    const { pharmacies, distributors, fetchInitDataLoading, fetchInitDataError } = useFetchInitData();
    
    const navigate = useNavigate();

    useEffect(() => {
      console.debug("Initiating PsaForm...")
      console.debug("Pharmacies: ", pharmacies);
      console.debug("Distributors: ", distributors);
      
      const allDistributorIds = distributors.map(distributor => distributor.name);
      setSelectedDistributors(allDistributorIds);
    }, [pharmacies, distributors]);

    useEffect(() => {
      if (fetchInitDataLoading) {
        console.debug("Fetching initial data...");
      } else {
        console.debug("Initial data fetched.");
      }
      if (fetchInitDataError) {
        console.error("Failed to fetch initial data:", fetchInitDataError);
        setHttpError(fetchInitDataError);
      } else {
        setHttpError(null);
      }
    }, [fetchInitDataLoading, fetchInitDataError]);

    useEffect(() => {
      console.debug("Selected distributors: ", selectedDistributors);
    }, [selectedDistributors]);

    useEffect(() => {
      console.debug("Selected pharmacy: ", selectedPharmacy);
    }, [selectedPharmacy]);
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      console.debug("File selected...")
      const file = event.target.files ? event.target.files[0] : null;
      if (file) {
        setSelectedFile(file);
        setSelectedFileName(file.name);
        setFormError(prev => ({ ...prev, file: false }));
      }
    };

    const handleSelectDistributor = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const distributorName = event.target.name;
      if (checked) {
        setSelectedDistributors([...selectedDistributors, distributorName]);
      } else {
        setSelectedDistributors(selectedDistributors.filter(id => id !== distributorName));
      }
      setFormError(prev => ({ ...prev, suppliers: false }));
    };

    const validateForm = () => {
      const errors = {
        file: !selectedFile,
        pharmacy: !selectedPharmacy,
        suppliers: selectedDistributors.length === 0
      };
      setFormError(errors);
      return Object.values(errors).every(v => !v);
    };

    const startProcessing = () => {
      console.debug("Starting to process...")
      if (validateForm()) {
        console.debug('Form is valid, processing data...');

        // TODO: Make HTTP request to create a new task
        createTask();
  
        // navigate('/task-progress')
      } else {
        console.log('Form contains errors.');
      }
    };

    async function createTask() {
      // Create HTTP POST request with the selected file, pharmacy, and suppliers data
      // Send the request to the backend API (Azure Functions) to create a new task
      // The backend API will process the data and return the task ID
      // The task ID will be used to track the progress of the task
      console.log('Creating a new task...');

      const formData = new FormData();
      formData.append('file', selectedFile as Blob);
      formData.append('pharmacy_id', selectedPharmacy);
      formData.append('distributors', JSON.stringify(selectedDistributors));

      try {
        const response = await fetch(`${API_BASE_URL}/task`, {
          method: 'POST',
          body: formData,
        });  

        if (response.ok) {
          const data = await response.json();
          console.log('Task created:', data);
          setHttpError(null);
          // Navigate to the task progress page
          navigate('/task-progress');
        } else {
          const responseText = await response.text();
          console.error('Failed to create task:', response.statusText, responseText);
          setHttpError(`${response.status}: ${responseText}`);
        }  
      }
      catch (error) {
        console.error('Failed to create task:', error);
        setHttpError(error.message || 'Error occurred while creating task.');
        return;
      }
    };
    
    return (
      <Container maxWidth="sm">
      <Grid container spacing={2}>
        {!fetchInitDataLoading && (
          <Grid item xs={12}>
          <input
            type="file"
            accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            id="raised-button-file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
              Избери файл
            </Button>
          </label>
        </Grid>
        )}

        {selectedFileName && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" style={{ marginTop: '8px', marginBottom: '8px' }}>
              Избран файл: {selectedFileName}
            </Typography>
          </Grid>
        )}

        {formError.file && (
          <Grid item xs={12}>
            <FormHelperText error>Моля, изберете файл.</FormHelperText>
          </Grid>
        )}

        <Grid item xs={12}>
          {fetchInitDataLoading && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                  <CircularProgress />
              </div>
          )}                    

          <FormControl component="fieldset" error={formError.pharmacy}>
            <FormLabel component="legend">Избери аптека</FormLabel>
            <RadioGroup
              aria-label="pharmacy"
              name="pharmacy"
              value={selectedPharmacy}
              onChange={(e) => {
                setSelectedPharmacy(e.target.value);
                setFormError(prev => ({ ...prev, pharmacy: false }));
              }}>
              {pharmacies.map((pharmacy) => (
                <FormControlLabel key={pharmacy.pharmacy_id} value={pharmacy.pharmacy_id} control={<Radio />} label={pharmacy.display_name} />
              ))}
            </RadioGroup>
            {formError.pharmacy && <FormHelperText>Моля, изберете аптека.</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset" error={formError.suppliers}>
            <FormLabel component="legend">Изберете доставчици</FormLabel>
            {distributors.map((option) => (
              <FormControlLabel
                key={option.name}
                control={
                  <Checkbox
                    checked={selectedDistributors.includes(option.name)}
                    onChange={handleSelectDistributor}
                    name={option.name}
                  />
                }
                label={option.display_name}
              />
            ))}
            {formError.suppliers && <FormHelperText>Изберете поне един доставчик</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={startProcessing}>
              Стартирай поръчка
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          {httpError && (
            <Alert severity="error">{httpError}</Alert>
          )}
        </Grid>        
      </Grid>
    </Container>
    );
}