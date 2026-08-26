import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import heroSlides from "../../../data/heroSlides";

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const nextSlide = () => {
        setIsAnimating(true);

        setTimeout(() => {
            setCurrentSlide((current) =>
                current === heroSlides.length - 1 ? 0 : current + 1
            );

            setIsAnimating(false);
        }, 300);
    };

    const previousSlide = () => {
        setIsAnimating(true);

        setTimeout(() => {
            setCurrentSlide((current) =>
                current === 0 ? heroSlides.length - 1 : current - 1
            );

            setIsAnimating(false);
        }, 300);
    };

    const goToSlide = (index) => {
        if (index === currentSlide) return;

        setIsAnimating(true);

        setTimeout(() => {
            setCurrentSlide(index);
            setIsAnimating(false);
        }, 300);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 7000);

        return () => clearInterval(interval);
    }, []);

    const slide = heroSlides[currentSlide];

    return (
        <section className="relative mx-auto max-w-7xl px-6 py-8">

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">

                <div
                    className={`
                        grid
                        min-h-[520px]
                        items-center
                        transition-all
                        duration-500
                        ease-out
                        lg:grid-cols-2
                        ${isAnimating
                            ? "opacity-0 translate-x-4"
                            : "opacity-100 translate-x-0"}`
                    }>

                    {/* TEXTO */}
                    <div className="relative z-10 px-6 py-12 sm:px-8 sm:py-16 lg:px-14">

                        <span className="text-sm font-semibold uppercase tracking-[0.4em] text-violet-300">
                            {slide.eyebrow}
                        </span>

                        <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
                            {slide.title}
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                            {slide.description}
                        </p>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">

                            <Link
                                to={slide.primaryLink}
                                className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500"
                            >
                                {slide.primaryLabel}
                            </Link>

                            <Link
                                to={slide.secondaryLink}
                                className="rounded-xl border border-violet-400/50 px-6 py-3 font-semibold text-violet-200 transition hover:bg-violet-500/10"
                            >
                                {slide.secondaryLabel}
                            </Link>

                        </div>

                    </div>

                    {/* IMAGEM */}
                    <div className="relative min-h-[300px] sm:min-h-[360px] lg:h-full lg:min-h-[420px]">

                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent lg:from-slate-950/70" />

                    </div>

                </div>

                {/* SETA ESQUERDA */}
                <button
                    onClick={previousSlide}
                    aria-label="Slide anterior"
                    className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur transition hover:bg-violet-600 sm:left-4 sm:p-3"
                >
                    <ChevronLeft />
                </button>

                {/* SETA DIREITA */}
                <button
                    onClick={nextSlide}
                    aria-label="Próximo slide"
                    className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-white backdrop-blur transition hover:bg-violet-600"
                >
                    <ChevronRight />
                </button>

            </div>

            {/* INDICADORES */}
            <div className="mt-5 flex justify-center gap-3">
                {heroSlides.map((item, index) => (
                    <button
                        key={item.id}
                        onClick={() => goToSlide(index)}
                        aria-label={`Ir para slide ${index + 1}`}
                        className={`h-2.5 w-2.5 rounded-full transition ${currentSlide === index
                            ? "bg-violet-400 scale-125"
                            : "bg-slate-600 hover:bg-slate-400"
                            }`}
                    />
                ))}
            </div>

        </section >
    );
}