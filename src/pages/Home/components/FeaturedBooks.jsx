import BookCard from "./BookCard";
import useBooks from "../../../hooks/useBooks";
import SectionTitle from "../../../components/ui/SectionTitle";

export default function FeaturedBooks({ search }) {

    const books = useBooks();

    const text = search.toLowerCase();

    const filteredBooks = books.filter((book) => {
        return (
            book.title.toLowerCase().includes(text) ||
            book.author.toLowerCase().includes(text) ||
            book.category.toLowerCase().includes(text)
        );
    });

    return (
        <section className="max-w-7xl mx-auto px-6 py-20">

            <SectionTitle
                subtitle="Biblioteca"
                title="Livros em Destaque"
                description="Conheça algumas obras selecionadas para inspirar sua jornada através da literatura, da imaginação e do conhecimento."
            />

            {filteredBooks.length === 0 ? (

                <div className="py-16 text-center">
                    <h3 className="text-2xl font-semibold text-white">
                        📚 Nenhum livro encontrado
                    </h3>

                    <p className="mt-4 text-slate-400">
                        Tente pesquisar por outro título, autor ou categoria.
                    </p>
                </div>

            ) : (

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

                    {filteredBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            author={book.author}
                            category={book.category}
                            price={book.price}
                            rating={book.rating}
                            cover={book.cover}
                        />
                    ))}

                </div>

            )}

        </section>
    );
}