import Button from "../../../components/ui/Button";

export default function Hero() {
    return (
        <section className="mx-auto flex min-h-[80vh] max-w-7xl items-center px-6 mt-6">

            <div className="max-w-2xl">

                <span className="text-violet-400 font-semibold tracking-widest uppercase px-2">
                    Bem-vindo a arte da magia
                </span>

                <h1 className="mt-4 text-6xl font-black leading-tight text-white">
                    Descubra um mundo magico dentro da sua casa.
                </h1>

                <p className="mt-6 text-lg leading-8 text-slate-300">
                    Explore livros incríveis, artigos exclusivos e mergulhe em
                    histórias capazes de transformar a maneira como você vê o mundo.
                </p>

                <div className="mt-10 flex gap-4">

                    <Button>
                        Explorar Livros
                    </Button>

                    <Button variant="outline">
                        Conhecer Blog
                    </Button>

                </div>

            </div>

        </section>
    );
}