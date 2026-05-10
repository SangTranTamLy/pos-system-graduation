const loginForm = document.getElementById("loginForm");
const employeeCodeInput = document.getElementById("employeeCode");
const passwordInput = document.getElementById("password");
const togglePasswordButton = document.getElementById("togglePassword");
const submitButton = document.getElementById("submitButton");
const feedbackMessage = document.getElementById("feedbackMessage");
const apiStatus = document.getElementById("apiStatus");
const systemClock = document.getElementById("systemClock");
const apiEndpoint = document.getElementById("apiEndpoint");
const rememberSessionCheckbox = document.getElementById("rememberSession");

const getTargetRoute = (user) => (CinoxAPI.isAdminUser(user) ? "./admin.html" : "./pos.html");

const setFeedback = (message, type = "") => {
  feedbackMessage.textContent = message;
  feedbackMessage.className = "feedback";
  if (type) {
    feedbackMessage.classList.add(`is-${type}`);
  }
};

const setSubmitting = (isSubmitting) => {
  submitButton.disabled = isSubmitting;
  submitButton.querySelector("span").textContent = isSubmitting ? "Dang xac thuc..." : "Dang nhap";
};

const setApiStatus = (message, status = "idle") => {
  apiStatus.textContent = message;
  apiStatus.dataset.status = status;
};

const updateClock = () => {
  systemClock.textContent = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
};

const pingApi = async () => {
  setApiStatus("Dang kiem tra ket noi...", "checking");

  try {
    const result = await CinoxAPI.request("/api/health", { method: "GET" });
    setApiStatus(result?.success ? "Quay đã san sang" : "Quay phan hoi", "ok");
  } catch (error) {
    setApiStatus("Quay chua ket noi", "error");
  }
};

apiEndpoint.textContent = `${CinoxAPI.API_BASE_URL}/api/auth/login`;

togglePasswordButton.addEventListener("click", () => {
  const nextType = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = nextType;
  togglePasswordButton.textContent = nextType === "password" ? "Hien" : "An";
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFeedback("");

  const employee_code = employeeCodeInput.value.trim();
  const password = passwordInput.value;

  if (!employee_code || !password) {
    setFeedback("Vui long nhap day du ma nhan vien va mat khau.", "error");
    return;
  }

  setSubmitting(true);

  try {
    const result = await CinoxAPI.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ employee_code, password })
    });

    CinoxAPI.saveSession(result.token, result.user, rememberSessionCheckbox.checked);
    setFeedback(`Xin chao ${result.user.full_name}. Dang nhap thanh cong.`, "success");
    window.setTimeout(() => {
      window.location.href = getTargetRoute(result.user);
    }, 400);
  } catch (error) {
    setFeedback(error.message || "Khong the dang nhap vao he thong.", "error");
  } finally {
    setSubmitting(false);
  }
});

const existingSession = CinoxAPI.getSession();
if (existingSession) {
  window.location.replace(getTargetRoute(existingSession.user));
}

updateClock();
setInterval(updateClock, 1000);
pingApi();
