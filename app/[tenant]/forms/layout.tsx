import { LayoutProps } from "@/types/layouts";
import { AvatarProfile } from "@/components/profile/avatar-profile";

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="p-4">
      <span className="flex justify-end gap-2">
        <AvatarProfile />
      </span>
      {children}
    </div>
  );
};

export default Layout;
