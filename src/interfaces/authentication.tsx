interface FormData {
    name: string;
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
    role: number;
}

interface ApiError {
    message: string;
}

export type { FormData, ApiError };