import { Hero } from "@/components/landing/hero";
import { useAuth } from "@/context/AuthContext";

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* first component */}
      {isAuthenticated ? (
        <div className="text-center mt-20 text-2xl font-semibold">
          You are logged in!
        </div>
      ) : (
        <Hero />
      )}
    </div>
  );
};
