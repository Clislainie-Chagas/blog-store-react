import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);


    // Aba selecionada: todas, pendentes ou respondidas
    const [activeTab, setActiveTab] = useState("all");

    // Filtra as mensagens de acordo com a aba selecionada
    const filteredMessages = messages.filter((message) => {
        if (activeTab === "pending") {
            return !message.is_replied;
        }

        if (activeTab === "replied") {
            return message.is_replied;
        }

        return true;
    });


    useEffect(() => {
        async function loadMessages() {
            const token = localStorage.getItem("admin_token");

            try {
                const response = await fetch(
                    `${API_URL}/contact/admin/messages`,
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
                    throw new Error(
                        "Não foi possível carregar as mensagens."
                    );
                }

                const data = await response.json();
                setMessages(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadMessages();
    }, []);


    // Marcar mensagem como respondida
    const handleMarkAsReplied = async (messageId) => {
        const confirmed = window.confirm(
            "Você já enviou a resposta por e-mail e deseja marcar esta mensagem como respondida?"
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("admin_token");

            const response = await fetch(
                `${API_URL}/contact/admin/messages/${messageId}/reply`,
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
                        : "Não foi possível marcar a mensagem como respondida."
                );
            }

            setMessages((previousMessages) =>
                previousMessages.map((message) =>
                    message.id === messageId
                        ? { ...message, is_replied: data.is_replied }
                        : message
                )
            );

            alert("Mensagem marcada como respondida com sucesso!");
        } catch (error) {
            alert(error.message);
        }
    };


    return (
        <main className="min-h-screen px-6 py-10">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8">
                    <p className="mb-2 text-sm uppercase tracking-[0.2em] text-violet-300">
                        Administração
                    </p>

                    <h1 className="text-3xl font-bold text-white">
                        Mensagens recebidas
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Mensagens enviadas pelo formulário de contato do site.
                    </p>
                </div>


                <div className="mb-6 flex flex-wrap gap-3">
                    {[
                        {
                            id: "all",
                            label: "Todas",
                            count: messages.length,
                        },
                        {
                            id: "pending",
                            label: "Pendentes",
                            count: messages.filter((message) => !message.is_replied).length,
                        },
                        {
                            id: "replied",
                            label: "Respondidas",
                            count: messages.filter((message) => message.is_replied).length,
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

                {loading && (
                    <p className="text-slate-400">
                        Carregando mensagens...
                    </p>
                )}

                {error && (
                    <p className="mb-6 text-red-400">
                        {error}
                    </p>
                )}

                {!loading && !error && messages.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
                        <p className="text-slate-400">
                            Nenhuma mensagem recebida.
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-6">

                    {!loading && !error && filteredMessages.length === 0 && messages.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-slate-900 p-8 text-center">
                            <p className="text-slate-300">
                                {activeTab === "pending"
                                    ? "Nenhuma mensagem pendente de resposta."
                                    : activeTab === "replied"
                                        ? "Nenhuma mensagem respondida ainda."
                                        : "Nenhuma mensagem encontrada."}
                            </p>
                        </div>
                    )}

                    {filteredMessages.map((message) => (
                        <article
                            key={message.id}
                            className="rounded-xl border border-white/10 bg-slate-900 p-6"
                        >
                            <div className="mb-5 border-b border-slate-700 pb-4">
                                <h2 className="text-xl font-semibold text-white">
                                    {message.name}
                                </h2>

                                <p className="mt-1 text-sm text-violet-300">
                                    {message.email}
                                </p>
                            </div>

                            {message.subject && (
                                <div className="mb-4">
                                    <span className="text-sm text-slate-500">
                                        Assunto
                                    </span>

                                    <p className="font-medium text-slate-200">
                                        {message.subject}
                                    </p>
                                </div>
                            )}

                            <div>
                                <span className="text-sm text-slate-500">
                                    Mensagem
                                </span>

                                <p className="mt-1 whitespace-pre-wrap text-slate-300">
                                    {message.message}
                                </p>
                            </div>


                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                {message.is_replied ? (
                                    <span className="inline-flex items-center rounded-lg bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">
                                        ✓ Respondida
                                    </span>
                                ) : (
                                    <>
                                        <a
                                            href={`mailto:${message.email}?subject=${encodeURIComponent(
                                                `Resposta: ${message.subject || "Contato pelo site Arte da Magia"}`
                                            )}`}
                                            className="inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
                                        >
                                            Responder
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => handleMarkAsReplied(message.id)}
                                            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                                        >
                                            Marcar como respondida
                                        </button>
                                    </>
                                )}
                            </div>


                            {message.created_at && (
                                <p className="mt-5 text-xs text-slate-500">
                                    Recebida em{" "}
                                    {new Date(
                                        message.created_at
                                    ).toLocaleString("pt-BR")}
                                </p>
                            )}
                        </article>
                    ))}
                </div>

            </div>
        </main>
    );
}

export default AdminMessages;