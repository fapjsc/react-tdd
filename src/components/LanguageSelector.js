import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  return (
    <div>
      <img
        src="https://countryflagsapi.com/svg/tw"
        onClick={() => {
          i18n.changeLanguage("tw");
        }}
        title="繁體中文"
        alt="台灣國旗"
      />

      <img
        src="https://countryflagsapi.com/svg/gb"
        onClick={() => {
          i18n.changeLanguage("en");
        }}
        title="English"
        alt="英國國旗"
      />
    </div>
  );
};

export default LanguageSelector;
