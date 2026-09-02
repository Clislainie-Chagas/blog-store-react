import { Search } from "lucide-react";

export default function SearchBar({
    search,
    setSearch,
}) {

    return (
        <div className="relative w-80">

            <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Pesquisar livros..."
                className="
          w-full
          rounded-xl
          border
          border-white/10
          bg-white/5
          py-2.5
          pl-10
          pr-4
          text-white
          placeholder:text-slate-400
          backdrop-blur-lg
          outline-none
          transition
          focus:border-violet-500
        "
            />

        </div>
    );
}