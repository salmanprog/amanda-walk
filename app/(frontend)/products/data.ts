const getPackage = (price: string, afterPrice: string) => ({
  id: 1,
  price,
  afterPrice,
  priceDescription: `${price} After Mag 8, price is ${afterPrice}`,
  description: `
  You are purchasing access to the photographs we will take of the Herndon Monument
    Climb and Sea Trials. Purchase includes unlimited downloads of your midshipman
    for personal use. We are not able to photograph every midshipman during Herndon,
    but we are during Sea Trials. During Sea Trials we photograph each company as they complete
    one of the events —the Mud Crawl.
  `
});

export const products = [
  {
    id: 1,
    slug: "sea-trials-herndon",
    title: "Manual and Facial Recognition Search",
    subtitle: "A LA CARTE: Manual and Facial Recognition $339.95",
    price: "$339.95",
    limit: "Limit one per customer",
    description:
      "PHOTO ACCESS with Manual Search and Facial Recognition. Unlimited downloads for personal use. This access is ideal for parents who don’t want to miss a single moment from Sea Trials or Herndon. You will receive access credentials via email within 48 hours of purchase.",
    highlight:
      "$59.99 of the $299.95 supports your son/daughter through NABSD.",
    infoLink: "https://example.com/details",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Manual and Facial Recognition Search",
      "Unlimited photo downloads for personal use",
      "Access to all photographs within 48 hours",
      "Supports your mid through NABSD",
    ],
    packages: getPackage("$29.95", "$39.95"),
    image: "/images/home/hero/01.jpg",
    eventDate: "December 2025",
    gallery: [
      "/images/home/hero/01.jpg",
      "/images/home/hero/02.jpg",
      "/images/home/hero/04.jpg",
      "/images/home/hero/03.jpg",
      "/images/home/hero/05.jpg",
      "/images/home/hero/06.jpg",
      "/images/home/hero/07.jpg",
      "/images/home/hero/08.jpg",
      "/images/home/hero/09.jpg",
      "/images/home/hero/10.jpg",
      "/images/home/hero/01.jpg",
      "/images/home/hero/02.jpg",
      "/images/home/hero/04.jpg",
      "/images/home/hero/03.jpg",
      "/images/home/hero/05.jpg",
      "/images/home/hero/06.jpg",
      "/images/home/hero/07.jpg",
      "/images/home/hero/08.jpg",
      "/images/home/hero/09.jpg",
      "/images/home/hero/10.jpg",
    ],
  },

  {
    id: 2,
    slug: "plebe-summer-photo-access",
    title: "Plebe Summer Complete Photo Access",
    subtitle: "Full Access: Manual + Facial Recognition $299.95",
    price: "$299.95",
    limit: "One account per family",
    description:
      "Enjoy full photo access during Plebe Summer. Our advanced facial recognition helps you find your midshipman’s moments quickly. Receive unlimited downloads and access to all galleries directly through your account within 24–48 hours.",
    highlight:
      "$49.99 of your purchase supports the Plebe Summer Activity Fund.",
    infoLink: "https://example.com/plebe-summer",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Complete gallery access for Plebe Summer",
      "Manual and AI-based facial recognition",
      "Unlimited downloads in high resolution",
      "Direct support for Plebe Summer events",
    ],
    image: "/images/home/hero/02.jpg",
    eventDate: "December 2025",
  },

  {
    id: 3,
    slug: "graduation-photo-package",
    title: "Graduation Day Photo Package",
    subtitle: "Premium Package: Ceremony + Candids $349.95",
    price: "$349.95",
    limit: "Limit one package per graduating mid",
    description:
      "Capture every moment of your midshipman’s graduation day. Includes high-resolution photos from the ceremony, family interactions, and candid shots throughout the day. Delivered within 72 hours post-event.",
    highlight:
      "$69.99 of this purchase supports midshipmen graduation activities.",
    infoLink: "https://example.com/graduation",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Full ceremony and candid coverage",
      "High-resolution downloadable gallery",
      "Delivery within 72 hours",
      "Supports graduation programs",
    ],
    image: "/images/home/hero/03.jpg",
    eventDate: "December 2025",
  },

  {
    id: 4,
    slug: "parents-weekend-gallery",
    title: "Parents Weekend Gallery Access",
    subtitle: "Event Access + Personalized Search $259.95",
    price: "$259.95",
    limit: "Per household subscription",
    description:
      "Get all photographs from Parents Weekend, including candid family moments, parades, and award events. Manual and facial recognition search makes it simple to find your photos easily.",
    highlight:
      "$39.95 of this purchase benefits the Parents Weekend Support Fund.",
    infoLink: "https://example.com/parents-weekend",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Full event photo access for Parents Weekend",
      "Facial recognition to identify your midshipman",
      "Unlimited personal-use downloads",
      "Support for family activity programs",
    ],
    image: "/images/home/hero/04.jpg",
    eventDate: "December 2025",
  },

  {
    id: 5,
    slug: "mid-year-photo-pass",
    title: "Mid-Year Photo Pass",
    subtitle: "Access All Events from January–June $289.95",
    price: "$289.95",
    limit: "Covers up to two family members",
    description:
      "Get complete access to all mid-year events, including sports, parades, and daily training highlights. Download unlimited high-quality images and relive the memories at your convenience.",
    highlight:
      "$55 of each purchase helps fund NABSD activity resources.",
    infoLink: "https://example.com/mid-year-pass",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Access to multiple mid-year events",
      "Unlimited personal-use downloads",
      "Manual & AI photo search available",
      "Supports NABSD activity programs",
    ],
    image: "/images/home/hero/05.jpg",
    eventDate: "December 2025",
  },

  {
    id: 6,
    slug: "sports-and-training-access",
    title: "Sports and Training Access",
    subtitle: "Complete Access to Athletic Events $319.95",
    price: "$319.95",
    limit: "Per household license",
    description:
      "Relive the excitement of athletic and training events through our complete access package. Includes team portraits, competitions, and daily training photos. Delivered digitally in high resolution.",
    highlight:
      "$60 of this purchase supports Naval Academy sports and recreation.",
    infoLink: "https://example.com/sports-access",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Covers all athletic and training events",
      "Includes team portraits and action photos",
      "High-quality downloads with no watermark",
      "Supports Naval sports and recreation",
    ],
    image: "/images/home/hero/06.jpg",
    eventDate: "December 2025",
  },

  {
    id: 7,
    slug: "yearbook-memory-collection",
    title: "Yearbook Memory Collection",
    subtitle: "All-Year Access + Special Editions $379.95",
    price: "$379.95",
    limit: "One license per student",
    description:
      "Get lifetime digital access to year-round photo collections, including special edition yearbook images. Perfect for parents wanting a complete record of their midshipman’s journey.",
    highlight:
      "$75 of the purchase goes toward class yearbook production support.",
    infoLink: "https://example.com/yearbook",
    contact: {
      name: "Larry Thornton",
      phone: "443-699-3000",
      email: "ThorntonStudios@comcast.net",
    },
    details: [
      "Full-year photo library access",
      "Includes special edition yearbook collections",
      "Unlimited lifetime downloads",
      "Supports yearbook production efforts",
    ],
    image: "/images/home/hero/07.jpg",
    eventDate: "December 2025",
  },
];
