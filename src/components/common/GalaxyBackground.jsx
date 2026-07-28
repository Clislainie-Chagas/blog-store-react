export default function GalaxyBackground() {
    return (
        <>
            <div className="fixed inset-0 -z-50 overflow-hidden bg-[#020617]">

                <div className="absolute top-[-150px] left-[-120px] h-[420px] w-[420px] rounded-full bg-violet-700/25 blur-3xl" />

                <div className="absolute bottom-[-180px] right-[-120px] h-[500px] w-[500px] rounded-full bg-blue-700/20 blur-3xl" />

                <div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

            </div>
        </>
    );
}