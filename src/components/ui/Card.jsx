export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        shadow-xl
        transition-all
        duration-300
        hover:border-violet-400/30
        hover:shadow-violet-500/20
        hover:-translate-y-2
        ${className}
      `}
    >
      {children}
    </div>
  );
}