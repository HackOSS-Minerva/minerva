import { SponsorNav } from "@/components/sponsor/sponsor-nav";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<unknown>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const { tenant } = (await params) as { tenant: string };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:py-10">
      <SponsorNav tenant={tenant} />
      {children}
    </div>
  );
};

export default Layout;