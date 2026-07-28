export default function Rating({ value }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-yellow-400">⭐</span>

            <span className="text-sm text-slate-300">
                {value}
            </span>
        </div>
    );
}