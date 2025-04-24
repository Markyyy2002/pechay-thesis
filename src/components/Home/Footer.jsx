import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white shadow-inner py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-center text-gray-600">
                        &copy; {new Date().getFullYear()} Pechay Monitoring System. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500 mt-2 md:mt-0">
                        Smart Agriculture Thesis Project
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;