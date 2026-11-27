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

// ilike treats "_" and "%" as wildcards; escape them so e.g. john_doe@x.com only matches itself
const escapeLike = (v) => String(v).replace(/[\\%_]/g, '\\$&');

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
    const login = async (emailOrUser, password) => {
        // Support direct user object pass (e.g. from quick buttons or AccountPage)
        if (typeof emailOrUser === 'object' && emailOrUser !== null) {
            const role = emailOrUser.role || (emailOrUser.email?.includes('admin') ? 'admin' : emailOrUser.email?.includes('staff') ? 'staff' : 'customer');
            const formatted = { ...emailOrUser, role };
            setUser(formatted);
            saveLocalCustomer(formatted);
            return { success: true, user: formatted, role };
        }

        const rawEmail = String(emailOrUser || '').trim();
        const cleanEmail = rawEmail.toLowerCase();
        const pwd = String(password || '');

        // 1. Default Hardcoded Admin for easy testing
        const adminPwd = localStorage.getItem('mama-co-admin-password') || 'admin123';
        if ((cleanEmail === 'admin@fatmama.ph' || cleanEmail === 'admin' || cleanEmail === 'admin@fatmama.com') && (pwd === adminPwd || pwd === 'admin123')) {
            const adminUser = { id: 'ADMIN-001', email: 'admin@fatmama.ph', name: 'Administrator', role: 'admin' };
            setUser(adminUser);
            return { success: true, user: adminUser, role: 'admin' };
        }

        // 2. Default Hardcoded Staff for easy testing
        if ((cleanEmail === 'staff@fatmama.ph' || cleanEmail === 'staff' || cleanEmail === 'staff@fatmama.com') && (pwd === 'staff123')) {
            const staffUser = { id: 'STAFF-001', email: 'staff@fatmama.ph', name: 'Staff Member', role: 'staff', status: 'active' };
            setUser(staffUser);
            return { success: true, user: staffUser, role: 'staff' };
        }

        // 3. Default Customer for easy testing
        if ((cleanEmail === 'customer@fatmama.ph' || cleanEmail === 'user@fatmama.ph' || cleanEmail === 'customer' || cleanEmail === 'user') && (pwd === 'customer123' || pwd === 'user123')) {
            const custUser = { id: 'CUST-001', email: 'customer@fatmama.ph', name: 'Sample Customer', role: 'customer' };
            setUser(custUser);
            saveLocalCustomer(custUser);
            return { success: true, user: custUser, role: 'customer' };
        }

        // 4. Try Supabase for staff & customers
        if (supabase) {
            try {
                // Check staff_accounts table
                const { data: staffData, error: staffErr } = await supabase
                    .from('staff_accounts')
                    .select('*')
                    .ilike('email', escapeLike(cleanEmail))
                    .eq('password', pwd)
                    .maybeSingle();

                if (staffData) {
                    if (staffData.status !== 'active') {
                        toast.error("Your staff account has been deactivated.");
                        return { success: false };
                    }
                    const role = staffData.email.includes('admin') || staffData.role === 'admin' ? 'admin' : 'staff';
                    const userData = { ...staffData, role };
                    setUser(userData);
                    return { success: true, user: userData, role };
                }

                // Check customers table
                const { data: customerData, error: custErr } = await supabase
                    .from('customers')
                    .select('*')
                    .ilike('email', escapeLike(cleanEmail))
                    .eq('password', pwd)
                    .maybeSingle();

                if (customerData) {
                    const userData = { ...customerData, role: customerData.role || 'customer' };
                    setUser(userData);
                    saveLocalCustomer(userData);
                    return { success: true, user: userData, role: userData.role };
                }
            } catch (error) {
                console.warn("Supabase login query note:", error);
            }
        }

        // 5. Check Local Staff accounts
        try {
            const raw = localStorage.getItem('mama-co-staff-accounts');
            const localStaff = raw ? JSON.parse(raw) : [{ id: 'STAFF-001', name: 'Staff', email: 'staff@fatmama.ph', password: 'staff123', status: 'active' }];
            const matchStaff = localStaff.find(s => s.email.toLowerCase() === cleanEmail && s.password === pwd);
            if (matchStaff) {
                if (matchStaff.status !== 'active') {
                    toast.error("Your staff account has been deactivated.");
                    return { success: false };
                }
                const role = matchStaff.email.includes('admin') ? 'admin' : 'staff';
                const userData = { ...matchStaff, role };
                setUser(userData);
                return { success: true, user: userData, role };
            }
        } catch {}

        // 6. Check Local Customers store
        const localCustomers = getLocalCustomers();
        const localCust = localCustomers.find(c => c.email.toLowerCase() === cleanEmail && c.password === pwd);
        if (localCust) {
            const userData = { ...localCust, role: localCust.role || 'customer' };
            setUser(userData);
            return { success: true, user: userData, role: userData.role };
        }

        // 7. Check password map (from AccountPage fallback)
        try {
            const userPasswords = JSON.parse(localStorage.getItem('mama-co-user-passwords') || '{}');
            const storedPwd = userPasswords[cleanEmail];
            if (storedPwd === pwd) {
                const userData = { id: `cust-${Date.now()}`, email: cleanEmail, name: cleanEmail.split('@')[0], role: 'customer' };
                setUser(userData);
                saveLocalCustomer({ ...userData, password: pwd });
                return { success: true, user: userData, role: 'customer' };
            }
        } catch {}

        toast.error('Invalid email or password');
        return { success: false };
    };

    const signup = async (userData) => {
        const cleanEmail = userData.email.trim().toLowerCase();

        const newCustomerObj = {
            id: `CUST-${Date.now().toString().slice(-6)}`,
            name: userData.name,
            email: cleanEmail,
            password: userData.password,
            phone: userData.phone || '',
            address: userData.address || '',
            role: 'customer',
            created_at: new Date().toISOString()
        };

        // Try pushing to Supabase
        if (supabase) {
            try {
                // Check if already in Supabase
                const { data: existingUser } = await supabase
                    .from('customers')
                    .select('email')
                    .ilike('email', escapeLike(cleanEmail))
                    .maybeSingle();

                if (existingUser) {
                    toast.error('An account with this email already exists in the database.');
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
                        role: 'customer'
                    }])
                    .select()
                    .maybeSingle();

                if (!error && newCustomer) {
                    const u = { ...newCustomer, role: 'customer' };
                    setUser(u);
                    saveLocalCustomer(u);
                    toast.success("Account created successfully in database!");
                    return { success: true, user: u };
                } else if (error) {
                    console.error("Supabase customer insert error:", error);
                    if (error.code === '23505') {
                        toast.error('An account with this email already exists.');
                    } else {
                        toast.error(`Could not create account: ${error.message || 'database error'}`);
                    }
                    return { success: false };
                }
            } catch (error) {
                console.error("Supabase signup sync error:", error);
                toast.error(`Database error: ${error.message || 'Connection failed'}`);
                return { success: false };
            }
        }

        // Offline / local fallback only when supabase client is not configured
        if (getLocalCustomers().some(c => c.email.toLowerCase() === cleanEmail)) {
            toast.error('An account with this email already exists.');
            return { success: false };
        }
        saveLocalCustomer(newCustomerObj);
        
        try {
            const pwdMap = JSON.parse(localStorage.getItem('mama-co-user-passwords') || '{}');
            pwdMap[cleanEmail] = userData.password;
            localStorage.setItem('mama-co-user-passwords', JSON.stringify(pwdMap));
        } catch {}

        setUser(newCustomerObj);
        toast.success("Account created successfully!");
        return { success: true, user: newCustomerObj };
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
            isAdmin: user?.role === 'admin' || user?.email === 'admin@fatmama.ph' || user?.email?.toLowerCase().includes('admin'),
            isStaff: user?.role === 'staff' || user?.email?.toLowerCase().includes('staff'),
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
