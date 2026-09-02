import { Link } from "react-router-dom";
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
} from "lucide-react";

export default function Cart({
    cart = [],
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveFromCart,
}) {
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <section className="mx-auto max-w-7xl">

                {/* TÍTULO */}
                <div className="mb-12">
                    <h1 className="flex items-center gap-3 text-4xl font-bold">
                        <ShoppingCart className="text-violet-300" />

                        Meu Carrinho
                    </h1>

                    <p className="mt-4 text-slate-400">
                        Confira os produtos adicionados antes de finalizar sua compra.
                    </p>
                </div>

                {/* CARRINHO VAZIO */}
                {cart.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">

                        <ShoppingCart
                            size={48}
                            className="mx-auto text-slate-500"
                        />

                        <h2 className="mt-6 text-2xl font-semibold">
                            Seu carrinho está vazio
                        </h2>

                        <p className="mt-3 text-slate-400">
                            Explore nossa loja e adicione alguns produtos.
                        </p>

                        <Link
                            to="/store"
                            className="mt-8 inline-flex rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
                        >
                            Ir para a Loja
                        </Link>

                    </div>
                ) : (

                    /* CARRINHO COM PRODUTOS */
                    <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

                        {/* LISTA DE PRODUTOS */}
                        <div className="space-y-4">

                            {cart.map((item) => (
                                <article
                                    key={item.id}
                                    className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-5"
                                >

                                    {/* IMAGEM */}
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-28 w-28 rounded-xl object-cover"
                                    />

                                    {/* INFORMAÇÕES */}
                                    <div className="flex flex-1 flex-col justify-center">

                                        <span className="text-sm text-violet-300">
                                            {item.category}
                                        </span>

                                        <h2 className="mt-1 text-xl font-semibold">
                                            {item.name}
                                        </h2>

                                        {/* PREÇO UNITÁRIO */}
                                        <p className="mt-2 font-semibold">
                                            {item.price.toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            })}
                                        </p>

                                        {/* CONTROLES DE QUANTIDADE */}
                                        <div className="mt-4 flex items-center gap-3">

                                            {/* DIMINUIR */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDecreaseQuantity(item.id)
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10"
                                                aria-label="Diminuir quantidade"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            {/* QUANTIDADE */}
                                            <span className="min-w-8 text-center font-semibold">
                                                {item.quantity}
                                            </span>

                                            {/* AUMENTAR */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onIncreaseQuantity(item.id)
                                                }
                                                disabled={
                                                    item.quantity >= item.stock
                                                }
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    border
                                                    border-white/10
                                                    bg-white/5
                                                    transition
                                                    hover:bg-white/10
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-30
                                                "
                                                aria-label="Aumentar quantidade"
                                            >
                                                <Plus size={16} />
                                            </button>

                                            {/* REMOVER */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemoveFromCart(item.id)
                                                }
                                                className="ml-3 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                                                aria-label="Remover produto"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                        </div>

                                        {/* ESTOQUE MÁXIMO */}
                                        {item.quantity >= item.stock && (
                                            <p className="mt-2 text-sm text-amber-400">
                                                Quantidade máxima disponível no estoque.
                                            </p>
                                        )}

                                        {/* SUBTOTAL DO PRODUTO */}
                                        <p className="mt-4 text-sm text-slate-400">
                                            Subtotal:{" "}
                                            <span className="font-semibold text-white">
                                                {(
                                                    item.price * item.quantity
                                                ).toLocaleString("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                })}
                                            </span>
                                        </p>

                                    </div>
                                </article>
                            ))}

                        </div>

                        {/* RESUMO DO PEDIDO */}
                        <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6">

                            <h2 className="text-xl font-semibold">
                                Resumo do pedido
                            </h2>

                            <div className="my-6 border-t border-white/10" />

                            {/* PRODUTOS DO RESUMO */}
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="mb-3 flex justify-between gap-4 text-sm text-slate-400"
                                >
                                    <span>
                                        {item.quantity}x {item.name}
                                    </span>

                                    <span>
                                        {(
                                            item.price * item.quantity
                                        ).toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        })}
                                    </span>
                                </div>
                            ))}

                            <div className="my-6 border-t border-white/10" />

                            {/* TOTAL */}
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold">
                                    Total
                                </span>

                                <strong className="text-2xl text-violet-300">
                                    {total.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })}
                                </strong>
                            </div>

                            {/* CHECKOUT */}
                            <Link
                                to="/checkout"
                                className="mt-6 block w-full rounded-xl bg-violet-500 px-5 py-3 text-center font-semibold text-white transition hover:bg-violet-400"
                            >
                                Finalizar compra
                            </Link>

                        </aside>

                    </div>
                )}

            </section>
        </main>
    );
}