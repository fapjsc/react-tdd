import axios from "axios";

export const userPost = async (formValues) => {
  const { confirmPassword, ...other } = formValues;
  const response = await axios.post("/api/1.0/users", other);
  return response.data;
};
