import { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export const useBusinessProfile = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAccounts = useCallback(async () => {
        if (!token) return [];
        setLoading(true);
        try {
            const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch accounts');
            const data = await response.json();
            return data.accounts || [];
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchLocations = useCallback(async (accountName) => {
        if (!token || !accountName) return [];
        setLoading(true);
        try {
            const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storeCode`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch locations');
            const data = await response.json();
            return data.locations || [];
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchReviews = useCallback(async (locationName, accountName) => {
        if (!token || !locationName) return [];

        // Construct resource name exactly as the original code did
        let resourceName = locationName;
        if (!resourceName.startsWith('accounts/') && accountName) {
            resourceName = `${accountName}/${locationName}`;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://mybusiness.googleapis.com/v4/${resourceName}/reviews?pageSize=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            return data.reviews || [];
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [token]);

    return {
        fetchAccounts,
        fetchLocations,
        fetchReviews,
        loading,
        error
    };
};
