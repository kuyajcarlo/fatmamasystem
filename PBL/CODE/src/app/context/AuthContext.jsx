import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Load user from localStorage on initialization
        const savedUser = localStorage.getItem('mama-co-user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('mama-co-user', JSON.stringify(user));
        }
        else {
            localStorage.removeItem('mama-co-user');
        }
    }, [user]);
    const login = (userData) => {
        setUser(userData);
    };
    const logout = () => {
        setUser(null);
    };
    const updateUser = (updates) => {
        setUser((prev) => prev ? { ...prev, ...updates } : prev);
    };
    return (<AuthContext.Provider value={{
            user,
            isLoggedIn: !!user,
            isAdmin: user?.role === 'admin',
            isStaff: user?.role === 'staff',
            login,
            logout,
            updateUser,
        }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
