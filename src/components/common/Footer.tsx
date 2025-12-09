import Image from "next/image";
import { Icons } from "@/components/icons/Index";
import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/",},
  { label: "Photo Access", href: "#",},
  { label: "Products", href: "/products",},
  { label: "About Us", href: "/about-us",},
  { label: "Contact", href: "/contact",},
  { label: "Blog", href: "#",},
]
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container pt-[130px] pb-[90px]">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-20">
          {/* Logo */}
          <div>
            <div className="max-w-[250px] h-auto">
              <Image
                src="/images/logo.png"
                alt="Footer Logo"
                width={250}
                height={250}
                priority
              />
            </div>
          </div>

          {/* Contact */}
          <div className="">
            <h5 className="text-2xl font-semibold mb-6">Contact Us</h5>
            <ul className="space-y-4">
              <li className="flex items-center gap-4">
                <div className="circle-theme">
                  <Icons.phone />
                </div>
                <a
                  href="tel:+1234567890"
                  className="footer-link"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-4">
                <div className="circle-theme shrink-0">
                  <Icons.email />
                </div>
                <a
                  href="mailto:welcome@thedailydosenow.com"
                  className="footer-link"
                >
                  welcome@thedailydosenow.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-2xl font-semibold mb-6">Quick Links</h5>
            <ul className="space-y-3">
              {footerLinks.map(
                (item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className="footer-link"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h5 className="text-2xl font-semibold mb-6">Follow Me</h5>
            <ul className="flex items-center gap-4">
              <li>
                <a
                  href="#"
                  className="circle-theme circle-md  !h-[60px] !w-[60px]"
                >
                  <Icons.facebook className="text-[20px]" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="circle-theme circle-md ml-[-28px] !h-[60px] !w-[60px] !text-[var(--primary-theme)] !bg-[var(--secondary-theme)]"
                >
                  <Icons.instagram className="text-[20px]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}

      </div>
      <div className="border-t border-gray-700 mt-12 pt-6 pb-6 text-center">
        <p className="text-lg text-gray-300">
          © 2025 <span className="font-semibold">Thornton Studios</span> | All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
