import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

const LOCAL_CUSTOMERS_KEY = 'mama-co-customers-db';

function getLocalCustomers() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_CUSTOMERS_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveLocalCustomer(customer) {
    const list = getLocalCustomers();
    const idx = list.findIndex(c => c.email.toLowerCase() === customer.email.toLowerCase());
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...customer };
    } else {
        list.push(customer);
    }
    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(list));
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Load user from localStorage on initialization for session persistence
        const savedUser = localStorage.getItem('mama-co-user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Save user to localStorage whenever it changes to keep them logged in
    useEffect(() => {
        if (user) {
            localStorage.setItem('mama-co-user', JSON.stringify(user));
        } else {
            localStorage.removeItem('mama-co-user');
        }
    }, [user]);

    // Custom Login function connecting to Supabase with seamless local fallback
    const login = async (email, password) => {
        const cleanEmail = email.trim().toLowerCase();

        // 1. Check Hardcoded / Local Admin
        const adminPwd = localStorage.getItem('mama-co-admin-password') || 'admin123';
        if (cleanEmail === 'admin@fatmama.ph' && password === adminPwd) {
            const adminUser = { id: 'admin-001', email: 'admin@fatmama.ph', name: 'Admin', role: 'admin' };
            setUser(adminUser);
            return { success: true };
        }

        // 2. Check Hardcoded / Local Staff
        try {
            const raw = localStorage.getItem('mama-co-staff-accounts');
            const localStaff = raw ? JSON.parse(raw) : [{ id: 'STAFF-001', name: 'Staff', email: 'staff@fatmama.ph', password: 'staff123', status: 'active' }];
            const matchStaff = localStaff.find(s => s.email.toLowerCase() === cleanEmail && s.password === password);
            if (matchStaff) {
                if (matchStaff.status !== 'active') {
                    toast.error("Your staff account has been deactivated.");
                    return { success: false };
                }
                const userData = { ...matchStaff, role: matchStaff.email.includes('admin') ? 'admin' : 'staff' };
                setUser(userData);
                return { success: true };
            }
        } catch {}

        // 3. Try Supabase for staff & customers
        if (supabase) {
            try {
                const { data: staffData } = await supabase
                    .from('staff_accounts')
                    .select('*')
                    .eq('email', cleanEmail)
                    .eq('password', password)
                    .maybeSingle();

                if (staffData) {
                    if (staffData.status !== 'active') {
                        toast.error("Your staff account has been deactivated.");
                        return { success: false };
                    }
                    const role = staffData.email.includes('admin') ? 'admin' : 'staff';
                    const userData = { ...staffData, role: role === 'admin' ? 'admin' : 'staff' };
                    setUser(userData);
                    return { success: true };
                }

                const { data: customerData } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('email', cleanEmail)
                    .eq('password', password)
                    .maybeSingle();

                if (customerData) {
                    const userData = { ...customerData, role: 'user' };
                    setUser(userData);
                    saveLocalCustomer(userData);
                    return { success: true };
                }
            } catch (error) {
                console.warn("Supabase login query note:", error);
            }
        }

        // 4. Check Local Customers store & password map
        const localCustomers = getLocalCustomers();
        const localCust = localCustomers.find(c => c.email.toLowerCase() === cleanEmail && c.password === password);
        if (localCust) {
            const userData = { ...localCust, role: 'user' };
            setUser(userData);
            return { success: true };
        }

        // Check password map (from AccountPage)
        try {
            const userPasswords = JSON.parse(localStorage.getItem('mama-co-user-passwords') || '{}');
            const storedPwd = userPasswords[cleanEmail];
            if (storedPwd === password) {
                const userData = { id: `cust-${Date.now()}`, email: cleanEmail, name: cleanEmail.split('@')[0], role: 'user' };
                setUser(userData);
                saveLocalCustomer({ ...userData, password });
                return { success: true };
            }
        } catch {}

        toast.error('Invalid email or password');
        return { success: false };
    };

    const signup = async (userData) => {
        const cleanEmail = userData.email.trim().toLowerCase();

        // Check local duplicate first
        const localList = getLocalCustomers();
        if (localList.some(c => c.email.toLowerCase() === cleanEmail)) {
            toast.error('An account with this email already exists.');
            return { success: false };
        }

        const newCustomerObj = {
            id: `CUST-${Date.now().toString().slice(-6)}`,
            name: userData.name,
            email: cleanEmail,
            password: userData.password,
            phone: userData.phone || '',
            address: userData.address || '',
            role: 'user',
            created_at: new Date().toISOString()
        };

        // Try pushing to Supabase
        if (supabase) {
            try {
                const { data: existingUser } = await supabase.from('customers').select('email').eq('email', cleanEmail).maybeSingle();
                if (existingUser) {
                    toast.error('An account with this email already exists.');
                    return { success: false };
                }

                const { data: newCustomer, error } = await supabase
                    .from('customers')
                    .insert([{
                        name: userData.name,
                        email: cleanEmail,
                        password: userData.password,
                        phone: userData.phone || '',
                        address: userData.address || '',
                        role: 'user'
                    }])
                    .select()
                    .maybeSingle();

                if (!error && newCustomer) {
                    const u = { ...newCustomer, role: 'user' };
                    setUser(u);
                    saveLocalCustomer(u);
                    toast.success("Account created successfully!");
                    return { success: true };
                }
            } catch (error) {
                console.warn("Supabase signup sync note:", error);
            }
        }

        // Always save locally so customer account works reliably
        saveLocalCustomer(newCustomerObj);
        
        // Also sync password map for profile change support
        try {
            const pwdMap = JSON.parse(localStorage.getItem('mama-co-user-passwords') || '{}');
            pwdMap[cleanEmail] = userData.password;
            localStorage.setItem('mama-co-user-passwords', JSON.stringify(pwdMap));
        } catch {}

        setUser(newCustomerObj);
        toast.success("Account created successfully!");
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        toast.success("Logged out successfully");
    };

    const updateUser = async (updates) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        saveLocalCustomer(updatedUser);

        if (supabase && user.id && !user.id.startsWith('cust-') && !user.id.startsWith('CUST-')) {
            try {
                await supabase
                    .from('customers')
                    .update(updates)
                    .eq('id', user.id);
            } catch (error) {
                console.warn("Supabase update error:", error);
            }
        }
        toast.success("Profile updated");
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn: !!user,
            isAdmin: user?.role === 'admin' || user?.email === 'admin@fatmama.ph',
            isStaff: user?.role === 'staff',
            login,
            signup,
            logout,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
