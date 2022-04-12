import React, { useState, useEffect } from "react";

import { userPost } from "../apis/user";

import useHttp from "../hooks/useHttp";

import Input from "../components/Input";

const SignUpPage = () => {
  const [disableBtn, setDisableBtn] = useState(true);
  const [validError, setValidError] = useState();
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { sendRequest, data, error, status } = useHttp(userPost);

  const onChange = ({ target }) => {
    setFormValues((prev) => ({
      ...prev,
      [target.id]: target.value,
    }));

    setValidError((prev) => ({
      ...prev,
      [target.id]: "",
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    sendRequest(formValues);
  };

  useEffect(() => {
    const { password, confirmPassword } = formValues;

    if (!password || !confirmPassword) {
      setDisableBtn(true);
      return;
    }

    if (password === confirmPassword) {
      setDisableBtn(false);
    } else {
      setDisableBtn(true);
    }
  }, [formValues]);

  useEffect(() => {
    if (!error) return;
    setValidError(error.response.data.validationErrors);
  }, [error]);

  return (
    <div className="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
      {!data && (
        <form
          onSubmit={onSubmit}
          className="card mt-5"
          data-testid="form-sign-up"
        >
          <div className="card-header">
            <h1 className="text-center">Sign Up</h1>
          </div>

          <div className="card-body">
            <Input
              id="username"
              title="Username"
              type="text"
              value={formValues?.name}
              onChange={onChange}
              validMessage={validError?.username}
            />

            <Input
              id="email"
              title="E-mail"
              type="email"
              value={formValues?.email}
              onChange={onChange}
              validMessage={validError?.email}
            />

            <Input
              id="password"
              title="Password"
              type="password"
              value={formValues?.password}
              onChange={onChange}
              validMessage={validError?.password}
            />

            <Input
              id="confirmPassword"
              title=" Confirm Password"
              type="password"
              value={formValues?.confirmPassword}
              onChange={onChange}
              validMessage={
                formValues?.password !== formValues?.confirmPassword &&
                "Password mismatch"
              }
            />

            <div className="text-center">
              <button
                className="btn btn-primary"
                disabled={disableBtn || status === "pending"}
              >
                {status === "pending" && (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}
                Sign Up
              </button>
            </div>
          </div>
        </form>
      )}

      {data && (
        <div className="alert alert-success">
          Please check your email to activate your account
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
