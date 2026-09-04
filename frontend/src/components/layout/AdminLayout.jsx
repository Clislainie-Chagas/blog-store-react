import { Link, useNavigate } from "react-router-dom";

function AdminLayout({ children }) {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
    }

    return (
        <div className="min-h-screen text-white">
            <header className="border-b border-white/10 bg-slate-950/80">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="font-semibold text-violet-300">
                            Painel Administrativo
                        </p>
                    </div>

                    <nav className="flex items-center gap-5">
                        <Link
                            to="/admin/products"
                            className="text-sm text-slate-300 transition hover:text-white"
                        >
                            Produtos
                        </Link>

                        <Link
                            to="/admin/orders"
                            className="text-sm text-slate-300 transition hover:text-white"
                        >
                            Pedidos
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                        >
                            Sair
                        </button>
                    </nav>
                </div>
            </header>

            {children}
        </div>
    );
}

export default AdminLayout;