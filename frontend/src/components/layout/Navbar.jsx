import { Link, NavLink } from "react-router-dom";
import SearchBar from "../ui/SearchBar";
import { Heart, ShoppingCart } from "lucide-react";

export default function Navbar({
    favorites = [],
    cart = [],
}) {
    const cartQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                <NavLink
                    to="/"
                    className="text-2xl font-bold tracking-wide text-white"
                >
                    {" "}
                    <span className="bg-linear-to-r from-violet-400 via-pink-300 to-blue-200 bg-clip-text text-transparent">
                        <strong>ARTE DA MAGIA</strong>
                    </span>
                    {/* <span className="bg-gradient-to-r from-violet-400 via-blue-300 to-pink-300 bg-clip-text text-transparent">
                        <strong>ARTE DA MAGIA</strong>
                    </span> */}
                </NavLink>

                <SearchBar />
                <div className="flex items-center gap-8"></div>

                <div className="flex items-center gap-8">

                    <NavLink to="/">
                        Página Inicial
                    </NavLink>

                    <NavLink to="/blog">
                        Blog
                    </NavLink>

                    <NavLink to="/store">
                        Loja
                    </NavLink>

                    <NavLink to="/about">
                        Sobre
                    </NavLink>

                    <NavLink to="/contact">
                        Contato
                    </NavLink>
                    <Link
                        to="/favorites"
                        className="relative flex items-center justify-center text-slate-300 transition hover:text-pink-400"
                        aria-label={`Favoritos: ${favorites.length}`}
                    >
                        <Heart size={22} />

                        {favorites.length > 0 && (
                            <span
                                className="
                                    absolute
                                    -right-3
                                    -top-3
                                    flex
                                    h-5
                                    min-w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-violet-500
                                    px-1
                                    text-xs
                                    font-bold
                                    text-white
                                "
                            >{favorites.length} </span>
                        )}
                    </Link>

                    <Link
                        to="/cart"
                        className="relative flex items-center justify-center text-slate-300 transition hover:text-violet-300"
                        aria-label={`Carrinho: ${cartQuantity} itens`}
                    >
                        <ShoppingCart size={22} />

                        {cartQuantity > 0 && (
                            <span
                                className="
                                    absolute
                                    -right-3
                                    -top-3
                                    flex
                                    h-5
                                    min-w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-violet-500
                                    px-1
                                    text-xs
                                    font-bold
                                    text-white
                                "
                            >{cartQuantity}
                            </span>
                        )}
                    </Link>

                </div>

            </nav>
        </header>
    );
}