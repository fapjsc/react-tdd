import axios from "axios";

import i18n from "../locale/i18n";

axios.interceptors.request.use((request) => {
  request.headers["Accept-Language"] = i18n.language;
  return request;
});

export const userPost = async (formValues) => {
  const { confirmPassword, ...other } = formValues;
  const response = await axios.post("/api/1.0/users", other);
  return response.data;
};
