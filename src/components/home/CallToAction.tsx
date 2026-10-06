import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-20 hero-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Job Seekers CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
              Ready to Find Your Perfect Job?
            </h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Join thousands of women who have found meaningful work through
              BloomPath. Your skills deserve recognition and fair pay.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="btn-accent-glow w-full sm:w-auto">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Employers CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-accent" />
              <span className="text-white/80 font-medium">For Businesses</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
              Looking for Reliable Workers?
            </h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Post your tasks and connect with verified, skilled women in
              your area. Flexible hiring for your business needs.
            </p>
            <Link to="/auth?mode=signup&role=business">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
              >
                Post a Job
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
