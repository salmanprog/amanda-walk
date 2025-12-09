import Image from "next/image";
import { products } from "../data";
import { notFound } from "next/navigation";
import Link from "next/link";
import InnerBanner from "@/components/common/InnerBanner";

interface ProductDetailProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
    const { slug } = await params;
    
    // Find the product by slug
    const product = products.find((p) => p.slug === slug);
    
    // If product not found, show 404
    if (!product) {
        notFound();
    }

    return (
        <>
            <InnerBanner bannerClass="products-banner" title={'Product Detail'} />
            <section className="py-20">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <Image className="w-full h-full object-fit-cover" src={product.image} alt={product.title} width={500} height={500} />
                        </div>
                        <div className="col-span-1">
                            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                            {product.subtitle && (
                                <p className="text-xl text-gray-600 mb-2">{product.subtitle}</p>
                            )}
                            <p className="text-2xl font-semibold text-blue-600 mb-4">{product.price}</p>
                            
                            {product.description && (
                                <p className="text-base text-gray-700 mb-4">{product.description}</p>
                            )}
                            
                            {product.highlight && (
                                <p className="text-lg font-semibold text-green-600 mb-3">{product.highlight}</p>
                            )}
                            
                            {product.limit && (
                                <p className="text-base text-orange-600 mb-3">{product.limit}</p>
                            )}
                            
                            {product.infoLink && (
                                <a href={product.infoLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-3 block">
                                    More Information
                                </a>
                            )}
                            {product.details && product.details.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-2">Details:</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {product.details.map((detail, index) => (
                                            <li key={index} className="text-base">{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {product.contact && (
                                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                                    <p className="text-base mb-1"><strong>Name:</strong> {product.contact.name}</p>
                                    <p className="text-base mb-1"><strong>Phone:</strong> <Link href={`tel:${product.contact.phone}`}>{product.contact.phone}</Link></p>
                                    <p className="text-base mb-1"><strong>Email:</strong> <Link href={`mailto:${product.contact.email}`}>{product.contact.email}</Link></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}


