import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(sessionStorage.getItem('google_access_token'));
    const [accountName, setAccountName] = useState(null);

    const setAccessToken = (newToken) => {
        if (newToken) {
            sessionStorage.setItem('google_access_token', newToken);
            setToken(newToken);
        } else {
            sessionStorage.removeItem('google_access_token');
            setToken(null);
            setAccountName(null);
        }
    };

    return (
        <AuthContext.Provider value={{ token, setAccessToken, accountName, setAccountName }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
