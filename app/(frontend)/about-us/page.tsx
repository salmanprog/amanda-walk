import InnerBanner from "@/components/common/InnerBanner";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Waldo | About Us",
  description: "Learn more about My Waldo",
};

export default function AboutPage() {
    return (
        <>
            <InnerBanner bannerClass="products-banner" title={'About Us'} />
            <section className="about-sec sec-gap">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 justify-between items-center gap-10">
                        <div className="flex flex-col gap-5 order-2 md:order-1">
                            <p className="para">
                                In <span className="font-bold">1955</span> (l was 10) my godmother gave me a camera, and I never ltx.ked back. And never regretted it. After thirtyyearsof pho
                                tcvaphing weddings and teaching high school English, decided to the Naval Academy parents by photo-
                                graphing Plebe Summer. In 1980 it was a Whim that has into a passion to helping the Plebe parents "make it
                                through" Plebe Summer I am Often asked Why I do not retire. The answer is simple. This is not work for me, and my fatherwa'
                                in the Great Class Of 1939. And the Naval Academy and parents have supported me in my journey.
                            </p>
                            <ul className="list-disc list-inside font-roboto font-medium">
                                <li><span className="font-bold">1963-1967:</span> Princeton University</li>
                                <li><span className="font-bold">1968-1971:</span> Maryland. Shippensburg State</li>
                                <li><span className="font-bold">1978-79:</span> President and Chairman of the Board, Maryland Professional Photographers Association</li>
                                <li><span className="font-bold">1978-79:</span> Md Institute Of Art in photography</li>
                                <li><span className="font-bold">1980:</span> First summer</li>
                            </ul>
                            <p className="para">
                                Encouraged by the Public Affairs Office, I continued to photographing Plebe Summer for twenty years.
                                In with the advent of the first digital camera, I concentrated on photography. Worked through the USNA
                                Alumni
                                @ 2010 thru 2026: With the formation Of (Naval Academy Business Services Division), I became the vendor
                                for plebe Summer,
                            </p>
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
