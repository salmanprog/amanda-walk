"use client";

import Image from "next/image";
import { useState } from "react";
import InnerBanner from "@/components/common/InnerBanner";
import Input from "@/components/form/input/InputField";
import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import { Icons } from "@/components/icons/Index";

interface GalleryClientProps {
    images: string[];
    productTitle: string;
}

export default function GalleryClient({ images, productTitle }: GalleryClientProps) {
    const [visibleCount, setVisibleCount] = useState(10);
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10);
    };

    const handleDownload = async (e: React.MouseEvent, imageUrl: string, imageName: string) => {
        e.stopPropagation();

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = imageName || `gallery-image-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const visibleImages = images.slice(0, visibleCount);
    const slides = images.map((image) => ({
        src: image,
        alt: productTitle,
    }));

    if (images.length === 0) {
        return (
            <>
            <InnerBanner bannerClass="products-banner" title={'Photo Gallery'} />
            <section className="py-20">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-6">{productTitle}</h1>
                    <p className="text-gray-600">No gallery images available for this product.</p>
                </div>
            </section>
            </>
        );
    }

    return (
        <>
            <InnerBanner bannerClass="products-banner" title={'Photo Gallery'} />
            <section className="py-20">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="hd-md">Gallery</h3>
                        </div>
                        <div className="w-1/3 relative">
                            <Input type="text" className="!bg-transparent !text-gray-500 !border-gray-300 custom-input pl-[48px]" placeholder="Search images" />
                            <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                <Icons.search className="text-[24px]" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {visibleImages.map((image, imgIndex) => {
                            return (
                                <div
                                    key={`${image}-${imgIndex}`}
                                    onClick={() => {
                                        setIndex(imgIndex);
                                        setOpen(true);
                                    }}
                                    className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
                                >
                                    <Image
                                        src={image}
                                        alt={`Gallery image ${imgIndex + 1}`}
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <button
                                        onClick={(e) => handleDownload(e, image, `gallery-image-${imgIndex + 1}.jpg`)}
                                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                        title="Download image"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {visibleCount < images.length && (
                        <div className="text-center mt-10">
                            <button
                                onClick={handleLoadMore}
                                className="btn btn-primary"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            </section>
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={index}
                slides={slides}
                plugins={[Download]}
            />
        </>
    );
}

