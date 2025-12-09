"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import InnerBanner from "@/components/common/InnerBanner";
import FaqList from "@/components/faq/FaqList";
import useApi from "@/utils/useApi";

interface ProductDescriptionProps {
    params: Promise<{ slug: string }>;
}

interface Event {
    id: number;
    name: string;
    slug: string;
    categoryId: number;
    price: number | null;
    imageUrl: string | null;
    description: string | null;
    category: {
        id: number;
        title: string;
        slug: string;
    } | null;
    status: boolean;
    createdAt: string;
}

export default function ProductDescriptionPage({ params }: ProductDescriptionProps) {
    // Use React's use() hook to unwrap the Promise synchronously
    const { slug } = use(params);
    
    const [events, setEvents] = useState<Event[]>([]);
    const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);

    const { data, loading: apiLoading, error: apiError, fetchApi } = useApi({
        url: `/api/users/events?cat_id=${slug}`,
        type: "manual",
        method: "GET",
        requiresAuth: false,
    });

    // Set page title
    useEffect(() => {
        const pageTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        document.title = `My Waldo | ${pageTitle}`;
    }, [slug]);

    // Fetch events when slug is available
    useEffect(() => {
        if (slug) {
            fetchApi();
        }
    }, [slug]);

    // Update events when data is received and fetch FAQs
    useEffect(() => {
        if (data && Array.isArray(data)) {
            setEvents(data);
            // Fetch FAQs using the categoryId from the first event
            if (data.length > 0 && data[0].categoryId) {
                const fetchCategoryFaqs = async () => {
                    try {
                        const response = await fetch(`/api/users/events/category/faq?eventCategoryId=${data[0].categoryId}`);
                        const result = await response.json();
                        if (result.data && Array.isArray(result.data)) {
                            setFaqs(result.data.map((faq: any) => ({
                                question: faq.question,
                                answer: faq.answer,
                            })));
                        }
                    } catch (err) {
                        console.error("Error fetching FAQs:", err);
                    }
                };
                fetchCategoryFaqs();
            }
        }
    }, [data]);

    
    return (
        <>

            {/* remove the dashes */}
            <InnerBanner bannerClass="products-banner capitalize" title={slug.replace(/-/g, ' ')} />

            <section className="sec-gap">

                <div className="container">
                    {apiLoading ? (
                        <div className="text-center py-8 loading-text"></div>
                    ) : apiError ? (
                        <div className="text-center py-8 text-red-500">Error loading events: {apiError}</div>
                    ) : events.length > 0 ? (
                        <div className="product-description-content">
                            {events.map((event) => (
                                <div key={event.id} className="text-center description-content-item mb-8">
                                    <div className="flex justify-center gap-4 items-center mb-4">
                                        <h2 className="text-[20px] font-bold">{event.name}</h2>
                                        {event.price !== null && (
                                            <p className="text-xl text-gray-600">Price: ${event.price.toFixed(2)}</p>
                                        )}
                                    </div>
                                    {event.description && (
                                        <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                                            {event.description}
                                        </p>
                                    )}
                                    <span className="">To add to cart</span>
                                    <div className="mt-6">
                                        <Link
                                            href="#"
                                            className="btn btn-primary inline-flex items-center gap-2"
                                        >
                                            <Image src="/images/waldo-logo.png" alt="cart" width={100} height={100} />
                                            <span>Click Me</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-xl text-gray-600">No events found for this category.</p>
                        </div>
                    )}
                </div>
            </section>
            <section className="pb-20">
                <div className="container mx-auto">
                    <FaqList faqs={faqs} />
                </div>
            </section>
        </>
    )
}