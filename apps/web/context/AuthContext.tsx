'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '../lib/api';

interface Role {
    id: number;
    name: string;
    permissions: any;
}

interface User {
    id: number;
    name: string;
    email: string;
    role_id: number;
    role?: Role;
    status?: boolean;
    created_at?: string;
    updated_at?: string;
    deal_updates?: boolean;
    email_notifications?: boolean;
    push_notifications?: boolean;
    task_reminders?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUserData: (userData: User) => void;
    fetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
    updateUserData: () => { },
    fetchMe: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchMe = async () => {
        const token = Cookies.get('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/auth/me');
            setUser(data);
        } catch (error) {
            console.error('Failed to fetch user', error);
            Cookies.remove('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const login = (token: string, userData: User) => {
        Cookies.set('token', token, { expires: 7 });
        setUser(userData);
        window.location.href = '/';
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        window.location.href = '/login';
    };

    const updateUserData = (userData: User) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUserData, fetchMe }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
