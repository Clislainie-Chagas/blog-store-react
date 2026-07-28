export default function Badge({
    children,
    variant = "primary"
}) {

    const styles = {
        primary: "bg-violet-600/20 text-violet-300 border border-violet-500/30",

        success: "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30",

        warning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",

        danger: "bg-red-600/20 text-red-300 border border-red-500/30",
    };

    return (
        <span
            className={`
                inline-flex
                items-center
                rounded-4xl
                px-3
                py-1
                text-xs
                font-medium
                ${styles[variant]}
            `}
        >
            {children}
        </span>
    );
}