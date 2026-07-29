import { NavLink } from "react-router-dom";
import SearchBar from "../ui/SearchBar";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                <NavLink
                    to="/"
                    className="text-2xl font-bold tracking-wide text-white"
                >
                    {" "}
                    <span className="bg-gradient-to-r from-violet-400 via-blue-300 to-pink-300 bg-clip-text text-transparent">
                        <strong>ARTE DA MAGIA</strong>
                    </span>
                </NavLink>

                <SearchBar />
                <div className="flex items-center gap-8"></div>



                <div className="flex items-center gap-8">

                    <NavLink to="/">
                        Home
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

                </div>

            </nav>
        </header>
    );
}