
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './services/cartContext';
import { WishlistProvider } from './services/wishlistContext';
import { AuthProvider } from './services/authContext';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { Login } from './pages/Login';
import { Account } from './pages/Account';
import { Services } from './pages/Services';
import { Success } from './pages/Success';

import { EmailConfirmation } from './pages/EmailConfirmation';
import { ResetPassword } from './pages/ResetPassword';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/services" element={<Services />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/login" element={<Login />} />
              <Route path="/connect/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/connect/reset-password" element={<ResetPassword />} />
              <Route path="/account" element={<Account />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
            </Routes>
          </HashRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
