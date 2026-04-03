import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import EmailStep from "./pages/EmailStep";
import VerifyCode from "./pages/VerifyCode";
import CompleteRegister from "./pages/CompleteRegister";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PublicProfile from "./pages/PublicProfile";


function App() {
  return (
    <Router>
      <Header />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-email" element={<EmailStep />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/complete-register" element={<CompleteRegister />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users/:id" element={<PublicProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;