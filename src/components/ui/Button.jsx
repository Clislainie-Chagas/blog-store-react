export default function Button({
    children,
    variant = "primary",
    onClick,
}) {

    const styles = {
        primary:
            "bg-violet-600 hover:bg-violet-500 text-white",

        secondary:
            "bg-slate-700 hover:bg-slate-600 text-white",

        outline:
            "border border-violet-500 text-violet-300 hover:bg-violet-500/10",
    };

    return (
        <button
            onClick={onClick}
            className={`
        px-5
        py-2
        rounded-xl
        transition
        duration-300
        font-semibold
        ${styles[variant]}
      `}
        >
            {children}
        </button>
    );
}