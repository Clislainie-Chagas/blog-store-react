import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function WebsiteDetails({
    onAddToCart,
}) {
    const { id } = useParams();

    const [website, setWebsite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartMessage, setCartMessage] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/products/${id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Site não encontrado");
                }

                return response.json();
            })
            .then((data) => {
                if (data.product_type !== "website_template") {
                    throw new Error("Este item não é um site pronto");
                }

                setWebsite(data);
            })
            .catch((error) => {
                console.error("Erro ao buscar site:", error);
                setError("Não foi possível carregar este site.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    function handleAddToCart() {
        onAddToCart(website);

        setCartMessage(true);

        setTimeout(() => {
            setCartMessage(false);
        }, 3000);
    }

    if (loading) {
        return (
            <main className="min-h-screen px-6 py-16 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="text-slate-400">
                        Carregando site...
                    </p>
                </div>
            </main>
        );
    }

    if (error || !website) {
        return (
            <main className="min-h-screen px-6 py-16 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="text-red-400">
                        {error || "Site não encontrado."}
                    </p>

                    <Link
                        to="/sites"
                        className="mt-6 inline-block text-violet-300 hover:text-violet-200"
                    >
                        ← Voltar para Sites Prontos
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <section className="mx-auto max-w-7xl">

                {/* VOLTAR */}
                <Link
                    to="/sites"
                    className="text-sm font-medium text-violet-300 transition hover:text-violet-200"
                >
                    ← Voltar para Sites Prontos
                </Link>

                <div className="mt-8 grid gap-12 lg:grid-cols-2">

                    {/* PREVIEW */}
                    <div>
                        <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-slate-900">
                            {website.image ? (
                                <img
                                    src={website.image}
                                    alt={`Preview do site ${website.name}`}
                                    className="aspect-video w-full object-cover"
                                />
                            ) : (
                                <div className="flex aspect-video items-center justify-center bg-linear-to-br from-slate-900 to-violet-950">
                                    <span className="text-slate-500">
                                        Preview do site
                                    </span>
                                </div>
                            )}

                            <span className="absolute left-5 top-5 rounded-full border border-violet-300/20 bg-slate-950/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-violet-200 backdrop-blur">
                                Site pronto
                            </span>
                        </div>
                    </div>

                    {/* INFORMAÇÕES */}
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
                            {website.category}
                        </span>

                        <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                            {website.name}
                        </h1>

                        <p className="mt-6 leading-7 text-slate-400">
                            {website.description}
                        </p>

                        {/* CARACTERÍSTICAS */}
                        <div className="mt-8 flex flex-wrap gap-3">
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                                Editável
                            </span>

                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                                Responsivo
                            </span>

                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                                Código incluído
                            </span>
                        </div>

                        {/* PREÇO */}
                        <div className="mt-8 border-t border-white/10 pt-8">
                            <p className="text-sm uppercase tracking-wider text-slate-500">
                                Site completo
                            </p>

                            <p className="mt-2 text-4xl font-bold">
                                {Number(website.price).toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency: "BRL",
                                    }
                                )}
                            </p>
                        </div>

                        {/* COMPRA */}
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className="mt-8 w-full rounded-xl bg-violet-600 px-6 py-4 font-semibold text-white transition hover:bg-violet-500"
                        >
                            Comprar este site
                        </button>

                        {cartMessage && (
                            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                <p className="text-sm font-medium text-emerald-300">
                                    Site adicionado ao carrinho!
                                </p>

                                <Link
                                    to="/cart"
                                    className="mt-3 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
                                >
                                    Ver carrinho
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}