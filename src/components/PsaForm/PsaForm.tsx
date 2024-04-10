import * as React from 'react';
import { Container, Typography, RadioGroup, Checkbox, FormControl, FormLabel, FormControlLabel, Radio, Button, LinearProgress, Box, Input } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useEffect, useState } from 'react';

interface Pharmacy {
    id: number;
    name: string;
  }
  
  interface Supplier {
    id: string;
    name: string;
  }
  
  const mockPharmacies: Pharmacy[] = [
    { id: 1, name: 'Pharmacy A' },
    { id: 2, name: 'Pharmacy B' },
    { id: 3, name: 'Pharmacy C' },
  ];
  
  const mockSuppliers: Supplier[] = [
    { id: '1', name: 'Sting' },
    { id: '2', name: 'Phoenix Pharma' },
  ];

export default function PsaForm() {
    const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
    const [currentItem, setCurrentItem] = useState<string>('');
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  
    useEffect(() => {
        console.debug("Initiating PsaForm...")
        setProgress(0);
      }, []);

    useEffect(() => {
    console.debug("Selected suppliers: ", selectedSuppliers);
    }, [selectedSuppliers]);
    
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug("File selected...")
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
          setSelectedFileName(file.name);
        } else {
          setSelectedFileName('');
        }    
      };
    
      const startProcessing = () => {
        console.debug("Starting to process...")
        simulateProgress();
      };
    
      const simulateProgress = () => {
        const interval = setInterval(() => {
          setProgress((prevProgress) => {
            if (prevProgress === 100) {
              clearInterval(interval);
              return 100;
            }
            const diff = Math.random() * 10;
            return Math.round(Math.min(prevProgress + diff, 100));
          });
          setCurrentItem(`Item ${Math.floor(Math.random() * 100)}`);
        }, 500);
      }
    
      const handleSelectSupplier = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setSelectedSuppliers(prev => 
          checked ? [...prev, name] : prev.filter(option => option !== name)
        );
      }
    
    return (
        <Container maxWidth="sm">
        <label htmlFor="raised-button-file">
          <Input 
            type="file" 
            id="raised-button-file"
            onChange={handleFileUpload} 
            fullWidth 
            style={{ display: 'none' }}
            />
          <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
          Избери файл
          </Button>
          {selectedFileName && (
          <Typography variant="subtitle1" style={{ marginTop: '8px' }}>
            Избран файл: {selectedFileName}
          </Typography>
          )}        
        </label>
        <FormLabel component="legend">Изберете аптека</FormLabel>
        <RadioGroup
          aria-label="pharmacy"
          name="pharmacy"
          value={selectedPharmacy}
          onChange={(e) => setSelectedPharmacy(e.target.value)}>
          {mockPharmacies.map((pharmacy) => (
            <FormControlLabel key={pharmacy.id} value={pharmacy.id.toString()} control={<Radio />} label={pharmacy.name} />
          ))}
        </RadioGroup>
        <FormLabel component="legend">Изберете доставчик</FormLabel>
        <FormControl component="fieldset">
          {mockSuppliers.map((option) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={selectedSuppliers.includes(option.id)}
                  onChange={handleSelectSupplier}
                  name={option.id}
                />
              }
              label={option.name}
            />
          ))}
        </FormControl>
        <Box my={2}>
          <Button variant="contained" color="primary" onClick={startProcessing}>
            Старт
          </Button>
        </Box>
        <Box my={2}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography>
            {progress}%
          </Typography>
          <Typography>
            Продукт: {currentItem}
          </Typography>
        </Box>
      </Container>
    );
}