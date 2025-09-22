import { BrowserRouter, Route, Routes } from "react-router";
import { Header } from "./components/common/header";
import { LandingPage } from "./screens/landing_page";
import ProfilePage from "./components/profile/profile";
import { Footer } from "./components/common/footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Header>
        <Toaster position="top-center" reverseOrder={false} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<div>Not Found</div>} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
        <Footer />
      </Header>
    </AuthProvider>
  );
}

export default App;
