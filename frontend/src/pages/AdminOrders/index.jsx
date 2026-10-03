import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadOrders() {
            const token = localStorage.getItem("admin_token");

            try {
                const response = await fetch(
                    `${API_URL}/orders`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("admin_token");
                    window.location.href = "/admin/login";
                    return;
                }

                if (!response.ok) {
                    throw new Error("Não foi possível carregar os pedidos");
                }

                const data = await response.json();
                setOrders(data);
            } catch (error) {
                setError(error.message);
            }
        }

        loadOrders();
    }, []);

    return (
        <main className="min-h-screen px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">
                    Pedidos
                </h1>

                {error && (
                    <p className="text-red-400 mb-6">
                        {error}
                    </p>
                )}

                <div className="flex flex-col gap-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-slate-900 rounded-xl p-6"
                        >
                            <div className="flex justify-between gap-4">
                                <div>
                                    <h2 className="text-white font-semibold">
                                        Pedido #{order.id}
                                    </h2>

                                    <p className="text-slate-300">
                                        {order.customer_name}
                                    </p>

                                    <p className="text-slate-400">
                                        {order.customer_email}
                                    </p>

                                    <p className="mt-2 text-slate-400">
                                        Telefone: {order.customer_phone || "Não informado"}
                                    </p>
                                    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                                        <p className="mb-2 font-semibold text-violet-300">
                                            Endereço de entrega
                                        </p>

                                        {order.shipping_street ? (
                                            <>
                                                <p className="text-sm text-slate-300">
                                                    {order.shipping_street}, {order.shipping_number}
                                                </p>

                                                {order.shipping_complement && (
                                                    <p className="text-sm text-slate-300">
                                                        Complemento: {order.shipping_complement}
                                                    </p>
                                                )}

                                                <p className="text-sm text-slate-300">
                                                    {order.shipping_city} - {order.shipping_state}
                                                </p>

                                                <p className="text-sm text-slate-400">
                                                    CEP: {order.shipping_cep}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                Endereço não informado
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${order.payment_status === "paid"
                                            ? "bg-green-500/20 text-green-300"
                                            : order.payment_status === "pending"
                                                ? "bg-yellow-500/20 text-yellow-300"
                                                : "bg-red-500/20 text-red-300"
                                            }`}
                                    >
                                        {order.payment_status === "paid"
                                            ? "PAGO"
                                            : order.payment_status === "pending"
                                                ? "PENDENTE"
                                                : order.payment_status?.toUpperCase()}
                                    </span>

                                    <p className="mt-3 text-xl font-bold text-white">
                                        R$ {Number(order.total).toFixed(2).replace(".", ",")}
                                    </p>

                                    {order.created_at && (
                                        <p className="mt-2 text-xs text-slate-400">
                                            {new Date(order.created_at).toLocaleString("pt-BR")}
                                        </p>
                                    )}

                                    {order.payment_method && (
                                        <p className="mt-2 text-xs text-slate-400">
                                            Método: {order.payment_method}
                                        </p>
                                    )}
                                </div>

                            </div>

                            <div className="mt-5 border-t border-slate-700 pt-4">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-2 text-slate-300"
                                    >
                                        <div>
                                            <p className="font-medium text-white">
                                                {item.product?.name || `Produto #${item.product_id}`}
                                            </p>

                                            <p className="text-sm text-slate-400">
                                                Quantidade: {item.quantity}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p>
                                                R$ {Number(item.unit_price)
                                                    .toFixed(2)
                                                    .replace(".", ",")} cada
                                            </p>

                                            <p className="text-sm font-semibold text-violet-300">
                                                Subtotal: R${" "}
                                                {(
                                                    Number(item.unit_price) * item.quantity
                                                )
                                                    .toFixed(2)
                                                    .replace(".", ",")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default AdminOrders;