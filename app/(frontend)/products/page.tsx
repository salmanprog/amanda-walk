import Image from "next/image";
import Link from "next/link";
import { products } from "./data";
import InnerBanner from "@/components/common/InnerBanner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Waldo | Products",
  description: "Browse our products",
};

export default function ProductsPage() {

    return (
        <>
            <InnerBanner bannerClass="products-banner" title={'Products'} />
            <section className="products-section sec-gap">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <div className="product-card group" key={product.id}>
                                <div className="product-card-image">
                                    <Image src={product.image} className="w-full" alt={product.title} width={400} height={400} />
                                </div>
                                <div className="product-card-content">
                                    {product.eventDate && (
                                        <span className="event-date">Event Held: {product.eventDate}</span>
                                    )}
                                    <h3 className="product-card-title line-clamp-2">{product.title}</h3>
                                </div>
                                <div className="product-hidden-content">
                                    <Link href={`/products/${product.slug}/gallery`} className="btn btn-primary w-full flex justify-center items-center gap-2">
                                        <span>View Gallery</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}