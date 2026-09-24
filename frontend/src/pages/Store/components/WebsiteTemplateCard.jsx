import { Link } from "react-router-dom";
import { useState } from "react";

export default function WebsiteTemplateCard({
    id,
    name,
    category,
    price,
    image,
    description,
    onAddToCart,
}) {
    const [cartMessage, setCartMessage] = useState(false);

    function handleAddToCart() {
        onAddToCart();

        setCartMessage(true);

        setTimeout(() => {
            setCartMessage(false);
        }, 3000);
    }

    return (
        <article className="group overflow-hidden rounded-3xl border border-violet-400/20 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:shadow-2xl hover:shadow-violet-950/30">

            {/* PREVIEW DO SITE */}
            <div className="relative aspect-video overflow-hidden bg-slate-900">
                {image ? (
                    <img
                        src={image}
                        alt={`Preview do site ${name}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-900 to-violet-950">
                        <span className="text-sm text-slate-500">
                            Preview do site
                        </span>
                    </div>
                )}

                {/* SELO */}
                <span className="absolute left-4 top-4 rounded-full border border-violet-300/20 bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-200 backdrop-blur">
                    Site pronto
                </span>
            </div>

            {/* CONTEÚDO */}
            <div className="p-6">
                <span className="text-sm font-medium text-violet-300">
                    {category}
                </span>

                <h3 className="mt-2 text-2xl font-bold text-white">
                    {name}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                    {description}
                </p>

                {/* BENEFÍCIOS */}
                <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        Editável
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        Responsivo
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        Código incluído
                    </span>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                        Site completo
                    </p>

                    <p className="mt-1 text-3xl font-bold text-white">
                        {Number(price).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        })}
                    </p>
                </div>

                {/* BOTÃO DE DETALHES */}
                <Link
                    to={`/sites/${id}`}
                    className="mt-6 flex w-full items-center justify-center rounded-xl border border-violet-400/30 px-5 py-3 font-semibold text-violet-200 transition hover:bg-violet-500/10"
                >
                    Ver detalhes do site
                </Link>

                {/* BOTÃO DE COMPRA */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-3 w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500"
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
        </article>
    );
}