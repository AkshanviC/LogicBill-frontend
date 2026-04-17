
import { useState } from "react";
import { type FormData, type ApiError } from "../../interfaces/authentication";
import styles from "../signin/styles";
import { toast } from "react-toastify";
type AuthMode = "signin" | "signup";



const API_BASE = "http://localhost:3000/api/auth";

export default function CreateUser() {
    const [mode, setMode] = useState<AuthMode>("signup");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const [form, setForm] = useState<FormData>({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        role: 2,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSignIn = async () => {
        if (!form.email || !form.password) {
            setError("Email and password are required.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Sign in failed.");
            setSuccess(`Welcome back! Token: ${data.token?.slice(0, 20)}...`);
        } catch (err) {
            setError((err as ApiError).message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!form.name || !form.email || !form.mobile || !form.password) {
            setError("All fields are required.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!/^\d{10}$/.test(form.mobile)) {
            setError("Mobile must be a 10-digit number.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    mobile: form.mobile,
                    password: form.password,
                    role: form.role,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Sign up failed.");
            setSuccess("Account created! You can now sign in.");
            setMode("signup");
            setForm({ name: "", email: "", mobile: "", password: "", confirmPassword: "", role: 2 });
        } catch (err) {
            setError((err as ApiError).message);
            toast.error((err as ApiError).message);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setError("");
        setSuccess("");
        setForm({ name: "", email: "", mobile: "", password: "", confirmPassword: "", role: 2 });
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {/* Logo/Brand */}
                <div style={styles.brand}>
                    <div style={styles.logoMark}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <rect width="28" height="28" rx="8" fill="#1a1a2e" />
                            <path d="M8 20L14 8L20 20" stroke="#e8c547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 16H18" stroke="#e8c547" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span style={styles.brandName}>Logic Bill</span>
                </div>

                {/* Toggle Tabs */}
                <div style={styles.tabs}>
                    {/* <button
                        style={{ ...styles.tab, ...(mode === "signin" ? styles.tabActive : {}) }}
                        onClick={() => switchMode("signin")}
                    >
                        Sign In
                    </button> */}
                    <button
                        style={{ ...styles.tab, ...(mode === "signup" ? styles.tabActive : {}) }}
                        onClick={() => switchMode("signup")}
                    >
                        Add user
                    </button>
                </div>

                {/* Heading */}
                <div style={styles.heading}>
                    <h1 style={styles.title}>
                        {mode === "signin" ? "Welcome back" : "Create account"}
                    </h1>
                    <p style={styles.subtitle}>
                        {mode === "signin"
                            ? "Sign in to continue to your dashboard"
                            : "Fill in your details to get started"}
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div style={styles.alertError}>
                        <span style={styles.alertIcon}>!</span>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={styles.alertSuccess}>
                        <span style={styles.alertIcon}>✓</span>
                        {success}
                    </div>
                )}

                {/* Form Fields */}
                <div style={styles.fields}>
                    {mode === "signup" && (
                        <Field label="Full Name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" />
                    )}
                    <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                    {mode === "signup" && (
                        <Field label="Mobile Number" name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="9876543210" />
                    )}
                    <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
                    {mode === "signup" && (
                        <Field label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                    )}
                    <div style={styles.flexRow}>
                        <label style={styles.label}>Is Admin</label>
                        <input
                            style={styles.input}
                            name={"isAdmin"}
                            type={"checkbox"}
                            checked={form.role === 1}
                            onChange={(e) => { setForm((prev) => ({ ...prev, role: e.target.checked ? 1 : 2 })); console.log(e.target.checked, "lol") }}
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
                    onClick={mode === "signin" ? handleSignIn : handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <span style={styles.spinner} />
                    ) : mode === "signin" ? (
                        "Sign In"
                    ) : (
                        "Create Account"
                    )}
                </button>

                {/* Footer */}
                {/* <p style={styles.footer}>
                    {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                    <button
                        style={styles.linkBtn}
                        onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                    >
                        {mode === "signin" ? "Sign up" : "Sign in"}
                    </button>
                </p> */}
            </div>
        </div>
    );
}

function Field({
    label, name, type, value, onChange, placeholder,
}: {
    label: string;
    name: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}) {
    return (
        <div style={styles.fieldGroup}>
            <label style={styles.label}>{label}</label>
            <input
                style={styles.input}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={type === "password" ? "current-password" : "off"}
            />
        </div>
    );
}

