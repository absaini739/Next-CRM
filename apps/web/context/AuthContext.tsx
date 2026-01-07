'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '../lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role_id: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await api.get('/auth/me'); // Ensure API endpoint exists
                setUser(data);
            } catch (error) {
                console.error('Failed to fetch user', error);
                Cookies.remove('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = (token: string, userData: User) => {
        Cookies.set('token', token, { expires: 7 });
        setUser(userData);
        router.push('/');
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
