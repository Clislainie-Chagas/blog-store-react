import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function PaymentFailure() {
    const { orderId } = useParams();

    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function checkPaymentStatus() {
            try {
                const response = await fetch(
                    `${API_URL}/payments/status/${orderId}`
                );

                if (!response.ok) {
                    throw new Error(
                        "Não foi possível consultar o pagamento."
                    );
                }

                const data = await response.json();

                setPaymentStatus(data.payment_status);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        checkPaymentStatus();
    }, [orderId]);

    if (loading) {
        return (
            <main className="min-h-screen px-6 py-16 text-white">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-8">
                        <p className="text-slate-300">
                            Verificando o pagamento do pedido #{orderId}...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen px-6 py-16 text-white">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
                        <p className="text-sm font-semibold uppercase tracking-wider text-red-300">
                            Pedido #{orderId}
                        </p>

                        <h1 className="mt-3 text-3xl font-bold">
                            Não foi possível verificar o pagamento
                        </h1>

                        <p className="mt-4 text-slate-300">
                            {error}
                        </p>

                        <Link
                            to="/store"
                            className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
                        >
                            Voltar para a loja
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const isPaid = paymentStatus === "paid";
    const isPending = paymentStatus === "pending";

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <div className="mx-auto max-w-3xl">
                <div
                    className={`rounded-2xl border p-8 ${isPaid
                        ? "border-emerald-500/20 bg-emerald-500/10"
                        : isPending
                            ? "border-yellow-500/20 bg-yellow-500/10"
                            : "border-red-500/20 bg-red-500/10"
                        }`}
                >
                    <p
                        className={`text-sm font-semibold uppercase tracking-wider ${isPaid
                            ? "text-emerald-300"
                            : isPending
                                ? "text-yellow-300"
                                : "text-red-300"
                            }`}
                    >
                        Pedido #{orderId}
                    </p>

                    <h1 className="mt-3 text-3xl font-bold">
                        {isPaid
                            ? "Pagamento confirmado!"
                            : isPending
                                ? "Pagamento em processamento"
                                : "Pagamento não concluído"}
                    </h1>

                    <p className="mt-4 text-slate-300">
                        {isPaid
                            ? "Seu pagamento foi confirmado e registrado com sucesso."
                            : isPending
                                ? "O pagamento ainda está aguardando confirmação."
                                : "O pagamento foi recusado ou cancelado."}
                    </p>

                    {isPaid ? (
                        <Link
                            to="/store"
                            className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
                        >
                            Voltar para a loja
                        </Link>
                    ) : (
                        <Link
                            to={`/payment/${orderId}`}
                            className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
                        >
                            {isPending
                                ? "Ver pagamento"
                                : "Tentar novamente"}
                        </Link>
                    )}
                </div>
            </div>
        </main>
    );
}