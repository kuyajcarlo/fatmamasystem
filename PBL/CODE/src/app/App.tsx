import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { InquiryProvider } from './context/InquiryContext';
import { ProductProvider } from './context/ProductContext';
import { CakeDesignProvider } from './context/CakeDesignContext';

export default function App() {
  return (
    <PrivacyProvider>
      <AuthProvider>
        <ProductProvider>
          <CakeDesignProvider>
            <DeliveryProvider>
              <OrderProvider>
                <InquiryProvider>
                  <CartProvider>
                    <RouterProvider router={router} />
                  </CartProvider>
                </InquiryProvider>
              </OrderProvider>
            </DeliveryProvider>
          </CakeDesignProvider>
        </ProductProvider>
      </AuthProvider>
    </PrivacyProvider>
  );
}