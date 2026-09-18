import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/admin/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("E-mail ou senha inválidos");
            }

            const data = await response.json();

            localStorage.setItem(
                "admin_token",
                data.access_token
            );

            navigate("/admin/products");

        } catch (error) {
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl">

                <h1 className="text-2xl font-bold text-white mb-6">
                    Login Administrativo
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                        className="p-3 rounded bg-slate-800 text-white"
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                        className="p-3 rounded bg-slate-800 text-white"
                    />

                    {error && (
                        <p className="text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-violet-600 hover:bg-violet-500 text-white p-3 rounded"
                    >
                        {loading
                            ? "Entrando..."
                            : "Entrar"}
                    </button>
                </form>

            </div>
        </main>
    );
}

export default AdminLogin;