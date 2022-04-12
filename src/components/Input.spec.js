import { render } from "@testing-library/react";
import Input from "./Input";

it("有錯誤訊息時，input必須有is-invalid class name", () => {
  const { container } = render(<Input validMessage="Error message" />);
  const input = container.querySelector("input");
  expect(input.classList).toContain("is-invalid");
});

it("有錯誤訊息時，span element 必須有 invalid-feedback class name", () => {
  const { container } = render(<Input validMessage="Error message" />);
  const span = container.querySelector("span");
  expect(span.classList).toContain("invalid-feedback");
});

it("沒有錯誤訊息時，input不能有 is-invalid class name", () => {
  const { container } = render(<Input />);
  const input = container.querySelector("input");
  expect(input.classList).not.toContain("is-invalid");
});

it("沒有錯誤訊息時，沒有span element", () => {
  const { container } = render(<Input />);
  const span = container.querySelector("span");
  expect(span).not.toBeInTheDocument();
});
