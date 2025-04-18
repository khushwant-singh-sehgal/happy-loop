import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress | Happy Loop",
  description: "Track your child's progress over time",
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 