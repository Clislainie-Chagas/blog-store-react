import Navbar from "./Navbar";
import Footer from "./Footer";
import GalaxyBackground from "../common/GalaxyBackground";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="min-h-screen flex flex-col">

                <GalaxyBackground />

                <Navbar />

                <main className="flex-1">
                    {children}
                </main>

                <Footer />

            </div>

        </div>
    );
}