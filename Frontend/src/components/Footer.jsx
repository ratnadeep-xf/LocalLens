import React from 'react';
import { Mail, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center">
          <p className="text-neutral-600 text-sm">
            Created by{' '}
            <span className="font-semibold text-primary-600">
              Ratnadeep Paul
            </span>
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a
              href="mailto:2024chb1075@iitrpr.ac.in"
              className="text-neutral-600 hover:text-primary-600 transition-colors text-sm flex items-center gap-1"
            >
              <Mail size={16} />
              2024chb1075@iitrpr.ac.in
            </a>
            <span className="text-neutral-300">•</span>
            <a
              href="https://www.linkedin.com/in/ratnadeep-paul-3988ba324/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-primary-600 transition-colors text-sm flex items-center gap-1"
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
          </div>
          <p className="text-neutral-500 text-xs mt-3">
            © {new Date().getFullYear()} LocalLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
