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
        <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-violet-400/30">

            {/* IMAGEM */}
            <div className="aspect-square overflow-hidden bg-slate-900">
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
            </div>

            {/* INFORMAÇÕES */}
            <div className="p-6">

                <span className="text-sm font-medium text-violet-300">
                    {category}
                </span>

                <h2 className="mt-2 text-xl font-semibold text-white">
                    {name}
                </h2>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                    {description}
                </p>

                <p className="mt-4 text-2xl font-bold text-white">
                    {price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}
                </p>
                <p
                    className={`mt-3 text-sm ${stock > 0
                        ? "text-emerald-400"
                        : "text-red-400"
                        }`}
                >
                    {stock > 0
                        ? `${stock} unidades disponíveis`
                        : "Produto esgotado"}
                </p>
                <Link
                    to={`/store/${id}`}
                    className="mt-6 flex w-full items-center justify-center rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-200 transition hover:border-violet-400/40 hover:bg-white/5"
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
                    {stock > 0
                        ? "Adicionar ao carrinho"
                        : "Produto esgotado"}
                </button>

                {cartMessage && (
                    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
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

        </article>
    );
}