import useBooks from "../../hooks/useBooks";
import { useParams, Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import Rating from "../../components/ui/Rating";

export default function BookDetails({
    favorites = [],
    onFavorite,
}) {
    const { id } = useParams();

    const books = useBooks();

    const book = books.find(
        (book) => book.id === Number(id)
    );

    if (!book) {
        return (
            <main className="min-h-screen px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl text-center">

                    <h1 className="text-4xl font-bold">
                        Livro não encontrado
                    </h1>

                    <Link
                        to="/"
                        className="mt-8 inline-block text-violet-300 hover:text-violet-200"
                    >
                        Voltar para a página inicial
                    </Link>

                </div>
            </main>
        );
    }

    const isFavorite = favorites.some(
        (favorite) => favorite.id === book.id
    );

    return (
        <main className="min-h-screen px-6 py-16 text-white">

            <div className="mx-auto max-w-7xl">

                <Link
                    to="/"
                    className="mb-10 inline-flex items-center gap-2 text-slate-400 transition hover:text-violet-300"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </Link>

                <div className="grid gap-12 lg:grid-cols-2">

                    {/* CAPA */}
                    <div className="flex justify-center">

                        <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">

                            <img
                                src={book.cover}
                                alt={`Capa do livro ${book.title}`}
                                className="aspect-2/3 w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling.style.display = "flex";
                                }}
                            />

                            <div
                                className="
                                    hidden
                                    aspect-2/3
                                    w-full
                                    items-center
                                    justify-center
                                    bg-linear-to-br
                                    from-slate-950
                                    via-violet-950
                                    to-blue-950
                                    p-8
                                    text-center
                                "
                            >
                                <div>

                                    <span className="text-sm uppercase tracking-[0.3em] text-violet-300">
                                        {book.category}
                                    </span>

                                    <h2 className="mt-6 text-3xl font-bold text-white">
                                        {book.title}
                                    </h2>

                                    <p className="mt-4 text-slate-300">
                                        {book.author}
                                    </p>

                                </div>
                            </div>

                        </div>

                    </div>

                    {/* INFORMAÇÕES */}
                    <div className="flex flex-col justify-center">

                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
                            {book.category}
                        </span>

                        <h1 className="mt-4 text-5xl font-bold leading-tight">
                            {book.title}
                        </h1>

                        <p className="mt-4 text-lg text-slate-400">
                            por {book.author}
                        </p>

                        <div className="mt-6">
                            <Rating value={book.rating} />
                        </div>

                        <p className="mt-8 text-3xl font-bold text-violet-300">
                            {book.price}
                        </p>

                        <p className="mt-8 leading-8 text-slate-300">
                            {book.description}
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">

                            <a
                                href={book.amazonUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500"
                            >
                                Comprar na Amazon
                            </a>

                            <Button
                                variant="outline"
                                onClick={() => onFavorite(book)}
                            >
                                <span className="flex items-center gap-2">

                                    <Heart
                                        size={18}
                                        fill={isFavorite ? "currentColor" : "none"}
                                        className={
                                            isFavorite
                                                ? "text-pink-400"
                                                : "text-white"
                                        }
                                    />

                                    {isFavorite
                                        ? "Favoritado"
                                        : "Favoritar"}

                                </span>
                            </Button>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}