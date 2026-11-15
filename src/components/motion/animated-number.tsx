"use client";

import * as React from "react";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";

type AnimatedNumberProps = {
  value: number;
  /** Turns the live number into the string on screen. */
  format?: (value: number) => string;
  duration?: number;
  className?: string;
};

/**
 * Counts to `value` without re-rendering React once per frame: the number lives
 * in a motion value, and only the text node it drives is touched.
 */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toString(),
  duration = 1.1,
  className,
}: AnimatedNumberProps) {
  const count: MotionValue<number> = useMotionValue(0);
  const text = useTransform(count, (latest) => format(latest));

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.22, 0.7, 0.2, 1],
    });
    return () => controls.stop();
  }, [count, duration, value]);

  return <motion.span className={className}>{text}</motion.span>;
}
