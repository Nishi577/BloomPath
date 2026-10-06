import { motion } from "framer-motion";
import { UserPlus, Search, CheckCircle, Wallet } from "lucide-react";
import womanEntrepreneur from "@/assets/woman-entrepreneur.jpg";
import womanTailoring from "@/assets/woman-tailoring.jpg";
import womanTutoring from "@/assets/woman-tutoring.jpg";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up with your basic details and upload your Aadhar for verification. Add your skills and set your location.",
    image: womanEntrepreneur,
  },
  {
    icon: Search,
    title: "Browse Opportunities",
    description: "Explore jobs matching your skills within your preferred distance. Filter by pay, duration, and work type.",
    image: womanTailoring,
  },
  {
    icon: CheckCircle,
    title: "Apply & Get Verified",
    description: "Apply to jobs that interest you. Once your Aadhar is verified by our team, you're ready to work.",
    image: womanTutoring,
  },
  {
    icon: Wallet,
    title: "Complete Tasks & Earn",
    description: "Complete your assigned tasks, submit proof of work, and receive your payment directly.",
    image: womanEntrepreneur,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in just four simple steps
          </p>
        </motion.div>

        <div className="space-y-16 md:space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-8 md:gap-16`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl">
                    {index + 1}
                  </div>
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/10 rounded-2xl transform rotate-3" />
                  <img
                    src={step.image}
                    alt={step.title}
                    className="relative rounded-xl w-full max-w-md mx-auto shadow-xl object-cover aspect-square"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
