export default function Toast({
    message,
    type = "success",
}) {
    if (!message) {
        return null;
    }

    const styles = {
        success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
        warning: "border-amber-400/30 bg-amber-500/10 text-amber-300",
        error: "border-red-400/30 bg-red-500/10 text-red-300",
    };

    return (
        <div
            className={`
                fixed
                bottom-6
                right-6
                z-[100]
                max-w-sm
                rounded-xl
                border
                px-5
                py-4
                shadow-2xl
                backdrop-blur-xl
                ${styles[type]}
            `}
        >
            {message}
        </div>
    );
}