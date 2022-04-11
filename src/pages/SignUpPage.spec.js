import SignUpPage from "./SignUpPage";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";

const url = "/api/1.0/users";
const signUpSuccessText = "Please check your email to activate your account";

const getElement = () => {
  render(<SignUpPage />);
  const usernameInput = screen.getByLabelText("Username");
  const emailInput = screen.getByLabelText("E-mail");
  const passwordInput = screen.getByLabelText("Password");
  const confirmPasswordInput = screen.getByLabelText("Confirm Password");
  const button = screen.getByRole("button", { name: "Sign Up" });

  return {
    usernameInput,
    emailInput,
    passwordInput,
    confirmPasswordInput,
    button,
  };
};

describe("Sign Up Page", () => {
  describe("Layout", () => {
    it("has heading", () => {
      render(<SignUpPage />);
      const header = screen.queryByRole("heading", { name: "Sign Up" });
      expect(header).toBeInTheDocument();
    });

    //  User name input
    it("has username input", () => {
      const { usernameInput } = getElement();
      expect(usernameInput).toBeInTheDocument();
    });

    it("has text type for username input", () => {
      const { usernameInput } = getElement();

      expect(usernameInput.type).toBe("text");
    });

    // Email input
    it("has email input", () => {
      const { emailInput } = getElement();
      expect(emailInput).toBeInTheDocument();
    });

    it("has email type for email input", () => {
      const { emailInput } = getElement();
      expect(emailInput.type).toBe("email");
    });

    // Password
    it("has  password input", () => {
      const { passwordInput } = getElement();
      expect(passwordInput).toBeInTheDocument();
    });

    it("has password type for password input", () => {
      const { passwordInput } = getElement();
      expect(passwordInput.type).toBe("password");
    });

    // Confirm Password input
    it("has confirm password input", () => {
      const { confirmPasswordInput } = getElement();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it("has password type for confirm password input", () => {
      const { confirmPasswordInput } = getElement();
      expect(confirmPasswordInput.type).toBe("password");
    });

    // Sign up button
    it("has sign up button", () => {
      const { button } = getElement();
      expect(button).toBeInTheDocument();
    });

    // sign up button disable initially
    it("disables sign up button initially", () => {
      const { button } = getElement();
      expect(button).toBeDisabled();
    });
  });

  // 交互測試
  describe("interactions", () => {
    let button;
    let counter = 0;
    let reqBody;

    const server = setupServer(
      rest.post("/api/1.0/users", (req, res, ctx) => {
        reqBody = req.body;
        counter += 1;

        return res(ctx.status(200));
      })
    );

    beforeEach(() => (counter = 0));

    beforeAll(() => server.listen());

    afterAll(() => server.close());

    const setup = () => {
      render(<SignUpPage />);
      const usernameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("E-mail");
      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      button = screen.getByRole("button", { name: "Sign Up" });

      userEvent.type(usernameInput, "test");
      userEvent.type(emailInput, "test@gmail.com");
      userEvent.type(passwordInput, "1234TestPassword");
      userEvent.type(confirmPasswordInput, "1234TestPassword");
    };

    // 兩次密碼一樣就enable button
    it("enables the button when password and confirm password has same value", () => {
      setup();
      expect(button).toBeEnabled();
    });

    // 發送api
    it("點擊按鈕後發送註冊api請求 (/api/1.0/users)", async () => {
      setup();

      userEvent.click(button);

      await screen.findByText(
        "Please check your email to activate your account"
      );

      expect(reqBody).toEqual({
        email: "test@gmail.com",
        password: "1234TestPassword",
        username: "test",
      });
    });

    // 避免連續發送請求
    it("disables button when there is an ongoing api call", async () => {
      setup();

      userEvent.click(button);
      userEvent.click(button);

      await screen.findByText(
        "Please check your email to activate your account"
      );

      expect(counter).toBe(1);
    });

    it("點擊註冊按鈕後，顯示spinner", async () => {
      setup();

      expect(
        screen.queryByRole("status", { hidden: true })
      ).not.toBeInTheDocument();

      userEvent.click(button);

      const spinner = screen.getByRole("status", { hidden: true });

      expect(spinner).toBeInTheDocument();

      await screen.findByText(
        "Please check your email to activate your account"
      );
    });

    it("成功註冊後，顯示帳號啟動通知", async () => {
      setup();
      const init = screen.queryByText(
        "Please check your email to activate your account"
      );
      expect(init).not.toBeInTheDocument();

      userEvent.click(button);

      const text = await screen.findByText(
        "Please check your email to activate your account"
      );

      expect(text).toBeInTheDocument();
    });

    it("註冊成功後隱藏註冊表單", async () => {
      setup();
      const form = screen.getByTestId("form-sign-up");
      userEvent.click(button);

      await waitFor(() => {
        expect(form).not.toBeInTheDocument();
      });
    });
  });
});
