import React from "react";
import SignUpPage from "./pages/SignUpPage";
import LanguageSelector from "./components/LanguageSelector";

const App = () => {
  return (
    <div className="container pt-4">
      <SignUpPage />
      <LanguageSelector />
    </div>
  );
};

export default App;
