import Navbar from "./Navbar";
import Footer from "./Footer";
import GalaxyBackground from "../common/GalaxyBackground";

export default function Layout({ children, favorites, cart, }) {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="min-h-screen flex flex-col">

                <GalaxyBackground />

                <Navbar favorites={favorites} cart={cart} />

                <main className="flex-1">
                    {children}
                </main>

                <Footer />

            </div>

        </div>
    );
}