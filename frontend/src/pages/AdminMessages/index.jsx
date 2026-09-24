import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

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
                    {messages.map((message) => (
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

                            <a
                                href={`mailto:${message.email}?subject=${encodeURIComponent(
                                    `Resposta: ${message.subject || "Contato pelo site Arte da Magia"}`
                                )}`}
                                className="mt-5 inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
                            >
                                Responder
                            </a>

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