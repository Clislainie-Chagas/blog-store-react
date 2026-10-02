import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminBlog() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const contentRef = useRef(null);
    const imageInputRef = useRef(null);
    const coverImageInputRef = useRef(null);
    const [showPreview, setShowPreview] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        summary: "",
        content: "",
        category: "",
        image_url: "",
        published: false,
    });

    const token = localStorage.getItem("admin_token");

    useEffect(() => {
        fetch(`${API_URL}/blog/admin/posts`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("admin_token");
                    navigate("/admin/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Erro ao buscar artigos");
                }

                return response.json();
            })
            .then((data) => {
                if (!data) {
                    return;
                }

                setPosts(data);
            })
            .catch((error) => {
                console.error("Erro ao buscar artigos:", error);
                setMessage("Não foi possível carregar os artigos.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [token, navigate]);

    const togglePublished = async (post) => {
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/blog/${post.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    published: !post.published,
                }),
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("admin_token");
                navigate("/admin/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Erro ao alterar publicação");
            }

            const updatedPost = await response.json();

            setPosts((currentPosts) =>
                currentPosts.map((item) =>
                    item.id === updatedPost.id ? updatedPost : item
                )
            );

            setMessage(
                updatedPost.published
                    ? "Artigo publicado com sucesso!"
                    : "Artigo movido para rascunho!"
            );
        } catch (error) {
            console.error("Erro ao alterar publicação:", error);
            setMessage(
                "Não foi possível alterar o status do artigo."
            );
        }
    };

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            summary: "",
            content: "",
            category: "",
            image_url: "",
            published: false,
        });

        setEditingPostId(null);
        setShowPreview(false);
    };

    const handleFormToggle = () => {
        if (showForm) {
            resetForm();
            setShowForm(false);
            return;
        }

        resetForm();
        setMessage("");
        setShowForm(true);
    };

    const handleEdit = (post) => {
        setEditingPostId(post.id);

        setFormData({
            title: post.title,
            slug: post.slug,
            summary: post.summary,
            content: post.content,
            category: post.category,
            image_url: post.image_url || "",
            published: post.published,
        });

        setShowForm(true);
        setMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    const createPost = async (event) => {
        event.preventDefault();

        setMessage("");
        setIsSaving(true);

        try {
            const response = await fetch(`${API_URL}/blog/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("admin_token");
                navigate("/admin/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Erro ao criar artigo"
                );
            }

            setPosts((currentPosts) => [
                data,
                ...currentPosts,
            ]);

            setFormData({
                title: "",
                slug: "",
                summary: "",
                content: "",
                category: "",
                image_url: "",
                published: false,
            });

            setShowForm(false);

            setMessage(
                data.published
                    ? "Artigo criado e publicado com sucesso!"
                    : "Artigo salvo como rascunho com sucesso!"
            );
        } catch (error) {
            console.error("Erro ao criar artigo:", error);

            setMessage(
                error.message ||
                "Não foi possível criar o artigo."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const savePost = async (event) => {
        event.preventDefault();

        if (!editingPostId) {
            await createPost(event);
            return;
        }

        setMessage("");
        setIsSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/blog/${editingPostId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("admin_token");
                navigate("/admin/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Erro ao atualizar artigo"
                );
            }

            setPosts((currentPosts) =>
                currentPosts.map((post) =>
                    post.id === data.id ? data : post
                )
            );

            setFormData({
                title: "",
                slug: "",
                summary: "",
                content: "",
                category: "",
                image_url: "",
                published: false,
            });

            setEditingPostId(null);
            setShowForm(false);

            setMessage("Artigo atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar artigo:", error);

            setMessage(
                error.message ||
                "Não foi possível atualizar o artigo."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const deletePost = async (post) => {
        const confirmed = window.confirm(
            `Tem certeza que deseja excluir o artigo "${post.title}"?`
        );

        if (!confirmed) {
            return;
        }

        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/blog/${post.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("admin_token");
                navigate("/admin/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Erro ao excluir artigo");
            }

            setPosts((currentPosts) =>
                currentPosts.filter(
                    (item) => item.id !== post.id
                )
            );

            setMessage("Artigo excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir artigo:", error);

            setMessage(
                "Não foi possível excluir o artigo."
            );
        }
    };

    const addBold = () => {
        const textarea = contentRef.current;

        if (!textarea) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selectedText = formData.content.substring(start, end);

        const formattedText = selectedText
            ? `**${selectedText}**`
            : "**texto em negrito**";

        const newContent =
            formData.content.substring(0, start) +
            formattedText +
            formData.content.substring(end);

        setFormData({
            ...formData,
            content: newContent,
        });
    };

    const addItalic = () => {
        const textarea = contentRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selectedText = textarea.value.slice(start, end);

        const formattedText = selectedText
            ? `*${selectedText}*`
            : "*texto em itálico*";

        const newContent =
            textarea.value.slice(0, start) +
            formattedText +
            textarea.value.slice(end);

        setFormData((currentFormData) => ({
            ...currentFormData,
            content: newContent,
        }));

        requestAnimationFrame(() => {
            textarea.focus();

            const cursorPosition = start + formattedText.length;

            textarea.setSelectionRange(
                cursorPosition,
                cursorPosition
            );
        });
    };

    const addTitle = () => {
        const textarea = contentRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selectedText = textarea.value.slice(start, end);

        const formattedText = selectedText
            ? `## ${selectedText}`
            : "## Título";

        const newContent =
            textarea.value.slice(0, start) +
            formattedText +
            textarea.value.slice(end);

        setFormData((currentFormData) => ({
            ...currentFormData,
            content: newContent,
        }));

        requestAnimationFrame(() => {
            textarea.focus();

            const cursorPosition = start + formattedText.length;

            textarea.setSelectionRange(
                cursorPosition,
                cursorPosition
            );
        });
    };

    const addSubtitle = () => {
        const textarea = contentRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selectedText = textarea.value.slice(start, end);

        const formattedText = selectedText
            ? `### ${selectedText}`
            : "### Subtítulo";

        const newContent =
            textarea.value.slice(0, start) +
            formattedText +
            textarea.value.slice(end);

        setFormData((currentFormData) => ({
            ...currentFormData,
            content: newContent,
        }));

        requestAnimationFrame(() => {
            textarea.focus();

            const cursorPosition = start + formattedText.length;

            textarea.setSelectionRange(
                cursorPosition,
                cursorPosition
            );
        });
    };

    const addList = () => {
        const textarea = contentRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selectedText = textarea.value.slice(start, end);

        const formattedText = selectedText
            ? selectedText
                .split("\n")
                .map((line) => `- ${line}`)
                .join("\n")
            : "- Item da lista";

        const newContent =
            textarea.value.slice(0, start) +
            formattedText +
            textarea.value.slice(end);

        setFormData((currentFormData) => ({
            ...currentFormData,
            content: newContent,
        }));

        requestAnimationFrame(() => {
            textarea.focus();

            const cursorPosition = start + formattedText.length;

            textarea.setSelectionRange(
                cursorPosition,
                cursorPosition
            );
        });
    };

    const addQuote = () => {
        const textarea = contentRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selectedText = textarea.value.slice(start, end);

        const formattedText = selectedText
            ? selectedText
                .split("\n")
                .map((line) => `> ${line}`)
                .join("\n")
            : "> Escreva sua citação aqui";

        const newContent =
            textarea.value.slice(0, start) +
            formattedText +
            textarea.value.slice(end);

        setFormData((currentFormData) => ({
            ...currentFormData,
            content: newContent,
        }));

        requestAnimationFrame(() => {
            textarea.focus();

            const cursorPosition = start + formattedText.length;

            textarea.setSelectionRange(
                cursorPosition,
                cursorPosition
            );
        });
    };

    const addLink = () => {
        const textarea = contentRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selectedText = textarea.value.slice(start, end);

        const url = window.prompt(
            "Cole o endereço do link:",
            "https://"
        );

        if (!url || url === "https://") return;

        const linkText = selectedText || "texto do link";

        const formattedText = `[${linkText}](${url})`;

        const newContent =
            textarea.value.slice(0, start) +
            formattedText +
            textarea.value.slice(end);

        setFormData((currentFormData) => ({
            ...currentFormData,
            content: newContent,
        }));

        requestAnimationFrame(() => {
            textarea.focus();

            const cursorPosition = start + formattedText.length;

            textarea.setSelectionRange(
                cursorPosition,
                cursorPosition
            );
        });
    };

    const addImage = () => {
        imageInputRef.current?.click();
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const textarea = contentRef.current;

        if (!textarea) return;

        const cursorPosition = textarea.selectionStart;

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            setMessage("Enviando imagem...");

            const response = await fetch(`${API_URL}/blog/upload-image`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: uploadData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Não foi possível enviar a imagem."
                );
            }

            const imageUrl = data.image_url;

            const formattedText =
                `\n\n![Imagem do artigo](${imageUrl})\n\n`;

            setFormData((currentFormData) => ({
                ...currentFormData,
                content:
                    currentFormData.content.slice(0, cursorPosition) +
                    formattedText +
                    currentFormData.content.slice(cursorPosition),
            }));

            setMessage("Imagem adicionada ao artigo!");
        } catch (error) {
            console.error("Erro ao enviar imagem:", error);

            setMessage(
                error.message || "Não foi possível enviar a imagem."
            );
        } finally {
            event.target.value = "";
        }
    };

    const handleCoverImageUpload = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            setMessage("Enviando imagem de capa...");

            const response = await fetch(`${API_URL}/blog/upload-image`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: uploadData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Não foi possível enviar a imagem de capa."
                );
            }

            setFormData((currentFormData) => ({
                ...currentFormData,
                image_url: data.image_url,
            }));

            setMessage("Imagem de capa adicionada com sucesso!");
        } catch (error) {
            console.error("Erro ao enviar imagem de capa:", error);

            setMessage(
                error.message || "Não foi possível enviar a imagem de capa."
            );
        } finally {
            event.target.value = "";
        }
    };

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <section className="mx-auto max-w-4xl">
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
                    Administração
                </span>

                <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                    Gerenciar Blog
                </h1>

                <p className="mt-4 text-slate-400">
                    Crie, edite, publique e exclua artigos do blog.
                </p>

                <button
                    type="button"
                    onClick={handleFormToggle}
                    className="
        mt-6
        rounded-lg
        bg-violet-500
        px-5
        py-3
        text-sm
        font-semibold
        text-white
        transition
        hover:bg-violet-400
    "
                >
                    {showForm ? "Cancelar" : "+ Novo artigo"}
                </button>

                {message && (
                    <p className="mt-6 text-sm text-red-400">
                        {message}
                    </p>
                )}

                {showForm && (
                    <form
                        onSubmit={savePost}

                        className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6" >
                        <div className="grid gap-6 md:grid-cols-2">

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-300">
                                    Título
                                </label>

                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(event) => {
                                        const title = event.target.value;

                                        setFormData({
                                            ...formData,
                                            title: title,
                                            slug: generateSlug(title),
                                        });
                                    }}

                                    placeholder="Ex.: O significado espiritual da Lua Cheia"
                                    className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-300">
                                    Categoria
                                </label>

                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            category: event.target.value,
                                        })
                                    }
                                    placeholder="Ex.: Espiritualidade"
                                    className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-300">
                                    Slug
                                </label>

                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            slug: event.target.value,
                                        })
                                    }
                                    placeholder="o-significado-espiritual-da-lua-cheia"
                                    className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    Será usado no endereço do artigo.
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-300">
                                    Resumo
                                </label>

                                <textarea
                                    value={formData.summary}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            summary: event.target.value,
                                        })
                                    }
                                    rows="3"
                                    placeholder="Escreva uma breve apresentação do artigo..."
                                    className="w-full resize-none rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-300">
                                    Imagem de capa
                                </label>

                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            image_url: event.target.value,
                                        })
                                    }
                                    placeholder="https://..."
                                    className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />

                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => coverImageInputRef.current?.click()}
                                        className="rounded-lg border border-violet-400/40 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
                                    >
                                        🖼 Escolher imagem do computador
                                    </button>

                                    <input
                                        ref={coverImageInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleCoverImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-300">
                                    Conteúdo do artigo
                                </label>

                                <div className="mb-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={addTitle}
                                        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
                                    >
                                        Título
                                    </button>

                                    <button
                                        type="button"
                                        onClick={addSubtitle}
                                        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
                                    >
                                        Subtítulo
                                    </button>

                                    <button
                                        onClick={addBold}
                                        type="button"
                                        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
                                    >
                                        B
                                    </button>

                                    <button
                                        type="button"
                                        onClick={addItalic}
                                        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm italic text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
                                    >
                                        I
                                    </button>

                                    <button
                                        type="button"
                                        onClick={addList}
                                        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
                                    >
                                        • Lista
                                    </button>

                                    <button
                                        type="button"
                                        onClick={addQuote}
                                        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
                                    >
                                        ❝ Citação
                                    </button>

                                    <button
                                        type="button"
                                        onClick={addLink}
                                        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
                                    >
                                        🔗 Link
                                    </button>

                                    <button
                                        type="button"
                                        onClick={addImage}
                                        className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-violet-200"
                                    >
                                        🖼 Imagem
                                    </button>

                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />

                                </div>

                                <textarea
                                    ref={contentRef}
                                    value={formData.content}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            content: event.target.value,
                                        })
                                    }
                                    rows="12"
                                    placeholder="Escreva aqui o conteúdo completo do artigo..."
                                    className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 leading-7 text-white outline-none transition focus:border-violet-400"
                                />

                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="rounded-lg border border-violet-400/40 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
                                    >
                                        {showPreview ? "Ocultar prévia" : "👁 Visualizar prévia"}
                                    </button>
                                </div>

                                {showPreview && (
                                    <div className="mt-6 rounded-2xl border border-violet-400/20 bg-slate-950/60 p-6">
                                        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
                                            Pré-visualização
                                        </p>

                                        <div className="mb-8 border-b border-white/10 pb-8">
                                            {formData.category && (
                                                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                                                    {formData.category}
                                                </span>
                                            )}

                                            {formData.title && (
                                                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                                                    {formData.title}
                                                </h1>
                                            )}

                                            {formData.summary && (
                                                <p className="mt-4 text-lg leading-8 text-slate-300">
                                                    {formData.summary}
                                                </p>
                                            )}

                                            {formData.image_url && (
                                                <img
                                                    src={
                                                        formData.image_url.startsWith("/uploads/")
                                                            ? `${API_URL}${formData.image_url}`
                                                            : formData.image_url
                                                    }
                                                    alt={formData.title || "Imagem de capa do artigo"}
                                                    className="mt-6 max-h-[420px] w-full rounded-2xl object-cover"
                                                />
                                            )}
                                        </div>

                                        {formData.content ? (
                                            <ReactMarkdown
                                                components={{
                                                    h2: ({ children }) => (
                                                        <h2 className="mb-5 mt-8 text-3xl font-bold text-white">
                                                            {children}
                                                        </h2>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="mb-4 mt-7 text-2xl font-semibold text-violet-200">
                                                            {children}
                                                        </h3>
                                                    ),
                                                    p: ({ children }) => (
                                                        <p className="mb-5 leading-8 text-slate-300">
                                                            {children}
                                                        </p>
                                                    ),
                                                    strong: ({ children }) => (
                                                        <strong className="font-bold text-white">
                                                            {children}
                                                        </strong>
                                                    ),
                                                    em: ({ children }) => (
                                                        <em className="italic text-violet-200">
                                                            {children}
                                                        </em>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="mb-6 ml-6 list-disc space-y-2 text-slate-300">
                                                            {children}
                                                        </ul>
                                                    ),
                                                    li: ({ children }) => (
                                                        <li className="leading-7">
                                                            {children}
                                                        </li>
                                                    ),
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="my-6 rounded-r-xl border-l-4 border-violet-400 bg-violet-500/10 px-6 py-4 italic text-slate-300">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    a: ({ href, children }) => (
                                                        <a
                                                            href={href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium text-violet-300 underline decoration-violet-400/50 underline-offset-4 hover:text-violet-200"
                                                        >
                                                            {children}
                                                        </a>
                                                    ),

                                                    img: ({ src, alt }) => {
                                                        const imageSrc = src?.startsWith("/uploads/")
                                                            ? `${API_URL}${src}`
                                                            : src;

                                                        return (
                                                            <img
                                                                src={imageSrc}
                                                                alt={alt || "Imagem do artigo"}
                                                                loading="lazy"
                                                                className="my-8 h-auto max-h-[650px] w-full rounded-2xl object-cover shadow-lg sm:my-10 sm:rounded-3xl"
                                                            />
                                                        );
                                                    },

                                                }}
                                            >
                                                {formData.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                Escreva o conteúdo do artigo para visualizar a prévia.
                                            </p>
                                        )}
                                    </div>
                                )}

                            </div>

                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

                            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={formData.published}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            published: event.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 accent-violet-500"
                                />

                                {editingPostId
                                    ? "Artigo publicado"
                                    : "Publicar imediatamente"}
                            </label>

                            <div className="flex flex-wrap gap-3">

                                {editingPostId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm();
                                            setShowForm(false);
                                        }}
                                        className="
                    rounded-lg
                    border
                    border-slate-500
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-slate-300
                    transition
                    hover:bg-white/5
                "
                                    >
                                        Cancelar edição
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="
                rounded-lg
                bg-violet-500
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-violet-400
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
                                >
                                    {isSaving
                                        ? "Salvando..."
                                        : editingPostId
                                            ? "Salvar alterações"
                                            : "Salvar artigo"}
                                </button>

                            </div>

                        </div>
                    </form>
                )}

                <div className="mt-10">
                    <h2 className="text-2xl font-bold">
                        Artigos cadastrados
                    </h2>

                    {isLoading ? (
                        <p className="mt-6 text-slate-400">
                            Carregando artigos...
                        </p>
                    ) : posts.length === 0 ? (
                        <p className="mt-6 text-slate-400">
                            Nenhum artigo cadastrado.
                        </p>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {posts.map((post) => (
                                <article
                                    key={post.id}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-xl font-semibold">
                                                {post.title}
                                            </h3>

                                            <p className="mt-2 text-sm text-slate-400">
                                                {post.category}
                                            </p>
                                        </div>

                                        <span
                                            className={
                                                post.published
                                                    ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                                                    : "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300"
                                            }
                                        >
                                            {post.published
                                                ? "Publicado"
                                                : "Rascunho"}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-sm text-slate-300">
                                        {post.summary}
                                    </p>

                                    <p className="mt-3 text-xs text-slate-500">
                                        Slug: {post.slug}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(post)}
                                            className="rounded-lg border border-violet-400/40 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => togglePublished(post)}
                                            className={
                                                post.published
                                                    ? "rounded-lg border border-amber-400/40 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/10"
                                                    : "rounded-lg border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
                                            }
                                        >
                                            {post.published ? "Despublicar" : "Publicar"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => deletePost(post)}
                                            className="rounded-lg border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                                        >
                                            Excluir
                                        </button>
                                    </div>

                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}