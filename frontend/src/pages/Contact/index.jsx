import { useState } from "react";



export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [status, setStatus] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSending(true);
        setStatus("");

        try {
            const apiUrl =
                import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

            const response = await fetch(`${apiUrl}/contact/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Não foi possível enviar a mensagem.");
            }

            setStatus("success");

            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
            });
        } catch (error) {
            console.error(error);
            setStatus("error");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white">

            {/* HERO */}
            <section className="relative overflow-hidden">
                {/* Efeitos de fundo */}
                <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl" />
                <div className="absolute -right-32 top-32 h-80 w-80 rounded-full bg-fuchsia-700/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:px-8 lg:py-32">

                    <span className="inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-medium tracking-widest text-purple-300">
                        CONTATO
                    </span>

                    <h1 className="mt-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
                        Vamos conversar?
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                        Tem alguma dúvida, sugestão ou quer falar com o
                        Arte da Magia? Envie uma mensagem através dos nossos
                        canais de contato.
                    </p>

                </div>
            </section>

            {/* ÁREA DE CONTATO */}
            <section className="border-t border-white/5 bg-slate-950">
                <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">

                    <div className="grid gap-12 lg:grid-cols-2">

                        {/* FORMULÁRIO */}
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">

                            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                                Envie uma mensagem
                            </span>

                            <h2 className="mt-4 text-3xl font-bold text-white">
                                Fale com a gente
                            </h2>

                            <p className="mt-4 leading-7 text-slate-400">
                                Preencha os campos abaixo e envie sua mensagem.
                            </p>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-8 space-y-6"
                            >

                                {/* NOME */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-medium text-slate-300"
                                    >
                                        Nome
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Seu nome"
                                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                                    />
                                </div>

                                {/* E-MAIL */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-slate-300"
                                    >
                                        E-mail
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="seuemail@exemplo.com"
                                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                                    />
                                </div>

                                {/* ASSUNTO */}
                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="mb-2 block text-sm font-medium text-slate-300"
                                    >
                                        Assunto
                                    </label>

                                    <input
                                        id="subject"
                                        name="subject"
                                        type="text"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="Sobre o que você deseja falar?"
                                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                                    />
                                </div>

                                {/* MENSAGEM */}
                                <div>
                                    <label
                                        htmlFor="message"
                                        className="mb-2 block text-sm font-medium text-slate-300"
                                    >
                                        Mensagem
                                    </label>

                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        placeholder="Escreva sua mensagem..."
                                        className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSending ? "Enviando..." : "Enviar mensagem"}
                                </button>

                                {status === "success" && (
                                    <p className="text-center text-sm font-medium text-emerald-400">
                                        Mensagem enviada com sucesso! ✨
                                    </p>
                                )}

                                {status === "error" && (
                                    <p className="text-center text-sm font-medium text-red-400">
                                        Não foi possível enviar a mensagem. Tente novamente.
                                    </p>
                                )}

                            </form>
                        </div>

                        {/* INFORMAÇÕES */}
                        <div className="flex flex-col justify-center">

                            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                                Arte da Magia
                            </span>

                            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                                Outros caminhos para se conectar
                            </h2>

                            <p className="mt-6 max-w-xl leading-8 text-slate-400">
                                Além do formulário, você também poderá acompanhar o
                                Arte da Magia através das redes sociais e ficar por
                                dentro de novos conteúdos, produtos e novidades.
                            </p>

                            <div className="mt-10 space-y-4">

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                    <p className="font-semibold text-white">
                                        Redes sociais
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Em breve adicionaremos nossos canais oficiais.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                    <p className="font-semibold text-white">
                                        Atendimento
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Utilize o formulário para dúvidas, sugestões
                                        ou assuntos relacionados ao Arte da Magia.
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </section>



        </main>
    );
}