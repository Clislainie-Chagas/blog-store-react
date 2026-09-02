import BookCard from "../Home/components/BookCard";

export default function Favorites({
    favorites,
    onFavorite,
}) {
    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <div className="mx-auto max-w-7xl">

                <h1 className="text-4xl font-bold">
                    Meus Favoritos
                </h1>

                <p className="mt-4 text-slate-400">
                    Livros que você salvou para ver depois.
                </p>

                {favorites.length === 0 ? (
                    <div className="py-20 text-center">
                        <h2 className="text-2xl font-semibold">
                            Nenhum livro favoritado
                        </h2>

                        <p className="mt-4 text-slate-400">
                            Explore a biblioteca e adicione seus livros favoritos.
                        </p>
                    </div>
                ) : (
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {favorites.map((book) => (
                            <BookCard
                                key={book.id}
                                id={book.id}
                                title={book.title}
                                author={book.author}
                                category={book.category}
                                price={book.price}
                                rating={book.rating}
                                cover={book.cover}
                                isFavorite={true}
                                onFavorite={() => onFavorite(book)}
                            />
                        ))}
                    </div>
                )}

            </div>
        </main>
    );
}