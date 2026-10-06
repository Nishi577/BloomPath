import { motion } from "framer-motion";
import { MapPin, Shield, Clock, Wallet, Users, Award } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Location-Based Jobs",
    description: "Find work opportunities within 20km of your home or choose remote tasks that fit your schedule.",
  },
  {
    icon: Shield,
    title: "Verified & Safe",
    description: "All users are verified through Aadhar authentication, ensuring a safe and trustworthy community.",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Work on your own terms with task-based jobs that fit around your family and personal commitments.",
  },
  {
    icon: Wallet,
    title: "Fair Pay",
    description: "Transparent pay-per-task structure ensures you know exactly what you'll earn before you start.",
  },
  {
    icon: Users,
    title: "Skill Matching",
    description: "Our smart system matches your skills with the right opportunities, from tailoring to data entry.",
  },
  {
    icon: Award,
    title: "Build Your Profile",
    description: "Track your work history, collect reviews, and build a professional portfolio over time.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">BloomPath?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We're building a platform that truly understands the needs of working women in India.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-hover bg-card rounded-xl p-6 border border-border"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
