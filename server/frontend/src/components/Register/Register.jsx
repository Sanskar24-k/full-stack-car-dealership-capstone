import { useEffect, useState } from "react";
import "./Register.css";

const initialValues = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
};

function getCookie(name) {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export default function Register() {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  useEffect(() => {
    fetch("/djangoapp/csrf", { credentials: "include" }).catch(() => {
      // The form reports a clear API connection error if submission also fails.
    });
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ kind: "loading", message: "Creating your account…" });
    try {
      let csrfToken = getCookie("csrftoken");
      if (!csrfToken) {
        await fetch("/djangoapp/csrf", { credentials: "include" });
        csrfToken = getCookie("csrftoken");
      }
      if (!csrfToken) throw new Error("Could not start a secure session. Please refresh and try again.");

      const response = await fetch("/djangoapp/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": decodeURIComponent(csrfToken),
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        const detail = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : result.error || "We could not create your account.";
        throw new Error(detail);
      }
      setStatus({ kind: "success", message: "Your account is ready. Welcome to Roadway!" });
      setValues(initialValues);
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof TypeError
          ? "We could not reach the dealership service. Please try again shortly."
          : error.message,
      });
    }
  }

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="register-name-row">
        <label>
          First name
          <input autoComplete="given-name" name="first_name" placeholder="First Name" value={values.first_name} onChange={handleChange} required />
        </label>
        <label>
          Last name
          <input autoComplete="family-name" name="last_name" placeholder="Last Name" value={values.last_name} onChange={handleChange} required />
        </label>
      </div>
      <label>
        Username
        <input autoComplete="username" name="username" placeholder="Username" value={values.username} onChange={handleChange} minLength={3} maxLength={150} required />
      </label>
      <label>
        Email address
        <input autoComplete="email" type="email" name="email" placeholder="email" value={values.email} onChange={handleChange} required />
      </label>
      <label>
        Password
        <input autoComplete="new-password" type="password" name="password" placeholder="Password" value={values.password} onChange={handleChange} minLength={8} required />
      </label>
      <button type="submit" disabled={status.kind === "loading"}>
        Register
      </button>
      <p className={`register-status ${status.kind}`} role="status" aria-live="polite">{status.message}</p>
    </form>
  );
}
