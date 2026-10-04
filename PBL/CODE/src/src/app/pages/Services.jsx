import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Send, CheckCircle, Lock, ChevronDown, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInquiries } from '../context/InquiryContext';
const USER_STATUS = {
    new: { label: 'Sent', color: 'bg-amber-100 text-amber-700 border-amber-200', desc: 'Your inquiry has been received and is waiting to be reviewed.' },
    read: { label: 'Opened', color: 'bg-blue-100 text-blue-700 border-blue-200', desc: 'Our team has opened and is reviewing your inquiry.' },
    replied: { label: 'Answered', color: 'bg-green-100 text-green-700 border-green-200', desc: 'We have responded to your inquiry. Check your email for our reply.' },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500 border-gray-200', desc: 'This inquiry has been closed.' },
};
export default function Services() {
    const { user, isLoggedIn } = useAuth();
    const { addInquiry, inquiries } = useInquiries();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [expandedInq, setExpandedInq] = useState(null);
    const myInquiries = inquiries.filter((inq) => inq.email.toLowerCase() === (user?.email || '').toLowerCase());
    // Pre-fill name and email when user is logged in
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: prev.name || user.name || '',
                email: prev.email || user.email || '',
            }));
        }
    }, [user]);
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required.';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required.';
        }
        return newErrors;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            navigate('/account?redirect=inquiries');
            return;
        }
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        addInquiry({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
        });
        setSubmitted(true);
    };
    return (<div>
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1672826979217-7156a305acf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
        }}>
          <div className="absolute inset-0 bg-[#2C5F4F]/80"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl text-white mb-4 font-bold">Inquiries</h1>
          <p className="text-amber-200 text-xl">
            Have a question or a special request? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 font-bold">What We Offer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From custom cakes to your everyday favorites, we can bake up all your special moments.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-[#2C5F4F]/5 border border-[#2C5F4F]/20 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#D4A843] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🎂</div>
              <h3 className="text-2xl mb-3">Custom Cakes</h3>
              <p className="text-gray-600 mb-6">
                Personalized cakes for birthdays, weddings, anniversaries, and every special moment.
              </p>
              <Link to="/design" className="inline-block bg-[#D4A843] hover:bg-[#B8923A] text-white px-6 py-2 rounded-md transition-colors font-medium">
                Design Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry-form" className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl mb-3 font-bold">We would love to hear from you!</h2>
            <p className="text-gray-600">
              For inquiries, feedback and suggestions, please fill out the form below.
            </p>
          </div>

          {submitted ? (<div className="bg-white rounded-xl shadow-md p-12 text-center border border-[#2C5F4F]/20">
              <CheckCircle className="w-16 h-16 text-[#2C5F4F] mx-auto mb-4"/>
              <h3 className="text-2xl font-bold text-[#2C5F4F] mb-2">Inquiry Sent!</h3>
              <p className="text-gray-600 mb-2">
                Thank you, <strong>{formData.name}</strong>! We've received your inquiry and will get back to you at{' '}
                <strong>{formData.email}</strong>.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You can track the status of your inquiry below.
              </p>
              <button onClick={() => {
                setSubmitted(false);
                setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: '',
                    message: '',
                });
            }} className="bg-[#D4A843] hover:bg-[#B8923A] text-white px-8 py-3 rounded-md transition-colors font-medium">
                Send Another Inquiry
              </button>
            </div>) : (<>
              {!isLoggedIn && (<div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 mb-6 text-sm text-amber-800">
                  <Lock className="w-4 h-4 mt-0.5 shrink-0 text-amber-600"/>
                  <span>
                    You must{' '}
                    <Link to="/account?redirect=inquiries" className="font-semibold underline hover:text-amber-900">
                      sign in
                    </Link>{' '}
                    before submitting an inquiry.
                  </span>
                </div>)}

              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 border border-[#2C5F4F]/20 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C5F4F] mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" className={`w-full border rounded-lg px-4 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}/>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C5F4F] mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={`w-full border rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}/>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C5F4F] mb-1">
                    Phone Number
                  </label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+63 912 345 6789" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition"/>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C5F4F] mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Write your message here..." className={`w-full border rounded-lg px-4 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition resize-none ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}/>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                {/* Submit */}
                <button type="submit" className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2">
                  {isLoggedIn ? (<>
                      <Send className="w-5 h-5"/>
                      SEND
                    </>) : (<>
                      <Lock className="w-5 h-5"/>
                      SIGN IN TO SEND
                    </>)}
                </button>
              </form>
            </>)}
        </div>
      </section>

      {/* My Inquiries - status tracker */}
      {isLoggedIn && myInquiries.length > 0 && (<section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-[#2C5F4F]"/>
              <h2 className="text-2xl font-bold text-[#2C5F4F]">My Inquiries</h2>
              <span className="bg-[#2C5F4F] text-white text-xs font-bold rounded-full px-2 py-0.5">
                {myInquiries.length}
              </span>
            </div>

            <div className="space-y-3">
              {myInquiries.map((inq) => {
                const statusMeta = USER_STATUS[inq.status];
                const isExpanded = expandedInq === inq.id;
                return (<div key={inq.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <button onClick={() => setExpandedInq(isExpanded ? null : inq.id)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono text-gray-400">{inq.id}</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-400">{inq.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 truncate">{inq.message}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.color}`}>
                          {statusMeta.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                      </div>
                    </button>

                    {isExpanded && (<div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">{inq.message}</p>
                        <div className={`flex items-start gap-3 rounded-lg px-4 py-3 border ${statusMeta.color}`}>
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wide mb-0.5">Status: {statusMeta.label}</p>
                            <p className="text-xs">{statusMeta.desc}</p>
                          </div>
                        </div>
                      </div>)}
                  </div>);
            })}
            </div>
          </div>
        </section>)}

      {/* Contact Info */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold text-[#2C5F4F] mb-1">Visit Us</h3>
              <p className="text-gray-600 text-sm">Purok 4, Mataas Na Lupa<br />Lipa City, Batangas</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2C5F4F] mb-1">Call Us</h3>
              <p className="text-gray-600 text-sm">0997 811 4442</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2C5F4F] mb-1">Email Us</h3>
              <p className="text-gray-600 text-sm">fatmama.ph@gmail.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>);
}
