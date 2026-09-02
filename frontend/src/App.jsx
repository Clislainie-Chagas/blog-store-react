import { useState, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import Toast from "./components/ui/Toast";

export default function App() {

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");

    return savedFavorites
      ? JSON.parse(savedFavorites)
      : [];
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");

    return savedCart
      ? JSON.parse(savedCart)
      : [];
  });

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

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const productAlreadyInCart = currentCart.find(
        (item) => item.id === product.id
      );

      if (productAlreadyInCart) {
        if (productAlreadyInCart.quantity >= product.stock) {
          showToast(
            "Quantidade máxima disponível em estoque.",
            "warning"
          );

          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? {
              ...item,
              quantity: item.quantity + 1,
            }
            : item
        );
      }

      if (product.stock <= 0) {
        return currentCart;
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };
  const increaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        if (item.quantity >= item.stock) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) => {
      const product = currentCart.find(
        (item) => item.id === productId
      );

      if (!product) {
        return currentCart;
      }

      if (product.quantity === 1) {
        showToast(
          "Produto removido do carrinho.",
          "warning"
        );

        return currentCart.filter(
          (item) => item.id !== productId
        );
      }

      return currentCart.map((item) =>
        item.id === productId
          ? {
            ...item,
            quantity: item.quantity - 1,
          }
          : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) => {
      const updatedCart = currentCart.filter(
        (item) => item.id !== productId
      );

      showToast(
        "Produto removido do carrinho.",
        "warning"
      );

      return updatedCart;
    });
  };

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        message: "",
        type: "success",
      });
    }, 2500);
  };

  return (
    <>
      <AppRoutes
        favorites={favorites}
        onFavorite={handleFavorite}
        cart={cart}
        onAddToCart={addToCart}
        onIncreaseQuantity={increaseQuantity}
        onDecreaseQuantity={decreaseQuantity}
        onRemoveFromCart={removeFromCart}
      />

      <Toast
        message={toast.message}
        type={toast.type}
      />
    </>
  );
}