import { ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";


export default function Navbar() {
    return (
        <nav className="bg-slate-900 text-white px-6 py-4">

            <div className="max-w-7xl mx-auto flex items-center justify-between">

                <Link
                    to="/"
                    className="text-2xl font-bold">
                    ARTE DA<br />
                    <span className="text-4xl">MAGIA</span>
                </Link>


                <div className="flex items-center gap-6">

                    <Link
                        to="/"
                        className="hover:text-blue-300"
                    >
                        Home
                    </Link>

                    <Link
                        to="/blog"
                        className="hover:text-blue-300"
                    >
                        Blog
                    </Link>

                    <Link
                        to="/store"
                        className="hover:text-blue-300"
                    >
                        Loja
                    </Link>

                    <Link
                        to="/about"
                        className="hover:text-blue-300"
                    >
                        Sobre
                    </Link>

                    <Link
                        to="/contact"
                        className="hover:text-blue-300"
                    >
                        Contato
                    </Link>


                    <button className="hover:text-blue-300">
                        <ShoppingCart />
                    </button>


                    <button className="hover:text-blue-300">
                        <User />
                    </button>

                </div>

            </div>

        </nav>
    );
}