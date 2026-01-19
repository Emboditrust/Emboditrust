import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Products from '@/components/Products';
import Industries from '@/components/Industries';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import About from '../components/About';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About/>
      <Features />
      <Products />
      <Industries />
      <ContactForm />
      <Footer />
    </main>
  );
}