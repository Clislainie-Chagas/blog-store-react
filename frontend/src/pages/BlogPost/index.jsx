import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogPost() {
    const { slug } = useParams();

    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [relatedPosts, setRelatedPosts] = useState([]);

    useEffect(() => {
        let currentPost = null;

        fetch(`${API_URL}/blog/${slug}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Artigo não encontrado");
                }

                return response.json();
            })
            .then((data) => {
                currentPost = data;
                setPost(data);

                return fetch(`${API_URL}/blog/`);
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        "Não foi possível carregar os artigos relacionados"
                    );
                }

                return response.json();
            })
            .then((posts) => {
                const otherPosts = posts.filter(
                    (item) => item.slug !== slug
                );

                const sameCategory = otherPosts.filter(
                    (item) => item.category === currentPost.category
                );

                const otherCategories = otherPosts.filter(
                    (item) => item.category !== currentPost.category
                );

                const related = [
                    ...sameCategory,
                    ...otherCategories,
                ].slice(0, 3);

                setRelatedPosts(related);
            })
            .catch((error) => {
                console.error("Erro ao buscar artigo:", error);

                setMessage(
                    "Não foi possível carregar este artigo."
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [slug]);

    if (isLoading) {
        return (
            <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-16">
                <div className="mx-auto max-w-4xl">
                    <p className="text-slate-400">
                        Carregando artigo...
                    </p>
                </div>
            </main>
        );
    }

    if (message || !post) {
        return (
            <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-16">
                <div className="mx-auto max-w-4xl">
                    <p className="text-red-400">
                        {message || "Artigo não encontrado."}
                    </p>

                    <Link
                        to="/blog"
                        className="mt-6 inline-block text-violet-300 transition hover:text-violet-200"
                    >
                        ← Voltar para o Blog
                    </Link>
                </div>
            </main>
        );
    }

    const formattedDate = post.created_at
        ? new Date(post.created_at).toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        )
        : "";

    return (
        <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-16">
            <div className="mx-auto max-w-7xl">

                <Link
                    to="/blog"
                    className="text-sm font-medium text-violet-300 transition hover:text-violet-200"
                >
                    ← Voltar para o Blog
                </Link>

                <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] sm:mt-10">

                    {/* ARTIGO PRINCIPAL */}
                    <article
                        className="
                        min-w-0
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        shadow-xl
                        shadow-black/20
                        sm:rounded-3xl
                    "
                    >
                        <div className="px-5 py-7 sm:px-8 sm:py-10 md:px-12">

                            <header>
                                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
                                    {post.category}
                                </span>

                                <h1 className="mt-4 break-words text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                                    {post.title}
                                </h1>

                                {formattedDate && (
                                    <p className="mt-5 text-sm text-slate-400">
                                        Publicado em {formattedDate}
                                    </p>
                                )}

                                <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                                    {post.summary}
                                </p>
                            </header>

                            {post.image_url && (
                                <img
                                    src={
                                        post.image_url?.startsWith("/uploads/")
                                            ? `${API_URL}${post.image_url}`
                                            : post.image_url
                                    }
                                    alt={post.title}
                                    className="mt-8 h-auto max-h-[520px] w-full rounded-2xl object-cover sm:mt-10 sm:rounded-3xl"
                                />
                            )}

                            <div className="mt-10 border-t border-white/10 pt-8 sm:mt-12 sm:pt-10">
                                <ReactMarkdown
                                    components={{
                                        h2: ({ children }) => (
                                            <h2 className="mb-4 mt-8 break-words text-2xl font-bold leading-tight text-white sm:mb-5 sm:mt-10 sm:text-3xl">
                                                {children}
                                            </h2>
                                        ),

                                        h3: ({ children }) => (
                                            <h3 className="mb-3 mt-7 break-words text-xl font-semibold leading-snug text-violet-200 sm:mb-4 sm:mt-8 sm:text-2xl">
                                                {children}
                                            </h3>
                                        ),

                                        p: ({ children }) => (
                                            <p className="mb-5 text-base leading-7 text-slate-300 sm:mb-6 sm:text-lg sm:leading-8">
                                                {children}
                                            </p>
                                        ),

                                        strong: ({ children }) => (
                                            <strong className="font-bold text-white">
                                                {children}
                                            </strong>
                                        ),

                                        em: ({ children }) => (
                                            <em className="italic text-violet-200">
                                                {children}
                                            </em>
                                        ),

                                        ul: ({ children }) => (
                                            <ul className="mb-6 ml-5 list-disc space-y-2 text-base text-slate-300 sm:mb-7 sm:ml-6 sm:text-lg">
                                                {children}
                                            </ul>
                                        ),

                                        ol: ({ children }) => (
                                            <ol className="mb-6 ml-5 list-decimal space-y-2 text-base text-slate-300 sm:mb-7 sm:ml-6 sm:text-lg">
                                                {children}
                                            </ol>
                                        ),

                                        li: ({ children }) => (
                                            <li className="pl-2 leading-8 sm:pl-3 sm:leading-9">
                                                {children}
                                            </li>
                                        ),

                                        blockquote: ({ children }) => (
                                            <blockquote className="my-6 rounded-r-xl border-l-4 border-violet-400 bg-violet-500/10 px-4 py-4 italic leading-7 text-slate-300 sm:my-8 sm:px-6">
                                                {children}
                                            </blockquote>
                                        ),

                                        a: ({ href, children }) => (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-violet-300 underline decoration-violet-400/50 underline-offset-4 transition hover:text-violet-200"
                                            >
                                                {children}
                                            </a>
                                        ),

                                        img: ({ src, alt }) => {
                                            const imageSrc = src?.startsWith("/uploads/")
                                                ? `${API_URL}${src}`
                                                : src;

                                            return (
                                                <img
                                                    src={imageSrc}
                                                    alt={alt || "Imagem do artigo"}
                                                    loading="lazy"
                                                    className="my-8 h-auto max-h-[650px] w-full rounded-2xl object-cover shadow-lg sm:my-10 sm:rounded-3xl"
                                                />
                                            );
                                        },
                                    }}
                                >
                                    {post.content}
                                </ReactMarkdown>

                                <div
                                    className="
        my-8
        flex
        min-h-[120px]
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-white/10
        bg-white/[0.02]
        px-5
        py-6
        text-center
        sm:my-10
    "
                                >
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Publicidade
                                        </p>

                                        <p className="mt-2 text-xs text-slate-600">
                                            Espaço reservado para anúncio
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </article>

                    {/* LEIA TAMBÉM */}
                    {relatedPosts.length > 0 && (
                        <aside className="lg:sticky lg:top-24">

                            <h2 className="mb-5 text-2xl font-bold text-white">
                                Leia também
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                                {relatedPosts.map((relatedPost) => (
                                    <Link
                                        key={relatedPost.id}
                                        to={`/blog/${relatedPost.slug}`}
                                        className="
                                        group
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/[0.04]
                                        transition
                                        duration-300
                                        hover:-translate-y-1
                                        hover:border-violet-400/30
                                        hover:bg-white/[0.06]
                                    "
                                    >
                                        {relatedPost.image_url && (
                                            <div className="overflow-hidden">
                                                <img
                                                    src={
                                                        relatedPost.image_url?.startsWith("/uploads/")
                                                            ? `${API_URL}${relatedPost.image_url}`
                                                            : relatedPost.image_url
                                                    }
                                                    alt={relatedPost.title}
                                                    loading="lazy"
                                                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}

                                        <div className="p-5">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                                                {relatedPost.category}
                                            </span>

                                            <h3 className="mt-2 break-words text-lg font-bold leading-snug text-white transition group-hover:text-violet-200">
                                                {relatedPost.title}
                                            </h3>

                                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                                                {relatedPost.summary}
                                            </p>

                                            <span className="mt-4 inline-flex text-sm font-semibold text-violet-300 transition group-hover:text-violet-200">
                                                Ler artigo
                                                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                                                    →
                                                </span>
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <div
                                className="
        mt-6
        hidden
        min-h-[250px]
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-white/10
        bg-white/[0.02]
        px-5
        py-8
        text-center
        lg:flex
    "
                            >
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Publicidade
                                    </p>

                                    <p className="mt-2 text-xs text-slate-600">
                                        Espaço reservado para anúncio
                                    </p>
                                </div>
                            </div>

                        </aside>
                    )}

                </div>
            </div>
        </main>
    );
}