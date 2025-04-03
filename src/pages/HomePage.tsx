import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-black via-gray-800 to-gray-600 bg-clip-text text-transparent mb-6"
          >
            LeadFlux
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Crie funis de vendas incríveis e converta mais leads com nossa plataforma intuitiva.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register">
              <Button className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white transition-all duration-300 shadow-lg hover:shadow-xl">
                Começar Agora
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-gray-200 hover:border-gray-300">
                Fazer Login
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage; 