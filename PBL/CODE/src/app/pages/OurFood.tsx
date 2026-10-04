export default function OurFood() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1595144780677-6d0b5abbd089?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl text-white mb-4 font-bold">Our Food</h1>
          <p className="text-white text-xl">Quality ingredients, traditional methods, exceptional taste</p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-6 font-bold">Our Philosophy</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              At Mama & Co., we believe that great food starts with great ingredients.
              We're committed to using only the finest, freshest ingredients in everything we bake.
              No shortcuts, no compromises—just honest, delicious food made the right way.
            </p>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12 font-bold">What Makes Our Food Special</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-2xl mb-3">Premium Ingredients</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Organic flour from local mills</li>
                <li>• Farm-fresh eggs and dairy</li>
                <li>• Belgian chocolate and premium cocoa</li>
                <li>• Real vanilla beans, never extract</li>
                <li>• Seasonal fruits from local farms</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-2xl mb-3">Traditional Methods</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Hand-mixed doughs for perfect texture</li>
                <li>• Slow-fermented sourdough starters</li>
                <li>• Small-batch baking for consistency</li>
                <li>• Time-honored family recipes</li>
                <li>• Baked fresh daily, never frozen</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-2xl mb-3">Sustainability</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Locally sourced when possible</li>
                <li>• Eco-friendly packaging</li>
                <li>• Minimal food waste practices</li>
                <li>• Supporting local farmers</li>
                <li>• Energy-efficient ovens</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-2xl mb-3">Made with Love</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Each item crafted by skilled bakers</li>
                <li>• Quality-checked before serving</li>
                <li>• Custom orders welcome</li>
                <li>• Attention to every detail</li>
                <li>• Passion in every creation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Items */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12 font-bold">Our Signature Creations</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-2xl mb-3">Chocolate Fudge Cake</h3>
              <p className="text-gray-600 mb-2">
                Our most famous creation since 1995. Three layers of rich chocolate cake
                with silky fudge frosting made from Belgian chocolate.
              </p>
              <p className="text-[#D4A843] font-medium">Mama's Original Recipe</p>
            </div>

            <div className="text-center">
              <h3 className="text-2xl mb-3">Butter Croissants</h3>
              <p className="text-gray-600 mb-2">
                Hand-laminated with premium European butter. Each croissant takes
                three days to make, resulting in 27 perfect, flaky layers.
              </p>
              <p className="text-[#D4A843] font-medium">Traditional French Method</p>
            </div>

            <div className="text-center">
              <h3 className="text-2xl mb-3">Sourdough Bread</h3>
              <p className="text-gray-600 mb-2">
                Made with our 20-year-old starter culture. Slow-fermented for
                24 hours for complex flavor and perfect texture.
              </p>
              <p className="text-[#D4A843] font-medium">Award-Winning Recipe</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dietary Options */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6 font-bold">Dietary Accommodations</h2>
          <p className="text-xl text-gray-700 mb-8">
            We believe everyone should enjoy delicious baked goods. That's why we offer:
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl mb-2 font-medium">Gluten-Free Options</h3>
              <p className="text-gray-600">Select cakes, cookies, and breads available gluten-free</p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl mb-2 font-medium">Dairy-Free Options</h3>
              <p className="text-gray-600">Vegan cakes and pastries upon request</p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl mb-2 font-medium">Reduced Sugar</h3>
              <p className="text-gray-600">Lower-sugar alternatives available</p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl mb-2 font-medium">Nut-Free</h3>
              <p className="text-gray-600">We offer nut-free options and maintain a nut-free prep area</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
