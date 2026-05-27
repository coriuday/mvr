import Navbar from "@/components/navbar/Navbar";
import SiteFooter from "@/components/site-footer/SiteFooter";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* Floating WhatsApp CTA — appears on all public pages after scroll */}
      <WhatsAppButton />
    </div>
  );
}
