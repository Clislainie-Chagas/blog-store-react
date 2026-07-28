import BookCard from "./BookCard";
import books from "../../../data/books";

export default function FeaturedBooks() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-20">
            <h2 className="text-4xl font-bold text-white mb-10">
                Livros em Destaque
            </h2>

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