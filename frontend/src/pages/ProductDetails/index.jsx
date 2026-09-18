import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductDetails({
    onAddToCart,
}) {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartMessage, setCartMessage] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/products/${id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Produto não encontrado");
                }

                return response.json();
            })
            .then((data) => {
                setProduct(data);
            })
            .catch((error) => {
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    function handleAddToCart() {
        console.log("Clique em adicionar:", product);

        setCartMessage(true);

        onAddToCart(product);

        setTimeout(() => {
            setCartMessage(false);
        }, 3000);
    }

    if (loading) {
        return (
            <main className="min-h-screen px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl text-center">
                    <p className="text-slate-300">
                        Carregando produto...
                    </p>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-screen px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl text-center">
                    <h1 className="text-4xl font-bold">
                        Produto não encontrado
                    </h1>

                    <Link
                        to="/store"
                        className="mt-8 inline-block text-violet-300 transition hover:text-violet-200"
                    >
                        Voltar para a Loja
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <div className="mx-auto max-w-7xl">

                <Link
                    to="/store"
                    className="mb-10 inline-flex items-center gap-2 text-slate-400 transition hover:text-violet-300"
                >
                    <ArrowLeft size={18} />
                    Voltar para a Loja
                </Link>

                <div className="grid gap-12 lg:grid-cols-2">

                    {/* IMAGEM */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="aspect-square w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* INFORMAÇÕES */}
                    <div className="flex flex-col justify-center">

                        <span className="text-sm font-semibold uppercase tracking-wider text-violet-300">
                            {product.category}
                        </span>

                        <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                            {product.name}
                        </h1>

                        <p className="mt-6 text-3xl font-bold text-violet-300">
                            {Number(product.price).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })}
                        </p>

                        <p className="mt-8 leading-8 text-slate-300">
                            {product.description}
                        </p>

                        <p
                            className={`mt-6 font-medium ${product.stock > 0
                                ? "text-emerald-400"
                                : "text-red-400"
                                }`}
                        >
                            {product.stock > 0
                                ? `${product.stock} unidades disponíveis`
                                : "Produto esgotado"}
                        </p>

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="
        mt-10
        inline-flex
        w-fit
        items-center
        gap-2
        rounded-xl
        bg-violet-600
        px-7
        py-3
        font-semibold
        transition
        hover:bg-violet-500
        disabled:cursor-not-allowed
        disabled:bg-slate-700
        disabled:text-slate-400
    "
                        >
                            <ShoppingCart size={19} />

                            {product.stock > 0
                                ? "Adicionar ao carrinho"
                                : "Produto esgotado"}
                        </button>

                        {cartMessage && (
                            <div className="mt-4 w-fit rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
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
            </div>
        </main>
    );
}