"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useScrollContainer } from "./ScrollContext";

interface Props {
  id: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export default function SectionWrapper({ id, title, icon, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const container = useScrollContainer();
  const { scrollYProgress } = useScroll({
    target: ref,
    container: container || undefined,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [50, 0, 0, -50]);

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      style={{ y }}
      className="beginner-lesson-section relative z-10 mx-auto w-full py-10 sm:py-12 lg:py-16"
    >
      <div className="beginner-lesson-section__inner w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="beginner-lesson-section__heading flex items-center gap-3"
        >
          <motion.span
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center w-10 h-10 rounded-xl glass text-accent-1"
          >
            {icon}
          </motion.span>
          <h2 className="text-2xl font-bold text-gradient sm:text-3xl">
            {title}
          </h2>
        </motion.div>
        <div className="beginner-lesson-section__content">{children}</div>
      </div>
    </motion.section>
  );
}
