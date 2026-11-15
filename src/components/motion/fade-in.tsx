"use client";

import * as React from "react";

import { motion, type HTMLMotionProps } from "motion/react";

type FadeInProps = HTMLMotionProps<"div"> & {
  /** Seconds to wait before the element arrives. */
  delay?: number;
};

/**
 * The default entrance: twelve pixels up, on a spring with no bounce. Lights in
 * this design settle; they do not wobble.
 */
export function FadeIn({ delay = 0, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.7, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
