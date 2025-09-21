import { motion } from "framer-motion";
import { Button } from "../ui/button";
import EndlessCarousel from "./carousel";
import { useState } from "react";
import { AuthGate } from "../auth/auth_gate";

export const Hero = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleToggleModal = () => {
    setOpenModal((prev) => !prev);
  };

  return (
    <>
      <div className="relative flex flex-col items-center justify-start overflow-hidden min-h-screen bg-gray-50">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full p-3 md:p-0 grd"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-center pt-24 text-gray-900 drop-shadow-lg">
            Welcome to <span className="text-primary">Bault</span>!
          </h1>
          <p className="text-center mt-6 md:text-lg text-gray-700">
            Your gateway to secure and efficient digital asset management.
          </p>
          {/* Button Section */}
          <div className="flex justify-center mt-10 gap-6">
            <Button
              onClick={handleToggleModal}
              className="md:h-12 cursor-pointer md:text-lg rounded-full font-semibold shadow-lg hover:shadow transition-all"
            >
              Get Started
            </Button>
          </div>
          {/* Features Section */}
          <div className="my-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
            <div className="bg-secondary border rounded-xl p-6">
              <h3 className="text-xl font-semibold">🔒 Secure</h3>
              <p className="text-gray-600 mt-2">
                Enterprise-grade encryption to protect your files.
              </p>
            </div>
            <div className="bg-secondary border rounded-xl p-6">
              <h3 className="text-xl font-semibold">⚡ Fast</h3>
              <p className="text-gray-600 mt-2">
                Optimized workflows for instant access.
              </p>
            </div>
            <div className="bg-secondary border rounded-xl p-6">
              <h3 className="text-xl font-semibold">🌍 Accessible</h3>
              <p className="text-gray-600 mt-2">
                Manage your files anywhere, anytime.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Endless File Carousel */}
        <EndlessCarousel />
      </div>

      {/* Login Modal */}
      {openModal && <AuthGate onClose={handleToggleModal} />}
    </>
  );
};
