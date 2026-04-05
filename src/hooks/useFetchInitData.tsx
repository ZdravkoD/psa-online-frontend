import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInitData } from '../store/initData';
import { AppDispatch, RootState } from '../store/store';

function useFetchInitData() {
    const dispatch = useDispatch<AppDispatch>();
    const { pharmacies, distributors, status, error } = useSelector(
        (state: RootState) => state.initData
    );

    useEffect(() => {
        dispatch(fetchInitData());
    }, [dispatch]);

    return {
        pharmacies,
        distributors,
        fetchInitDataLoading: status === 'idle' || status === 'loading',
        fetchInitDataError: error,
    };
}


export default useFetchInitData;
