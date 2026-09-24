import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../../../Store/components/ProductCard";

const API_URL = import.meta.env.VITE_API_URL;

export default function FeaturedProducts({
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
                const physicalProducts = data
                    .filter(
                        (product) =>
                            product.product_type === "physical"
                    )
                    .slice(0, 3);

                setProducts(physicalProducts);
            })
            .catch((error) => {
                console.error(
                    "Erro ao buscar produtos em destaque:",
                    error
                );

                setError(
                    "Não foi possível carregar os produtos."
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <section className="px-6 py-16 text-white">
            <div className="mx-auto max-w-7xl">

                {/* CABEÇALHO */}
                <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
                            Loja
                        </span>

                        <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                            Produtos em destaque
                        </h2>

                        <p className="mt-3 max-w-2xl text-slate-400">
                            Conheça alguns dos produtos disponíveis
                            na Arte da Magia.
                        </p>
                    </div>

                    <Link
                        to="/store"
                        className="font-semibold text-violet-300 transition hover:text-violet-200"
                    >
                        Ver todos os produtos →
                    </Link>
                </div>

                {/* CARREGAMENTO */}
                {loading && (
                    <p className="text-slate-400">
                        Carregando produtos...
                    </p>
                )}

                {/* ERRO */}
                {error && (
                    <p className="text-red-400">
                        {error}
                    </p>
                )}

                {/* PRODUTOS */}
                {!loading && !error && products.length > 0 && (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
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
            </div>
        </section>
    );
}