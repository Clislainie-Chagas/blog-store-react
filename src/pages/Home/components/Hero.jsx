import Button from "../../../components/ui/Button";

export default function Hero() {

    return (
        <section className="flex min-h-[80vh] items-center justify-center px-6">
            <div className="max-w-4xl text-center">

                <span className="text-sm uppercase tracking-[0.4em] text-violet-300">
                    Bem-vindo a
                </span>

                <h1 className="mt-6 text-6xl font-bold leading-tight text-white">
                    {" "}
                    <span className="bg-gradient-to-r from-violet-300 via-blue-300 to-pink-300 bg-clip-text text-transparent">
                        Arte da Magia
                    </span>
                </h1>

                <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-300">
                    Um universo onde literatura, imaginação, espiritualidade e
                    conhecimento se encontram para inspirar novas jornadas.
                </p>

                <div className="mt-10 flex justify-center gap-4">
                    <Button>Explorar Livros</Button>

                    <Button variant="outline">
                        Visitar Blog
                    </Button>
                </div>

            </div>
        </section>
    );
}