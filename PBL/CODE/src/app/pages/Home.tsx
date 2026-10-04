import { Link } from 'react-router';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1749996089724-268703b8c4dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="Cozy bakery interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#D4A843]/75"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl mb-4 font-bold text-white">Welcome to Fat Mama</h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Handmade Cakes & Pastries with Love
          </p>
          <Link
            to="/inquiries"
            className="inline-block bg-[#2C5F4F] hover:bg-[#1F4437] text-white px-8 py-3 rounded-md transition-colors font-medium"
          >
            INQUIRE NOW
          </Link>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 font-bold">Why Choose Fat Mama?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've been crafting delicious memories since day one
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl mb-2 font-bold">Fresh Daily</h3>
              <p className="text-gray-600">Everything baked fresh every morning</p>
            </div>

            <div className="text-center">
              <h3 className="text-xl mb-2 font-bold">Made with Love</h3>
              <p className="text-gray-600">Each item crafted with care and passion</p>
            </div>

            <div className="text-center">
              <h3 className="text-xl mb-2 font-bold">Premium Quality</h3>
              <p className="text-gray-600">Only the finest ingredients used</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#D4A843] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl text-white mb-4 font-bold">Ready to Order?</h2>
          <p className="text-white text-xl mb-8">
            Browse our products or design your custom cake today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-block bg-white text-[#D4A843] px-8 py-3 rounded-md transition-colors font-medium hover:bg-gray-100"
            >
              View Products
            </Link>
            <Link
              to="/design"
              className="inline-block bg-[#2C5F4F] text-white px-8 py-3 rounded-md transition-colors font-medium hover:bg-[#1F4437]"
            >
              Design Custom Cake
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
