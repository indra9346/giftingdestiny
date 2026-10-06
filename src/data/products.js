import { csvProducts } from './csvProducts.js';

// Alias csvProducts as products for backward compatibility
export const products = csvProducts;

export const videoReels = [
  {
    id: 'reel-01',
    title: 'Custom Laser Etching on Luxury Bottle & Flask',
    category: 'Laser Engraving',
    videoUrl: 'https://cdn.coverr.co/videos/coverr-hands-unwrapping-a-present-5245/1080p.mp4',
    poster: '/images/categories/bottle.webp',
    views: '18.4K',
    likes: '1.2K',
    duration: '0:28',
    productLinked: '2913',
    description: 'Precision fiber laser etching on matte finish insulated stainless steel thermal drinkware.'
  },
  {
    id: 'reel-02',
    title: 'Surprise Reaction: Custom Heart Mug & Cushion',
    category: 'Personalized Gifts',
    videoUrl: 'https://cdn.coverr.co/videos/coverr-a-woman-opening-a-box-with-a-gift-5250/1080p.mp4',
    poster: '/images/categories/sublimation-mugs.webp',
    views: '32.1K',
    likes: '2.8K',
    duration: '0:34',
    productLinked: '3075',
    description: 'Her tears of joy when seeing their first anniversary photograph printed in vivid high-definition porcelain!'
  },
  {
    id: 'reel-03',
    title: 'High-Precision Laser Engraving on Metal Pen',
    category: 'Craftsmanship',
    videoUrl: 'https://cdn.coverr.co/videos/coverr-laser-engraving-on-wood-4952/1080p.mp4',
    poster: '/images/categories/pen.webp',
    views: '45.9K',
    likes: '4.1K',
    duration: '0:22',
    productLinked: '2880',
    description: 'Watch precision fiber laser beam etch intricate signature script on metallic executive pen body.'
  },
  {
    id: 'reel-04',
    title: 'Sublimation Heat Press Transfer in Studio',
    category: 'Workshop Studio',
    videoUrl: 'https://cdn.coverr.co/videos/coverr-craftsman-working-in-his-workshop-4375/1080p.mp4',
    poster: '/images/categories/machine.webp',
    views: '26.7K',
    likes: '1.9K',
    duration: '0:30',
    productLinked: '2933',
    description: 'From digital print to 200°C dye-sublimation bond that never washes off or chips.'
  },
  {
    id: 'reel-05',
    title: 'Bespoke Executive Combo Set Presentation',
    category: 'Bulk Gifting',
    videoUrl: 'https://cdn.coverr.co/videos/coverr-making-a-gift-package-5252/1080p.mp4',
    poster: '/images/categories/combo-sets.webp',
    views: '14.8K',
    likes: '980',
    duration: '0:25',
    productLinked: '3093',
    description: 'Assembling premium corporate welcome gift sets with custom laser personalization.'
  }
];

export const clientTestimonials = [
  {
    id: 1,
    quote: "Gifting Destiny made our corporate gifting effortless. From product selection to laser customization of 450 kits, everything was handled smoothly. Truly crafted with love & care.",
    author: "Kavita Ramachandran",
    role: "VP People & Culture",
    company: "NexTech Solutions Bangalore",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    orderType: "450x Executive Combo Sets"
  },
  {
    id: 2,
    quote: "We placed a bulk order for client appreciation promotional gifts and the experience was seamless. Great pricing, premium finish and on-time delivery. We’ll definitely reorder.",
    author: "Rohit Deshmukh",
    role: "Head of Marketing",
    company: "Apex Capital Advisors",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    orderType: "200x Smart Temperature Bottles"
  },
  {
    id: 3,
    quote: "The personalized gift sets were beautifully designed and well packed. Our VIP clients loved them and it strengthened our brand impression. The gold foil finish was top notch.",
    author: "Pooja Hegde",
    role: "Client Relations Director",
    company: "Vanguard Hospitality",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    orderType: "120x Velvet Cushion & Plaque Hampers"
  },
  {
    id: 4,
    quote: "The team at Gifting Destiny guided us perfectly in choosing the right gifts for our annual developers conference. Custom branding was neat, sharp, and highly professional. A trusted gifting partner!",
    author: "Siddharth Menon",
    role: "Event Operations Lead",
    company: "CloudScale India",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    orderType: "800x Matte Black Laser Pens"
  },
  {
    id: 5,
    quote: "We ordered customized corporate gift sets for our employees across India and the quality exceeded our expectations. The individual packaging and attention to detail were excellent. Highly recommended!",
    author: "Ananya Sharma",
    role: "Chief Human Resources Officer",
    company: "InnoVerve Global",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    orderType: "350x Platinum Welcome Kits"
  }
];

export const corporateClients = [
  "Infosys", "Wipro", "Razorpay", "Swiggy", "Flipkart", "Accenture", "TCS", "Titan"
];
