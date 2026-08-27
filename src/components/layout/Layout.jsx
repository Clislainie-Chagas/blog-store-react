import Navbar from "./Navbar";
import Footer from "./Footer";
import GalaxyBackground from "../common/GalaxyBackground";

export default function Layout({ children, favorites, }) {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="min-h-screen flex flex-col">

                <GalaxyBackground />

                <Navbar favorites={favorites} />

                <main className="flex-1">
                    {children}
                </main>

                <Footer />

            </div>

        </div>
    );
}