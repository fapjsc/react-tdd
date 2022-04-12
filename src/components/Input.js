import React from "react";

const Input = ({ title, value, onChange, validMessage, id, type }) => {
  let inputClass = "form-control";

  if (validMessage) {
    inputClass += " is-invalid";
  }

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>
        {title}
      </label>
      <input
        autoComplete="off"
        className={inputClass}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
      />
      {validMessage && <span className="invalid-feedback">{validMessage}</span>}
    </div>
  );
};

export default Input;
