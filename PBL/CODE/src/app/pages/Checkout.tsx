import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';
import { useDelivery } from '../context/DeliveryContext';
import { CreditCard, Truck, MapPin, Phone, User, Mail, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { isLoggedIn, user } = useAuth();
  const { hasConsented } = usePrivacy();
  const { savedDeliveryInfo, saveDeliveryInfo } = useDelivery();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [saveAddress, setSaveAddress] = useState(false);
  const [formData, setFormData] = useState({
    firstName: savedDeliveryInfo?.firstName || '',
    lastName: savedDeliveryInfo?.lastName || '',
    email: user?.email || '',
    phone: savedDeliveryInfo?.phone || '',
    address: savedDeliveryInfo?.address || '',
    city: savedDeliveryInfo?.city || '',
    province: savedDeliveryInfo?.province || '',
    zipCode: savedDeliveryInfo?.zipCode || '',
    notes: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const deliveryFee = 50;
  const finalTotal = totalPrice + deliveryFee;

  // Check if user is logged in and has consented to privacy policy
  useEffect(() => {
    if (!hasConsented) {
      toast.error('Please accept our data privacy policy to checkout');
      navigate('/');
      return;
    }

    if (!isLoggedIn) {
      toast.info('Please sign in to place an order');
      navigate('/account?redirect=checkout');
    }
  }, [isLoggedIn, hasConsented, navigate]);

  // Update email when user changes
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.province.trim()) {
      newErrors.province = 'Province is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check privacy consent
    if (!hasConsented) {
      toast.error('Please accept our data privacy policy to place orders');
      navigate('/');
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    // Create order object
    const order = {
      customer: `${formData.firstName} ${formData.lastName}`,
      email: user?.email || formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      province: formData.province,
      zipCode: formData.zipCode,
      notes: formData.notes,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: totalPrice,
      deliveryFee,
      finalTotal,
      paymentMethod,
    };

    // Save delivery info if checkbox is checked
    if (saveAddress) {
      saveDeliveryInfo({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        zipCode: formData.zipCode,
      });
    }

    // Save order
    addOrder(order);

    toast.success('Order placed successfully! Thank you for your purchase.', {
      duration: 3000,
    });
    clearCart();
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-20">
            <h1 className="mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some delicious treats before checking out!</p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-[#D4A843] hover:bg-[#B8923A] text-white px-8 py-3 rounded-md transition-colors"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2C5F4F] hover:text-[#1F4437] mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Shopping
        </button>

        <h1 className="mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-6 h-6 text-[#2C5F4F]" />
                <h2>Delivery Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      <User className="w-4 h-4 inline mr-1" />
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.firstName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#2C5F4F]'
                      }`}
                      placeholder="Juan"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.lastName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#2C5F4F]'
                      }`}
                      placeholder="Dela Cruz"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="juan@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Using your account email</p>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#2C5F4F]'
                      }`}
                      placeholder="0917 123 4567"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.address
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#2C5F4F]'
                    }`}
                    placeholder="123 Rizal Street, Barangay San Juan"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.city
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#2C5F4F]'
                      }`}
                      placeholder="Manila"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.province
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#2C5F4F]'
                      }`}
                      placeholder="Metro Manila"
                    />
                    {errors.province && (
                      <p className="text-red-500 text-xs mt-1">{errors.province}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.zipCode
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#2C5F4F]'
                      }`}
                      placeholder="1000"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]"
                    placeholder="Any special instructions for delivery?"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="save-address"
                    name="save-address"
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 text-[#D4A843] focus:ring-[#D4A843] border-gray-300 rounded"
                  />
                  <label htmlFor="save-address" className="ml-2 block text-sm text-gray-700">
                    Save this delivery address for future orders
                  </label>
                </div>

                {savedDeliveryInfo && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm">
                    <p className="text-blue-800">
                      <strong>Note:</strong> Your previously saved delivery information has been loaded automatically.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-6 h-6 text-[#2C5F4F]" />
                <h2>Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: paymentMethod === 'cod' ? '#2C5F4F' : '#e5e7eb' }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#2C5F4F] focus:ring-[#2C5F4F]"
                  />
                  <div className="ml-3">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: paymentMethod === 'gcash' ? '#2C5F4F' : '#e5e7eb' }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="gcash"
                    checked={paymentMethod === 'gcash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#2C5F4F] focus:ring-[#2C5F4F]"
                  />
                  <div className="ml-3">
                    <p className="font-medium">GCash</p>
                    <p className="text-sm text-gray-500">Pay via GCash e-wallet</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: paymentMethod === 'paymaya' ? '#2C5F4F' : '#e5e7eb' }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="paymaya"
                    checked={paymentMethod === 'paymaya'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#2C5F4F] focus:ring-[#2C5F4F]"
                  />
                  <div className="ml-3">
                    <p className="font-medium">PayMaya</p>
                    <p className="text-sm text-gray-500">Pay via PayMaya e-wallet</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₱ {item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₱ {totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₱ {deliveryFee}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-[#D4A843]">₱ {finalTotal}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-md transition-colors mt-6"
              >
                Place Order
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}
