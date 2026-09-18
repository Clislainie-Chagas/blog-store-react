import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Payment() {
    const { orderId } = useParams();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handlePayment() {
        if (isLoading) return;

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/payments/checkout-pro/${orderId}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                    errorData.detail ||
                    "Não foi possível iniciar o pagamento"
                );
            }

            const data = await response.json();

            const checkoutUrl =
                data.sandbox_checkout_url || data.checkout_url;

            if (!checkoutUrl) {
                throw new Error(
                    "O Mercado Pago não retornou uma URL de pagamento"
                );
            }

            window.location.href = checkoutUrl;
        } catch (error) {
            console.error("Erro ao iniciar pagamento:", error);

            setError(
                typeof error.message === "string"
                    ? error.message
                    : "Não foi possível iniciar o pagamento"
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <div className="mx-auto max-w-3xl">
                <Link
                    to="/checkout"
                    className="text-slate-400 transition hover:text-violet-300"
                >
                    ← Voltar ao checkout
                </Link>

                <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
                        Pedido #{orderId}
                    </p>

                    <h1 className="mt-3 text-3xl font-bold">
                        Pagamento
                    </h1>

                    <p className="mt-4 text-slate-400">
                        Você será direcionado ao Mercado Pago para concluir o pagamento.
                    </p>

                    {error && (
                        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {error}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="
                            mt-8
                            w-full
                            rounded-xl
                            bg-violet-600
                            px-5
                            py-3
                            font-semibold
                            transition
                            hover:bg-violet-500
                            disabled:cursor-not-allowed
                            disabled:bg-slate-700
                            disabled:text-slate-400
                        "
                    >
                        {isLoading
                            ? "Abrindo Mercado Pago..."
                            : "Pagar com Mercado Pago"}
                    </button>
                </div>
            </div>
        </main>
    );
}