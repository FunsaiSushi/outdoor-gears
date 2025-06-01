"use client";

import { motion } from "framer-motion";
import { Bebas_Neue } from "next/font/google";
import {
  FaFire,
  FaCampground,
  FaCompass,
  FaMapMarkedAlt,
} from "react-icons/fa";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const Hero = () => {
  const cornerLinksVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1533873984035-25970ab07461"
          alt="Camping Hero"
          className="h-full w-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4 md:space-y-6 max-w-[90vw] md:max-w-4xl"
        >
          <h1
            className={`${bebasNeue.className} text-5xl sm:text-6xl md:text-7xl lg:text-[120px] text-white leading-none tracking-wide`}
          >
            EQUIPPED
            <br />
            FOR
            <br />
            COMFORT
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-200 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4"
          >
            Rent premium outdoor gear from local adventurers. Experience nature
            without the burden of ownership.
          </motion.p>
        </motion.div>

        {/* Corner Links */}
        <div className="absolute inset-0 p-4 sm:p-6 md:p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="h-full w-full flex flex-col justify-between"
          >
            <div className="w-full flex justify-between">
              <motion.div variants={cornerLinksVariants} className="mt-20">
                <button
                  onClick={() => scrollToSection("camping-gear")}
                  className="text-white hover:text-emerald-400 flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base md:text-lg font-medium cursor-pointer"
                >
                  <FaCampground className="text-sm sm:text-base md:text-lg" />
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 hidden sm:inline">
                    CAMPING GEAR
                  </span>
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 sm:hidden">
                    GEAR
                  </span>
                </button>
              </motion.div>
              <motion.div variants={cornerLinksVariants} className="mt-20">
                <button
                  onClick={() => scrollToSection("featured-gears")}
                  className="text-white hover:text-emerald-400 flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base md:text-lg font-medium cursor-pointer"
                >
                  <FaFire className="text-sm sm:text-base md:text-lg" />
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 hidden sm:inline">
                    FEATURED GEARS
                  </span>
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 sm:hidden">
                    FEATURED
                  </span>
                </button>
              </motion.div>
            </div>
            <div className="w-full flex justify-between">
              <motion.div variants={cornerLinksVariants}>
                <button
                  onClick={() => scrollToSection("locations")}
                  className="text-white hover:text-emerald-400 flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base md:text-lg font-medium cursor-pointer"
                >
                  <FaMapMarkedAlt className="text-sm sm:text-base md:text-lg" />
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 hidden sm:inline">
                    LIMITED
                  </span>
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 sm:hidden">
                    LOC
                  </span>
                </button>
              </motion.div>
              <motion.div variants={cornerLinksVariants}>
                <button
                  onClick={() => scrollToSection("explore")}
                  className="text-white hover:text-emerald-400 flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base md:text-lg font-medium cursor-pointer"
                >
                  <FaCompass className="text-sm sm:text-base md:text-lg" />
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1">
                    EST. 2024
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
