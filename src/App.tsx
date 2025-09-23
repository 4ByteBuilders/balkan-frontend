import { BrowserRouter, Route, Routes } from "react-router";
import { Header } from "./components/common/header";
import { LandingPage } from "./screens/landing_page";
import ProfilePage from "./components/profile/profile";
import { Footer } from "./components/common/footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SharedResourcePage } from "./lib/SharedResourcePage";
import { ErrorPage } from "./components/common/error";

function App() {

  const notFoundError = Error("Resource Not Found!");

  return (
    <AuthProvider>
      <Header>
        <Toaster position="top-center" reverseOrder={false} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/file/:shareToken" element={<SharedResourcePage />} />
            <Route path="/folder/:shareToken" element={<SharedResourcePage />} />
            <Route path="*" element={<ErrorPage error={notFoundError} />} />
          </Routes>
        </BrowserRouter>
        <Footer />
      </Header>
    </AuthProvider>
  );
}

export default App;
