import { useEffect, useState } from "react";

import WebsiteTemplateCard from "../Store/components/WebsiteTemplateCard";

const API_URL = import.meta.env.VITE_API_URL;

export default function Websites({
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
                const websiteTemplates = data.filter(
                    (product) =>
                        product.product_type === "website_template"
                );

                setWebsites(websiteTemplates);
            })
            .catch((error) => {
                console.error("Erro ao buscar sites:", error);
                setError(
                    "Não foi possível carregar os sites no momento."
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <section className="mx-auto max-w-7xl">

                {/* CABEÇALHO */}
                <div className="mb-12">
                    <span className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
                        Criação Digital
                    </span>

                    <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                        Sites Prontos
                    </h1>

                    <p className="mt-4 max-w-3xl leading-7 text-slate-400">
                        Escolha um modelo de site profissional e personalize
                        com sua marca, textos, imagens e informações.
                    </p>
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
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                        <p className="text-slate-400">
                            Nenhum modelo de site disponível no momento.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}