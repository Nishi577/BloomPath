import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-women-working.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Women working together"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
              🌟 Empowering Women Through Work
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6"
          >
            Your Skills,{" "}
            <span className="text-accent">Your Location,</span>{" "}
            Your Opportunity
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed"
          >
            BloomPath connects women with flexible, location-based job
            opportunities. From home-based work to local tasks, find the
            perfect fit for your skills and schedule.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/auth?mode=signup">
              <Button size="lg" className="btn-accent-glow text-lg px-8 py-6 w-full sm:w-auto">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6 w-full sm:w-auto"
              >
                Browse Jobs
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20"
          >
            <div className="text-center sm:text-left">
              <div className="text-3xl md:text-4xl font-display font-bold text-white">
                500+
              </div>
              <div className="text-sm text-white/70">Jobs Available</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-3xl md:text-4xl font-display font-bold text-white">
                1000+
              </div>
              <div className="text-sm text-white/70">Women Employed</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-3xl md:text-4xl font-display font-bold text-white">
                50+
              </div>
              <div className="text-sm text-white/70">Partner Businesses</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
