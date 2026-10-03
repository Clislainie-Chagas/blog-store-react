import { Link } from "react-router-dom";
import { useState } from "react";
export default function ProductCard({
    id,
    name,
    category,
    price,
    image,
    description,
    stock,
    onAddToCart,
}) {
    const [cartMessage, setCartMessage] = useState(false);

    // function handleAddToCart() {
    //     onAddToCart({ id, name, price, image });
    //     setCartMessage(true);

    //     setTimeout(() => {
    //         setCartMessage(false);
    //     }, 3000);
    // }
    // const [cartMessage, setCartMessage] = useState(false);

    function handleAddToCart() {
        onAddToCart();

        setCartMessage(true);

        setTimeout(() => {
            setCartMessage(false);
        }, 3000);
    }

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-xl hover:shadow-violet-950/20">
            {/* IMAGEM */}
            {/* IMAGEM */}
            <Link
                to={`/store/${id}`}
                className="block aspect-square overflow-hidden bg-slate-900"
            >
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
            </Link>

            {/* INFORMAÇÕES */}
            <div className="flex flex-1 flex-col p-6">

                <span className="text-sm font-medium text-violet-300">
                    {category}
                </span>

                <h2 className="mt-2 text-xl font-semibold text-white">
                    {name}
                </h2>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                    {description}
                </p>

                <div className="mt-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Preço
                    </p>

                    <p className="mt-1 text-2xl font-bold text-white">
                        {Number(price).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        })}
                    </p>
                </div>

                <div className="mt-3">
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stock === 0
                            ? "bg-red-500/10 text-red-300"
                            : stock <= 3
                                ? "bg-amber-500/10 text-amber-300"
                                : "bg-emerald-500/10 text-emerald-300"
                            }`}
                    >
                        {stock === 0
                            ? "Produto esgotado"
                            : stock === 1
                                ? "Última unidade"
                                : stock <= 3
                                    ? `Últimas ${stock} unidades`
                                    : "Em estoque"}
                    </span>
                </div>

                <div className="mt-auto pt-6">
                    <Link
                        to={`/store/${id}`}
                        className="flex w-full items-center justify-center rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-200 transition hover:border-violet-400/40 hover:bg-white/5"
                    >
                        Ver detalhes
                    </Link>


                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={stock === 0}
                        className="
        mt-6
        w-full
        rounded-xl
        bg-violet-600
        px-5
        py-3
        font-semibold
        text-white
        transition
        hover:bg-violet-500
        disabled:cursor-not-allowed
        disabled:bg-slate-700
        disabled:text-slate-400
    "
                    >
                        {stock === 0
                            ? "Produto esgotado"
                            : cartMessage
                                ? "✓ Adicionado ao carrinho"
                                : "Adicionar ao carrinho"}
                    </button>

                    {cartMessage && (
                        <div className={`mt-4 w-full rounded-xl px-5 py-3 font-semibold text-white transition ${cartMessage
                                ? "bg-emerald-600 hover:bg-emerald-600"
                                : "bg-violet-600 hover:bg-violet-500"
                            } disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400`}>
                            <p className="text-sm font-medium text-emerald-300">
                                Produto adicionado ao carrinho com sucesso!
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

        </article>
    );
}