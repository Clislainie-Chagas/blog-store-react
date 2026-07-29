import Rating from "../../../components/ui/Rating";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
export default function BookCard({ title, author, category, price, rating, cover }) {

    return (
        <article className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 transition hover:scale-105 hover:border-violet-500 gap-1">

            <Card className="mb-4 h-52 rounded-xl bg-gradient-to-br from-violet-500 via-blue-500 to-slate-900 absolute"></Card>

            <img className="mb-4 h-52 rounded-xl relative" src={cover} alt={title} />

            <Badge>{category}</Badge>

            <h3 className="mt-2 text-xl font-bold text-white">
                {title}
            </h3>

            <p className="mt-1 text-slate-400">
                {author}
            </p>
            <p className="px-1">R$ {price}</p>

            <Rating value={rating} />

            <div>
                <Button className="mt-4 px-2 transition hover:scale-105 hover:border-violet-500">
                    Comprar</Button>
            </div>

            {/* <Button variant="secondary">
                Favoritar
            </Button> */}

            {/* <Button variant="outline">
                Ler mais
            </Button> */}

        </article>
    );
}