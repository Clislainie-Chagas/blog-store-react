export default function GalaxyBackground() {
    return (
        <>
            <div className="fixed inset-0 -z-50 overflow-hidden bg-[#020617]">

                <div className="absolute -top-37.5 -left-30 h-105 w-105 rounded-full bg-violet-700/25 blur-3xl" />

                <div className="absolute -bottom-45 -right-30 h-125 w-125 rounded-full bg-blue-700/20 blur-3xl" />

                <div className="absolute top-1/2 left-1/2 h-87.5 w-87.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

            </div>
        </>
    );
}
