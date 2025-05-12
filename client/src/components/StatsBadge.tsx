import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface StatsBadgeProps {
  count: number;
  isVisible: boolean;
}

export function StatsBadge({ count, isVisible }: StatsBadgeProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="mt-2"
        >
          <Badge variant="floating" className="py-1 px-3 text-xs">
            <span className="font-semibold mr-1">{count}</span> replacements
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StatsBadge;
