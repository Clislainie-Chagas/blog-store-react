import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookDetails from "../pages/BookDetails";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import Blog from "../pages/Blog";
import Store from "../pages/Store";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import Favorites from "../pages/Favorites";
import Cart from "../pages/Cart";
import ProductDetails from "../pages/ProductDetails";
import Checkout from "../pages/Checkout";
import AdminProducts from "../pages/AdminProducts";
import AdminLogin from "../pages/AdminLogin";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes({
    favorites,
    onFavorite,
    cart,
    onAddToCart,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveFromCart,
}) {
    return (
        <BrowserRouter>
            <Layout favorites={favorites} onFavorite={onFavorite} cart={cart}>
                <Routes>

                    <Route path="/" element={<Home
                        favorites={favorites} onFavorite={onFavorite} />} />

                    <Route path="/blog" element={<Blog />} />
                    <Route path="/store" element={<Store onAddToCart={onAddToCart} />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />

                    <Route path="/books/:id" element={<BookDetails
                        favorites={favorites} onFavorite={onFavorite} />} />

                    <Route path="/store/:id" element={<ProductDetails
                        onAddToCart={onAddToCart} />} />

                    <Route path="/favorites" element={<Favorites
                        favorites={favorites} onFavorite={onFavorite} />} />

                    <Route path="/cart" element={<Cart
                        cart={cart}
                        onIncreaseQuantity={onIncreaseQuantity}
                        onDecreaseQuantity={onDecreaseQuantity}
                        onRemoveFromCart={onRemoveFromCart}
                    />} />

                    <Route path="/checkout" element={<Checkout cart={cart} />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/products" element={
                        <ProtectedRoute>
                            <AdminProducts />
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<NotFound />} />


                </Routes>
            </Layout>
        </BrowserRouter>
    );
}