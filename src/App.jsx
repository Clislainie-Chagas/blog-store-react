import { useState, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");

    return savedFavorites
      ? JSON.parse(savedFavorites)
      : [];
  });

  const [cart, setCart] = useState([]);

  const handleFavorite = (book) => {
    setFavorites((currentFavorites) => {
      const alreadyFavorite = currentFavorites.some(
        (favorite) => favorite.id === book.id
      );

      if (alreadyFavorite) {
        return currentFavorites.filter(
          (favorite) => favorite.id !== book.id
        );
      }

      return [...currentFavorites, book];
    });
  };

  useEffect(() => {
    localStorage.setItem(
      "favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  const addToCart = (book) => {
    setCart((currentCart) => {
      const bookAlreadyInCart = currentCart.find(
        (item) => item.id === book.id
      );

      if (bookAlreadyInCart) {
        return currentCart.map((item) =>
          item.id === book.id
            ? {
              ...item,
              quantity: item.quantity + 1,
            }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...book,
          quantity: 1,
        },
      ];
    });
  };

  return (
    <AppRoutes
      favorites={favorites}
      onFavorite={handleFavorite}
      cart={cart}
      onAddToCart={addToCart}
    />
  );
}