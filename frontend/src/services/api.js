import { API_URL } from "../config";

export async function listarTarefas() {
    const resposta = await fetch(`${API_URL}/tarefas`);
    return await resposta.json();
}

export async function criarTarefa(tarefa) {
    const resposta = await fetch(`${API_URL}/tarefas`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(tarefa),
    });

    return await resposta.json();
}