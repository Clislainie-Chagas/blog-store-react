import { useEffect, useState } from "react";

import ProductCard from "./components/ProductCard";

const API_URL = import.meta.env.VITE_API_URL;

export default function Store({
    onAddToCart,
}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("default");

    useEffect(() => {
        fetch(`${API_URL}/products/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erro ao buscar produtos");
                }

                return response.json();
            })
            .then((data) => {
                setProducts(data);
            })
            .catch((error) => {
                console.error("Erro ao buscar produtos:", error);
                setError("Não foi possível carregar os produtos.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Somente produtos físicos pertencem à Loja
    const physicalProducts = products.filter(
        (product) => product.product_type === "physical"
    );

    // Categorias somente dos produtos físicos
    const categories = [
        "Todos",
        ...new Set(
            physicalProducts.map((product) => product.category)
        ),
    ];

    // Filtra os produtos físicos pela categoria selecionada
    const filteredProducts = physicalProducts.filter((product) => {
        const matchesCategory =
            selectedCategory === "Todos" ||
            product.category === selectedCategory;

        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            product.name?.toLowerCase().includes(search) ||
            product.description?.toLowerCase().includes(search) ||
            product.category?.toLowerCase().includes(search);

        return matchesCategory && matchesSearch;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOrder === "price-low") {
            return Number(a.price) - Number(b.price);
        }

        if (sortOrder === "price-high") {
            return Number(b.price) - Number(a.price);
        }

        if (sortOrder === "name") {
            return a.name.localeCompare(b.name, "pt-BR");
        }

        return 0;
    });

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <section className="mx-auto max-w-7xl">

                {/* CABEÇALHO */}
                <div className="mb-12">
                    <span className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
                        Arte da Magia
                    </span>

                    <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                        Loja
                    </h1>

                    <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                        Produtos selecionados para acompanhar suas histórias,
                        estudos e jornadas pelo universo da Arte da Magia.
                    </p>
                </div>

                {/* CARREGAMENTO */}
                {loading && (
                    <p className="mb-10 text-slate-400">
                        Carregando produtos...
                    </p>
                )}

                {/* ERRO */}
                {error && (
                    <p className="mb-10 text-red-400">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <>

                        {/* BUSCA */}
                        <div className="mb-8">
                            <div className="relative max-w-xl">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Buscar produtos..."
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:bg-white/10"
                                />

                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                                    🔍
                                </span>
                            </div>
                        </div>

                        {/* FILTROS */}
                        <div className="mb-10 flex flex-wrap gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() =>
                                        setSelectedCategory(category)
                                    }
                                    className={`rounded-full px-5 py-2 text-sm font-medium transition ${selectedCategory === category
                                        ? "bg-violet-600 text-white"
                                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* CONTADOR E ORDENAÇÃO */}
                        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-400">
                                {sortedProducts.length === 1
                                    ? "1 produto encontrado"
                                    : `${sortedProducts.length} produtos encontrados`}
                            </p>

                            <select
                                value={sortOrder}
                                onChange={(event) => setSortOrder(event.target.value)}
                                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-violet-500"
                            >
                                <option value="default">Ordenar por</option>
                                <option value="price-low">Menor preço</option>
                                <option value="price-high">Maior preço</option>
                                <option value="name">Nome A–Z</option>
                            </select>
                        </div>

                        {/* PRODUTOS FÍSICOS */}
                        {sortedProducts.length > 0 ? (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {sortedProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        name={product.name}
                                        category={product.category}
                                        price={product.price}
                                        image={product.image}
                                        description={product.description}
                                        stock={product.stock}
                                        onAddToCart={() =>
                                            onAddToCart(product)
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                                <p className="text-slate-400">
                                    Nenhum produto disponível nesta categoria.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
