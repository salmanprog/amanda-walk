import InnerBanner from "@/components/common/InnerBanner";
import Image from "next/image";
import Link from "next/link";
import { packages } from "./data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Waldo | Packages",
  description: "View our packages",
};

export default function PackagesPage() {
    return (
        <>
            <InnerBanner bannerClass="packages-banner inner-banner" title={'Packages'} />
            <section className="packages-sec sec-gap">
                <div className="container">
                    <h2 className="hd-lg text-center !text-black mb-4">Our Packages</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        Choose the perfect package for your needs. All packages are one-time payment with lifetime access to your selected features.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className={`package-card ${pkg.popular ? 'popular' : ''}`}>
                                {pkg.popular && (
                                    <div className="popular-badge">Most Popular</div>
                                )}
                                <div className="package-card-image">
                                    <Image 
                                        src={pkg.image} 
                                        alt={pkg.title}
                                        width={400}
                                        height={300}
                                        className="w-full"
                                    />
                                </div>
                                <div className="package-card-content">
                                    <h3 className="package-card-title">{pkg.title}</h3>
                                    <div className="package-price-wrapper">
                                        <span className="package-price">{pkg.price}</span>
                                        {pkg.originalPrice && (
                                            <span className="package-original-price">{pkg.originalPrice}</span>
                                        )}
                                    </div>
                                    <p className="package-description">{pkg.description}</p>
                                    <ul className="package-features">
                                        {pkg.features.map((feature, index) => (
                                            <li key={index}>
                                                <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="package-footer">
                                        <p className="one-time-payment">One-Time Payment</p>
                                        <Link href="#" className="btn btn-primary w-full">
                                            Purchase Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}