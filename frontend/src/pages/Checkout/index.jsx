import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Checkout({ cart = [] }) {
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cep: "",
        state: "",
        street: "",
        number: "",
        complement: "",
        city: "",
    });
    const [shipping, setShipping] = useState(null);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);

    const [isLoadingCep, setIsLoadingCep] = useState(false);

    const hasPhysicalItems = cart.some(
        (item) => (item.product_type ?? "physical") === "physical"
    );

    const subtotal = cart.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
    );

    const total = subtotal + (shipping ?? 0);

    const [orderMessage, setOrderMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);


    const formatCep = (value) => {
        const numbers = value.replace(/\D/g, "").slice(0, 8);

        return numbers.replace(
            /^(\d{5})(\d)/,
            "$1-$2"
        );
    };

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, "").slice(0, 11);

        if (numbers.length <= 10) {
            return numbers
                .replace(/^(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{4})(\d)/, "$1-$2");
        }

        return numbers
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2");
    };
    const handleChange = (event) => {
        const { name, value } = event.target;

        let formattedValue = value;

        if (name === "cep") {
            formattedValue = formatCep(value);
        }

        if (name === "phone") {
            formattedValue = formatPhone(value);
        }

        setFormData((currentData) => ({
            ...currentData,
            [name]: formattedValue,
        }));

        if (errors[name]) {
            setErrors((currentErrors) => ({
                ...currentErrors,
                [name]: "",
            }));
        }
    };

    const handleCepBlur = async () => {
        const cleanCep = formData.cep.replace(/\D/g, "");

        if (cleanCep.length !== 8) {
            return;
        }

        setIsLoadingCep(true);

        try {
            const response = await fetch(
                `https://viacep.com.br/ws/${cleanCep}/json/`
            );

            if (!response.ok) {
                throw new Error("Erro na consulta do CEP.");
            }

            const data = await response.json();

            if (data.erro) {
                setErrors((currentErrors) => ({
                    ...currentErrors,
                    cep: "CEP não encontrado.",
                }));

                return;
            }

            setFormData((currentData) => ({
                ...currentData,
                street: data.logradouro || "",
                city: data.localidade || "",
                state: data.uf || "",
            }));

            setErrors((currentErrors) => ({
                ...currentErrors,
                cep: "",
            }));
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);

            setErrors((currentErrors) => ({
                ...currentErrors,
                cep: "Não foi possível consultar o CEP.",
            }));
        } finally {
            setIsLoadingCep(false);
        }
    };

    const handleCalculateShipping = async () => {
        const cleanCep = formData.cep.replace(/\D/g, "");

        if (cleanCep.length !== 8) {
            setErrors((currentErrors) => ({
                ...currentErrors,
                cep: "Informe um CEP válido para calcular o frete.",
            }));
            return;
        }

        const physicalItems = cart.filter(
            (item) => (item.product_type ?? "physical") === "physical"
        );

        if (physicalItems.length === 0) {
            setShipping(0);
            setShippingOptions([]);
            setSelectedShipping(null);
            return;
        }

        setIsLoadingShipping(true);
        setShippingOptions([]);
        setSelectedShipping(null);
        setShipping(null);

        try {
            /*
             * PRIMEIRO TESTE:
             * usamos as mesmas medidas que já funcionaram no Swagger.
             *
             * Depois substituiremos isso pelas medidas reais dos produtos
             * cadastradas no PostgreSQL.
             */
            const response = await fetch(`${API_URL}/shipping/quote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    destination_cep: cleanCep,
                    weight: 0.5,
                    width: 12,
                    height: 2,
                    length: 17,
                    insurance_value: subtotal,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                    typeof errorData.detail === "string"
                        ? errorData.detail
                        : "Não foi possível calcular o frete."
                );
            }

            const options = await response.json();

            setShippingOptions(options);

            if (options.length === 0) {
                throw new Error(
                    "Nenhuma opção de entrega disponível para este CEP."
                );
            }
        } catch (error) {
            console.error("Erro ao calcular frete:", error);

            setShippingOptions([]);
            setSelectedShipping(null);
            setShipping(null);

            setOrderMessage(error.message);
        } finally {
            setIsLoadingShipping(false);
        }
    };
    const validateForm = () => {
        const newErrors = {};

        // Dados pessoais — obrigatórios para qualquer compra
        if (!formData.name.trim()) {
            newErrors.name = "Informe seu nome completo.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Informe seu e-mail.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Informe um e-mail válido.";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Informe seu telefone.";
        }

        // Endereço — obrigatório somente quando houver produto físico
        if (hasPhysicalItems) {
            if (!formData.cep.trim()) {
                newErrors.cep = "Informe seu CEP.";
            } else if (
                formData.cep.replace(/\D/g, "").length !== 8
            ) {
                newErrors.cep = "O CEP deve conter 8 números.";
            }

            if (!formData.state.trim()) {
                newErrors.state = "Informe o estado.";
            }

            if (!formData.street.trim()) {
                newErrors.street = "Informe a rua.";
            }

            if (!formData.number.trim()) {
                newErrors.number = "Informe o número.";
            }

            if (!formData.city.trim()) {
                newErrors.city = "Informe a cidade.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    const handleContinue = async () => {


        if (cart.length === 0) {
            return;
        }

        if (isLoadingCep) {
            return;
        }

        const hasPhysicalItems = cart.some(
            (item) => (item.product_type ?? "physical") === "physical"
        );

        if (hasPhysicalItems && !selectedShipping) {
            setOrderMessage(
                "Selecione uma opção de entrega antes de continuar para o pagamento."
            );
            return;
        }

        const isValid = validateForm();

        if (!isValid) {
            return;
        }
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setOrderMessage("");

        const orderData = {
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,

            shipping_cep: formData.cep,
            shipping_state: formData.state,
            shipping_city: formData.city,
            shipping_street: formData.street,
            shipping_number: formData.number,
            shipping_complement: formData.complement || null,
            shipping_service_id: selectedShipping?.id ?? null,

            shipping_service_name: selectedShipping?.name ?? null,
            shipping_company: selectedShipping?.company ?? null,
            shipping_price: shipping ?? 0,
            shipping_delivery_min: selectedShipping?.delivery_min ?? null,
            shipping_delivery_max: selectedShipping?.delivery_max ?? null,

            items: cart.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
            })),
        };

        try {
            const response = await fetch(
                `${API_URL}/orders/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                    errorData.detail || "Não foi possível criar o pedido"
                );
            }

            const order = await response.json();

            setCreatedOrder(order);

            setOrderMessage(
                `Pedido #${order.id} criado com sucesso!`
            );

        } catch (error) {
            console.error("Erro ao criar pedido:", error.message);
            setOrderMessage(error.message);
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen px-6 py-10 text-white">
            <div className="mx-auto max-w-6xl">

                <Link
                    to="/cart"
                    className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-violet-300"
                >
                    <ArrowLeft size={18} />
                    Voltar ao carrinho
                </Link>

                <div className="mb-10">
                    <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
                        Finalização
                    </p>

                    <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                        Checkout
                    </h1>

                    <p className="mt-3 text-slate-400">
                        Preencha seus dados para continuar com a compra.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

                    <section className="space-y-8">

                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                            <h2 className="mb-6 text-xl font-semibold">
                                Dados pessoais
                            </h2>

                            <div className="grid gap-5 md:grid-cols-2">

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Nome completo
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Digite seu nome"
                                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-violet-400"
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        E-mail
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="seuemail@email.com"
                                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-violet-400"
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-400">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Telefone
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        maxLength={15}
                                        placeholder="(47) 99999-9999"
                                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-violet-400"
                                    />
                                    {errors.phone && (
                                        <p className="mt-2 text-sm text-red-400">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {hasPhysicalItems && (

                            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">

                                <h2 className="mb-6 text-xl font-semibold">
                                    Endereço de entrega
                                </h2>

                                <div className="grid gap-5 md:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block text-sm text-slate-300">
                                            CEP
                                        </label>

                                        <input
                                            type="text"
                                            name="cep"
                                            value={formData.cep}
                                            onChange={handleChange}
                                            onBlur={handleCepBlur}
                                            maxLength={9}
                                            placeholder="00000-000"
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-violet-400"
                                        />
                                        {isLoadingCep && (
                                            <p className="mt-2 text-sm text-violet-300">
                                                Buscando CEP...
                                            </p>
                                        )}
                                        {errors.cep && (
                                            <p className="mt-2 text-sm text-red-400">
                                                {errors.cep}
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleCalculateShipping}
                                            disabled={isLoadingShipping}
                                            className="
        mt-3
        rounded-lg
        bg-violet-600
        px-4
        py-2
        text-sm
        font-semibold
        text-white
        transition
        hover:bg-violet-500
        disabled:cursor-not-allowed
        disabled:bg-slate-700
        disabled:text-slate-400
    "
                                        >
                                            {isLoadingShipping
                                                ? "Calculando..."
                                                : "Calcular frete"}
                                        </button>

                                    </div>

                                    {shippingOptions.length > 0 && (
                                        <div className="md:col-span-2 rounded-xl border border-white/10 bg-slate-950/40 p-4">
                                            <p className="mb-3 font-semibold text-white">
                                                Escolha uma opção de entrega
                                            </p>

                                            <div className="space-y-3">
                                                {shippingOptions.map((option) => (
                                                    <label
                                                        key={option.id}
                                                        className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 p-4 transition hover:border-violet-400"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                name="shippingOption"
                                                                checked={selectedShipping?.id === option.id}
                                                                onChange={() => {
                                                                    setSelectedShipping(option);
                                                                    setShipping(Number(option.price));
                                                                    setOrderMessage("");
                                                                }}
                                                            />

                                                            <div>
                                                                <p className="font-semibold">
                                                                    {option.company} {option.name}
                                                                </p>

                                                                <p className="text-sm text-slate-400">
                                                                    Prazo: {option.delivery_min} a{" "}
                                                                    {option.delivery_max} dias
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <strong className="whitespace-nowrap text-violet-300">
                                                            {Number(option.price).toLocaleString("pt-BR", {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            })}
                                                        </strong>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-2 block text-sm text-slate-300">
                                            Estado
                                        </label>

                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="SC"
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-violet-400"
                                        />
                                        {errors.state && (
                                            <p className="mt-2 text-sm text-red-400">
                                                {errors.state}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm text-slate-300">
                                            Rua
                                        </label>

                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            placeholder="Nome da rua"
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-violet-400"
                                        />
                                        {errors.street && (
                                            <p className="mt-2 text-sm text-red-400">
                                                {errors.street}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm text-slate-300">
                                            Número
                                        </label>

                                        <input
                                            type="text"
                                            name="number"
                                            value={formData.number}
                                            onChange={handleChange}
                                            placeholder="123"
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-violet-400"
                                        />
                                        {errors.number && (
                                            <p className="mt-2 text-sm text-red-400">
                                                {errors.number}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm text-slate-300">
                                            Complemento
                                        </label>

                                        <input
                                            type="text"
                                            name="complement"
                                            value={formData.complement}
                                            onChange={handleChange}
                                            placeholder="Apto, bloco, sala..."
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-violet-400"
                                        />

                                        <p className="mt-2 text-xs text-slate-500">
                                            Opcional
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm text-slate-300">
                                            Cidade
                                        </label>

                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="Sua cidade"
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-violet-400"
                                        />
                                        {errors.city && (
                                            <p className="mt-2 text-sm text-red-400">
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>

                                </div>
                            </div>
                        )}

                    </section>

                    <aside className="h-fit rounded-2xl border border-white/10 bg-slate-900/60 p-6 lg:sticky lg:top-24">

                        <h2 className="text-xl font-semibold">
                            Resumo do pedido
                        </h2>

                        <div className="mt-6 space-y-4">

                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-4 border-b border-white/10 pb-4"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {item.name}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Quantidade: {item.quantity}
                                        </p>
                                    </div>

                                    <p className="whitespace-nowrap text-sm">
                                        {(Number(item.price) * item.quantity).toLocaleString(
                                            "pt-BR",
                                            {
                                                style: "currency",
                                                currency: "BRL",
                                            }
                                        )}
                                    </p>
                                </div>
                            ))}

                        </div>

                        <div className="mt-6 flex items-center justify-between text-slate-300">
                            <span>Subtotal</span>

                            <span>
                                {subtotal.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                })}
                            </span>

                        </div>

                        {hasPhysicalItems && (
                            <div className="mt-3 flex items-center justify-between text-slate-300">
                                <span>Frete</span>
                                <span>
                                    {shipping !== null
                                        ? `R$ ${shipping.toFixed(2).replace(".", ",")}`
                                        : "A calcular"}
                                </span>
                            </div>
                        )}

                        <div className="mt-6 border-t border-white/10 pt-5">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold">
                                    Total
                                </span>

                                <span className="text-xl font-bold text-violet-300">
                                    {total.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })}
                                </span>
                            </div>
                        </div>

                        {orderMessage && (
                            <p className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                                {orderMessage}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={
                                cart.length === 0 ||
                                isLoadingCep ||
                                isSubmitting ||
                                createdOrder !== null
                            }
                            className="
        mt-6
        w-full
        rounded-xl
        bg-violet-500
        px-5
        py-3
        font-semibold
        transition
        hover:bg-violet-400
        disabled:cursor-not-allowed
        disabled:bg-slate-700
        disabled:text-slate-400
    "
                        >
                            {isSubmitting
                                ? "Criando pedido..."
                                : createdOrder
                                    ? `Pedido #${createdOrder.id} criado`
                                    : isLoadingCep
                                        ? "Aguarde..."
                                        : "Continuar para pagamento"}
                        </button>

                        {createdOrder && (
                            <Link
                                to={`/payment/${createdOrder.id}`}
                                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500"
                            >
                                Ir para pagamento
                            </Link>
                        )}

                    </aside>

                </div>
            </div>
        </main>
    );
}