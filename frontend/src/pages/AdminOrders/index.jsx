import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOrders = orders.filter((order) => {
        const matchesTab =
            activeTab === "all" ||
            (activeTab === "shipped" && order.status === "shipped") ||
            (activeTab === "delivered" && order.status === "delivered") ||
            (activeTab === "cancelled" && order.status === "cancelled");

        const search = searchTerm.trim().toLowerCase();

        const matchesSearch = /^\d+$/.test(search)
            ? String(order.id) === String(Number(search))
            : (order.customer_name || "").toLowerCase().includes(search) ||
            (order.customer_email || "").toLowerCase().includes(search);

        return matchesTab && matchesSearch;
    });

    const handlePrintLabel = async (orderId) => {
        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(`${API_URL}/shipping/label/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail?.message ||
                    data.detail ||
                    "Não foi possível obter a etiqueta."
                );
            }

            const labelUrl = data.melhor_envio?.url;

            if (!labelUrl) {
                throw new Error("O link da etiqueta não foi encontrado.");
            }

            window.open(labelUrl, "_blank", "noopener,noreferrer");

        } catch (error) {
            alert(error.message);
        }
    };

    const handleAddShipping = async (orderId) => {
        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(`${API_URL}/shipping/cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    order_id: orderId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : data.detail?.message || "Erro ao adicionar frete."
                );
            }

            alert("Frete adicionado ao Melhor Envio com sucesso!");

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            melhor_envio_order_id: data.melhor_envio_order_id,
                        }
                        : order
                )
            );
        } catch (error) {
            alert(error.message);
        }
    };

    const handleBuyShipping = async (orderId) => {
        const confirmed = window.confirm(
            `Deseja comprar o frete do pedido #${orderId} no Melhor Envio?`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(`${API_URL}/shipping/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    order_id: orderId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : data.detail?.message || "Erro ao comprar frete."
                );
            }

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            melhor_envio_purchase_id:
                                data.melhor_envio_purchase_id,
                        }
                        : order
                )
            );

            alert("Frete comprado com sucesso!");
        } catch (error) {
            alert(error.message);
        }
    };

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

    const handleGenerateLabel = async (orderId) => {
        const confirmed = window.confirm(
            `Deseja solicitar a geração da etiqueta do pedido #${orderId}?`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(`${API_URL}/shipping/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    order_id: orderId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : data.detail?.message || "Erro ao gerar etiqueta."
                );
            }

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            melhor_envio_generate_key:
                                data.melhor_envio_generate_key ||
                                data.melhor_envio?.generate_key ||
                                data.generate_key,
                        }
                        : order
                )
            );

            alert("Geração da etiqueta solicitada com sucesso!");
        } catch (error) {
            alert(error.message);
        }
    };


    // =========================================================
    // CANCELAR PEDIDO NÃO PAGO - ADMIN
    // =========================================================

    const handleCancelOrder = async (orderId) => {
        const confirmed = window.confirm(
            `Deseja realmente cancelar o pedido #${orderId}?\n\nEssa ação não realiza estorno de pagamentos.`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(
                `${API_URL}/orders/${orderId}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Não foi possível cancelar o pedido."
                );
            }

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: data.status }
                        : order
                )
            );

            alert(`Pedido #${orderId} cancelado com sucesso!`);
        } catch (error) {
            alert(error.message);
        }
    };


    const handleMarkAsDelivered = async (orderId) => {
        const confirmed = window.confirm(
            `Confirme somente se o pedido #${orderId} foi realmente entregue ao cliente.\n\nDeseja marcar este pedido como ENTREGUE?`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(`${API_URL}/orders/${orderId}/deliver`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : data.detail?.message || "Erro ao atualizar o pedido."
                );
            }

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: data.status,
                        }
                        : order
                )
            );

            alert(`Pedido #${orderId} marcado como entregue!`);
        } catch (error) {
            alert(error.message);
        }
    };


    const handleMarkAsShipped = async (orderId) => {
        const confirmed = window.confirm(
            `ATENÇÃO: Confirme somente se o pedido #${orderId} já foi entregue à transportadora.\n\nEssa ação marcará o pedido como ENVIADO no sistema.\n\nDeseja continuar?`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(`${API_URL}/orders/${orderId}/ship`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : data.detail?.message || "Erro ao atualizar o pedido."
                );
            }

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: data.status,
                            shipping_email_status: data.shipping_email_status,
                            shipping_email_sent_at: data.shipping_email_sent_at,
                        }
                        : order
                )
            );

            alert(`Pedido #${orderId} marcado como enviado!`);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleFetchTracking = async (orderId) => {
        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(
                `${API_URL}/shipping/tracking/${orderId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : data.detail?.message ||
                        "Não foi possível consultar o rastreamento."
                );
            }

            if (!data.tracking_code) {
                alert(data.message || "Código ainda não disponível.");
                return;
            }

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            tracking_code: data.tracking_code,
                            status: data.order_status || order.status,
                        }
                        : order
                )
            );

            alert(`Rastreamento atualizado: ${data.tracking_code}`);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleSaveTracking = async (orderId) => {
        const trackingCode = window.prompt(
            `Digite o código de rastreamento do pedido #${orderId}:`
        );

        if (trackingCode === null) return;

        const code = trackingCode.trim().toUpperCase();

        if (code.length < 5) {
            alert("O código de rastreamento deve ter pelo menos 5 caracteres.");
            return;
        }

        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(`${API_URL}/orders/${orderId}/tracking`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tracking_code: code,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Não foi possível salvar o código de rastreamento."
                );
            }

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? { ...order, tracking_code: data.tracking_code }
                        : order
                )
            );

            alert("Código de rastreamento salvo com sucesso!");
        } catch (error) {
            alert(error.message);
        }
    };

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

                <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap gap-3">
                        {[
                            {
                                id: "all",
                                label: "Pedidos gerais",
                                count: orders.length,
                            },

                            {
                                id: "shipped",
                                label: "Enviados",
                                count: orders.filter((order) => order.status === "shipped").length,
                            },

                            {
                                id: "delivered",
                                label: "Entregues",
                                count: orders.filter((order) => order.status === "delivered").length,
                            },

                            {
                                id: "cancelled",
                                label: "Cancelados",
                                count: orders.filter((order) => order.status === "cancelled").length,
                            },

                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${activeTab === tab.id
                                    ? "bg-violet-600 text-white"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    }`}
                            >
                                {tab.label}
                                <span className="ml-2 rounded-full bg-white/10 px-2 py-1 text-xs">
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Buscar por número, nome ou e-mail..."
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
                    />
                </div>

                <div className="flex flex-col gap-6">
                    {filteredOrders.length === 0 && (
                        <div className="rounded-xl border border-white/10 bg-slate-900 p-10 text-center">
                            <p className="text-lg font-semibold text-white">
                                Nenhum pedido encontrado
                            </p>

                            <p className="mt-2 text-sm text-slate-400">
                                {searchTerm.trim()
                                    ? "Tente buscar por outro número, nome ou e-mail."
                                    : "Não existem pedidos nesta categoria."}
                            </p>
                        </div>
                    )}
                    {filteredOrders.map((order) => (
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
                                    {order.shipping_service_name && (
                                        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                                            <p className="mb-2 font-semibold text-violet-300">
                                                Frete
                                            </p>

                                            <p className="text-sm text-slate-300">
                                                {order.shipping_company} — {order.shipping_service_name}
                                            </p>

                                            <p className="text-sm text-slate-300">
                                                Valor: R${" "}
                                                {Number(order.shipping_price)
                                                    .toFixed(2)
                                                    .replace(".", ",")}
                                            </p>

                                            {order.shipping_delivery_min &&
                                                order.shipping_delivery_max && (
                                                    <p className="text-sm text-slate-400">
                                                        Prazo: {order.shipping_delivery_min} a{" "}
                                                        {order.shipping_delivery_max} dias úteis
                                                    </p>
                                                )}
                                        </div>
                                    )}
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
                                    <div className="mt-3">
                                        <span
                                            className={`text-sm font-semibold ${order.melhor_envio_generate_key
                                                ? "text-emerald-400"
                                                : order.melhor_envio_purchase_id
                                                    ? "text-blue-400"
                                                    : order.melhor_envio_order_id
                                                        ? "text-amber-400"
                                                        : "text-slate-400"
                                                }`}
                                        >
                                            Frete:{" "}
                                            {order.melhor_envio_generate_key
                                                ? "Etiqueta solicitada"
                                                : order.melhor_envio_purchase_id
                                                    ? "Frete comprado"
                                                    : order.melhor_envio_order_id
                                                        ? "No carrinho"
                                                        : order.shipping_service_id
                                                            ? "Aguardando processamento"
                                                            : "Sem frete"}
                                        </span>
                                    </div>

                                    {order.status === "shipped" && (
                                        <p className="mt-2 text-sm font-bold text-cyan-400">
                                            ✓ Pedido enviado
                                        </p>
                                    )}

                                    {order.status === "delivered" && (
                                        <p className="mt-2 text-sm font-bold text-emerald-400">
                                            ✓ Pedido entregue
                                        </p>
                                    )}

                                    <div className="mt-3">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${order.shipping_email_status === "sent"
                                                ? "bg-emerald-500/20 text-emerald-300"
                                                : order.shipping_email_status === "sending"
                                                    ? "bg-amber-500/20 text-amber-300"
                                                    : "bg-slate-500/20 text-slate-300"
                                                }`}
                                        >
                                            {order.shipping_email_status === "sent"
                                                ? "✓ E-mail enviado"
                                                : order.shipping_email_status === "sending"
                                                    ? "⚠ Verificar envio"
                                                    : "✉ E-mail pendente"}
                                        </span>
                                    </div>

                                    {order.shipping_email_status === "sent" &&
                                        order.shipping_email_sent_at && (
                                            <p className="mt-1 text-xs text-slate-400">
                                                Enviado em:{" "}
                                                {new Date(order.shipping_email_sent_at).toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        dateStyle: "short",
                                                        timeStyle: "short",
                                                        timeZone: "America/Sao_Paulo",
                                                    }
                                                )}
                                            </p>
                                        )}

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


                            {/* Botão de cancelamento para pedidos não pagos */}
                            {order.status === "pending" &&
                                order.payment_status === "pending" &&
                                !order.payment_reference &&
                                !order.melhor_envio_order_id &&
                                !order.melhor_envio_purchase_id &&
                                !order.melhor_envio_generate_key && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/20"
                                        >
                                            Cancelar pedido
                                        </button>
                                    </div>
                                )}

                            {order.payment_status === "paid" &&
                                order.shipping_service_id &&
                                !order.melhor_envio_order_id && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleAddShipping(order.id)}
                                            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
                                        >
                                            Adicionar frete
                                        </button>
                                    </div>
                                )}

                            {order.payment_status === "paid" &&
                                order.melhor_envio_order_id &&
                                !order.melhor_envio_purchase_id && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleBuyShipping(order.id)}
                                            className="rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-500"
                                        >
                                            Comprar frete
                                        </button>
                                    </div>
                                )}

                            {order.payment_status === "paid" &&
                                order.melhor_envio_purchase_id &&
                                !order.melhor_envio_generate_key && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateLabel(order.id)}
                                            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
                                        >
                                            Gerar etiqueta
                                        </button>
                                    </div>
                                )}

                            {order.payment_status === "paid" && order.melhor_envio_generate_key && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handlePrintLabel(order.id)}
                                        className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500"
                                    >
                                        Imprimir etiqueta
                                    </button>
                                </div>
                            )}

                            {order.payment_status === "paid" &&
                                order.melhor_envio_generate_key &&
                                order.status !== "shipped" &&
                                order.status !== "delivered" && (
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleMarkAsShipped(order.id)}
                                            className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-500"
                                        >
                                            Marcar como enviado
                                        </button>
                                    </div>
                                )}

                            {order.status === "cancelled" && (
                                <p className="mt-2 text-sm font-bold text-red-400">
                                    ✕ Pedido cancelado
                                </p>
                            )}

                            {order.status === "shipped" && (
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleMarkAsDelivered(order.id)}
                                        className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
                                    >
                                        ✓ Marcar como entregue
                                    </button>
                                </div>
                            )}

                            {order.payment_status === "paid" &&
                                order.melhor_envio_generate_key && (
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleFetchTracking(order.id)}
                                            className="rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-500"
                                        >
                                            Consultar rastreamento
                                        </button>
                                    </div>
                                )}

                            {order.payment_status === "paid" &&
                                order.melhor_envio_generate_key && (
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleSaveTracking(order.id)}
                                            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
                                        >
                                            {order.tracking_code
                                                ? "Editar rastreamento"
                                                : "Cadastrar rastreamento"}
                                        </button>
                                    </div>
                                )}

                            {order.tracking_code && (
                                <div className="mt-2">
                                    <p className="text-sm text-slate-300">
                                        <span className="font-semibold text-white">
                                            Código de rastreamento:
                                        </span>{" "}
                                        <span className="font-mono text-indigo-400">
                                            {order.tracking_code}
                                        </span>
                                    </p>
                                </div>
                            )}

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