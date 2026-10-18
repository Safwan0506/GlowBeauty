import React, { createContext, useContext, useState, useMemo } from 'react';

type Lang = 'fr' | 'en';

const translations = {
  fr: {
    nav: { home: 'Accueil', about: 'À propos', products: 'Nos Produits', contact: 'Contact', login: 'Connexion', myAccount: 'Mon Compte' },
    hero: {
      subtitle: 'L\'art de la beauté sensorielle',
      title: 'SCENSORA',
      description: 'Révélez votre beauté naturelle avec nos produits premium soigneusement sélectionnés',
      tagline: 'L\'excellence au service de votre peau',
      cta1: 'Découvrir la collection',
      cta2: 'Passer commande',
    },
    about: {
      title: 'Notre Histoire',
      subtitle: 'L\'élégance dans chaque détail',
      description1: 'Scensora est née de la passion de créer des produits de beauté naturels et efficaces. Notre mission est de vous offrir des solutions adaptées à votre peau, avec des ingrédients soigneusement sélectionnés et des formules innovantes.',
      description2: 'Nous travaillons avec les meilleurs fournisseurs et des experts en dermatologie pour garantir la qualité et l\'efficacité de chacun de nos produits. Votre satisfaction et le bien-être de votre peau sont notre priorité absolue.',
      card1: '100% Naturel',
      card2: 'Qualité Premium',
      card3: 'Éco-responsable',
      since: 'Votre partenaire beauté depuis 2020',
    },
    products: {
      title: 'La Collection',
      subtitle: 'Des soins d\'exception pour chaque besoin',
      empty: 'Aucun produit disponible pour le moment',
      order: 'Commander',
      reviews: 'Avis',
    },
    contact: {
      title: 'Nous Contacter',
      subtitle: 'Une question ? Besoin de conseils ? N\'hésitez pas à nous écrire',
      name: 'Nom complet',
      email: 'Email',
      message: 'Message',
      send: 'Envoyer via WhatsApp',
      address: 'Adresse',
      phone: 'Téléphone',
    },
    footer: {
      description: 'Votre partenaire beauté pour des produits naturels et efficaces.',
      quickLinks: 'Liens rapides',
      contactTitle: 'Contact',
      rights: 'Tous droits réservés.',
    },
    auth: {
      loginTitle: 'Connectez-vous à votre compte',
      registerTitle: 'Créez votre compte',
      username: 'Nom d\'utilisateur',
      password: 'Mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      loginBtn: 'Se connecter',
      registerBtn: 'S\'inscrire',
      noAccount: 'Je n\'ai pas de compte ?',
      hasAccount: 'J\'ai déjà un compte ?',
      connecting: 'Connexion...',
      registering: 'Inscription...',
    },
    reviews: {
      title: 'Avis sur',
      noReviews: 'Aucun avis pour ce produit',
    },
  },
  en: {
    nav: { home: 'Home', about: 'About', products: 'Our Products', contact: 'Contact', login: 'Sign In', myAccount: 'My Account' },
    hero: {
      subtitle: 'The art of sensorial beauty',
      title: 'SCENSORA',
      description: 'Reveal your natural beauty with our carefully selected premium products',
      tagline: 'Excellence at the service of your skin',
      cta1: 'Discover the collection',
      cta2: 'Place an order',
    },
    about: {
      title: 'Our Story',
      subtitle: 'Elegance in every detail',
      description1: 'Scensora was born from a passion for creating natural and effective beauty products. Our mission is to offer solutions tailored to your skin, with carefully selected ingredients and innovative formulas.',
      description2: 'We work with the finest suppliers and dermatology experts to guarantee the quality and effectiveness of each product. Your satisfaction and skin wellness are our absolute priority.',
      card1: '100% Natural',
      card2: 'Premium Quality',
      card3: 'Eco-friendly',
      since: 'Your beauty partner since 2020',
    },
    products: {
      title: 'The Collection',
      subtitle: 'Exceptional care for every need',
      empty: 'No products available at the moment',
      order: 'Order',
      reviews: 'Reviews',
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Have a question? Need advice? Don\'t hesitate to write to us',
      name: 'Full name',
      email: 'Email',
      message: 'Message',
      send: 'Send via WhatsApp',
      address: 'Address',
      phone: 'Phone',
    },
    footer: {
      description: 'Your beauty partner for natural and effective products.',
      quickLinks: 'Quick Links',
      contactTitle: 'Contact',
      rights: 'All rights reserved.',
    },
    auth: {
      loginTitle: 'Sign in to your account',
      registerTitle: 'Create your account',
      username: 'Username',
      password: 'Password',
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone',
      loginBtn: 'Sign In',
      registerBtn: 'Sign Up',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      connecting: 'Connecting...',
      registering: 'Registering...',
    },
    reviews: {
      title: 'Reviews for',
      noReviews: 'No reviews for this product',
    },
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof translations.fr;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('scensora_lang');
    return (stored === 'en' || stored === 'fr') ? stored : 'fr';
  });

  const value = useMemo(() => {
    localStorage.setItem('scensora_lang', lang);
    return { lang, setLang, t: translations[lang] };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
