import AppLayoutClient from "./AppLayoutClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
