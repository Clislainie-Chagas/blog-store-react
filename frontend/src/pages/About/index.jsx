export default function About() {
    return (

        <main className="min-h-screen bg-slate-950 text-white">
            <section className="relative overflow-hidden">
                {/* Efeitos de fundo */}
                <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl" />
                <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-fuchsia-700/10 blur-3xl" />

                <div className="relative mx-auto flex min-h-[75vh] max-w-7xl items-center px-6 py-20 lg:px-8">
                    <div className="max-w-4xl">

                        <span className="mb-6 inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-medium tracking-widest text-purple-300">
                            SOBRE O ARTE DA MAGIA
                        </span>

                        <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
                            Onde conhecimento,
                            <span className="block bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                                simbolismo e transformação
                            </span>
                            se encontram.
                        </h1>

                        <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
                            O Arte da Magia nasceu como um espaço dedicado ao
                            conhecimento, à espiritualidade e ao autoconhecimento,
                            reunindo conteúdos, livros e produtos para quem deseja
                            explorar novas formas de compreender a si mesmo e o
                            mundo ao seu redor.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <a
                                href="/store"
                                className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
                            >
                                Explorar a loja
                            </a>

                            <a
                                href="/blog"
                                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
                            >
                                Conhecer o blog
                            </a>
                        </div>

                    </div>
                </div>
            </section>

            <section className="border-t border-white/5 bg-slate-950">
                <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
                    <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

                        {/* Nossa história */}
                        <div>
                            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                                Nossa história
                            </span>

                            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                                Um espaço criado para compartilhar conhecimento
                            </h2>

                            <div className="mt-6 space-y-5 leading-8 text-slate-400">
                                <p>
                                    O Arte da Magia surgiu do desejo de reunir, em um único
                                    espaço, conhecimento, criatividade e temas ligados à
                                    espiritualidade e ao autoconhecimento.
                                </p>

                                <p>
                                    Mais do que uma loja, a proposta é construir um ambiente
                                    onde diferentes formas de conhecimento possam ser
                                    descobertas através de conteúdos, livros e produtos
                                    selecionados com propósito.
                                </p>

                                <p>
                                    Cada parte do projeto nasce da curiosidade, da pesquisa
                                    e da vontade de transformar conhecimento em algo
                                    acessível, inspirador e significativo.
                                </p>
                            </div>
                        </div>

                        {/* Propósito */}
                        <div className="rounded-3xl border border-purple-400/15 bg-gradient-to-br from-purple-950/40 to-slate-900/40 p-8 sm:p-10">

                            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-300">
                                Nosso propósito
                            </span>

                            <h2 className="mt-4 text-3xl font-bold text-white">
                                Conhecimento que inspira transformação.
                            </h2>

                            <p className="mt-6 leading-8 text-slate-300">
                                Criar um espaço onde informação, reflexão e espiritualidade
                                possam caminhar juntas, incentivando cada pessoa a explorar
                                novos conhecimentos e construir sua própria jornada.
                            </p>

                            <div className="mt-8 h-px bg-gradient-to-r from-purple-400/50 to-transparent" />

                            <p className="mt-8 text-lg italic leading-8 text-purple-200">
                                “A transformação começa quando nos permitimos conhecer,
                                questionar e enxergar além.”
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            <section className="bg-slate-900/40">
                <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

                    <div className="mx-auto max-w-3xl text-center">
                        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                            Explore o Arte da Magia
                        </span>

                        <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                            O que você encontra aqui
                        </h2>

                        <p className="mt-6 leading-8 text-slate-400">
                            Diferentes caminhos para descobrir conteúdos, conhecimentos
                            e produtos que fazem parte do universo do Arte da Magia.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-6 md:grid-cols-3">

                        {/* LIVROS */}
                        <a
                            href="/#livros"
                            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-purple-500/5"
                        >
                            <span className="text-3xl">📚</span>

                            <h3 className="mt-6 text-xl font-semibold text-white">
                                Livros
                            </h3>

                            <p className="mt-3 leading-7 text-slate-400">
                                Descubra livros e leituras selecionadas para ampliar
                                conhecimentos e explorar novos caminhos.
                            </p>

                            <span className="mt-6 inline-block font-medium text-purple-300 transition group-hover:text-purple-200">
                                Explorar livros →
                            </span>
                        </a>

                        {/* LOJA */}
                        <a
                            href="/store"
                            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-purple-500/5"
                        >
                            <span className="text-3xl">✨</span>

                            <h3 className="mt-6 text-xl font-semibold text-white">
                                Loja
                            </h3>

                            <p className="mt-3 leading-7 text-slate-400">
                                Produtos escolhidos para complementar momentos de
                                cuidado, reflexão, espiritualidade e bem-estar.
                            </p>

                            <span className="mt-6 inline-block font-medium text-purple-300 transition group-hover:text-purple-200">
                                Conhecer a loja →
                            </span>
                        </a>

                        {/* BLOG */}
                        <a
                            href="/blog"
                            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-purple-500/5"
                        >
                            <span className="text-3xl">🌙</span>

                            <h3 className="mt-6 text-xl font-semibold text-white">
                                Blog
                            </h3>

                            <p className="mt-3 leading-7 text-slate-400">
                                Conteúdos sobre espiritualidade, simbolismo,
                                autoconhecimento e outros temas para explorar.
                            </p>

                            <span className="mt-6 inline-block font-medium text-purple-300 transition group-hover:text-purple-200">
                                Ler conteúdos →
                            </span>
                        </a>

                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-slate-950">
                {/* Efeito de fundo */}
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/15 blur-3xl" />

                <div className="relative mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">

                    <span className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                        Continue explorando
                    </span>

                    <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                        Faça parte desse universo.
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl leading-8 text-slate-400">
                        Explore conteúdos, descubra novos conhecimentos e acompanhe
                        tudo o que está sendo construído no Arte da Magia.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <a
                            href="/blog"
                            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
                        >
                            Explorar conteúdos
                        </a>

                        <a
                            href="/contact"
                            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
                        >
                            Entre em contato
                        </a>
                    </div>

                </div>
            </section>

        </main>
    );
}