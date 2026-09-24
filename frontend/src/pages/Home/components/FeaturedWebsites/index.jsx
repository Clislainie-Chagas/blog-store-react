import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import WebsiteTemplateCard from "../../../Store/components/WebsiteTemplateCard";

const API_URL = import.meta.env.VITE_API_URL;

export default function FeaturedWebsites({
    onAddToCart,
}) {
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/products/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erro ao buscar sites");
                }

                return response.json();
            })
            .then((data) => {
                const websiteTemplates = data
                    .filter(
                        (product) =>
                            product.product_type === "website_template"
                    )
                    .slice(0, 3);

                setWebsites(websiteTemplates);
            })
            .catch((error) => {
                console.error(
                    "Erro ao buscar sites em destaque:",
                    error
                );

                setError(
                    "Não foi possível carregar os sites."
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
                            Criação Digital
                        </span>

                        <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                            Sites em destaque
                        </h2>

                        <p className="mt-3 max-w-2xl text-slate-400">
                            Conheça alguns dos modelos de sites prontos
                            disponíveis para personalização.
                        </p>
                    </div>

                    <Link
                        to="/sites"
                        className="font-semibold text-violet-300 transition hover:text-violet-200"
                    >
                        Ver todos os sites →
                    </Link>
                </div>

                {/* CARREGAMENTO */}
                {loading && (
                    <p className="text-slate-400">
                        Carregando sites...
                    </p>
                )}

                {/* ERRO */}
                {error && (
                    <p className="text-red-400">
                        {error}
                    </p>
                )}

                {/* SITES */}
                {!loading && !error && websites.length > 0 && (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {websites.map((website) => (
                            <WebsiteTemplateCard
                                key={website.id}
                                id={website.id}
                                name={website.name}
                                category={website.category}
                                price={website.price}
                                image={website.image}
                                description={website.description}
                                onAddToCart={() =>
                                    onAddToCart(website)
                                }
                            />
                        ))}
                    </div>
                )}

                {/* NENHUM SITE */}
                {!loading && !error && websites.length === 0 && (
                    <p className="text-slate-400">
                        Nenhum site disponível no momento.
                    </p>
                )}
            </div>
        </section>
    );
}