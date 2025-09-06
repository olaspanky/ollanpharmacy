'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Upload,
  Star,
  Shield,
  Truck,
  Smartphone,
  User,
  Rabbit,
  PackageCheck,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  X,
  File,
  Loader2,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ShopByCategory from './ShopByCategory';
import Navbar from './Navbar';

// Assuming these imports point to valid paths
import logo from '../../../public/ollogo.svg';
import i1 from '../../../public/ol1.png';
import as from '../../../public/assets/as.png';
import gp from '../../../public/assets/gp.png';

interface UploadPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
}

const UploadPrescriptionModal: React.FC<UploadPrescriptionModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Clean up image previews to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach((uploadedFile) => {
        if (uploadedFile.preview) {
          URL.revokeObjectURL(uploadedFile.preview);
        }
      });
    };
  }, [files]);

  const handleFileChange = (selectedFiles: FileList | null) => {
    setError(null);
    setSuccess(false);
    if (selectedFiles) {
      const validFiles: UploadedFile[] = [];
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      Array.from(selectedFiles).forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          setError('Only JPEG, PNG, PDF, and DOCX files are allowed');
          return;
        }
        if (file.size > maxSize) {
          setError('File size must be less than 5MB');
          return;
        }
        validFiles.push({
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        });
      });

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removedFile = newFiles.splice(index, 1)[0];
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return newFiles;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Valid email is required';
    if (!formData.phone.match(/^\+?\d{10,15}$/)) return 'Valid phone number is required';
    if (!formData.location.trim()) return 'Location is required';
    return null;
  };

  const handleUpload = async () => {
    const formError = validateForm();
    if (formError) {
      setError(formError);
      return;
    }
    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Uploaded files:', files.map((f) => f.file.name));
      console.log('Form data:', formData);
      setSuccess(true);
      setFiles([]);
      setFormData({ name: '', email: '', phone: '', location: '' });
    } catch (err) {
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full mx-4 shadow-xl animate-fadeIn border border-white/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Upload Prescription</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your location"
            />
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center ${
            dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">
            Drag and drop your prescription files here, or
          </p>
          <button
            onClick={openFilePicker}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Select Files
          </button>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </div>

        {/* File Previews */}
        {files.length > 0 && (
          <div className="mb-6 max-h-64 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Uploaded Files:</h4>
            <div className="grid gap-4">
              {files.map((uploadedFile, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {uploadedFile.preview ? (
                      <Image
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    ) : (
                      <File className="w-8 h-8 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {uploadedFile.file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove ${uploadedFile.file.name}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center space-x-2">
            <X className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <p>Prescription uploaded successfully! Our agents will reach out to you shortly.</p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload Prescription'}</span>
        </button>
      </div>
    </div>
  );
};

const PharmacyWebsite = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">30,000+ customers</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Welcome to Ollan Pharmacy – Your <span className="text-red-500">One-Stop Online Pharmacy & Supermarket</span> in Ibadan
              </h1>

              <h2 className="text-gray-600 mb-8 text-md lg:text-lg lg:leading-relaxed">
                Welcome to Ollan Pharmacy, your trusted source for authentic
                medications, health supplements, and everyday supermarket items
                – now available online! Established in 1985 and proudly serving
                Ibadan, we combine professional pharmaceutical care with the
                convenience of fast, reliable delivery. Whether you’re a student
                at the University of Ibadan, a patient or visitor at UCH, or a
                busy family in the city, we bring the pharmacy and supermarket
                to your fingertips. From prescription drugs, pain relievers, and
                vitamins to Milo, tissues, and personal care essentials –
                everything you need is just a few clicks away. Enjoy secure
                payments, pharmacist support, and free delivery on qualifying
                orders. Ollan Pharmacy – The Right Medicine, because everyone
                deserves the right medicine.
              </h2>

              <div className="flex space-x-4 mb-8">
                <Link href="/pages/shop">
                  <button
                    className="bg-red-500 text-white p-2 lg:px-6 lg:py-3 rounded-full font-semibold flex items-center hover:bg-red-600 transition-colors"
                  >
                    Shop now →
                  </button>
                </Link>
                <button
                  onClick={handleOpenModal}
                  className="border-2 border-red-500 text-red-500 p-2 lg:px-6 lg:py-3 rounded-full font-semibold flex items-center hover:bg-red-50 transition-colors"
                >
                  <Upload size={18} className="mr-2" />
                  Upload a prescription
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <Image
                src={i1}
                alt="Happy Ollan woman using phone"
                className=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why <span className="text-red-500">Choose Us</span> ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Prescription Made Simple */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">
                Prescription Made Simple
              </h3>
              <p className="text-gray-600 text-sm">
                Upload A Picture Of Your Prescription And We Handle The Rest.
              </p>
            </div>

            {/* 100% Genuine */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">
                100% Genuine
              </h3>
              <p className="text-gray-600 text-sm">
                All Medications Are Sourced From Verified Suppliers.
              </p>
            </div>

            {/* Fast Delivery */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">
                Fast Delivery
              </h3>
              <p className="text-gray-600 text-sm">
                Same-Day Delivery Available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center lg:text-left mb-12 lg:mb-16">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-red-600 bg-red-50 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Get Your Meds In Minutes With <br className="hidden lg:block" />
              <span className="text-red-600">4 Easy Steps</span>
            </h2>
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-gray-600">
              From prescription to doorstep in just a few taps. No stress, no
              queues — just seamless care.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-[#F0F9FF] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Search or Upload
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Find medication in our catalog or upload your doctor's
                    prescription.
                  </p>
                </div>
              </div>
              <div className="mt-4 text-blue-600 font-medium text-sm">
                Step 1
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F5F3FF] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm">
                  <Rabbit className="text-purple-600 font-bold text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Fast Delivery
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your meds arrive safely and fast — same day delivery in
                    major cities.
                  </p>
                </div>
              </div>
              <div className="mt-4 text-purple-600 font-medium text-sm">
                Step 2
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FFF1F2] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm">
                  <PackageCheck className="text-red-600 font-bold text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confirm Order
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Review your order details and confirm your delivery
                    preferences.
                  </p>
                </div>
              </div>
              <div className="mt-4 text-red-600 font-medium text-sm">
                Step 3
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FFFBEB] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm">
                  <Smartphone className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Easy Refills
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tap once on our app to reorder. We'll remind you before you
                    run out.
                  </p>
                </div>
              </div>
              <div className="mt-4 text-yellow-600 font-medium text-sm">
                Step 4
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop with Category */}
      <section className="py-16 bg-gray-50">
        <div>
          <ShopByCategory />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Contact */}
            <div className="">
              <h4 className="text-lg font-medium mb-5 tracking-tight">
                Contact Us
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5" />
                  <p className="leading-relaxed">
                    No. 62 Iwo Road, Opposite Ibadan North East Secretariat,
                    Ibadan, Oyo State, Nigeria
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <a
                    href="tel:+2349040788398"
                    className="hover:text-blue-600 transition-colors duration-200"
                  >
                    +234 904 078 8398
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <a
                    href="mailto:services@ollanpharmacy.ng"
                    className="hover:text-blue-600 transition-colors duration-200"
                  >
                    services@ollanpharmacy.ng
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <p className="cursor-pointer hover:underline">Home</p>
                <p className="cursor-pointer hover:underline">Shop</p>
                <p className="cursor-pointer hover:underline">About Us</p>
                <p className="cursor-pointer hover:underline">Contact</p>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <div className="space-y-2 text-sm">
                <p className="cursor-pointer hover:underline">24/7 delivery</p>
                <p className="cursor-pointer hover:underline">Consultation</p>
                <p className="cursor-pointer hover:underline">Laboratory</p>
                <p className="cursor-pointer hover:underline">ICU</p>
                <p className="cursor-pointer hover:underline">Patient Ward</p>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4">Social Media</h4>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
                  <a
                    href="https://www.facebook.com/share/1EaBvbB5ow/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
                  <a
                    href="https://www.linkedin.com/posts/ollan-pharmacy-ltd_ollanpharmacy-healthcare-communityfirst-activity-7338957007003054080-IxsP?utm_source=share&utm_medium=member_ios&rcm=ACoAAA2w0ckBTdcNeTLeyqVh9MGXNxk1Ly8_rtk"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
                  <a
                    href="https://www.instagram.com/ollanpharmacyltd?igsh=ejY1bHV2d3A3Mzhx"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
                  <a
                    href="https://www.youtube.com/@OllanPharmacyLTD"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 lg:flex-col flex-row lg:flex gap-6 justify-between items-center text-sm">
            <p>
              © 2023 Ollan Pharmacy | RC Number: 69,342 . All rights reserved.
            </p>
            <div className="flex space-x-6 mt-9 lg:mt-0">
              <span className="cursor-pointer hover:underline">
                Terms and Conditions
              </span>
              <span className="cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </div>
          </div>
        </div>
      </footer>

      <UploadPrescriptionModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default PharmacyWebsite;