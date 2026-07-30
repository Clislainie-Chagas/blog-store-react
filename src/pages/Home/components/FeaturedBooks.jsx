import BookCard from "./BookCard";
import useBooks from "../../../hooks/useBooks";
import SectionTitle from "../../../components/ui/SectionTitle";

export default function FeaturedBooks() {

    const books = useBooks()

    return (
        <section className="max-w-7xl mx-auto px-6 py-20">
            <SectionTitle
                subtitle="Biblioteca"
                title="Livros em Destaque"
                description="Conheça algumas obras selecionadas para inspirar sua jornada através da literatura, da imaginação e do conhecimento."
            />

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                    <BookCard
                        key={book.id}
                        title={book.title}
                        author={book.author}
                        category={book.category}
                        price={book.price}
                        rating={book.rating}
                        cover={book.cover}
                    />
                ))}
            </div>
        </section>
    );
}