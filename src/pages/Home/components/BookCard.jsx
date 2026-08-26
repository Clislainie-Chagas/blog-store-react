import Rating from "../../../components/ui/Rating";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import { Link } from "react-router-dom";

export default function BookCard({
    id,
    title,
    author,
    category,
    price,
    rating,
    cover,
}) {
    return (
        <article className="transition duration-300 hover:scale-[1.02]">

            <Card className="h-full overflow-hidden p-6">

                {/* CAPA */}
                <div className="relative mb-6 h-64 overflow-hidden rounded-xl">

                    <img
                        src={cover}
                        alt={`Capa do livro ${title}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling.style.display = "flex";
                        }}
                    />

                    <div className="hidden h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-blue-950 p-6 text-center">

                        <div>
                            <span className="text-xs uppercase tracking-[0.3em] text-violet-300">
                                {category}
                            </span>

                            <h3 className="mt-4 text-2xl font-bold text-white">
                                {title}
                            </h3>

                            <p className="mt-3 text-sm text-slate-300">
                                {author}
                            </p>
                        </div>

                    </div>

                </div>

                <Badge>
                    {category}
                </Badge>

                <h3 className="mt-4 text-xl font-bold text-white">
                    {title}
                </h3>

                <p className="mt-1 text-slate-400">
                    {author}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-semibold text-violet-300">
                        {price}
                    </p>

                    <Rating value={rating} />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">

                    <Button>
                        Comprar
                    </Button>

                    <Link
                        to={`/books/${id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-violet-500 px-5 py-2 font-semibold text-violet-300 transition duration-300 hover:bg-violet-500/10"
                    >
                        Ver detalhes
                    </Link>

                </div>

            </Card>

        </article>
    );
}