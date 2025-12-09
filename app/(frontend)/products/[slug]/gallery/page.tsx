import { products } from "../../data";
import { notFound } from "next/navigation";
import GalleryClient from "./GalleryClient";

interface GalleryPageProps {
    params: Promise<{ slug: string }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
    const { slug } = await params;

    // Find the product by slug
    const product = products.find((p) => p.slug === slug);

    // If product not found, show 404
    if (!product) {
        notFound();
    }

    const images = product.gallery || [];

    return <GalleryClient images={images} productTitle={product.title} />;
}
