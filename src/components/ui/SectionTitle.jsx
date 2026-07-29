export default function SectionTitle({
    subtitle,
    title,
    description,
}) {
    return (
        <div className="text-center mb-16">

            <span className="uppercase tracking-[0.3em] text-violet-300 text-sm font-semibold">
                {subtitle}
            </span>

            <h2 className="mt-4 text-5xl font-bold text-white">
                {title}
            </h2>

            <p className="mt-6 max-w-2xl mx-auto text-slate-300 leading-8">
                {description}
            </p>

        </div>
    );
}