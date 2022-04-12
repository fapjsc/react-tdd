import SignUpPage from "./SignUpPage";
import LanguageSelector from "../components/LanguageSelector";

import {
  render,
  screen,
  waitFor,
  act,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";
import i18n from "../locale/i18n";
import { EN, TW } from "../locale/language";
import { config } from "../config/config";

const url = "/api/1.0/users";
const signUpSuccessText = "Please check your email to activate your account";

let reqBody;
let counter = 0;
let acceptLanguageHeader;

const server = setupServer(
  rest.post(url, (req, res, ctx) => {
    reqBody = req.body;
    counter += 1;
    acceptLanguageHeader = req.headers.get("Accept-Language");
    return res(
      ctx.status(200),
      ctx.json({ data: { message: "User created" } })
    );
  })
);

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

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
    let passwordInput;
    let confirmPasswordInput;

    const setup = () => {
      render(<SignUpPage />);
      const usernameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("E-mail");
      passwordInput = screen.getByLabelText("Password");
      confirmPasswordInput = screen.getByLabelText("Confirm Password");
      button = screen.getByRole("button", { name: "Sign Up" });

      userEvent.type(usernameInput, "test");
      userEvent.type(emailInput, "test@gmail.com");
      userEvent.type(passwordInput, "1234TestPassword");
      userEvent.type(confirmPasswordInput, "1234TestPassword");
    };

    const generateValidError = (field, message) => {
      return rest.post(url, (req, res, ctx) =>
        res(
          ctx.status(400),
          ctx.json({
            validationErrors: { [field]: message },
          })
        )
      );
    };

    // 兩次密碼一樣就enable button
    it("enables the button when password and confirm password has same value", () => {
      setup();
      expect(button).toBeEnabled();
    });

    // 發送api
    it(`點擊按鈕後發送註冊api請求 (${url})`, async () => {
      setup();

      userEvent.click(button);

      await screen.findByText(signUpSuccessText);

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

      await screen.findByText(signUpSuccessText);

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

      await screen.findByText(signUpSuccessText);
    });

    it("成功註冊後，顯示帳號啟動通知", async () => {
      setup();
      const init = screen.queryByText(signUpSuccessText);
      expect(init).not.toBeInTheDocument();

      userEvent.click(button);

      const text = await screen.findByText(signUpSuccessText);

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

    it.each`
      field         | message
      ${"username"} | ${"Username cannot be null"}
      ${"email"}    | ${"E-mail cannot be null"}
      ${"password"} | ${"Password cannot be null"}
    `("表單驗證訊息", async ({ field, message }) => {
      server.use(generateValidError(field, message));
      setup();
      userEvent.click(button);
      const validError = await screen.findByText(message);
      expect(validError).toBeInTheDocument();
    });

    it.each`
      field         | message                      | label
      ${"username"} | ${"Username cannot be null"} | ${"Username"}
      ${"email"}    | ${"E-mail cannot be null"}   | ${"E-mail"}
      ${"password"} | ${"Password cannot be null"} | ${"Password"}
    `(
      "user輸入表單，隱藏表單驗證的錯誤訊息",
      async ({ field, message, label }) => {
        server.use(generateValidError(field, message));
        setup();
        userEvent.click(button);
        const validError = await screen.findByText(message);
        const input = screen.getByLabelText(label);
        userEvent.type(input, "updated");
        expect(validError).not.toBeInTheDocument();
      }
    );

    it("hides spinner and enables button after response received", async () => {
      server.use(generateValidError("username", "Username cannot be null"));
      setup();
      userEvent.click(button);
      await screen.findByText("Username cannot be null");
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it("顯示密碼不一致的錯誤訊息", () => {
      setup();
      userEvent.type(passwordInput, "1234TestPassword");
      userEvent.type(confirmPasswordInput, "5678TestPassword");
      const validError = screen.queryByText("Password mismatch");
      expect(validError).toBeInTheDocument();
    });
  });

  // 國際化
  describe("i18n", () => {
    let enToggle,
      twToggle,
      header,
      button,
      userInput,
      emailInput,
      passwordInput,
      confirmPasswordInput;

    const setup = ({ lan }) => {
      render(
        <>
          <SignUpPage />
          <LanguageSelector />
        </>
      );
      enToggle = screen.getByTitle("English");
      twToggle = screen.getByTitle("繁體中文");

      if (lan === TW) {
        userEvent.click(twToggle);
      }

      if (lan === EN) {
        userEvent.click(enToggle);
      }

      header = screen.getByRole("heading", { name: lan.signUp });
      button = screen.getByRole("button", { name: lan.signUp });
      userInput = screen.getByLabelText(lan.username);
      emailInput = screen.getByLabelText(lan.email);
      passwordInput = screen.getByLabelText(lan.password);
      confirmPasswordInput = screen.getByLabelText(lan.passwordConfirm);
    };

    const typeInput = () => {
      userEvent.type(userInput, "test");
      userEvent.type(emailInput, "test@gmail.com");
      userEvent.type(passwordInput, "1234TestPassword");
      userEvent.type(confirmPasswordInput, "1234TestPassword");
    };

    // beforeEach(() => {
    //   i18n.changeLanguage(config.defaultLanguage);
    // });

    afterEach(() => {
      act(() => {
        i18n.changeLanguage(config.defaultLanguage);
      });
    });

    it("預設英文", () => {
      render(<SignUpPage />);
      expect(
        screen.getByRole("heading", { name: EN.signUp })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: EN.signUp })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(EN.username)).toBeInTheDocument();
      expect(screen.getByLabelText(EN.email)).toBeInTheDocument();
      expect(screen.getByLabelText(EN.password)).toBeInTheDocument();
      expect(screen.getByLabelText(EN.passwordConfirm)).toBeInTheDocument();
    });

    it("切換語系到繁體中文", () => {
      setup({ lan: TW });
      expect(header).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(userInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it("切換語系到英文", () => {
      setup({ lan: EN });
      expect(header).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(userInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it("密碼輸入不一樣時，中文錯誤訊息", () => {
      setup({ lan: TW });
      userEvent.type(passwordInput, "21234");
      const validErrors = screen.getByText(TW.passwordMismatchValidation);
      expect(validErrors).toBeInTheDocument();
    });

    it("語言是英文時，請求頭須包含 Accept-Language: en", async () => {
      setup({ lan: EN });
      typeInput();
      const form = screen.queryByTestId("form-sign-up");
      userEvent.click(button);
      await waitForElementToBeRemoved(form);
      expect(acceptLanguageHeader).toBe("en");
    });

    it("語言是中文時，請求頭須包含 Accept-Language: tw", async () => {
      setup({ lan: TW });
      typeInput();
      const form = screen.queryByTestId("form-sign-up");
      userEvent.click(button);
      await waitForElementToBeRemoved(form);
      expect(acceptLanguageHeader).toBe("tw");
    });
  });
});
