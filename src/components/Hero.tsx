
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4 animate-fade-in">
            Powerful conversions made simple
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance animate-fade-in [animation-delay:200ms]">
            Create Interactive Funnels that <span className="text-gradient">Convert</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in [animation-delay:400ms]">
            Design beautiful, engaging quiz-style conversion funnels without any technical skills - in minutes, not hours.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in [animation-delay:600ms]">
            <Button asChild size="lg" className="rounded-full h-14 px-8 button-hover">
              <Link to="/builder">
                Start Building <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-8 button-hover">
              <Link to="/templates">
                Browse Templates
              </Link>
            </Button>
          </div>
          
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 animate-fade-in [animation-delay:800ms]">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-20 relative bg-card rounded-xl shadow-card overflow-hidden animate-scale-in">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30 pointer-events-none"></div>
          <img 
            src="https://images.unsplash.com/photo-1545987796-200677ee1011?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Interactive Funnel Builder Interface" 
            className="w-full h-auto object-cover rounded-xl shadow-inner drag-none"
          />
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-60 animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full filter blur-3xl opacity-70 animate-float [animation-delay:2s]"></div>
      </div>
    </section>
  );
};

const features = [
  "Drag-and-drop editor",
  "Multiple question types",
  "Custom design options",
  "Lead capture forms",
  "Real-time preview",
  "Responsive design"
];

export default Hero;
