import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/business.manage';

export const useGoogleAuth = () => {
    const { setAccessToken } = useAuth();
    const [tokenClient, setTokenClient] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const initGoogle = () => {
            if (window.google && window.google.accounts && window.google.accounts.oauth2) {
                console.log('Initializing Google Token Client');
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    callback: (tokenResponse) => {
                        console.log('Token response received', tokenResponse);
                        if (tokenResponse && tokenResponse.access_token) {
                            setAccessToken(tokenResponse.access_token);
                            // Navigate to a temporary dashboard route or check session
                            navigate('/dashboard');
                        }
                    },
                    error_callback: (err) => {
                        console.error('Google Auth Error:', err);
                        setIsLoading(false);
                    }
                });
                setTokenClient(client);
            } else {
                console.log('Waiting for google script...');
                setTimeout(initGoogle, 500);
            }
        };

        if (!tokenClient) {
            initGoogle();
        }
    }, [tokenClient, setAccessToken, navigate]);

    const signIn = () => {
        if (tokenClient) {
            setIsLoading(true);
            tokenClient.requestAccessToken();
        } else {
            console.error('Token client not initialized');
        }
    };

    const signOut = () => {
        setAccessToken(null);
        navigate('/');
    };

    return { signIn, signOut, isLoading };
};
