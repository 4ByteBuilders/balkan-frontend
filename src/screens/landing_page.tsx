import { Dashboard } from "@/components/dashboard/dashboard";
import { Hero } from "@/components/landing/hero";
import { useAuth } from "@/context/AuthContext";

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* first component */}
      {isAuthenticated ? <Dashboard /> : <Hero />}
    </div>
  );
};
