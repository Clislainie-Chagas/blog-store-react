import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookDetails from "../pages/BookDetails";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import Blog from "../pages/Blog";
import Store from "../pages/Store";
import Websites from "../pages/Websites";
import WebsiteDetails from "../pages/WebsiteDetails";

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
import AdminOrders from "../pages/AdminOrders";
import AdminLayout from "../components/layout/AdminLayout";
import Payment from "../pages/Payment";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentFailure from "../pages/PaymentFailure";
import PaymentPending from "../pages/PaymentPending";
import AdminMessages from "../pages/AdminMessages";
import AdminBlog from "../pages/AdminBlog";
import BlogPost from "../pages/BlogPost";

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

                    <Route
                        path="/"
                        element={
                            <Home
                                favorites={favorites}
                                onFavorite={onFavorite}
                                onAddToCart={onAddToCart}
                            />
                        }
                    />

                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />


                    <Route path="/store" element={<Store onAddToCart={onAddToCart} />} />

                    <Route path="/sites" element={<Websites onAddToCart={onAddToCart} />} />
                    <Route path="/sites/:id" element={<WebsiteDetails onAddToCart={onAddToCart} />} />

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
                    <Route path="/payment/:orderId" element={<Payment />} />
                    <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />
                    <Route path="/payment/failure/:orderId" element={<PaymentFailure />} />
                    <Route path="/payment/pending/:orderId" element={<PaymentPending />} />

                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/products" element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <AdminProducts />
                            </AdminLayout>
                        </ProtectedRoute>
                    } />

                    <Route
                        path="/admin/orders"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <AdminOrders />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/messages"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <AdminMessages />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/blog"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <AdminBlog />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<NotFound />} />


                </Routes>
            </Layout>
        </BrowserRouter>
    );
}