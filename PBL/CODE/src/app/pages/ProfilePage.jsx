import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useInquiries } from '../context/InquiryContext';
import { useDelivery } from '../context/DeliveryContext';
import { useCakeDesign } from '../context/CakeDesignContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import { User, Lock, Eye, EyeOff, ShieldCheck, Briefcase, Save, MapPin, Phone, ShoppingBag, MessageSquare, CheckCircle, Cake, Clock, XCircle, ShoppingCart, } from 'lucide-react';
import { toast } from 'sonner';
// ── Password helpers ──────────────────────────────────────────────────────────
function getUserPasswords() {
    try {
        return JSON.parse(localStorage.getItem('mama-co-user-passwords') || '{}');
    }
    catch {
        return {};
    }
}
function setUserPassword(email, password) {
    const map = getUserPasswords();
    map[email.toLowerCase()] = password;
    localStorage.setItem('mama-co-user-passwords', JSON.stringify(map));
}
function getAdminPassword() { return localStorage.getItem('mama-co-admin-password') || 'admin123'; }
function verifyAndUpdatePassword(role, email, current, next) {
    if (role === 'admin') {
        if (current !== getAdminPassword())
            return false;
        localStorage.setItem('mama-co-admin-password', next);
        return true;
    }
    if (role === 'staff') {
        try {
            const accounts = JSON.parse(localStorage.getItem('mama-co-staff-accounts') || '[]');
            const idx = accounts.findIndex((s) => s.email.toLowerCase() === email.toLowerCase());
            if (idx === -1 || accounts[idx].password !== current)
                return false;
            accounts[idx].password = next;
            localStorage.setItem('mama-co-staff-accounts', JSON.stringify(accounts));
            return true;
        }
        catch {
            return false;
        }
    }
    if (role === 'user') {
        const map = getUserPasswords();
        const stored = map[email.toLowerCase()];
        if (stored && stored !== current)
            return false;
        setUserPassword(email, next);
        return true;
    }
    return false;
}
// ── Role meta ─────────────────────────────────────────────────────────────────
const ROLE_META = {
    admin: { label: 'Administrator', color: 'text-[#2C5F4F]', bg: 'bg-[#2C5F4F]', icon: ShieldCheck },
    staff: { label: 'Staff Member', color: 'text-[#1F4437]', bg: 'bg-[#1F4437]', icon: Briefcase },
    user: { label: 'Customer', color: 'text-[#D4A843]', bg: 'bg-[#D4A843]', icon: User },
};
// ── Reusable field ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', disabled = false, error, placeholder, hint, }) {
    return (<div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} disabled={disabled} placeholder={placeholder} className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] transition
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'}
          ${error ? 'border-red-400' : ''}`}/>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>);
}
function PwdField({ label, value, onChange, show, onToggle, error, placeholder, }) {
    return (<div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] ${error ? 'border-red-400' : 'border-gray-300'}`}/>
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>);
}
// ── Main component ────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { orders } = useOrders();
    const { inquiries } = useInquiries();
    const { savedDeliveryInfo, saveDeliveryInfo } = useDelivery();
    const { requests: allDesignRequests, markOrdered } = useCakeDesign();
    const { addItem } = useCart();
    const myDesignRequests = allDesignRequests.filter((r) => r.customerEmail === user?.email);
    const pendingDesigns = myDesignRequests.filter((r) => r.status === 'pending').length;
    const approvedDesigns = myDesignRequests.filter((r) => r.status === 'approved' && !r.ordered).length;
    const role = user?.role || 'user';
    const meta = ROLE_META[role] ?? ROLE_META.user;
    const RoleIcon = meta.icon;
    // ── Personal info ─────────────────────────────────────────────────────────
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(savedDeliveryInfo?.phone || '');
    const [infoErrors, setInfoErrors] = useState({});
    const handleSaveInfo = () => {
        const errs = {};
        if (!name.trim())
            errs.name = 'Name cannot be empty';
        if (role === 'user' && phone && !/^[0-9\s\-\+\(\)]+$/.test(phone))
            errs.phone = 'Enter a valid phone number';
        if (Object.keys(errs).length) {
            setInfoErrors(errs);
            return;
        }
        setInfoErrors({});
        updateUser({ name: name.trim() });
        if (role === 'user' && savedDeliveryInfo) {
            saveDeliveryInfo({ ...savedDeliveryInfo, phone: phone.trim() });
        }
        else if (role === 'user' && phone.trim()) {
            saveDeliveryInfo({
                firstName: '', lastName: '', address: '', city: '', province: '', zipCode: '',
                phone: phone.trim(),
            });
        }
        toast.success('Profile updated');
    };
    // ── Delivery address ──────────────────────────────────────────────────────
    const [delivery, setDelivery] = useState({
        firstName: savedDeliveryInfo?.firstName || '',
        lastName: savedDeliveryInfo?.lastName || '',
        address: savedDeliveryInfo?.address || '',
        city: savedDeliveryInfo?.city || '',
        province: savedDeliveryInfo?.province || '',
        zipCode: savedDeliveryInfo?.zipCode || '',
    });
    const [deliveryErrors, setDeliveryErrors] = useState({});
    const setDField = (key) => (v) => setDelivery((d) => ({ ...d, [key]: v }));
    const handleSaveDelivery = () => {
        const errs = {};
        if (!delivery.firstName.trim())
            errs.firstName = 'Required';
        if (!delivery.lastName.trim())
            errs.lastName = 'Required';
        if (!delivery.address.trim())
            errs.address = 'Required';
        if (!delivery.city.trim())
            errs.city = 'Required';
        if (!delivery.province.trim())
            errs.province = 'Required';
        if (!delivery.zipCode.trim())
            errs.zipCode = 'Required';
        if (Object.keys(errs).length) {
            setDeliveryErrors(errs);
            return;
        }
        setDeliveryErrors({});
        saveDeliveryInfo({ ...delivery, phone: phone.trim() || savedDeliveryInfo?.phone || '' });
        toast.success('Delivery address saved — it will auto-fill at checkout');
    };
    // ── Password ──────────────────────────────────────────────────────────────
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showC, setShowC] = useState(false);
    const [showN, setShowN] = useState(false);
    const [showF, setShowF] = useState(false);
    const [pwdErrors, setPwdErrors] = useState({});
    const storedPwdExists = role === 'user'
        ? !!getUserPasswords()[(user?.email || '').toLowerCase()]
        : true;
    const handleChangePassword = () => {
        const errs = {};
        if (storedPwdExists && !currentPwd)
            errs.current = 'Enter your current password';
        if (!newPwd)
            errs.next = 'Enter a new password';
        else if (newPwd.length < 6)
            errs.next = 'Minimum 6 characters';
        if (newPwd && newPwd !== confirmPwd)
            errs.confirm = "Passwords don't match";
        if (Object.keys(errs).length) {
            setPwdErrors(errs);
            return;
        }
        const ok = verifyAndUpdatePassword(role, user?.email || '', currentPwd, newPwd);
        if (!ok) {
            setPwdErrors({ current: 'Incorrect current password' });
            return;
        }
        setPwdErrors({});
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
        toast.success('Password updated successfully');
    };
    // ── Stats ─────────────────────────────────────────────────────────────────
    const myOrders = orders.filter((o) => o.email === user?.email);
    const myInquiries = inquiries.filter((i) => i.email === user?.email);
    const stats = role === 'admin' ? [
        { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
        { label: 'Total Inquiries', value: inquiries.length, icon: MessageSquare },
        { label: 'Staff Accounts', value: (() => { try {
                return JSON.parse(localStorage.getItem('mama-co-staff-accounts') || '[]').length;
            }
            catch {
                return 0;
            } })(), icon: User },
    ] : role === 'staff' ? [
        { label: 'Orders Managed', value: orders.length, icon: ShoppingBag },
        { label: 'New Inquiries', value: inquiries.filter((i) => i.status === 'new').length, icon: MessageSquare },
        { label: 'Total Inquiries', value: inquiries.length, icon: MessageSquare },
    ] : [
        { label: 'My Orders', value: myOrders.length, icon: ShoppingBag },
        { label: 'Completed', value: myOrders.filter((o) => o.status === 'completed').length, icon: CheckCircle },
        { label: 'My Inquiries', value: myInquiries.length, icon: MessageSquare },
    ];
    const addressFilled = !!(savedDeliveryInfo?.address && savedDeliveryInfo?.city);
    const allTabs = [
        { id: 'info', label: 'Personal Info', icon: User },
        ...(role === 'user'
            ? [
                { id: 'delivery', label: 'Delivery Address', icon: MapPin,
                    badge: addressFilled
                        ? <span className="ml-1.5 w-2 h-2 rounded-full bg-green-400 inline-block"/>
                        : undefined },
                { id: 'designs', label: 'Design Requests', icon: Cake,
                    badge: approvedDesigns > 0
                        ? <span className="ml-1.5 min-w-[18px] h-[18px] rounded-full bg-[#D4A843] text-white text-[10px] font-bold flex items-center justify-center px-1">{approvedDesigns}</span>
                        : pendingDesigns > 0
                            ? <span className="ml-1.5 w-2 h-2 rounded-full bg-yellow-400 inline-block"/>
                            : undefined },
            ]
            : [{ id: 'contact', label: 'Contact', icon: Phone }]),
        { id: 'password', label: 'Change Password', icon: Lock },
    ];
    const [activeTab, setActiveTab] = useState('info');
    return (<div className="p-6 max-w-3xl mx-auto space-y-4">

      {/* ── Avatar header ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className={`h-20 ${meta.bg}`}/>
        <div className="px-8 pb-7 -mt-10">
          <div className={`w-20 h-20 rounded-full ${meta.bg} text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md`}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">{user?.name}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${meta.bg}`}>
              <RoleIcon className="w-3 h-3"/>
              {meta.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => {
            const Icon = s.icon;
            return (<div key={s.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${meta.color}`}/>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            </div>);
        })}
      </div>

      {/* ── Tab bar ── */}
      <div className="flex flex-wrap gap-2">
        {allTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-colors ${active
                    ? `${meta.bg} text-white border-transparent`
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
              <Icon className="w-3.5 h-3.5"/>
              {tab.label}
              {tab.badge}
            </button>);
        })}
      </div>

      {/* ── Active tab content ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">

        {/* Personal Info */}
        {activeTab === 'info' && (<div className="space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
              <User className={`w-4 h-4 ${meta.color}`}/>
              Personal Information
            </h2>

            <Field label="Full Name" value={name} onChange={setName} error={infoErrors.name} placeholder="Your name"/>

            {role === 'user' && (<Field label="Contact Number" value={phone} onChange={setPhone} type="tel" error={infoErrors.phone} placeholder="+63 917 123 4567" hint="Used to contact you about your orders"/>)}

            <Field label="Email Address" value={user?.email || ''} disabled hint="Email cannot be changed"/>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white ${meta.bg}`}>
                <RoleIcon className="w-4 h-4"/>
                {meta.label}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button onClick={handleSaveInfo} className="flex items-center gap-2 px-6 py-2.5 bg-[#D4A843] hover:bg-[#B8923A] text-white rounded-lg font-medium transition-colors">
                <Save className="w-4 h-4"/>
                Save Changes
              </button>
            </div>
          </div>)}

        {/* Delivery Address */}
        {activeTab === 'delivery' && role === 'user' && (<div className="space-y-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${meta.color}`}/>
                Delivery Address
              </h2>
              {addressFilled && (<span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 font-medium">
                  <CheckCircle className="w-3 h-3"/>
                  Saved
                </span>)}
            </div>

            <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              Saved here — auto-fills at checkout so you don't have to type it every time.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" value={delivery.firstName} onChange={setDField('firstName')} error={deliveryErrors.firstName} placeholder="Juan"/>
              <Field label="Last Name" value={delivery.lastName} onChange={setDField('lastName')} error={deliveryErrors.lastName} placeholder="Dela Cruz"/>
            </div>
            <Field label="Street Address" value={delivery.address} onChange={setDField('address')} error={deliveryErrors.address} placeholder="123 Rizal Street, Barangay San Juan"/>
            <div className="grid grid-cols-3 gap-4">
              <Field label="City" value={delivery.city} onChange={setDField('city')} error={deliveryErrors.city} placeholder="Lipa City"/>
              <Field label="Province" value={delivery.province} onChange={setDField('province')} error={deliveryErrors.province} placeholder="Batangas"/>
              <Field label="Zip Code" value={delivery.zipCode} onChange={setDField('zipCode')} error={deliveryErrors.zipCode} placeholder="4217"/>
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={handleSaveDelivery} className="flex items-center gap-2 px-6 py-2.5 bg-[#2C5F4F] hover:bg-[#1F4437] text-white rounded-lg font-medium transition-colors">
                <MapPin className="w-4 h-4"/>
                Save Delivery Address
              </button>
            </div>
          </div>)}

        {/* Change Password */}
        {activeTab === 'password' && (<div className="space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
              <Lock className={`w-4 h-4 ${meta.color}`}/>
              Change Password
            </h2>

            {role === 'user' && !storedPwdExists && (<p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No password set yet. Enter a new password below to secure your account.
              </p>)}

            {storedPwdExists && (<PwdField label="Current Password" value={currentPwd} onChange={setCurrentPwd} show={showC} onToggle={() => setShowC(!showC)} error={pwdErrors.current} placeholder="Enter current password"/>)}
            <PwdField label="New Password" value={newPwd} onChange={setNewPwd} show={showN} onToggle={() => setShowN(!showN)} error={pwdErrors.next} placeholder="Minimum 6 characters"/>
            <PwdField label="Confirm New Password" value={confirmPwd} onChange={setConfirmPwd} show={showF} onToggle={() => setShowF(!showF)} error={pwdErrors.confirm} placeholder="Re-enter new password"/>
            <div className="flex justify-end pt-1">
              <button onClick={handleChangePassword} className="flex items-center gap-2 px-6 py-2.5 bg-[#2C5F4F] hover:bg-[#1F4437] text-white rounded-lg font-medium transition-colors">
                <Lock className="w-4 h-4"/>
                Update Password
              </button>
            </div>
          </div>)}

        {/* Contact — admin/staff only */}
        {activeTab === 'contact' && role !== 'user' && (<div>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Phone className={`w-4 h-4 ${meta.color}`}/>
              Contact
            </h2>
            <p className="text-sm text-gray-500">For account-related concerns, contact your system administrator.</p>
          </div>)}

        {/* Design Requests — customers only */}
        {activeTab === 'designs' && role === 'user' && (<div>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
              <Cake className={`w-4 h-4 ${meta.color}`}/>
              My Cake Design Requests
            </h2>

            {myDesignRequests.length === 0 ? (<div className="text-center py-10 text-gray-400">
                <Cake className="w-10 h-10 mx-auto mb-3 opacity-40"/>
                <p className="text-sm">No design requests yet.</p>
                <button onClick={() => navigate('/design')} className="mt-4 px-5 py-2 bg-[#D4A843] hover:bg-[#B8923A] text-white rounded-lg text-sm font-medium transition-colors">
                  Design a Custom Cake
                </button>
              </div>) : (<div className="space-y-4">
                {myDesignRequests.map((req) => {
                    const statusStyle = {
                        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                        approved: 'bg-green-100 text-green-700 border-green-200',
                        rejected: 'bg-red-100 text-red-700 border-red-200',
                    }[req.status];
                    const StatusIcon = req.status === 'approved' ? CheckCircle : req.status === 'rejected' ? XCircle : Clock;
                    return (<div key={req.id} className={`border rounded-xl overflow-hidden ${req.status === 'approved' && !req.ordered ? 'border-green-300 shadow-sm shadow-green-100' : 'border-gray-100'}`}>
                      <div className="flex gap-4 p-4">
                        {req.imageUrl && (<img src={req.imageUrl} alt="Cake" className="w-20 h-20 rounded-lg object-cover shrink-0 border border-gray-100"/>)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-mono text-gray-400">{req.id}</span>
                              <p className="text-sm font-semibold text-gray-800">
                                {req.sizeName} · {req.layers}L · {req.flavor} · {req.frosting}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {req.occasion} · {req.submittedAt}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${statusStyle}`}>
                              <StatusIcon className="w-3 h-3"/>
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </span>
                          </div>

                          {/* Staff note */}
                          {req.reviewNote && (<p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded px-2.5 py-1.5 border border-gray-100">
                              Note from team: {req.reviewNote}
                            </p>)}

                          {/* Approved state — show price + Order Now */}
                          {req.status === 'approved' && !req.ordered && req.approvedPrice !== undefined && (<div className="mt-3 flex items-center justify-between">
                              <span className="text-sm font-bold text-[#D4A843]">Approved Price: ₱{req.approvedPrice.toLocaleString()}</span>
                              <button onClick={() => {
                                const topperDisplay = req.topper === 'other'
                                    ? req.otherTopper || 'Custom Topper'
                                    : req.topper !== 'none' ? req.topper : '';
                                const itemName = `Custom Cake — ${req.sizeName} · ${req.flavor} · ${req.frosting}${topperDisplay ? ' · ' + topperDisplay : ''}${req.occasion ? ' (' + req.occasion + ')' : ''}`;
                                addItem({
                                    id: `cake-approved-${req.id}`,
                                    name: itemName,
                                    price: req.approvedPrice,
                                    image: req.imageUrl,
                                });
                                markOrdered(req.id);
                                toast.success('Custom cake added to cart!');
                                navigate('/checkout');
                            }} className="flex items-center gap-1.5 px-4 py-2 bg-[#D4A843] hover:bg-[#B8923A] text-white rounded-lg text-sm font-semibold transition-colors">
                                <ShoppingCart className="w-4 h-4"/>
                                Order Now
                              </button>
                            </div>)}

                          {/* Already ordered */}
                          {req.ordered && (<p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5"/> Added to order
                            </p>)}

                          {/* Rejected */}
                          {req.status === 'rejected' && (<button onClick={() => navigate('/design')} className="mt-2 text-xs text-[#2C5F4F] underline hover:no-underline">
                              Submit a new design →
                            </button>)}
                        </div>
                      </div>
                    </div>);
                })}
              </div>)}
          </div>)}
      </div>
    </div>);
}
