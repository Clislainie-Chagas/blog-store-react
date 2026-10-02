import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    useEffect(() => {
        fetch(`${API_URL}/blog/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erro ao buscar artigos");
                }

                return response.json();
            })
            .then((data) => {
                setPosts(data);
            })
            .catch((error) => {
                console.error("Erro ao buscar artigos:", error);
                setMessage("Não foi possível carregar os artigos.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const categories = [
        "Todos",
        ...new Set(
            posts
                .map((post) => post.category)
                .filter(Boolean)
        ),
    ];

    const filteredPosts =
        selectedCategory === "Todos"
            ? posts
            : posts.filter(
                (post) => post.category === selectedCategory
            );

    return (
        <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-16">
            <section className="mx-auto max-w-6xl">

                {/* HERO DO BLOG */}
                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        border
                        border-violet-400/20
                        bg-gradient-to-br
                        from-violet-950/70
                        via-slate-950/80
                        to-fuchsia-950/40
                        px-6
                        py-12
                        shadow-2xl
                        shadow-violet-950/20
                        sm:px-10
                        sm:py-16
                        md:px-14
                        md:py-20
                    "
                >
                    {/* EFEITOS DE LUZ */}
                    <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

                    {/* CONTEÚDO */}
                    <div className="relative z-10 max-w-3xl">

                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-300 sm:text-sm">
                            Arte da Magia
                        </span>

                        <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                            Blog
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                            Conhecimento, espiritualidade e magia para transformar
                            sua jornada e ampliar sua conexão com o universo.
                        </p>

                        {/* TEMAS */}
                        <div className="mt-8 flex flex-wrap gap-3">
                            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
                                ✦ Espiritualidade
                            </span>

                            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
                                ✦ Magia
                            </span>

                            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
                                ✦ Autoconhecimento
                            </span>
                        </div>
                    </div>
                </div>

                {/* ARTIGOS */}
                <div className="mt-12 sm:mt-16">

                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
                                Conteúdos
                            </span>

                            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                                Artigos recentes
                            </h2>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                                Explore os conteúdos mais recentes do universo
                                Arte da Magia.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => setSelectedCategory(category)}
                                        className={`
                rounded-full
                border
                px-4
                py-2
                text-sm
                font-medium
                transition
                ${selectedCategory === category
                                                ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                                                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-violet-400/30 hover:text-violet-200"
                                            }
            `}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {message && (
                        <p className="mt-8 text-red-400">
                            {message}
                        </p>
                    )}

                    {isLoading ? (
                        <p className="mt-10 text-slate-400">
                            Carregando artigos...
                        </p>
                    ) : posts.length === 0 ? (
                        <p className="mt-10 text-slate-400">
                            Nenhum artigo publicado no momento.
                        </p>
                    ) : filteredPosts.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
                            <p className="text-lg font-semibold text-white">
                                Nenhum artigo encontrado
                            </p>

                            <p className="mt-2 text-sm text-slate-400">
                                Ainda não existem artigos publicados nesta categoria.
                            </p>

                            <button
                                type="button"
                                onClick={() => setSelectedCategory("Todos")}
                                className="mt-5 text-sm font-semibold text-violet-300 transition hover:text-violet-200"
                            >
                                Ver todos os artigos →
                            </button>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">                            {filteredPosts.map((post) => (
                            <article
                                key={post.id}
                                className="
                                        group
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/[0.04]
                                        shadow-lg
                                        shadow-black/10
                                        transition
                                        duration-300
                                        hover:-translate-y-1
                                        hover:border-violet-400/30
                                        hover:bg-white/[0.06]
                                    "
                            >
                                <Link
                                    to={`/blog/${post.slug}`}
                                    className="flex h-full flex-col"
                                >
                                    {post.image_url && (
                                        <div className="overflow-hidden">
                                            <img
                                                src={
                                                    post.image_url?.startsWith("/uploads/")
                                                        ? `${API_URL}${post.image_url}`
                                                        : post.image_url
                                                }
                                                alt={post.title}
                                                loading="lazy"
                                                className="
                                                        h-48
                                                        w-full
                                                        object-cover
                                                        transition
                                                        duration-500
                                                        sm:h-52
                                                        group-hover:scale-105
                                                    "
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-1 flex-col p-5 sm:p-6">

                                        <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                                            {post.category}
                                        </span>

                                        <h3 className="mt-3 break-words text-xl font-bold leading-snug transition group-hover:text-violet-200 sm:text-2xl">
                                            {post.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-slate-400">
                                            {post.summary}
                                        </p>

                                        <span className="mt-auto inline-flex items-center pt-6 text-sm font-semibold text-violet-300 transition group-hover:text-violet-200">
                                            Ler artigo

                                            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                                                →
                                            </span>
                                        </span>
                                    </div>
                                </Link>
                            </article>
                        ))}
                        </div>
                    )}
                </div>

            </section>
        </main>
    );
}