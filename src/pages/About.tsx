
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-charcoal text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="container px-4 md:px-8 max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-8">
            <h1 className="text-3xl font-space font-bold mb-6">About CollectiveMint</h1>
            <p className="text-muted-foreground mb-8">
              This page will contain information about the platform, team, and vision.
            </p>
            <div className="p-6 bg-secondary/30 rounded-lg border border-border">
              <p className="text-center text-emerald">Coming Soon!</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
