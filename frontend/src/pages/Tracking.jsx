import { ExternalLink, PackageSearch } from "lucide-react";

export default function Tracking() {
    return (
        <main className="min-h-screen bg-slate-950 px-4 py-20 text-white">
            <div className="mx-auto max-w-2xl text-center">

                <PackageSearch
                    size={48}
                    className="mx-auto mb-6 text-purple-400"
                />

                <h1 className="mb-4 text-4xl font-bold">
                    Rastreie seu Pedido
                </h1>

                <p className="mb-8 text-slate-300">
                    Recebeu seu código de rastreamento por e-mail?
                    Acompanhe a entrega da sua encomenda diretamente
                    no site oficial dos Correios.
                </p>

                <a
                    href="https://rastreamento.correios.com.br/app/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-xl
                     bg-purple-600 px-8 py-4 font-semibold
                     transition hover:bg-purple-500"
                >
                    <ExternalLink size={20} />
                    Rastrear nos Correios
                </a>

                <p className="mt-8 text-sm text-slate-400">
                    Tenha seu código de rastreamento em mãos
                    para consultar a entrega.
                </p>

            </div>
        </main>
    );
}