import { MapPin, Phone, Clock } from 'lucide-react';
export default function Branches() {
    return (<div>
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1511018556340-d16986a1c194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
        }}>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl text-white mb-4 font-bold">Our Branches</h1>
          <p className="text-white text-xl">Visit us at any of our convenient locations</p>
        </div>
      </section>

      {/* Branches List */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Branch 1 - Main Store */}
            <div className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-6 h-6 text-[#D4A843] flex-shrink-0 mt-1"/>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-2xl">Fat Mama Ph - Villa Lourdes</h3>
                    <span className="text-xs font-semibold text-white bg-[#2C5F4F] px-2 py-0.5 rounded-full">Now Open</span>
                  </div>
                  <p className="text-gray-600">Purok 4, Mataas Na Lupa<br />Lipa City, Batangas</p>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <Phone className="w-6 h-6 text-[#D4A843] flex-shrink-0 mt-1"/>
                <div>
                  <p className="text-gray-700">0997 811 4442</p>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-6 h-6 text-[#D4A843] flex-shrink-0 mt-1"/>
                <div>
                  <p className="text-gray-700 mb-2">Weekly schedule:</p>
                  <p className="text-gray-600">Monday - Thursday: 12:00 AM - 11:59 PM</p>
                  <p className="text-gray-600">Friday: 12:00 AM - 4:00 PM, 6:15 PM - 11:59 PM</p>
                  <p className="text-gray-600">Saturday - Sunday: 12:00 AM - 11:59 PM</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Features:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full custom cake design service</li>
                  <li>• Takeout</li>
                  <li>• Open 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-4 font-bold">Coming Soon!</h2>
          <p className="text-xl text-gray-700">
            We're expanding! Stay tuned for new locations opening soon.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-4 font-bold">Visit Us Today!</h2>
          <p className="text-gray-600 mb-8">
            Stop by our pastry to experience the warmth and deliciousness of Fat Mama.
            Our friendly staff is always ready to help you find the perfect treat!
          </p>
          <p className="text-lg text-gray-700">
            Questions? Call us at <span className="text-[#D4A843] font-medium">0997 811 4442</span>
          </p>
        </div>
      </section>
    </div>);
}
