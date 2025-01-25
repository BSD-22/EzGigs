import NavigationGuard from "@/components/NavigationGuard";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return <NavigationGuard>{children}</NavigationGuard>;
};

export default HomeLayout;
