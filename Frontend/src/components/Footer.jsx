import React from 'react';

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
          <p className="text-neutral-500 text-xs mt-1">
            © {new Date().getFullYear()} LocalLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
