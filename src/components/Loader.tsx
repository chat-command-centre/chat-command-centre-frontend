import { motion } from "framer-motion";

export const Loader = () => (
  <motion.div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="h-16 w-16 rounded-full border-t-4 border-blue-500"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);
