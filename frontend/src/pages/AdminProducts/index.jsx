import { useEffect, useState } from "react";

export default function AdminProducts() {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        image: "",
        description: "",
        stock: "",
    });

    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState("");
    const [editingProductId, setEditingProductId] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/products/")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erro ao buscar produtos");
                }

                return response.json();
            })
            .then((data) => {
                setProducts(data);
            })
            .catch((error) => {
                console.error("Erro ao buscar produtos:", error);
            });
    }, []);

    useEffect(() => {
        if (!message) {
            return;
        }

        const timer = setTimeout(() => {
            setMessage("");
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [message]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    }


    function handleSubmit(event) {
        event.preventDefault();

        const productData = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
        };

        const isEditing = editingProductId !== null;

        const url = isEditing
            ? `http://127.0.0.1:8000/products/${editingProductId}`
            : "http://127.0.0.1:8000/products/";

        const method = isEditing ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        isEditing
                            ? "Erro ao atualizar produto"
                            : "Erro ao cadastrar produto"
                    );
                }

                return response.json();
            })
            .then((savedProduct) => {
                if (isEditing) {
                    setProducts((currentProducts) =>
                        currentProducts.map((product) =>
                            product.id === savedProduct.id
                                ? savedProduct
                                : product
                        )
                    );

                    setMessage("Produto atualizado com sucesso!");
                } else {
                    setProducts((currentProducts) => [
                        ...currentProducts,
                        savedProduct,
                    ]);

                    setMessage("Produto cadastrado com sucesso!");
                }

                setFormData({
                    name: "",
                    category: "",
                    price: "",
                    image: "",
                    description: "",
                    stock: "",
                });

                setEditingProductId(null);
            })
            .catch((error) => {
                console.error(error);

                setMessage(
                    isEditing
                        ? "Não foi possível atualizar o produto."
                        : "Não foi possível cadastrar o produto."
                );
            });
    }

    const token = localStorage.getItem("admin_token");
    function handleEdit(product) {
        setMessage("");

        setEditingProductId(product.id);

        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image || "",
            description: product.description || "",
            stock: product.stock,
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }
    function handleDelete(productId) {
        const confirmed = window.confirm(
            "Tem certeza que deseja excluir este produto?"
        );

        if (!confirmed) {
            return;
        }

        fetch(`http://127.0.0.1:8000/products/${productId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erro ao excluir produto");
                }

                return response.json();
            })
            .then(() => {
                setProducts((currentProducts) =>
                    currentProducts.filter(
                        (product) => product.id !== productId
                    )
                );

                setMessage("Produto excluído com sucesso!");
            })
            .catch((error) => {
                console.error("Erro ao excluir produto:", error);
                setMessage("Não foi possível excluir o produto.");
            });
    }

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <section className="mx-auto max-w-4xl">
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
                    Administração
                </span>

                <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                    Gerenciar Produtos
                </h1>

                <p className="mt-4 text-slate-400">
                    Cadastre novos produtos disponíveis na loja.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nome do produto"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-violet-500"
                    />

                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Categoria"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-violet-500"
                    />

                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Preço"
                        step="0.01"
                        min="0"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-violet-500"
                    />

                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Caminho da imagem"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-violet-500"
                    />

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Descrição"
                        rows="5"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-violet-500"
                    />

                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="Estoque"
                        min="0"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-violet-500"
                    />

                    <button
                        type="submit"
                        className="rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
                    >
                        {editingProductId !== null
                            ? "Atualizar Produto"
                            : "Cadastrar Produto"}
                    </button>
                    {editingProductId !== null && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingProductId(null);

                                setFormData({
                                    name: "",
                                    category: "",
                                    price: "",
                                    image: "",
                                    description: "",
                                    stock: "",
                                });

                                setMessage("");
                            }}
                            className="ml-3 rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/5"
                        >
                            Cancelar edição
                        </button>
                    )}

                    {message && (
                        <p className="text-sm text-slate-300">
                            {message}
                        </p>
                    )}
                </form>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold">
                        Produtos cadastrados
                    </h2>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="rounded-2xl border border-white/10 bg-white/5 p-5"
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="aspect-video w-full rounded-xl object-cover"
                                />

                                <h3 className="mt-4 text-xl font-semibold">
                                    {product.name}
                                </h3>

                                <p className="mt-2 text-sm text-slate-400">
                                    {product.category}
                                </p>

                                <p className="mt-3 font-semibold text-violet-300">
                                    {Number(product.price).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })}
                                </p>

                                <p className="mt-2 text-sm text-slate-400">
                                    Estoque: {product.stock}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => handleEdit(product)}
                                    className="mt-5 rounded-xl border border-violet-500/40 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(product.id)}
                                    className="ml-3 mt-5 rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                                >
                                    Excluir
                                </button>

                            </div>
                        ))}
                    </div>
                </div>

            </section>
        </main>
    );
}