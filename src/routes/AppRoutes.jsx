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

export default function AppRoutes({
    favorites,
    onFavorite,
}) {
    return (
        <BrowserRouter>
            <Layout favorites={favorites} onFavorite={onFavorite}>
                <Routes>

                    <Route
                        path="/"
                        element={
                            <Home
                                favorites={favorites}
                                onFavorite={onFavorite}
                            />
                        }
                    />

                    <Route path="/blog" element={<Blog />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />

                    <Route
                        path="/books/:id"
                        element={
                            <BookDetails
                                favorites={favorites}
                                onFavorite={onFavorite}
                            />
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <Favorites
                                favorites={favorites}
                                onFavorite={onFavorite}
                            />
                        }
                    />
                    <Route path="*" element={<NotFound />} />


                </Routes>
            </Layout>
        </BrowserRouter>
    );
}