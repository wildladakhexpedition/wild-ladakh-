import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { 
  Mountain, 
  Bike, 
  Tent, 
  Compass, 
  MapPin, 
  Calendar, 
  Star, 
  ArrowRight, 
  Instagram, 
  Facebook, 
  Twitter, 
  Phone, 
  Mail,
  Quote,
  CheckCircle2,
  Menu,
  X,
  Camera,
  Bird,
  Users,
  History,
  Info,
  ChevronDown,
  ExternalLink,
  Home as HomeIcon,
  Shield,
  AlertCircle
} from "lucide-react";
import { useState, useEffect, useMemo, Component, ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import blogData from "./blogData.json";
import ReviewSystem from "./components/ReviewSystem";
import { db } from "./firebase";
import { doc, getDocFromServer } from "firebase/firestore";

// --- Error Boundary ---

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
          <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl text-center border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-ladakh-accent transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Components ---

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    expedition: "Snow Leopard Expedition",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\+?[0-9\s\-]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (validate()) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setIsSubmitted(true);
          setFormData({ name: "", email: "", phone: "", expedition: "Snow Leopard Expedition", message: "" });
        } else {
          const errorData = await response.json();
          setSubmitError(errorData.error || "Failed to send inquiry. Please try again later.");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setSubmitError("An error occurred. Please check your internet connection and try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">Inquiry Sent!</h3>
        <p className="text-gray-500 mb-8">Thank you for reaching out. Our experts will get back to you within 24 hours.</p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="text-ladakh-accent font-bold uppercase tracking-widest text-xs hover:text-ladakh-gold transition-colors"
        >
          Send another inquiry
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.name ? 'border-red-300' : 'border-gray-100'} rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-ladakh-accent transition-colors text-gray-900`} 
              placeholder="John Doe" 
            />
            {errors.name && <p className="text-[10px] text-red-500 ml-4">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.email ? 'border-red-300' : 'border-gray-100'} rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-ladakh-accent transition-colors text-gray-900`} 
              placeholder="john@example.com" 
            />
            {errors.email && <p className="text-[10px] text-red-500 ml-4">{errors.email}</p>}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-4">Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.phone ? 'border-red-300' : 'border-gray-100'} rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-ladakh-accent transition-colors text-gray-900`} 
              placeholder="+91 80828 06259" 
            />
            {errors.phone && <p className="text-[10px] text-red-500 ml-4">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-4">Interested In</label>
            <div className="relative">
              <select 
                value={formData.expedition}
                onChange={(e) => setFormData({...formData, expedition: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-ladakh-accent transition-colors appearance-none text-gray-900"
              >
                <option value="Snow Leopard Expedition">Snow Leopard Expedition</option>
                <option value="Wildlife of Ladakh">Wildlife of Ladakh</option>
                <option value="Trekking">Trekking</option>
                <option value="Birding Tour">Birding Tour</option>
                <option value="Bike Trip">Bike Trip</option>
                <option value="Family Tour">Family Tour</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-4">Your Message</label>
          <textarea 
            rows={4} 
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className={`w-full bg-gray-50 border ${errors.message ? 'border-red-300' : 'border-gray-100'} rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-ladakh-accent transition-colors resize-none text-gray-900`} 
            placeholder="Tell us about your travel plans..."
          ></textarea>
          {errors.message && <p className="text-[10px] text-red-500 ml-4">{errors.message}</p>}
        </div>
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4" />
            {submitError}
          </div>
        )}
        <button 
          disabled={isSubmitting}
          className={`w-full bg-ladakh-accent text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-ladakh-gold transition-all shadow-lg shadow-ladakh-accent/20 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : "Send Inquiry"}
        </button>
      </form>
    </div>
  );
};

const FloatingBookButton = () => {
  const { pathname } = useLocation();
  const tourPaths = [
    "/snow-leopard-expedition-ladakh",
    "/birding-tours-ladakh",
    "/wildlife-photography-ladakh",
    "/ladakh-bike-trip-packages",
    "/leh-ladakh-family-tour",
    "/ladakh-wildlife-tour",
    "/trekking-in-ladakh",
    "/ladakh-cultural-tours"
  ];

  const isTourPage = tourPaths.includes(pathname);

  if (!isTourPage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-8 right-8 z-40"
    >
      <Link
        to="/#contact"
        onClick={(e) => {
          if (pathname === "/") {
            e.preventDefault();
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
        className="flex items-center gap-3 bg-ladakh-accent text-white px-8 py-4 rounded-full font-display font-bold uppercase tracking-widest shadow-2xl hover:bg-ladakh-gold hover:scale-105 transition-all group"
      >
        Book Now
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Small delay to ensure content is rendered
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

const Navbar = ({ scrolled }: { scrolled: boolean }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/90 backdrop-blur-xl py-4 border-b border-gray-100" : "bg-transparent py-8"}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-100 bg-white">
            <img 
              src="https://i.pinimg.com/736x/15/51/a7/1551a7557668371442851afa6cc69bde.jpg" 
              alt="Wild Ladakh Logo" 
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display font-bold text-xl tracking-[0.1em] uppercase text-gray-900">Wild Ladakh <span className="text-ladakh-gold">Expedition</span></span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8">
          <div className="relative group/dropdown">
            <button className="text-sm font-medium uppercase tracking-widest text-gray-900 hover:text-ladakh-accent transition-colors flex items-center gap-1">
              Expeditions <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl w-64 grid gap-2 shadow-2xl">
                <Link to="/snow-leopard-expedition-ladakh" className="text-xs uppercase tracking-widest p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Snow Leopard Expedition</Link>
                <Link to="/birding-tours-ladakh" className="text-xs uppercase tracking-widest p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Ladakh Birding</Link>
                <Link to="/eurasian-lynx-expedition-ladakh" className="text-xs uppercase tracking-widest p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Eurasian Lynx Expedition</Link>
                <Link to="/wildlife-photography-ladakh" className="text-xs uppercase tracking-widest p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Palla's Cat Expedition</Link>
                <Link to="/ladakh-wildlife-tour" className="text-xs uppercase tracking-widest p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">All Wildlife Tours</Link>
              </div>
            </div>
          </div>
          <Link to="/trekking-in-ladakh" className="text-sm font-medium uppercase tracking-widest text-gray-900 hover:text-ladakh-accent transition-colors">Trekking</Link>
          <Link to="/leh-ladakh-family-tour" className="text-sm font-medium uppercase tracking-widest text-gray-900 hover:text-ladakh-accent transition-colors">Family</Link>
          <Link to="/ladakh-cultural-tours" className="text-sm font-medium uppercase tracking-widest text-gray-900 hover:text-ladakh-accent transition-colors">Culture</Link>
          <Link to="/ladakh-bike-trip-packages" className="text-sm font-medium uppercase tracking-widest text-gray-900 hover:text-ladakh-accent transition-colors">Bike Trip</Link>
          <Link to="/blog" className="text-sm font-medium uppercase tracking-widest text-gray-900 hover:text-ladakh-accent transition-colors">Blog</Link>
          <Link 
            to="/#contact"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="bg-gray-900 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ladakh-accent transition-all"
          >
            Book Now
          </Link>
        </div>

        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 lg:hidden text-gray-900"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-display font-bold uppercase">Home</Link>
            <Link to="/snow-leopard-expedition-ladakh" onClick={() => setIsMenuOpen(false)} className="text-2xl font-display font-bold uppercase">Snow Leopard</Link>
            <Link to="/birding-tours-ladakh" onClick={() => setIsMenuOpen(false)} className="text-2xl font-display font-bold uppercase">Ladakh Birding</Link>
            <Link to="/eurasian-lynx-expedition-ladakh" onClick={() => setIsMenuOpen(false)} className="text-2xl font-display font-bold uppercase">Eurasian Lynx</Link>
            <Link to="/ladakh-bike-trip-packages" onClick={() => setIsMenuOpen(false)} className="text-2xl font-display font-bold uppercase">Bike Trips</Link>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-2xl font-display font-bold uppercase">Blog</Link>
            <Link 
              to="/#contact" 
              onClick={(e) => {
                setIsMenuOpen(false);
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }
              }} 
              className="text-2xl font-display font-bold uppercase text-ladakh-accent"
            >
              Book Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="py-20 px-6 border-t border-gray-100 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
        <div className="col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border border-gray-100 bg-white">
              <img 
                src="https://i.pinimg.com/736x/15/51/a7/1551a7557668371442851afa6cc69bde.jpg" 
                alt="Wild Ladakh Logo" 
                className="w-full h-full object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-bold text-2xl tracking-[0.1em] uppercase text-gray-900">Wild Ladakh <span className="text-ladakh-gold">Expedition</span></span>
          </div>
          <p className="text-gray-500 max-w-sm text-sm leading-relaxed mb-8">
            Wild Ladakh Expedition specializes in premium Snow Leopard tours, Himalayan birding, and wildlife photography in the Trans-Himalayas. Expert local guides, ethical tourism, and unforgettable adventures.
          </p>
          <div className="flex gap-4">
            {[
              { Icon: Instagram, href: "https://www.instagram.com/wildladakhexpedition/" },
              { Icon: Facebook, href: "https://www.facebook.com/wildladakhexpedition/" },
              { Icon: Twitter, href: "https://twitter.com/wildladakh" }
            ].map((social, i) => (
              <a 
                key={i} 
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-ladakh-accent hover:border-ladakh-accent hover:text-white transition-all text-gray-600"
              >
                <social.Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-8 text-gray-900">Wildlife Tours</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><Link to="/snow-leopard-expedition-ladakh" className="hover:text-ladakh-accent transition-colors">Snow Leopard Expedition</Link></li>
            <li><Link to="/birding-tours-ladakh" className="hover:text-ladakh-accent transition-colors">Ladakh Birding</Link></li>
            <li><Link to="/eurasian-lynx-expedition-ladakh" className="hover:text-ladakh-accent transition-colors">Lynx Expedition</Link></li>
            <li><Link to="/wildlife-photography-ladakh" className="hover:text-ladakh-accent transition-colors">Palla's Cat Expedition</Link></li>
            <li><Link to="/ladakh-wildlife-tour" className="hover:text-ladakh-accent transition-colors">Ladakh Wildlife Tour</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-8 text-gray-900">Adventure</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><Link to="/ladakh-bike-trip-packages" className="hover:text-ladakh-accent transition-colors">Bike Trip Packages</Link></li>
            <li><Link to="/trekking-in-ladakh" className="hover:text-ladakh-accent transition-colors">Trekking in Ladakh</Link></li>
            <li><Link to="/eurasian-lynx-expedition-ladakh" className="hover:text-ladakh-accent transition-colors">Lynx Expedition</Link></li>
            <li><Link to="/leh-ladakh-family-tour" className="hover:text-ladakh-accent transition-colors">Family Tours</Link></li>
            <li><Link to="/ladakh-cultural-tours" className="hover:text-ladakh-accent transition-colors">Cultural Tours</Link></li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-mono">
        <span>© 2024 Wild Ladakh Expedition. All Rights Reserved.</span>
        <div className="flex gap-6">
          <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

const FAQ = ({ items }: { items: { q: string, a: string }[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
          <button 
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full p-6 flex justify-between items-center text-left bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-display font-bold uppercase tracking-tight text-sm text-gray-900">{item.q}</span>
            <ChevronDown className={`w-4 h-4 transition-transform text-gray-400 ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                  {item.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

const TourMap = () => {
  const tourLocations = useMemo(() => [
    {
      id: 1,
      name: "Snow Leopard Expedition",
      location: "Hemis National Park",
      coords: [33.9917, 77.3417] as [number, number],
      description: "The best place in the world to spot the elusive Ghost of the Mountains.",
      link: "/snow-leopard-expedition-ladakh"
    },
    {
      id: 2,
      name: "Ladakh Birding Tour",
      location: "Tso Moriri Lake",
      coords: [32.9000, 78.3167] as [number, number],
      description: "High altitude wetland home to the Black-necked Crane and Bar-headed Goose.",
      link: "/birding-tours-ladakh"
    },
    {
      id: 3,
      name: "Palla's Cat Expedition",
      location: "Hanle Valley",
      coords: [32.7833, 78.9833] as [number, number],
      description: "The vast plains of Hanle are the prime habitat for the rare Palla's Cat.",
      link: "/wildlife-photography-ladakh"
    },
    {
      id: 4,
      name: "Chadar Frozen River Trek",
      location: "Zanskar River",
      coords: [33.9833, 77.1833] as [number, number],
      description: "An extraordinary winter trek over the frozen Zanskar river.",
      link: "/trekking-in-ladakh"
    },
    {
      id: 5,
      name: "Nubra Valley Adventure",
      location: "Nubra Valley",
      coords: [34.5428, 77.5617] as [number, number],
      description: "Explore the sand dunes of Hunder and the Diskit Monastery.",
      link: "/ladakh-bike-trip-packages"
    },
    {
      id: 6,
      name: "Pangong Lake Journey",
      location: "Pangong Tso",
      coords: [33.7595, 78.6674] as [number, number],
      description: "The world's highest saltwater lake, changing colors through the day.",
      link: "/leh-ladakh-family-tour"
    },
    {
      id: 8,
      name: "Eurasian Lynx Expedition",
      location: "Wari La Pass",
      coords: [34.2381, 77.9250] as [number, number],
      description: "Track the elusive Eurasian Lynx in the rugged Wari La region.",
      link: "/eurasian-lynx-expedition-ladakh"
    },
    {
      id: 7,
      name: "Wild Ladakh Office",
      location: "Main Market, Leh",
      coords: [34.1642, 77.5848] as [number, number],
      description: "Visit us at our headquarters in the heart of Leh.",
      link: "/#contact",
      isOffice: true
    }
  ], []);

  const customIcon = (isOffice: boolean) => new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${isOffice ? '#2563EB' : '#D2691E'}; width: ${isOffice ? '20px' : '16px'}; height: ${isOffice ? '20px' : '16px'}; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px ${isOffice ? 'rgba(37, 99, 235, 0.5)' : 'rgba(210, 105, 30, 0.5)'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">${isOffice ? '★' : ''}</div>`,
    iconSize: [isOffice ? 20 : 16, isOffice ? 20 : 16],
    iconAnchor: [isOffice ? 10 : 8, isOffice ? 10 : 8]
  });

  return (
    <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl relative z-0">
      <MapContainer 
        center={[33.8, 78.0]} 
        zoom={7} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tourLocations.map((tour) => (
          <Marker key={tour.id} position={tour.coords} icon={customIcon(!!(tour as any).isOffice)}>
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <h4 className="font-display font-bold uppercase text-gray-900 text-sm mb-1">{tour.name}</h4>
                <p className="text-ladakh-accent text-[10px] uppercase tracking-widest font-bold mb-2">{tour.location}</p>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">{tour.description}</p>
                <Link 
                  to={tour.link} 
                  onClick={(e) => {
                    if (tour.link === "/#contact") {
                      e.preventDefault();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-900 hover:text-ladakh-accent transition-colors"
                >
                  {tour.id === 7 ? "Contact Us" : "View Details"} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// --- Pages ---

const Home = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <>
      <Helmet>
        <title>Wild Ladakh Expedition | Snow Leopard & Wildlife Tours Ladakh</title>
        <meta name="description" content="Expert-led Snow Leopard expeditions, birding tours, and wildlife photography in Ladakh. Book your premium Ladakh wildlife tour with local experts." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "Wild Ladakh Expedition",
            "description": "Specialized wildlife and adventure tour operator in Ladakh, India.",
            "url": "https://wildladakhexpedition.com",
            "telephone": "+918082806259",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Main Market",
              "addressLocality": "Leh",
              "addressRegion": "Ladakh",
              "postalCode": "194101",
              "addressCountry": "IN"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            style={{ y }}
            src="https://i.pinimg.com/1200x/dc/e7/c5/dce7c5cd0a80aed4db93644bc4d1d51d.jpg" 
            className="w-full h-full object-cover opacity-70 scale-110"
            alt="Snow Leopard Expedition Ladakh"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Premium Wildlife Expeditions</span>
            <h1 className="text-5xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter mb-8 uppercase text-balance text-gray-900">
              The Ultimate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-ladakh-gold to-gray-900">Snow Leopard Tour India</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-800 max-w-2xl mx-auto mb-12 font-medium tracking-wide">
              Join Wild Ladakh Expedition for world-class wildlife photography, Himalayan birding, and authentic cultural journeys led by expert local trackers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="group relative bg-ladakh-accent text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Book Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link to="/ladakh-wildlife-tour" className="px-10 py-5 rounded-full font-bold uppercase tracking-widest border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all">
                Explore Wildlife Tours
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden">
                <img src="https://i.pinimg.com/1200x/81/41/50/814150e1c4ed137f0f993ba47f0561d0.jpg" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Wild Ladakh Team" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-ladakh-accent p-12 rounded-[2rem] hidden md:block text-white">
                <span className="text-5xl font-display font-bold block mb-2">10+</span>
                <span className="text-xs uppercase tracking-[0.2em] font-bold opacity-80">Years of Local <br /> Expertise</span>
              </div>
            </div>
            
            <div>
              <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Our Story</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-8 leading-tight text-gray-900">
                Deep Roots in the <br />
                <span className="text-ladakh-gold">Trans-Himalayas</span>
              </h2>
              <div className="space-y-6 text-gray-600 text-lg font-light leading-relaxed mb-12">
                <p>
                  Wild Ladakh Expedition was born from a passion for the untamed beauty of our homeland. As locals, we don't just guide tours; we share the secrets of the mountains that have been passed down through generations.
                </p>
                <p>
                  Our mission is to provide premium, ethical wildlife experiences that prioritize conservation and community. Every expedition is a step towards preserving the fragile ecosystem of Ladakh for future generations.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <h4 className="font-display font-bold uppercase text-gray-900 mb-2">Ethical Tours</h4>
                  <p className="text-sm text-gray-400">Strict non-intrusive wildlife tracking protocols.</p>
                </div>
                <div>
                  <h4 className="font-display font-bold uppercase text-gray-900 mb-2">Local Guides</h4>
                  <p className="text-sm text-gray-400">Expert trackers from the high-altitude villages.</p>
                </div>
              </div>

              <Link to="/ladakh-wildlife-tour" className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-ladakh-accent transition-colors">
                Learn More About Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Naturalist Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Expert Guidance</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-8 leading-tight text-gray-900">
                Meet Tsewang Nurboo <br />
                <span className="text-ladakh-gold">Your Lead Naturalist</span>
              </h2>
              <div className="space-y-6 text-gray-600 text-lg font-light leading-relaxed mb-12">
                <p>
                  With over <strong>10 years of experience</strong> tracking the elusive wildlife of the Trans-Himalayas, Tsewang Nurboo brings an unparalleled depth of knowledge to every expedition. Born and raised in the high-altitude villages of Ladakh, his connection to the land and its creatures is both professional and deeply personal.
                </p>
                <p>
                  As a certified naturalist and expert spotter, Tsewang has led hundreds of successful Snow Leopard quests and birding tours. His philosophy centers on ethical wildlife viewing and sharing the rich cultural heritage of the Ladakhi people with travelers from around the world.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-12">
                {["Snow Leopard Expert", "Himalayan Ornithology", "Photography Mentor", "Local Heritage"].map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] uppercase tracking-widest font-bold text-gray-500">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-gray-50 bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Guest" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                  Trusted by <span className="text-gray-900 font-bold">500+</span> Global Adventurers
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://i.pinimg.com/736x/eb/13/48/eb13480e4528030ac6f5e9ef783c8d40.jpg" 
                  className="w-full h-full object-cover" 
                  alt="Tsewang Nurboo - Lead Naturalist" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-ladakh-accent/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-ladakh-gold/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="expeditions" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-6 text-gray-900">Our Specialized Expeditions</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm uppercase tracking-widest">Expert-led journeys across the Trans-Himalayas</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Snow Leopard Expedition Ladakh", icon: <Mountain />, link: "/snow-leopard-expedition-ladakh", desc: "Track the 'Ghost of the Mountains' with expert local spotters.", img: "https://images.unsplash.com/photo-1564349683136-77e08bef1ed1?auto=format&fit=crop&q=80&w=800" },
              { title: "Ladakh Birding", icon: <Bird />, link: "/birding-tours-ladakh", desc: "Himalayan birding tours focusing on rare high-altitude species.", img: "https://i.pinimg.com/1200x/99/d1/c8/99d1c88e4dee7350d620dd28c4448ced.jpg" },
              { title: "Palla's Cat Expedition", icon: <Camera />, link: "/wildlife-photography-ladakh", desc: "Search for the elusive and enigmatic Manul in the high-altitude steppes.", img: "https://i.pinimg.com/1200x/a9/6b/eb/a96beb5f9e07719eabf2578251bb9bc4.jpg" },
              { title: "Ladakh Bike Trip Packages", icon: <Bike />, link: "/ladakh-bike-trip-packages", desc: "Iconic motorcycle journeys through the world's highest passes.", img: "https://i.pinimg.com/736x/91/43/e1/9143e193e575fc62ef20a317b30296e7.jpg" },
              { title: "Leh Ladakh Family Tour", icon: <Users />, link: "/leh-ladakh-family-tour", desc: "Curated cultural and leisure experiences for all ages.", img: "https://i.pinimg.com/736x/3b/ee/0a/3bee0a539520e6ad5ec3f18ff92007f3.jpg" },
              { title: "Ladakh Cultural Tours", icon: <History />, link: "/ladakh-cultural-tours", desc: "Explore ancient monasteries and authentic local life.", img: "https://i.pinimg.com/1200x/ae/c9/3a/aec93a79950110c817e78f557b7f356f.jpg" },
              { title: "Trekking in Ladakh", icon: <Mountain />, link: "/trekking-in-ladakh", desc: "Walk the Himalayas through high passes and frozen rivers.", img: "https://i.pinimg.com/736x/3d/fd/d1/3dfdd1902d10273b1c8e25bf081a76bd.jpg" },
              { title: "Eurasian Lynx Expedition", icon: <Camera />, link: "/eurasian-lynx-expedition-ladakh", desc: "Search for the elusive Eurasian Lynx in the rugged terrains of Ladakh.", img: "https://i.pinimg.com/736x/5e/6e/5f/5e6e5f0875647667124a7e3f1d8546ac.jpg" }
            ].map((s, i) => (
              <Link key={i} to={s.link} className="group relative p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-ladakh-accent/30 transition-all overflow-hidden shadow-sm hover:shadow-2xl">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <img src={s.img} className="w-full h-full object-cover" alt={s.title} referrerPolicy="no-referrer" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-ladakh-accent/10 rounded-2xl flex items-center justify-center text-ladakh-accent mb-8 group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">{s.title}</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">{s.desc}</p>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 text-gray-400 group-hover:text-ladakh-accent transition-colors">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Path Explorer Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Explore All Paths</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter text-gray-900">
              Your Journey <span className="text-ladakh-gold">Starts Here</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: "Home", path: "/", icon: <HomeIcon size={20} /> },
              { name: "Snow Leopard", path: "/snow-leopard-expedition-ladakh", icon: <Mountain size={20} /> },
              { name: "Birding", path: "/birding-tours-ladakh", icon: <Bird size={20} /> },
              { name: "Wildlife", path: "/ladakh-wildlife-tour", icon: <Shield size={20} /> },
              { name: "Trekking", path: "/trekking-in-ladakh", icon: <Mountain size={20} /> },
              { name: "Cultural", path: "/ladakh-cultural-tours", icon: <History size={20} /> },
              { name: "Bike Trips", path: "/ladakh-bike-trip-packages", icon: <Bike size={20} /> },
              { name: "Photography", path: "/wildlife-photography-ladakh", icon: <Camera size={20} /> },
              { name: "Lynx Expedition", path: "/eurasian-lynx-expedition-ladakh", icon: <Camera size={20} /> },
              { name: "Family", path: "/leh-ladakh-family-tour", icon: <Users size={20} /> },
              { name: "Contact", path: "/#contact", icon: <Mail size={20} /> },
            ].map((link, i) => (
              <Link 
                key={i} 
                to={link.path} 
                onClick={(e) => {
                  if (link.path === "/#contact" && window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex flex-col items-center justify-center p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:border-ladakh-accent/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 group-hover:text-ladakh-accent group-hover:scale-110 transition-all mb-4 shadow-sm">
                  {link.icon}
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-900 text-center">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Visual Explorer</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-6 text-gray-900">Expedition <span className="text-ladakh-gold">Map</span></h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">Explore the remote corners of the Trans-Himalayas where our specialized tours take place.</p>
          </div>
          <TourMap />
          
          {/* Office Location Google Map */}
          <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Visit Us</span>
              <h3 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter mb-6 text-gray-900">Our <span className="text-ladakh-gold">Office</span></h3>
              <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
                Located in the heart of Leh's Main Market, our office is the hub for all our expeditions. Drop by for a cup of butter tea and let's plan your next adventure.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-ladakh-accent shadow-sm shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold uppercase text-gray-900 text-sm">Address</h4>
                    <p className="text-gray-500 text-sm">Main Market, Leh, Ladakh, 194101</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-ladakh-accent shadow-sm shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold uppercase text-gray-900 text-sm">Phone</h4>
                    <p className="text-gray-500 text-sm">+91 80828 06259</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[400px] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl">
              <iframe 
                src="https://maps.google.com/maps?q=Wild%20Ladakh%20Expedition%20Leh&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1920" 
            className="w-full h-full object-cover opacity-5" 
            alt="Ladakh Landscape" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center relative z-10">
          <div>
            <div className="text-ladakh-gold mb-6 flex justify-center"><CheckCircle2 className="w-12 h-12" /></div>
            <h4 className="font-display font-bold uppercase tracking-widest text-sm mb-4 text-gray-900">Local Expertise</h4>
            <p className="text-gray-500 text-xs leading-relaxed">Our guides are native to Ladakh, with deep knowledge of wildlife behavior and terrain.</p>
          </div>
          <div>
            <div className="text-ladakh-gold mb-6 flex justify-center"><CheckCircle2 className="w-12 h-12" /></div>
            <h4 className="font-display font-bold uppercase tracking-widest text-sm mb-4 text-gray-900">Ethical Wildlife Tours</h4>
            <p className="text-gray-500 text-xs leading-relaxed">We prioritize conservation and maintain respectful distances from all wildlife.</p>
          </div>
          <div>
            <div className="text-ladakh-gold mb-6 flex justify-center"><CheckCircle2 className="w-12 h-12" /></div>
            <h4 className="font-display font-bold uppercase tracking-widest text-sm mb-4 text-gray-900">Safety First</h4>
            <p className="text-gray-500 text-xs leading-relaxed">High-altitude safety protocols and premium equipment for all expeditions.</p>
          </div>
        </div>
      </section>
      {/* Reviews Section */}
      {/* Reviews Section */}
      <section className="relative py-32 px-6 overflow-hidden bg-gray-50/50">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Testimonials</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter text-gray-900">
              What Our <span className="text-ladakh-gold">Adventurers Say</span>
            </h2>
          </div>

          <ReviewSystem />
        </div>
      </section>

      {/* International Support Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto border-y border-gray-100 py-20">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-ladakh-accent/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-ladakh-accent" />
              </div>
              <div>
                <h4 className="font-display font-bold uppercase tracking-tight mb-2 text-gray-900">Global Support</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Dedicated assistance for international travelers from USA, UK, and Europe.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-ladakh-accent/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-ladakh-accent" />
              </div>
              <div>
                <h4 className="font-display font-bold uppercase tracking-tight mb-2 text-gray-900">Hassle-Free Permits</h4>
                <p className="text-sm text-gray-500 leading-relaxed">We handle all inner-line permits and wildlife clearances for your expedition.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-ladakh-accent/10 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-ladakh-accent" />
              </div>
              <div>
                <h4 className="font-display font-bold uppercase tracking-tight mb-2 text-gray-900">Premium Logistics</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Luxury stays, private transfers, and top-tier equipment for a seamless journey.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Visual Journey</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter text-gray-900">
              Moments from the <span className="text-ladakh-gold">High Altitude</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px] md:h-[800px]">
            <div className="col-span-2 row-span-2 rounded-[2.5rem] overflow-hidden group relative">
              <img src="https://i.pinimg.com/1200x/0b/56/6a/0b566a4d56612e0cd93077b94c89a969.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Snow Leopard" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <p className="text-white font-display font-bold uppercase tracking-widest text-sm">The Ghost of the Mountains</p>
              </div>
            </div>
            <div className="rounded-[2.5rem] overflow-hidden group relative">
              <img src="https://i.pinimg.com/1200x/d1/72/9e/d1729e958aca8aff77f3dcfd99a5a191.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Ladakh Landscape" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-[2.5rem] overflow-hidden group relative">
              <img src="https://i.pinimg.com/736x/b3/18/80/b318802d8b68969d37b9f44a9519b7ef.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Snow Leopard" referrerPolicy="no-referrer" />
            </div>
            <div className="col-span-2 rounded-[2.5rem] overflow-hidden group relative">
              <img src="https://i.pinimg.com/736x/71/a5/20/71a520b2ccdec52ad9bf8311cfa6af4e.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Himalayan Bird" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest from the Journal */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Field Notes</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter text-gray-900">
                Latest from <br /> <span className="text-ladakh-gold">The Journal</span>
              </h2>
            </div>
            <Link to="/blog" className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-ladakh-accent transition-all">
              View All Articles <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogData.slice(0, 3).map((post, i) => (
              <Link key={i} to={`/blog/${post.slug}`} className="group flex flex-col h-full">
                <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                  <img src={post.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} referrerPolicy="no-referrer" />
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-ladakh-accent font-bold">{post.category}</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">{post.date}</span>
                </div>
                <h3 className="text-xl font-display font-bold uppercase tracking-tight group-hover:text-ladakh-accent transition-colors leading-tight text-gray-900">{post.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Get In Touch</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-8 leading-tight text-gray-900">
                Ready to Plan Your <br />
                <span className="text-ladakh-gold">Ladakh Adventure?</span>
              </h2>
              <p className="text-gray-500 text-lg mb-12 max-w-md">
                Whether it's a Snow Leopard quest or a family holiday, our experts are here to help you craft the perfect itinerary.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100">
                    <Phone className="w-5 h-5 text-ladakh-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Call Us</p>
                    <a href="tel:+918082806259" className="text-lg font-display font-bold text-gray-900 hover:text-ladakh-accent transition-colors">+91 8082806259</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100">
                    <Mail className="w-5 h-5 text-ladakh-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Email Us</p>
                    <a href="mailto:wildladakhexpedition@gmail.com" className="text-lg font-display font-bold text-gray-900 hover:text-ladakh-accent transition-colors">wildladakhexpedition@gmail.com</a>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-6 font-mono">Follow Our Expeditions</p>
                <div className="flex gap-4">
                  {[
                    { Icon: Instagram, href: "https://www.instagram.com/wildladakhexpedition/" },
                    { Icon: Facebook, href: "https://www.facebook.com/wildladakhexpedition/" }
                  ].map((social, i) => (
                    <a 
                      key={i} 
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-ladakh-accent hover:border-ladakh-accent hover:text-white transition-all text-gray-600 shadow-sm"
                    >
                      <social.Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
};

const TrekkingPage = () => (
  <>
    <Helmet>
      <title>Trekking in Ladakh | Markha Valley & Chadar Trek | Wild Ladakh</title>
      <meta name="description" content="Embark on the best trekking in Ladakh. From the classic Markha Valley trek to the frozen Chadar Trek, explore the Himalayas with expert guides and premium support." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">High Altitude Adventure</span>
        <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-12 leading-[0.9]">Trekking in Ladakh</h1>
        
        <div className="aspect-video rounded-[2rem] overflow-hidden mb-16">
          <img src="https://i.pinimg.com/736x/3d/fd/d1/3dfdd1902d10273b1c8e25bf081a76bd.jpg" className="w-full h-full object-cover" alt="Trekking in Ladakh" referrerPolicy="no-referrer" />
        </div>

        <div className="prose max-w-none">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Walk the Himalayas: Trekking in Ladakh</h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
            <strong>Trekking in Ladakh</strong> is a journey through time and terrain. Whether you're walking on the frozen Zanskar River during the <strong>Chadar Trek</strong> or crossing high passes in the <strong>Markha Valley</strong>, every step reveals a new facet of the Himalayas. Our treks are led by local experts who ensure your safety and provide deep insights into the landscape.
          </p>
          
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">Our Signature Treks</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-2">Markha Valley Trek</h4>
              <p className="text-sm text-gray-500">The most popular trek in Ladakh, offering stunning views of Kang Yatse and the Hemis National Park.</p>
            </div>
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-2">Chadar Trek</h4>
              <p className="text-sm text-gray-500">A once-in-a-lifetime winter trek on the frozen Zanskar River. Extreme adventure at its best.</p>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Itinerary & Pricing</h2>
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase text-gray-900 mb-4">Markha Valley Itinerary</h3>
              {[
                { day: "Day 1-2", title: "Leh Acclimatization", desc: "Essential rest days in Leh with light local walks." },
                { day: "Day 3", title: "Leh to Chilling & Trek to Skiu", desc: "Drive to Chilling, cross the Zanskar river, and start the trek." },
                { day: "Day 4-6", title: "Markha Valley Crossing", desc: "Trek through remote villages, crossing high passes and lush valleys." },
                { day: "Day 7", title: "Nimaling to Shang Sumdo", desc: "Cross the Kongmaru La (5,200m) and descend to Shang Sumdo." },
                { day: "Day 8", title: "Return to Leh", desc: "Short walk to Hemis, visit the monastery, and drive back to Leh." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-16 h-16 bg-ladakh-accent/10 rounded-lg flex items-center justify-center text-ladakh-accent font-bold text-xs uppercase text-center leading-tight">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 uppercase text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl h-fit">
              <h3 className="text-xl font-display font-bold uppercase mb-2">Trek Price</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-ladakh-gold">$1,250</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">per person</span>
              </div>
              <ul className="space-y-3 text-xs text-white/60 mb-8">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Expert mountain guides</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />High-end camping gear</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />All meals during trek</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Ponies for luggage</li>
              </ul>
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full bg-ladakh-accent hover:bg-ladakh-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs block text-center"
              >
                Book Now
              </Link>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Chadar Trek: The Frozen River Adventure</h2>
          
          <div className="aspect-video rounded-[2rem] overflow-hidden mb-12 shadow-xl">
            <img 
              src="https://i.pinimg.com/736x/91/51/25/91512543eba2d874c6da59afa179193b.jpg" 
              className="w-full h-full object-cover" 
              alt="Chadar Trek Frozen River" 
              referrerPolicy="no-referrer" 
            />
          </div>

          <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
            The <strong>Chadar Trek</strong> is one of the most unique and challenging treks in the world. Walking on the frozen Zanskar River in temperatures dropping to -30°C, you'll witness frozen waterfalls, deep gorges, and the incredible resilience of the local people. This is not just a trek; it's a test of spirit and a journey into a winter wonderland.
          </p>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase text-gray-900 mb-4">Chadar Trek Itinerary</h3>
              {[
                { day: "Day 1-3", title: "Leh Arrival & Acclimatization", desc: "Critical rest days in Leh. Mandatory medical check-up at SNM Hospital." },
                { day: "Day 4", title: "Drive to Shingra Koma & Trek to Somo Paldar", desc: "First steps on the ice. Learning the 'penguin walk' on the Chadar." },
                { day: "Day 5", title: "Trek to Tibb Cave", desc: "Walking through deep gorges with stunning frozen waterfalls." },
                { day: "Day 6", title: "Tibb Cave to Naerak", desc: "The highlight day: witnessing the giant frozen waterfall at Naerak." },
                { day: "Day 7-9", title: "Return Journey", desc: "Retracing steps back to Shingra Koma and driving back to Leh." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs uppercase text-center leading-tight">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 uppercase text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl h-fit">
              <h3 className="text-xl font-display font-bold uppercase mb-2">Chadar Price</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-blue-400">$1,450</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">per person</span>
              </div>
              <ul className="space-y-3 text-xs text-white/60 mb-8">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" />ALTOA certified guides</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" />Sub-zero sleeping bags</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" />Gum boots & crampons</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" />Wildlife & permit fees</li>
              </ul>
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs block text-center"
              >
                Book Now
              </Link>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Why Trek With Us?</h2>
          <ul className="text-gray-600 mb-8 list-disc pl-6 space-y-2">
            <li>Experienced local guides with mountain rescue certification.</li>
            <li>High-quality camping gear (North Face/Mountain Hardwear tents).</li>
            <li>Nutritious, freshly cooked meals prepared by our trekking chefs.</li>
            <li>Small group sizes for a more intimate and safe experience.</li>
          </ul>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8 text-center text-gray-900">Trekking FAQs</h2>
          <FAQ items={[
            { q: "What is the best time for trekking?", a: "June to September is ideal for most treks. The Chadar Trek only happens in January and February." },
            { q: "How fit do I need to be?", a: "A good level of physical fitness is required. We recommend cardio and strength training 2-3 months before the trek." },
            { q: "Do you provide porters or ponies?", a: "Yes, our packages include ponies or porters to carry your main luggage, so you only carry a daypack." }
          ]} />
        </div>
      </div>
    </div>
  </>
);

const CulturalPage = () => (
  <>
    <Helmet>
      <title>Ladakh Cultural Tours | Monasteries & Festivals | Wild Ladakh</title>
      <meta name="description" content="Immerse yourself in the rich heritage of the Himalayas with our Ladakh cultural tours. Visit ancient monasteries, witness vibrant festivals, and stay with local families." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Heritage & Spirituality</span>
        <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-12 leading-[0.9]">Ladakh Cultural Tours</h1>
        
        <div className="aspect-video rounded-[2rem] overflow-hidden mb-16">
          <img src="https://i.pinimg.com/1200x/ae/c9/3a/aec93a79950110c817e78f557b7f356f.jpg" className="w-full h-full object-cover" alt="Cultural Tour in Ladakh" referrerPolicy="no-referrer" />
        </div>

        <div className="prose max-w-none">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">The Soul of the Himalayas: Ladakh Cultural Tours</h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
            Our <strong>Ladakh cultural tours</strong> are designed to take you beyond the tourist trails and into the heart of Ladakhi life. Experience the spiritual resonance of ancient monasteries like Hemis, Thiksey, and Lamayuru, and witness the vibrant colors of local festivals.
          </p>
          
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">Authentic Experiences</h3>
          <p className="text-gray-500 mb-8">
            Stay in traditional homestays, participate in morning prayers at a monastery, and learn the art of Ladakhi cooking. We believe in sustainable tourism that respects and preserves the local culture.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Monastery Visits</h4>
              <p className="text-sm text-gray-500">Guided tours of the most significant and remote monasteries in the region.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Festival Tours</h4>
              <p className="text-sm text-gray-500">Special itineraries centered around major festivals like Hemis Tsechu and Losar.</p>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Itinerary & Pricing</h2>
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase text-gray-900 mb-4">Monastery & Heritage Trail</h3>
              {[
                { day: "Day 1", title: "Arrival in Leh", desc: "Traditional welcome and rest for acclimatization." },
                { day: "Day 2", title: "Indus Valley Monasteries", desc: "Visit Shey, Thiksey, and Hemis monasteries." },
                { day: "Day 3", title: "Sham Valley Tour", desc: "Visit Alchi (11th century), Likir, and Magnetic Hill." },
                { day: "Day 4", title: "Nubra Valley via Khardung La", desc: "Cross the world's highest pass and visit Diskit Monastery." },
                { day: "Day 5", title: "Return to Leh", desc: "Explore local markets and enjoy a traditional Ladakhi dinner." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-16 h-16 bg-ladakh-accent/10 rounded-lg flex items-center justify-center text-ladakh-accent font-bold text-xs uppercase text-center leading-tight">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 uppercase text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl h-fit">
              <h3 className="text-xl font-display font-bold uppercase mb-2">Tour Price</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-ladakh-gold">$950</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">per person</span>
              </div>
              <ul className="space-y-3 text-xs text-white/60 mb-8">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Boutique hotel stays</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Private AC vehicle</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Expert cultural guide</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />All entry fees included</li>
              </ul>
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full bg-ladakh-accent hover:bg-ladakh-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs block text-center"
              >
                Book Now
              </Link>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8 text-center text-gray-900">Cultural Tour FAQs</h2>
          <FAQ items={[
            { q: "What is the best time for cultural tours?", a: "Ladakh is beautiful year-round for culture. Summer is great for festivals, while winter offers a more intimate look at local life." },
            { q: "Can we customize our cultural tour?", a: "Absolutely! We can tailor the itinerary to focus on specific interests like art, history, or spirituality." },
            { q: "Are homestays comfortable?", a: "Yes, our partner homestays are clean, warm, and offer a truly authentic experience with modern basic amenities." }
          ]} />
        </div>
      </div>
    </div>
  </>
);

const BikeTripPage = () => (
  <>
    <Helmet>
      <title>Ladakh Bike Trip Packages 2024/25 | Manali to Leh | Wild Ladakh</title>
      <meta name="description" content="Book the ultimate Ladakh bike trip packages. Experience the thrill of riding through Khardung La, Pangong Lake, and Nubra Valley with expert backup and support." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Adventure Expedition</span>
        <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-12 leading-[0.9]">Ladakh Bike Trip Packages</h1>
        
        <div className="aspect-video rounded-[2rem] overflow-hidden mb-16">
          <img src="https://i.pinimg.com/736x/91/43/e1/9143e193e575fc62ef20a317b30296e7.jpg" className="w-full h-full object-cover" alt="Ladakh Bike Trip" referrerPolicy="no-referrer" />
        </div>

        <div className="prose max-w-none">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">The Ultimate Adventure: Ladakh Bike Trip Packages</h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
            A <strong>Ladakh bike trip</strong> is a rite of passage for every adventure enthusiast. Riding through the highest motorable passes in the world, crossing glacial streams, and witnessing the stark beauty of the cold desert is an experience that stays with you forever. Our <strong>Ladakh bike trip packages</strong> are designed for safety, comfort, and maximum thrill.
          </p>
          
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">Why Choose Our Bike Tours?</h3>
          <p className="text-gray-500 mb-8">
            We provide well-maintained Royal Enfield bikes, a dedicated backup vehicle with a mechanic, and experienced road captains who know every curve of the Himalayan roads. Whether you choose the <strong>Manali to Leh</strong> route or a circuit starting from Leh, we ensure a seamless journey.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-2">Expert Backup</h4>
              <p className="text-xs text-gray-400">Mechanical support and medical oxygen always on hand.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-2">Premium Stays</h4>
              <p className="text-xs text-gray-400">Handpicked campsites and boutique hotels for recovery.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-2">Small Groups</h4>
              <p className="text-xs text-gray-400">Personalized attention and better safety on the road.</p>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Featured Itinerary: The High Pass Odyssey</h2>
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 mb-12">
            <ul className="space-y-4 text-sm text-gray-600">
              <li><strong className="text-ladakh-gold">Day 1:</strong> Arrival in Leh & Acclimatization</li>
              <li><strong className="text-ladakh-gold">Day 2:</strong> Leh Local Sightseeing & Bike Check</li>
              <li><strong className="text-ladakh-gold">Day 3:</strong> Leh to Nubra Valley via Khardung La (17,582 ft)</li>
              <li><strong className="text-ladakh-gold">Day 4:</strong> Nubra Valley to Pangong Lake via Shyok</li>
              <li><strong className="text-ladakh-gold">Day 5:</strong> Pangong Lake to Leh via Chang La</li>
              <li><strong className="text-ladakh-gold">Day 6:</strong> Departure from Leh</li>
            </ul>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Itinerary & Pricing</h2>
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase text-gray-900 mb-4">The High Pass Odyssey</h3>
              {[
                { day: "Day 1", title: "Leh Arrival", desc: "Pick up and bike handover. Evening test ride." },
                { day: "Day 2", title: "Leh to Nubra Valley", desc: "Ride through Khardung La (17,582 ft) to Hunder." },
                { day: "Day 3", title: "Nubra to Pangong", desc: "Off-road adventure along the Shyok river to the blue lake." },
                { day: "Day 4", title: "Pangong to Leh", desc: "Return via Chang La (17,590 ft) and Hemis." },
                { day: "Day 5", title: "Departure", desc: "Final breakfast and transfer to airport." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-16 h-16 bg-ladakh-accent/10 rounded-lg flex items-center justify-center text-ladakh-accent font-bold text-xs uppercase text-center leading-tight">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 uppercase text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl h-fit">
              <h3 className="text-xl font-display font-bold uppercase mb-2">Package Price</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-ladakh-gold">$1,100</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">per person</span>
              </div>
              <ul className="space-y-3 text-xs text-white/60 mb-8">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Royal Enfield 500cc/Himalayan</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Fuel for the entire trip</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Backup vehicle & mechanic</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Oxygen & medical kit</li>
              </ul>
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full bg-ladakh-accent hover:bg-ladakh-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs block text-center"
              >
                Book Now
              </Link>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8 text-center text-gray-900">Bike Trip FAQs</h2>
          <FAQ items={[
            { q: "Do I need a special license?", a: "A valid Indian or International Driving License for motorcycles is mandatory." },
            { q: "What is the best time for a bike trip?", a: "June to September is the best window when the roads from Manali and Srinagar are open." },
            { q: "Is fuel included in the package?", a: "Most of our packages include fuel for the entire circuit. Check your specific itinerary for details." }
          ]} />
        </div>
      </div>
    </div>
  </>
);

const FamilyTourPage = () => (
  <>
    <Helmet>
      <title>Leh Ladakh Family Tour Packages | Safe & Comfortable | Wild Ladakh</title>
      <meta name="description" content="Plan a memorable family vacation with our Leh Ladakh family tour packages. Comfortable stays, child-friendly itineraries, and expert local guides." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Leisure & Culture</span>
        <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-12 leading-[0.9]">Leh Ladakh Family Tour</h1>
        
        <div className="aspect-video rounded-[2rem] overflow-hidden mb-16">
          <img src="https://i.pinimg.com/736x/3b/ee/0a/3bee0a539520e6ad5ec3f18ff92007f3.jpg" className="w-full h-full object-cover" alt="Family Tour in Ladakh" referrerPolicy="no-referrer" />
        </div>

        <div className="prose max-w-none">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Create Memories: Leh Ladakh Family Tour Packages</h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
            Ladakh is not just for adventure junkies; it's a land of wonder for families too. Our <strong>Leh Ladakh family tour</strong> packages focus on comfort, safety, and engaging experiences for all ages. From visiting ancient monasteries to enjoying a double-humped camel ride in Nubra Valley, we ensure your family has a magical time.
          </p>
          
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">Family-Friendly Highlights</h3>
          <ul className="text-gray-600 mb-8 list-disc pl-6 space-y-2">
            <li>Interactive cultural sessions with local Ladakhi families.</li>
            <li>Easy-paced itineraries with ample time for rest and acclimatization.</li>
            <li>Stays in comfortable hotels and luxury camps with modern amenities.</li>
            <li>Visit to Magnetic Hill, Pathar Sahib Gurudwara, and Shanti Stupa.</li>
          </ul>

          <div className="bg-gray-50 border border-gray-100 p-8 rounded-3xl mb-12">
            <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Safety First for Families</h4>
            <p className="text-sm text-gray-500">We provide 24/7 on-call support, oxygen cylinders in all vehicles, and choose accommodations near medical facilities for peace of mind.</p>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Itinerary & Pricing</h2>
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase text-gray-900 mb-4">Family Adventure Trail</h3>
              {[
                { day: "Day 1", title: "Leh Arrival", desc: "Easy day with hotel rest and light evening walk." },
                { day: "Day 2", title: "Hall of Fame & Shanti Stupa", desc: "Educational and scenic visits suitable for all ages." },
                { day: "Day 3", title: "Nubra Valley", desc: "Camel rides in the sand dunes and Diskit monastery." },
                { day: "Day 4", title: "Pangong Lake", desc: "Day trip or overnight stay at the stunning blue lake." },
                { day: "Day 5", title: "Return & Shopping", desc: "Leh market visit for souvenirs and local crafts." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-16 h-16 bg-ladakh-accent/10 rounded-lg flex items-center justify-center text-ladakh-accent font-bold text-xs uppercase text-center leading-tight">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 uppercase text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl h-fit">
              <h3 className="text-xl font-display font-bold uppercase mb-2">Family Price</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-ladakh-gold">$850</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">per person</span>
              </div>
              <ul className="space-y-3 text-xs text-white/60 mb-8">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Child-friendly hotels</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Spacious private SUV</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Flexible pace</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />All meals included</li>
              </ul>
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full bg-ladakh-accent hover:bg-ladakh-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs block text-center"
              >
                Book Now
              </Link>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8 text-center text-gray-900">Family Tour FAQs</h2>
          <FAQ items={[
            { q: "Is Ladakh safe for children?", a: "Yes, children above 5 years usually adapt well. We recommend a slow pace and proper hydration." },
            { q: "What kind of food is available?", a: "Most hotels serve a mix of Indian, Continental, and local Ladakhi cuisine. We can cater to specific dietary needs." },
            { q: "Are there medical facilities in Leh?", a: "Leh has a well-equipped hospital (SNM Hospital) and several private clinics." }
          ]} />
        </div>
      </div>
    </div>
  </>
);

const WildlifeTourPage = () => (
  <>
    <Helmet>
      <title>Ladakh Wildlife Tour | Snow Leopards & Rare Species | Wild Ladakh</title>
      <meta name="description" content="Explore the unique biodiversity of the Himalayas with our Ladakh wildlife tour. Spot Snow Leopards, Tibetan Wolves, and rare birds in their natural habitat." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">The Wild Side</span>
        <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-12 leading-[0.9]">Ladakh Wildlife Tour</h1>
        
        <div className="aspect-video rounded-[2rem] overflow-hidden mb-16">
          <img src="https://i.pinimg.com/1200x/dc/e7/c5/dce7c5cd0a80aed4db93644bc4d1d51d.jpg" className="w-full h-full object-cover" alt="Wildlife in Ladakh" referrerPolicy="no-referrer" />
        </div>

        <div className="prose max-w-none">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Discover the High-Altitude Wilderness</h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
            Our <strong>Ladakh wildlife tour</strong> is a journey into one of the most extreme and beautiful ecosystems on Earth. Home to the elusive <strong>Snow Leopard</strong>, the <strong>Tibetan Wolf</strong>, and the <strong>Himalayan Brown Bear</strong>, Ladakh offers a wildlife experience that is raw and authentic.
          </p>
          
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">The Big Cats and Beyond</h3>
          <p className="text-gray-500 mb-8">
            While the <strong>Snow Leopard tour India</strong> is our flagship offering, Ladakh's wildlife is incredibly diverse. Spot the <strong>Blue Sheep (Bharal)</strong>, the <strong>Asiatic Ibex</strong>, and the rare <strong>Tibetan Gazelle</strong>. Our expert trackers use years of local knowledge to increase your chances of sightings.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Ethical Tracking</h4>
              <p className="text-sm text-gray-500">We follow strict guidelines to ensure minimal disturbance to the animals and their habitat.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Community Led</h4>
              <p className="text-sm text-gray-500">We work closely with local communities, ensuring that tourism benefits conservation efforts.</p>
            </div>
          </div>

          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-6 text-gray-900">Our Specialized Expeditions</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm uppercase tracking-widest">Expert-led journeys across the Trans-Himalayas</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { title: "Snow Leopard Expedition Ladakh", icon: <Mountain />, link: "/snow-leopard-expedition-ladakh", desc: "Track the 'Ghost of the Mountains' with expert local spotters.", img: "https://images.unsplash.com/photo-1564349683136-77e08bef1ed1?auto=format&fit=crop&q=80&w=800" },
              { title: "Ladakh Birding", icon: <Bird />, link: "/birding-tours-ladakh", desc: "Himalayan birding tours focusing on rare high-altitude species.", img: "https://i.pinimg.com/1200x/99/d1/c8/99d1c88e4dee7350d620dd28c4448ced.jpg" },
              { title: "Palla's Cat Expedition", icon: <Camera />, link: "/wildlife-photography-ladakh", desc: "Search for the elusive and enigmatic Manul in the high-altitude steppes.", img: "https://i.pinimg.com/1200x/a9/6b/eb/a96beb5f9e07719eabf2578251bb9bc4.jpg" },
              { title: "Ladakh Bike Trip Packages", icon: <Bike />, link: "/ladakh-bike-trip-packages", desc: "Iconic motorcycle journeys through the world's highest passes.", img: "https://i.pinimg.com/736x/91/43/e1/9143e193e575fc62ef20a317b30296e7.jpg" },
              { title: "Leh Ladakh Family Tour", icon: <Users />, link: "/leh-ladakh-family-tour", desc: "Curated cultural and leisure experiences for all ages.", img: "https://i.pinimg.com/736x/3b/ee/0a/3bee0a539520e6ad5ec3f18ff92007f3.jpg" },
              { title: "Ladakh Cultural Tours", icon: <History />, link: "/ladakh-cultural-tours", desc: "Explore ancient monasteries and authentic local life.", img: "https://i.pinimg.com/1200x/ae/c9/3a/aec93a79950110c817e78f557b7f356f.jpg" },
              { title: "Trekking in Ladakh", icon: <Mountain />, link: "/trekking-in-ladakh", desc: "Walk the Himalayas through high passes and frozen rivers.", img: "https://i.pinimg.com/736x/3d/fd/d1/3dfdd1902d10273b1c8e25bf081a76bd.jpg" },
              { title: "Eurasian Lynx Expedition", icon: <Camera />, link: "/eurasian-lynx-expedition-ladakh", desc: "Search for the elusive Eurasian Lynx in the rugged terrains of Ladakh.", img: "https://i.pinimg.com/736x/5e/6e/5f/5e6e5f0875647667124a7e3f1d8546ac.jpg" }
            ].map((s, i) => (
              <Link key={i} to={s.link} className="group relative p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-ladakh-accent/30 transition-all overflow-hidden shadow-sm hover:shadow-2xl">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <img src={s.img} className="w-full h-full object-cover" alt={s.title} referrerPolicy="no-referrer" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-ladakh-accent/10 rounded-2xl flex items-center justify-center text-ladakh-accent mb-8 group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">{s.title}</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">{s.desc}</p>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 text-gray-400 group-hover:text-ladakh-accent transition-colors">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

const BirdingPage = () => (
  <>
    <Helmet>
      <title>Birding in Ladakh | Himalayan Birding Tours | Wild Ladakh</title>
      <meta name="description" content="Discover rare high-altitude birds with our Himalayan birding tours in Ladakh. Spot the Black-necked Crane, Tibetan Snowcock, and more with expert birding guides." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Wildlife Specialty</span>
        <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-12 leading-[0.9]">Ladakh Birding</h1>
        
        <div className="aspect-video rounded-[2rem] overflow-hidden mb-16">
          <img src="https://i.pinimg.com/1200x/99/d1/c8/99d1c88e4dee7350d620dd28c4448ced.jpg" className="w-full h-full object-cover" alt="Birding in Ladakh" referrerPolicy="no-referrer" />
        </div>

        <div className="prose max-w-none">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Himalayan Birding Tours: A High-Altitude Paradise</h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
            <strong>Birding in Ladakh</strong> is an experience unlike any other. The Trans-Himalayan landscape of Ladakh is home to over 300 species of birds, many of which are rare high-altitude specialists. Our <strong>Himalayan birding tours</strong> are meticulously designed to cover diverse habitats, from the high-altitude wetlands of Tso Kar to the scrub forests of the Indus Valley.
          </p>
          
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">Key Species to Spot</h3>
          <p className="text-gray-500 mb-8">
            Ladakh is the only breeding ground for the majestic <strong>Black-necked Crane</strong> in India. Other sought-after species include the <strong>Tibetan Snowcock</strong>, <strong>Himalayan Snowcock</strong>, <strong>Ibisbill</strong>, <strong>Fire-fronted Serin</strong>, and the elusive <strong>Wallcreeper</strong>.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Expert Ornithologists</h4>
              <p className="text-sm text-gray-500">Our guides are passionate birders with years of experience in identifying high-altitude species.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Prime Locations</h4>
              <p className="text-sm text-gray-500">We visit Tso Kar, Puga Valley, and the Shey marshes for maximum species diversity.</p>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Best Time for Birding in Ladakh</h2>
          <p className="text-gray-500 mb-8">
            The summer months from May to August are ideal for <strong>birding in Ladakh</strong>. This is when migratory birds arrive for breeding, and the weather is pleasant for long days in the field.
          </p>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Itinerary & Pricing</h2>
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase text-gray-900 mb-4">The Himalayan Birding Trail</h3>
              {[
                { day: "Day 1", title: "Leh Arrival & Acclimatization", desc: "Rest and light birding around Leh town to spot resident species like the Eurasian Magpie and White-browed Tit-warbler." },
                { day: "Day 2", title: "Leh Around Birding", desc: "Full day exploring the Indus River marshes at Shey and Thiksey. Key targets: Ibisbill, Solitary Snipe, and various wagtails." },
                { day: "Day 3", title: "Wari La Pass Expedition", desc: "Day trip to Wari La (17,400 ft). Search for high-altitude specialists like Tibetan Snowcock, Himalayan Snowcock, and Brandt's Mountain Finch." },
                { day: "Day 4", title: "Leh to Pangong Lake", desc: "Drive via Chang La Pass (17,590 ft). Look for Lammergeier, Golden Eagle, and Robin Accentor along the rocky slopes." },
                { day: "Day 5", title: "Pangong to Hanle", desc: "A scenic drive via Chushul and Tsaga La. This remote stretch is excellent for spotting Tibetan Gazelle and the rare Ground Jay." },
                { day: "Day 6", title: "Hanle Marshes Exploration", desc: "Full day in Hanle, the premier spot for Black-necked Cranes. Also look for Tibetan Lark, Hume's Groundpecker, and Upland Buzzard." },
                { day: "Day 7", title: "Hanle to Tso Kar via Puga", desc: "Visit the Puga hot springs and the salt lake of Tso Kar. Target species: Tibetan Sandgrouse, Little Owl, and Great Rosefinch." },
                { day: "Day 8", title: "Tso Kar to Leh", desc: "Return to Leh via Taglang La (17,480 ft). Final birding stops for raptors and high-altitude larks before a farewell dinner." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-16 h-16 bg-ladakh-accent/10 rounded-lg flex items-center justify-center text-ladakh-accent font-bold text-xs uppercase text-center leading-tight">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 uppercase text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl h-fit sticky top-32">
              <h3 className="text-xl font-display font-bold uppercase mb-2">Tour Price</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-ladakh-gold">$1,850</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">per person</span>
              </div>
              <ul className="space-y-3 text-xs text-white/60 mb-8">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Expert local birding guide</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Premium 4x4 transport</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />High-end spotting scopes</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />All permits and entry fees</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Full board accommodation</li>
              </ul>
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full bg-ladakh-accent hover:bg-ladakh-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs block text-center"
              >
                Book Now
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 mb-16">
            <h3 className="text-xl font-display font-bold uppercase mb-6 text-gray-900">Internal Links</h3>
            <ul className="grid md:grid-cols-2 gap-4 text-sm text-ladakh-gold">
              <li><Link to="/snow-leopard-expedition-ladakh" className="hover:underline">Snow Leopard Expedition</Link></li>
              <li><Link to="/wildlife-photography-ladakh" className="hover:underline">Palla's Cat Expedition</Link></li>
            </ul>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8 text-center text-gray-900">Birding FAQs</h2>
          <FAQ items={[
            { q: "What should I pack for a birding tour?", a: "High-quality binoculars are essential. A spotting scope is recommended for wetlands. Wear layered clothing as temperatures can fluctuate." },
            { q: "Is birding in Ladakh physically demanding?", a: "Most birding is done near roads or with short walks. However, the high altitude (3,500m+) requires proper acclimatization." },
            { q: "Can we combine birding with a Snow Leopard tour?", a: "Yes, winter birding is also possible, focusing on resident species like the Solitary Snipe and various Rosefinches." }
          ]} />

          <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1552728089-57bdde30eba3?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1480044965905-02098d419e96?auto=format&fit=crop&q=80&w=600"
            ].map((img, i) => (
              <div key={i} className="aspect-square rounded-3xl overflow-hidden">
                <img src={img} className="w-full h-full object-cover" alt="Birding Ladakh" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

const PhotographyPage = () => (
  <>
    <Helmet>
      <title>Palla's Cat Expedition Ladakh | Manul Tracking Tours | Wild Ladakh</title>
      <meta name="description" content="Join our specialized Palla's Cat expedition in Ladakh. Track the elusive Manul across the high-altitude plateaus of Hanle and eastern Ladakh with expert spotters." />
    </Helmet>
    <div className="pt-32 pb-20 px-6 bg-[#fafafa]">
      <div className="max-w-5xl mx-auto relative">
        <div className="absolute -left-20 top-0 hidden xl:block">
          <span className="writing-mode-vertical-rl rotate-180 font-mono text-[10px] uppercase tracking-[0.5em] text-gray-400">
            Wildlife Photography • Eastern Ladakh • 2024
          </span>
        </div>
        
        <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.4em] mb-6 block">Creative Expedition</span>
        <h1 className="text-6xl md:text-[10rem] font-display font-bold uppercase tracking-tighter mb-16 leading-[0.8] text-gray-900">
          Palla's <br /> Cat
        </h1>
        
        <div className="relative group aspect-[16/10] md:aspect-[21/9] rounded-[3rem] overflow-hidden mb-20 shadow-2xl shadow-ladakh-accent/10">
          <img 
            src="https://i.pinimg.com/1200x/a9/6b/eb/a96beb5f9e07719eabf2578251bb9bc4.jpg" 
            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
            alt="Palla's Cat in Ladakh" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-white/50"></div>
              <p className="text-white font-mono text-[10px] uppercase tracking-[0.3em]">Otocolobus manul • Hanle Plateau</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 prose prose-lg max-w-none">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-display text-6xl text-ladakh-accent/20">01</span>
              <h2 className="text-4xl font-display font-bold uppercase tracking-tight text-gray-900 m-0">The Enigma of the Steppes</h2>
            </div>
            <p className="text-gray-600 text-xl font-light leading-relaxed mb-12 first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-ladakh-accent">
              Our <strong>Palla's Cat expedition</strong> (Manul) takes you to the remote, high-altitude plateaus of Eastern Ladakh, specifically the Hanle region. This is one of the few places on earth where this small, incredibly fluffy, and notoriously elusive feline can be spotted in the wild.
            </p>
            
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-display text-6xl text-ladakh-accent/20">02</span>
              <h3 className="text-3xl font-display font-bold uppercase tracking-tight text-gray-900 m-0">The Search for the Manul</h3>
            </div>
            <p className="text-gray-500 mb-12">
              Tracking a <strong>Palla's Cat</strong> requires patience, sharp eyes, and local expertise. Our team of spotters has years of experience in the Changthang region, knowing the rocky outcrops and burrows where these cats prefer to hide. This expedition is a must for serious wildlife enthusiasts and photographers.
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 p-8 rounded-[2rem] bg-white border border-gray-100 shadow-xl">
              <h4 className="font-display font-bold uppercase tracking-tight mb-6">Expedition Details</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="font-medium">Duration</span>
                  <span>8 Days</span>
                </li>
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="font-medium">Location</span>
                  <span>Hanle Plateau</span>
                </li>
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="font-medium">Best Time</span>
                  <span>Oct - Mar</span>
                </li>
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="font-medium">Difficulty</span>
                  <span>Moderate</span>
                </li>
              </ul>
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full mt-8 bg-ladakh-accent text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-colors block text-center"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Photography Mentors</h4>
              <p className="text-sm text-gray-500">Learn from professional wildlife photographers who know the nuances of high-altitude lighting.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Small Group Sizes</h4>
              <p className="text-sm text-gray-500">We limit our groups to ensure personalized attention and better access to wildlife.</p>
            </div>
          </div>



          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Itinerary & Pricing</h2>
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase text-gray-900 mb-4">Expedition Itinerary</h3>
              {[
                { day: "Day 1", title: "Leh Acclimatisation", desc: "Essential rest and hydration in Leh to adjust to the high altitude (3,500m)." },
                { day: "Day 2", title: "Leh to Hanle", desc: "Scenic drive to the remote Hanle plateau, the heart of Palla's Cat territory." },
                { day: "Day 3-6", title: "Hanle Expedition", desc: "Four full days dedicated to tracking and photographing the elusive Manul and other high-altitude wildlife." },
                { day: "Day 7", title: "Return to Leh", desc: "Final morning session in Hanle before driving back to Leh for the evening." },
                { day: "Day 8", title: "Leh to New Delhi", desc: "Transfer to Leh airport for your flight back to New Delhi." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-16 h-16 bg-ladakh-accent/10 rounded-lg flex items-center justify-center text-ladakh-accent font-bold text-xs uppercase text-center leading-tight">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 uppercase text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl h-fit">
              <h3 className="text-xl font-display font-bold uppercase mb-2">Expedition Price</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-ladakh-gold">$1,950</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">per person</span>
              </div>
              <ul className="space-y-3 text-xs text-white/60 mb-8">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Photography mentor</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Small group (max 6)</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Stable tripods & beanbags</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Astro-photo sessions</li>
              </ul>
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full bg-ladakh-accent hover:bg-ladakh-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs block text-center"
              >
                Book Now
              </Link>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8 text-center text-gray-900">Photography FAQs</h2>
          <FAQ items={[
            { q: "What gear do I need?", a: "A telephoto lens (400mm or more) is essential for wildlife. A wide-angle lens is great for the stunning Ladakh landscapes. Bring extra batteries as they drain faster in the cold." },
            { q: "Do you provide equipment rental?", a: "We can arrange for rentals of high-end lenses and camera bodies with prior notice." },
            { q: "Is there charging facility in the camps?", a: "Yes, we provide solar-powered charging stations in our remote camps." }
          ]} />

      </div>
    </div>
  </>
);

const SnowLeopardPage = () => (
  <>
    <Helmet>
      <title>Snow Leopard Expedition Ladakh | Snow Leopard Tour India</title>
      <meta name="description" content="Join the most successful Snow Leopard Expedition in Ladakh. Expert trackers, high-altitude camps, and ethical wildlife viewing. Book your Snow Leopard tour India today." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Signature Expedition</span>
        <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-12 leading-[0.9]">Snow Leopard Expedition Ladakh</h1>
        
        <div className="aspect-video rounded-[2rem] overflow-hidden mb-16">
          <img src="https://i.pinimg.com/1200x/a7/48/c0/a748c0f51c6d33c8e6844688817d0ced.jpg" className="w-full h-full object-cover" alt="Snow Leopard in Ladakh" referrerPolicy="no-referrer" />
        </div>

        <div className="prose max-w-none">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">The Ultimate Snow Leopard Tour India</h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
            The <strong>Snow Leopard Expedition Ladakh</strong> is a journey into the heart of the "Ghost of the Mountains." At Wild Ladakh Expedition, we offer a specialized <strong>Snow Leopard tour India</strong> that combines local tracking expertise with premium high-altitude logistics. Ladakh is the premier destination for anyone seeking a <strong>Ladakh wildlife tour</strong> that focuses on this elusive feline.
          </p>
          
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">Why Choose Our Snow Leopard Tour?</h3>
          <p className="text-gray-500 mb-8">
            Our expeditions are led by native Ladakhi trackers who have spent their lives in the mountains. Their ability to spot a snow leopard from miles away is legendary. We operate primarily in the Hemis National Park and the Ulley region, known for high leopard density.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Expert Spotters</h4>
              <p className="text-sm text-gray-500">Native trackers with 20+ years of experience in snow leopard behavior.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Ethical Viewing</h4>
              <p className="text-sm text-gray-500">We strictly follow wildlife conservation guidelines to minimize impact.</p>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-12 rounded-[3rem] mb-16 relative overflow-hidden">
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-ladakh-gold text-xs uppercase tracking-widest mb-4 block">Lead Naturalist</span>
                <h3 className="text-3xl font-display font-bold uppercase mb-6">Meet Tsewang Nurboo</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-8">
                  With over 10 years of experience in the high-altitude terrain of Ladakh, Tsewang Nurboo is one of the region's most respected naturalists. His deep understanding of Snow Leopard behavior and local ecology ensures an educational and successful expedition.
                </p>
                <div className="flex gap-4">
                  <div className="bg-white/10 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest">10+ Years Exp</div>
                  <div className="bg-white/10 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest">Local Expert</div>
                </div>
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden border-4 border-white/10">
                <img 
                  src="https://i.pinimg.com/736x/eb/13/48/eb13480e4528030ac6f5e9ef783c8d40.jpg" 
                  className="w-full h-full object-cover" 
                  alt="Tsewang Nurboo - Lead Naturalist" 
                  referrerPolicy="no-referrer" 
                />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-ladakh-accent/20 blur-[100px] -z-0" />
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Itinerary & Best Time</h2>
          <p className="text-gray-500 mb-8">
            The best time for a <strong>Snow Leopard tour India</strong> is during the winter months, from late December to March. This is when the leopards descend to lower altitudes in search of prey, making sightings more frequent. Our standard 12-day itinerary includes acclimatization in Leh, followed by 8 days of intensive tracking in the mountains.
          </p>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase text-gray-900 mb-4">Detailed Itinerary</h3>
              {[
                { day: "Day 1", title: "Arrival in Leh (3,500m)", desc: "Rest and acclimatization. Evening briefing with our lead tracker." },
                { day: "Day 2", title: "Leh Sightseeing", desc: "Visit Thiksey Monastery and Shanti Stupa. Light walking for altitude prep." },
                { day: "Day 3", title: "Drive to Tracking Base", desc: "Scenic drive to Hemis National Park or Ulley. Settle into high-altitude camp." },
                { day: "Day 4-10", title: "Wildlife Tracking", desc: "Daily field tracking with expert spotters. Focus on Snow Leopards, Ibex, and Wolves." },
                { day: "Day 11", title: "Return to Leh", desc: "Final morning tracking, then drive back to Leh for a farewell dinner." },
                { day: "Day 12", title: "Departure", desc: "Transfer to Leh airport for your flight back home." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-16 h-16 bg-ladakh-accent/10 rounded-lg flex items-center justify-center text-ladakh-accent font-bold text-xs uppercase text-center leading-tight">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 uppercase text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-display font-bold uppercase mb-2">Expedition Price</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-display font-bold text-ladakh-gold">$2,499</span>
                  <span className="text-xs text-white/40 uppercase tracking-widest">per person</span>
                </div>
                <ul className="space-y-3 text-xs text-white/60 mb-8">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-ladakh-gold rounded-full" />
                    All inner-line & wildlife permits
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-ladakh-gold rounded-full" />
                    Expert local tracking team
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-ladakh-gold rounded-full" />
                    Premium sub-zero camping gear
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-ladakh-gold rounded-full" />
                    All meals & heated tents
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-ladakh-gold rounded-full" />
                    Leh airport transfers
                  </li>
                </ul>
                <Link 
                  to="/#contact"
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="w-full bg-ladakh-accent hover:bg-ladakh-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs block text-center"
                >
                  Book Now
                </Link>
              </div>
              
              <div className="p-6 rounded-2xl border border-dashed border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Private Expedition?</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">We offer customized private tours for photographers and small groups. Contact us for a bespoke quote.</p>
                <Link 
                  to="/#contact" 
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-xs font-bold text-ladakh-accent uppercase tracking-widest hover:underline"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 mb-16">
            <h3 className="text-xl font-display font-bold uppercase mb-6 text-gray-900">Internal Links</h3>
            <ul className="grid md:grid-cols-2 gap-4 text-sm text-ladakh-gold">
              <li><Link to="/wildlife-photography-ladakh" className="hover:underline">Palla's Cat Expedition</Link></li>
              <li><Link to="/birding-tours-ladakh" className="hover:underline">Ladakh Birding</Link></li>
            </ul>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8 text-center text-gray-900">Frequently Asked Questions</h2>
          <FAQ items={[
            { q: "What is the success rate of seeing a Snow Leopard?", a: "While wildlife sightings are never guaranteed, our expert trackers maintain a very high success rate (over 90%) during the peak winter months." },
            { q: "How cold does it get during the expedition?", a: "Temperatures can drop to -20°C or lower at night. We provide high-quality sub-zero sleeping bags and heated tents." },
            { q: "Is this tour suitable for beginners?", a: "The expedition involves high-altitude camping and moderate trekking. A basic level of fitness and proper acclimatization is required." }
          ]} />
        </div>

        <div className="mt-20 text-center">
          <Link 
            to="/#contact"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-block bg-ladakh-accent text-white px-12 py-6 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  </>
);

const EurasianLynxPage = () => (
  <>
    <Helmet>
      <title>Eurasian Lynx Expedition Ladakh | Wildlife Tours India</title>
      <meta name="description" content="Join our specialized Eurasian Lynx Expedition in Ladakh. Track the elusive lynx in the Wari La region with expert local spotters. Book your Ladakh wildlife tour today." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Wildlife Expedition</span>
        <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-12 leading-[0.9]">Eurasian Lynx Expedition Ladakh</h1>
        
        <div className="aspect-video rounded-[2rem] overflow-hidden mb-16">
          <img src="https://i.pinimg.com/736x/5e/6e/5f/5e6e5f0875647667124a7e3f1d8546ac.jpg" className="w-full h-full object-cover" alt="Eurasian Lynx in Ladakh" referrerPolicy="no-referrer" />
        </div>

        <div className="prose max-w-none">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Search for the Elusive Eurasian Lynx</h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-8">
            The <strong>Eurasian Lynx Expedition Ladakh</strong> is a specialized journey focusing on one of the most secretive predators of the Himalayas. Often overshadowed by the Snow Leopard, the Lynx is a master of camouflage and a thrill to track in the rugged Wari La region. Our <strong>Ladakh wildlife tour</strong> offers a unique opportunity to witness this magnificent cat in its natural habitat.
          </p>
          
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-gray-900">Why Track Lynx with Us?</h3>
          <p className="text-gray-500 mb-8">
            Our team of local spotters has identified key territories in the Wari La area where Lynx activity is highest. We use ethical tracking methods and high-quality optics to ensure the best possible sightings without disturbing the wildlife.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Specialized Territory</h4>
              <p className="text-sm text-gray-500">Focus on Wari La region and surrounding areas known for Lynx sightings.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-display font-bold uppercase text-ladakh-accent mb-4">Small Group Focus</h4>
              <p className="text-sm text-gray-500">Limited group sizes for a more intimate and quiet tracking experience.</p>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6 text-gray-900">Itinerary & Pricing</h2>
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase text-gray-900 mb-4">10-Day Expedition Itinerary</h3>
              {[
                { day: "Day 1", title: "Arrival in Leh", desc: "Rest and acclimatization at 3,500m." },
                { day: "Day 2", title: "Leh Sightseeing", desc: "Visit local monasteries and prepare for the field." },
                { day: "Day 3", title: "Wari La Pass", desc: "Scenic drive over the high pass to our base camp in Lynx territory." },
                { day: "Day 4-8", title: "Lynx Tracking", desc: "Daily field tracking and wildlife observation with expert spotters." },
                { day: "Day 9", title: "Return to Leh", desc: "Drive back to Leh for a farewell dinner." },
                { day: "Day 10", title: "Departure", desc: "Transfer to Leh airport." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-16 h-16 bg-ladakh-accent/10 rounded-lg flex items-center justify-center text-ladakh-accent font-bold text-xs uppercase text-center leading-tight">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 uppercase text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl h-fit">
              <h3 className="text-xl font-display font-bold uppercase mb-2">Tour Price</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-ladakh-gold">$1,899</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">per person</span>
              </div>
              <ul className="space-y-3 text-xs text-white/60 mb-8">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Expert local spotters</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />All permits included</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />Field accommodation</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-ladakh-gold rounded-full" />All meals in the field</li>
              </ul>
              <Link 
                to="/#contact"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full bg-ladakh-accent hover:bg-ladakh-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs block text-center"
              >
                Book Now
              </Link>
            </div>
          </div>

          <FAQ items={[
            { q: "What is the best time for Lynx tracking?", a: "The best time is from February to April when the Lynx are more active and visible in the Wari La region." },
            { q: "Is the Lynx sighting guaranteed?", a: "Like all wildlife expeditions, sightings are not guaranteed, but our trackers have a high success rate in these specific territories." },
            { q: "What gear do I need?", a: "Warm layers, good hiking boots, and high-quality binoculars are essential. We provide spotting scopes for the group." }
          ]} />
        </div>
      </div>
    </div>
  </>
);

const BlogPage = () => {
  return (
    <>
      <Helmet>
        <title>Ladakh Travel Blog | Wildlife & Adventure Tips | Wild Ladakh</title>
        <meta name="description" content="Read our latest blog posts for expert tips on Snow Leopard expeditions, birding in Ladakh, and Himalayan adventure planning." />
      </Helmet>
      <div className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="font-mono text-ladakh-accent text-xs uppercase tracking-[0.3em] mb-6 block">Field Notes</span>
            <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter leading-[0.9]">The Wild <br /> <span className="text-ladakh-gold">Journal</span></h1>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogData.map((post, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-[2.5rem] bg-white border border-gray-100 hover:border-ladakh-accent/30 transition-all flex flex-col h-full overflow-hidden shadow-sm hover:shadow-2xl"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={post.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} referrerPolicy="no-referrer" />
                  {post.featured && (
                    <div className="absolute top-6 left-6 bg-ladakh-accent text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                      Featured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1 rounded-full bg-gray-50 text-[10px] uppercase tracking-widest text-ladakh-accent font-bold border border-gray-100">{post.category}</span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-4 group-hover:text-ladakh-accent transition-colors leading-tight text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500 mb-8 flex-grow font-light leading-relaxed">{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:gap-4 transition-all text-gray-400 group-hover:text-ladakh-accent">
                    Read Full Article <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = blogData.find(p => p.slug === slug);

  if (!post) return <div className="pt-40 text-center">Post not found</div>;

  return (
    <>
      <Helmet>
        <title>{post.title} | Wild Ladakh Journal</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>
      <div className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-ladakh-accent mb-12 transition-colors">
            <ArrowRight className="w-3 h-3 rotate-180" /> Back to Journal
          </Link>
          
          <div className="mb-12">
            <div className="flex gap-4 items-center mb-6">
              <span className="px-3 py-1 rounded-full bg-ladakh-accent/10 text-[10px] uppercase tracking-widest text-ladakh-accent font-bold border border-ladakh-accent/20">{post.category}</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">{post.date}</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-[0.9] text-gray-900 mb-12">{post.title}</h1>
            
            <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl">
              <img src={post.img} className="w-full h-full object-cover" alt={post.title} referrerPolicy="no-referrer" />
            </div>

            <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900 prose-li:text-gray-600">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>

          <div className="pt-16 border-t border-gray-100 mt-20">
            <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-8 text-gray-900">Share this article</h4>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button key={i} className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-ladakh-accent hover:text-white transition-all text-gray-400">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const PrivacyPolicyPage = () => (
  <>
    <Helmet>
      <title>Privacy Policy | Wild Ladakh Expedition</title>
      <meta name="description" content="Privacy Policy for Wild Ladakh Expedition. Learn how we collect, use, and protect your personal information." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-12 text-gray-900">Privacy Policy</h1>
        <div className="prose max-w-none text-gray-600 leading-relaxed">
          <p className="mb-6">Last updated: April 14, 2024</p>
          
          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">1. Introduction</h2>
          <p className="mb-6">At Wild Ladakh Expedition, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">2. Information We Collect</h2>
          <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
          </ul>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">3. How We Use Your Information</h2>
          <p className="mb-6">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide our services to you, to manage our relationship with you, and to improve our website and services.</p>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">4. Data Security</h2>
          <p className="mb-6">We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">5. Contact Us</h2>
          <p className="mb-6">If you have any questions about this privacy policy or our privacy practices, please contact us at wildladakhexpedition@gmail.com.</p>
        </div>
      </div>
    </div>
  </>
);

const TermsOfServicePage = () => (
  <>
    <Helmet>
      <title>Terms of Service | Wild Ladakh Expedition</title>
      <meta name="description" content="Terms of Service for Wild Ladakh Expedition. Read our booking conditions, cancellation policies, and liability terms." />
    </Helmet>
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-12 text-gray-900">Terms of Service</h1>
        <div className="prose max-w-none text-gray-600 leading-relaxed">
          <p className="mb-6">Last updated: April 14, 2024</p>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">By accessing or using the Wild Ladakh Expedition website and services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">2. Booking and Payments</h2>
          <p className="mb-6">All bookings are subject to availability. A deposit is required at the time of booking to secure your spot. Full payment must be made according to the schedule provided during the booking process.</p>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">3. Cancellation and Refunds</h2>
          <p className="mb-6">Cancellations must be made in writing. Refund amounts depend on the timing of the cancellation relative to the expedition start date. Please refer to your specific booking confirmation for detailed cancellation policies.</p>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">4. Liability and Insurance</h2>
          <p className="mb-6">Wild Ladakh Expedition is not liable for any personal injury, property damage, or loss incurred during our tours. We strongly recommend that all participants obtain comprehensive travel and medical insurance.</p>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">5. Code of Conduct</h2>
          <p className="mb-6">Participants are expected to follow the instructions of our guides and respect local cultures and environments. We reserve the right to remove any participant whose behavior is disruptive or dangerous.</p>

          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mt-12 mb-4">6. Governing Law</h2>
          <p className="mb-6">These terms shall be governed by and construed in accordance with the laws of India, and any disputes will be subject to the exclusive jurisdiction of the courts in Leh, Ladakh.</p>
        </div>
      </div>
    </div>
  </>
);

// --- Main App ---

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-ladakh-accent selection:text-white overflow-x-hidden">
            <Navbar scrolled={scrolled} />
            
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/snow-leopard-expedition-ladakh" element={<SnowLeopardPage />} />
                <Route path="/birding-tours-ladakh" element={<BirdingPage />} />
                <Route path="/wildlife-photography-ladakh" element={<PhotographyPage />} />
                <Route path="/ladakh-bike-trip-packages" element={<BikeTripPage />} />
                <Route path="/leh-ladakh-family-tour" element={<FamilyTourPage />} />
                <Route path="/ladakh-wildlife-tour" element={<WildlifeTourPage />} />
                <Route path="/trekking-in-ladakh" element={<TrekkingPage />} />
                <Route path="/ladakh-cultural-tours" element={<CulturalPage />} />
                <Route path="/eurasian-lynx-expedition-ladakh" element={<EurasianLynxPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              </Routes>
            </main>

            <FloatingBookButton />
            <Footer />
          </div>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
