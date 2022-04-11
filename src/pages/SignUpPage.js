import React, { useState, useEffect } from "react";

import axios from "axios";

import { userPost } from "../apis/user";

import useHttp from "../hooks/useHttp";

const SignUpPage = () => {
  const [disableBtn, setDisableBtn] = useState(true);
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

  return (
    <div className="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
      {status !== "completed" && (
        <form
          onSubmit={onSubmit}
          className="card mt-5"
          data-testid="form-sign-up"
        >
          <div className="card-header">
            <h1 className="text-center">Sign Up</h1>
          </div>

          <div className="card-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                className="form-control"
                id="username"
                type="text"
                value={formValues.name}
                onChange={onChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                E-mail
              </label>
              <input
                className="form-control"
                id="email"
                type="email"
                value={formValues.email}
                onChange={onChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                className="form-control"
                id="password"
                type="password"
                value={formValues.password}
                onChange={onChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="form-control"
                id="confirmPassword"
                type="password"
                value={formValues.confirmPassword}
                onChange={onChange}
              />
            </div>
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

      {status === "completed" && (
        <div className="alert alert-success">
          Please check your email to activate your account
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
