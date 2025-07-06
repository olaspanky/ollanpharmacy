// app/components/ShopByCategory.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Drug, drugsData, categories } from "../lib/data";

const ShopByCategory: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Category");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const filteredDrugs = selectedCategory === "All Category"
    ? drugsData
    : drugsData.filter((drug) => drug.category === selectedCategory);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering navigation
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProductClick = (e: React.MouseEvent) => {
    // Only navigate if the click is not on the "Add to Cart" button
    if (!(e.target as HTMLElement).closest("button")) {
      router.push("/pages/shop");
    }
  };

  interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

  const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
        <div 
          ref={modalRef}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl animate-fadeIn border border-white/20"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              Our online shopping cart feature is under development. Stay tuned for updates and shop with us in-store at Ollan Pharmacy!
            </p>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200"
              aria-label="Close modal"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">
          Shop by Category
        </h2>

        <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
              }`}
              onClick={() => setSelectedCategory(category)}
              aria-label={`Filter by ${category}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h3 className="text-2xl font-bold text-gray-900">
            {selectedCategory === "All Category" ? "All Products" : selectedCategory}
          </h3>
          <button 
            onClick={() => router.push("/shop")}
            className="text-red-500 font-semibold flex items-center hover:text-red-600 transition-colors"
            aria-label="View all products"
          >
            View All <span className="ml-1">→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-6">
          {filteredDrugs.map((drug) => (
            <div 
              key={drug.id} 
              className="bg-white rounded-2xl lg:p-6 p-2 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer"
              onClick={handleProductClick}
            >
              <div className="w-full h-48 rounded-lg mb-4 flex items-center justify-center bg-gray-50">
                <img
                  src={drug.image}
                  alt={drug.name}
                  className="h-40 object-contain max-w-full"
                  loading="lazy"
                />
              </div>
              <div className="flex-grow">
                <h4 className="text-[14px] lg:text-lg font-semibold mb-2 text-gray-900 line-clamp-2" title={drug.name}>
                  {drug.name}
                </h4>
                <p className="text-red-500 font-bold mb-4">
                  ₦{drug.price.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleProductClick}
                className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-300 mt-auto"
                aria-label={`Add ${drug.name} to cart`}
              >
                Shop now
              </button>
            </div>
          ))}
        </div>

        <ComingSoonModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    </section>
  );
};

export default ShopByCategory;