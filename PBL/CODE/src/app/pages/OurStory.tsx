export default function OurStory() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1542200684142-9e7bf8ce104b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl text-white mb-4 font-bold">Our Story</h1>
          <p className="text-white text-xl">A journey of love, passion, and pastries</p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 font-bold">The Beginning</h2>
          </div>

          <div className="space-y-8 text-gray-700 text-lg leading-relaxed">
            <p>
              Mama & Co (formerly Fat Mama) began in 2020 during the height of the pandemic as a home-based baking concept. What started as a passion project by Teodoro "TJ" Lamang Jr. and his family—creating cakes and desserts—quickly transformed into a growing food business rooted in community and authenticity in Lipa City.
            </p>

            <p>
              Recognizing the need for accessibility and scalability, the business embraced a delivery-first ecosystem as a cloud kitchen, long before the model became mainstream. Our mission was simple: to serve not just food, but comfort—just like how Mama would.
            </p>

            <div className="bg-gray-50 p-8 rounded-lg my-8">
              <blockquote className="text-2xl italic text-center text-gray-800">
                "At Mama & Co, every dish, every cake, and every order is made with love, care, and intention."
              </blockquote>
              <p className="text-center mt-4 text-gray-600">— Teodoro "TJ" Lamang Jr., Founder</p>
            </div>

            <p>
              Today, Mama & Co stands as a hybrid, multi-brand food company that delivers both convenience and a physical dining experience. From a single oven at home, we have grown to include strategic partnerships and multiple concepts like Ben & Mama, Tikim Takam, and Urbanica.
            </p>

            <p>
              We carry forward the same warmth of a family table, reminding every customer that they are cared for, whether the food is delivered to their doorstep or shared in our space.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12 font-bold">Our Journey</h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="bg-[#D4A843] text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-xl flex-shrink-0">
                2020
              </div>
              <div>
                <h3 className="text-2xl mb-2">The First Recipe</h3>
                <p className="text-gray-600">
                  Mama & Co begins as a home-based baking concept known as Fat Mama, launching with foil cakes and dream cakes.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-[#D4A843] text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-xl flex-shrink-0">
                2022
              </div>
              <div>
                <h3 className="text-2xl mb-2">Ecosystem Expansion</h3>
                <p className="text-gray-600">
                  The company formally builds a multi-brand cloud kitchen system and launches the comfort food concept, Ben & Mama.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-[#D4A843] text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-xl flex-shrink-0">
                2023
              </div>
              <div>
                <h3 className="text-2xl mb-2">Portfolio Growth</h3>
                <p className="text-gray-600">
                  Mama & Co introduces 15th Street Kitchen, further strengthening its position as a scalable cloud kitchen operator.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-[#D4A843] text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-xl flex-shrink-0">
                2024
              </div>
              <div>
                <h3 className="text-2xl mb-2">First Physical Experience</h3>
                <p className="text-gray-600">
                  The brand evolves by opening its first dine-in restaurant under Ben & Mama, offering a hybrid food experience.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-[#D4A843] text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-xl flex-shrink-0">
                Today
              </div>
              <div>
                <h3 className="text-2xl mb-2">Multi-Brand Company</h3>
                <p className="text-gray-600">
                  Continuing to grow and create accessible, comforting, and meaningful food experiences across platforms and physical spaces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12 font-bold">Our Values</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-2xl mb-3">Love & Care</h3>
              <p className="text-gray-600">
                Every brand, every kitchen, and every experience reflects warmth, resilience, and genuine care.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-2xl mb-3">Quality First</h3>
              <p className="text-gray-600">
                We maintain an unwavering commitment to quality and service, adapting quickly to meet real-time cravings and expectations.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-2xl mb-3">Community</h3>
              <p className="text-gray-600">
                We aspire to be a home for many, bringing people closer through food that feels familiar, heartfelt, and sincere.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
