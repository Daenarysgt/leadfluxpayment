import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/utils/store";
import { CheckCircle2, ChevronRight, Code, Layers, Smartphone } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { funnels, createFunnel, setCurrentFunnel } = useStore();
  
  const handleStartBuilding = () => {
    if (funnels.length === 0) {
      createFunnel("New Funnel");
      toast({
        title: "Funil criado",
        description: "Um novo funil foi criado para você começar",
      });
    } else {
      setCurrentFunnel(funnels[0].id);
    }
    
    navigate("/builder");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />
        
        {/* Features Section */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create engaging quiz-style funnels in just a few minutes with our intuitive drag-and-drop builder.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="bg-card rounded-xl p-6 shadow-card hover:shadow-premium transition-shadow">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Button 
                size="lg" 
                className="rounded-full px-8 h-14"
                onClick={handleStartBuilding}
              >
                Start Building <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features Grid Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create high-converting funnel experiences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="p-6 border rounded-xl hover:shadow-subtle transition-shadow">
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 px-6 bg-primary/5 rounded-3xl mx-6 my-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to boost your conversions?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start creating beautiful, interactive funnels that capture leads and drive results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="rounded-full px-8 h-14"
                onClick={handleStartBuilding}
              >
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 h-14">
                View Demo
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-muted/30 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Funilicious</h3>
              <p className="text-muted-foreground">
                Create beautiful, interactive funnel experiences that convert.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Templates</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms & Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-6 text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} Funilicious. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const steps = [
  {
    icon: Layers,
    title: "Create your funnel",
    description: "Design your funnel with our drag-and-drop editor and choose from various question types."
  },
  {
    icon: Smartphone,
    title: "Customize the design",
    description: "Personalize colors, fonts, and styles to match your brand perfectly."
  },
  {
    icon: Code,
    title: "Publish and integrate",
    description: "Publish your funnel and integrate with your favorite marketing tools."
  }
];

const features = [
  {
    icon: Layers,
    title: "Drag-and-Drop Builder",
    description: "Create funnels easily with our intuitive drag-and-drop interface."
  },
  {
    icon: CheckCircle2,
    title: "Multiple Question Types",
    description: "Choose from text, multiple choice, email, phone, rating and more."
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Your funnels look great on any device, from desktop to mobile."
  },
  {
    icon: Code,
    title: "Integrations",
    description: "Connect with your favorite marketing tools and CRM systems."
  },
  {
    icon: Layers,
    title: "Custom Branding",
    description: "Match your brand with custom colors, fonts and design elements."
  },
  {
    icon: CheckCircle2,
    title: "Lead Generation",
    description: "Capture leads and export data for your marketing campaigns."
  },
];

export default Index;
