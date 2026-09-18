import { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard";

const API_URL = import.meta.env.VITE_API_URL;

export default function Store({
    onAddToCart,
}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
    // Categoria selecionada
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Cria a lista de categorias sem repetir
    const categories = [
        "Todos",
        ...new Set(
            products.map((product) => product.category)
        ),
    ];

    // Filtra os produtos
    const filteredProducts =
        selectedCategory === "Todos"
            ? products
            : products.filter(
                (product) =>
                    product.category === selectedCategory
            );

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

                {loading && (
                    <p className="mb-10 text-slate-400">
                        Carregando produtos...
                    </p>
                )}

                {error && (
                    <p className="mb-10 text-red-400">
                        {error}
                    </p>
                )}

                {/* FILTROS */}
                {!loading && !error && (
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
                )}

                {/* PRODUTOS */}
                {!loading && !error && (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product) => (
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
                )}
            </section>

        </main>
    );
}