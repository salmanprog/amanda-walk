import InnerBanner from "@/components/common/InnerBanner";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/icons/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Waldo | Contact Us",
  description: "Contact My Waldo",
};

export default function AboutPage() {
    return (
        <>
            <InnerBanner bannerClass="products-banner" title={'Contact Us'} />
            <section className="about-sec sec-gap">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 justify-between items-center gap-10">
                        <div className="flex flex-col gap-5 contact-con order-2 md:order-1">
                            <h3 className="hd-md flex items-center gap-2"><span><Icons.website className="text-[20px] contact-icon" /></span> <Link className="underline hover:text-[var(--secondary-theme-light)]" href="https://plebesummer.com">Plebesummer.com</Link></h3>
                            <h3 className="hd-md flex items-center gap-2"><span><Icons.email className="text-[20px] contact-icon" /></span> <Link className="underline hover:text-[var(--secondary-theme-light)]" href="mailto:ThorntonStudios@comcats.net">ThorntonStudios@comcats.net</Link></h3>
                            <h3 className="hd-md flex items-center gap-2">
                                <span><Icons.phone className="text-[20px] contact-icon" /></span> 
                                <span className="flex-1">
                                <Link className="underline hover:text-[var(--secondary-theme-light)] me-2" href="tel:4436993000">443-699-3000</Link>
                                    Please do not leave text messages.
                                    Hours: During Plebe Summer (June 25-Aug 15), 1700-1900 Monday thru Friday,
                                    Aug 16 June 24 0900 to 1600 HRS
                                </span>
                            </h3>
                            <h3 className="hd-md flex items-center gap-2"><span className="shrink-0"><Icons.clock className="text-[20px] contact-icon" /></span> <span className="flex-1">Hours: During Pletp Summer (June 2S-Aug IS), Monday thru Friday, Aug 16 June 24: 0900 to 1600 HRS</span></h3>
                            <h3 className="hd-md flex items-center gap-2"><span className="shrink-0"><Icons.location className="text-[20px] contact-icon" /></span> <span className="flex-1">Thornton, 2802 Autumn Chase Circle, Annagnlis, MD 21401, Please do not mail me anything without prior approval.</span></h3>
                            <h3 className="hd-md">SOCIAL MEDIA</h3>
                            <div className="social-links flex items-center">
                                <h3 className="hd-md"><Link className="underline hover:text-[var(--secondary-theme-light)]" href="https://www.facebook.com/groups/search/groups_home?q=usna%202029%"><Icons.facebook className="text-[20px] contact-icon" /></Link></h3>
                                <h3 className="hd-md"><Link className="underline hover:text-[var(--secondary-theme-light)]" href="https://www.instagram.com/plebesummerphotos/"><Icons.instagram className="text-[20px] contact-icon" /></Link></h3>
                                <h3 className="hd-md"><Link className="underline hover:text-[var(--secondary-theme-light)]" href="#"><Icons.tiktok className="text-[20px] contact-icon" /></Link></h3>
                            </div>
                        </div>
                        <div className="text-end w-full order-1 md:order-2">
                            <Image src="/images/home/hero/01.jpg" alt="About" className="w-full" width={500} height={500} />
                        </div>
                    </div>
                </div>
            </section>
        </>

    )
}
