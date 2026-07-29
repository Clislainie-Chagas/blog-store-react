import Hero from "./components/Hero";
import FeaturedBooks from "./components/FeaturedBooks";
import { useState } from "react";

export default function Home() {
    const [search, setSearch] = useState("");
    return (
        <>
            <Hero
                search={search}
                setSearch={setSearch}
            />
            <FeaturedBooks />
        </>
    );
}