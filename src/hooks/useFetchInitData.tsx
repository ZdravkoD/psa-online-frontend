import { useState, useEffect } from 'react';
import config from '../config/config';

// TODO: Replace the API URL with the actual backend API URL from configuration
const pharmacyUrl = `${config.apiBaseUrl}/pharmacies`;
const distributorUrl = `${config.apiBaseUrl}/distributors`;


export interface Pharmacy {
    pharmacy_id: string;
    display_name: string;
  }
  
export interface Distributor {
  name: string;
  display_name: string;
}


// The hook
function useFetchInitData() {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [fetchInitDataLoading, setLoading] = useState(true);
    const [fetchInitDataError, setError] = useState<string | null>(null);

    useEffect(() => {
        console.debug("Fetching init data...")
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                
                const responses = await Promise.all([
                    fetch(pharmacyUrl),
                    fetch(distributorUrl)
                ]);

                if (!responses[0].ok) throw new Error('Failed to fetch pharmacies');
                if (!responses[1].ok) throw new Error('Failed to fetch distributors');
                
                const data = await Promise.all(responses.map(res => res.json()));
                
                setPharmacies(data[0]);
                setDistributors(data[1]);
            } catch (error) {
                console.error('Error fetching data:', error);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [])

    return { pharmacies, distributors, fetchInitDataLoading, fetchInitDataError };
}


export default useFetchInitData;
