'use client';
import Link from "next/link";

export default function Sec({ 
    title, 
    sectionClass, 
    href, 
    backgroundImage 
}: { 
    title: string; 
    sectionClass?: string; 
    href: string; 
    backgroundImage?: string | null;
}) {
    return (
        <Link href={href || "/"}>
            <section 
                className={`home-sec h-screen flex items-center relative ${sectionClass || ''}`}
                style={backgroundImage ? {
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                } : {}}
            >
                {/* Overlay for better text readability */}
                {backgroundImage && (
                    <div className="absolute inset-0 bg-black/40 z-[1]"></div>
                )}
                <div className="container relative z-10">
                    <h2 className="hd-lg text-center text-white">{title}</h2>
                </div>
            </section>
        </Link>
    )
}