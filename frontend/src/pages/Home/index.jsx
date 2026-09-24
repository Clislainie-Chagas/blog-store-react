import Hero from "./components/Hero";
import FeaturedBooks from "./components/FeaturedBooks";
import FeaturedProducts from "./components/FeaturedProducts";
import FeaturedWebsites from "./components/FeaturedWebsites";
import { useState } from "react";

export default function Home({
    favorites,
    onFavorite,
    onAddToCart,
}) {
    const [search, setSearch] = useState("");

    return (
        <>
            <Hero
                search={search}
                setSearch={setSearch}
            />

            <FeaturedBooks
                search={search}
                favorites={favorites}
                onFavorite={onFavorite}
            />

            <FeaturedProducts
                onAddToCart={onAddToCart}
            />

            <FeaturedWebsites
                onAddToCart={onAddToCart}
            />
        </>
    );
}