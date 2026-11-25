import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { login } from '../../../services/user';
import { useUserDetails } from '../../../context/userDetails';
import { getTwoColorTheme } from '../theme';
import NewHeader from '../components/NewHeader';

const NewSignIn = () => {
    const [inverted, setInverted] = useState(false);
    const theme = getTwoColorTheme(inverted);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [inProgress, setInProgress] = useState(false);

    const navigate = useNavigate();
    const { updateUser } = useUserDetails();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInProgress(true);
        try {
            const response = await login(formData.email, formData.password);
            if (response.message === 'Login successful') {
                updateUser(response.user);
                localStorage.setItem('loginMessage', response.message);
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('loginTime', Date.now().toString());
                navigate('/');
            } else {
                toast.error(response.error || 'Invalid credentials');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Sign in failed');
        } finally {
            setInProgress(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: () => {
            window.location.href = 'https://vooshfoods-backend.onrender.com/api/auth/google';
        },
        onError: (error) => console.log(error),
    });

    useEffect(() => {
        const signUpMessage = localStorage.getItem('signUpMessage');
        if (signUpMessage) {
            toast.success('Account created. Please sign in.');
            localStorage.removeItem('signUpMessage');
        }
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ backgroundColor: theme.bg, color: theme.ink }}
        >
            <ToastContainer position="bottom-right" autoClose={3500} hideProgressBar />

            <NewHeader
                theme={theme}
                inverted={inverted}
                onToggleInvert={() => setInverted((prev) => !prev)}
            />

            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">
                {/* Left Editorial Panel (Inverted 2-Color Contrast) */}
                <section
                    className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12"
                    style={{
                        backgroundColor: theme.ink,
                        color: theme.bg,
                    }}
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-medium opacity-75 hover:opacity-100 w-fit"
                    >
                        <ArrowBackIcon sx={{ fontSize: 15 }} />
                        Back to overview
                    </Link>

                    <div className="space-y-5 max-w-sm">
                        <span className="text-[11px] uppercase tracking-[0.2em] opacity-65 block">
                            Welcome Back
                        </span>
                        <h2 className="text-4xl font-semibold tracking-tight leading-tight">
                            Quiet focus starts with a clear list.
                        </h2>
                        <p className="text-sm leading-relaxed opacity-75">
                            Pick up right where you left off. Your tasks, boards, and focus sessions stay synced.
                        </p>
                    </div>

                    <div className="text-xs opacity-60">
                        Taskora — Two-Tone Minimalist Workspace
                    </div>
                </section>

                {/* Right Form Panel */}
                <section className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
                    <div className="w-full max-w-md space-y-8">
                        <div className="space-y-2">
                            <span
                                className="text-[11px] uppercase tracking-[0.18em] font-semibold"
                                style={{ color: theme.subtle }}
                            >
                                Sign In
                            </span>
                            <h1 className="text-3xl font-semibold tracking-tight">
                                Access your workspace
                            </h1>
                            <p className="text-sm" style={{ color: theme.muted }}>
                                Enter your email and password to continue.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    className="block text-[11px] uppercase tracking-[0.15em] font-medium mb-1.5"
                                    style={{ color: theme.muted }}
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                                    style={{
                                        backgroundColor: theme.surface,
                                        border: `1px solid ${theme.border}`,
                                        color: theme.ink,
                                    }}
                                />
                            </div>

                            <div>
                                <label
                                    className="block text-[11px] uppercase tracking-[0.15em] font-medium mb-1.5"
                                    style={{ color: theme.muted }}
                                >
                                    Password
                                </label>
                                <div
                                    className="flex items-center rounded-xl px-4"
                                    style={{
                                        backgroundColor: theme.surface,
                                        border: `1px solid ${theme.border}`,
                                    }}
                                >
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        required
                                        className="flex-1 py-3 bg-transparent text-sm outline-none"
                                        style={{ color: theme.ink }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="p-1 opacity-60 hover:opacity-100"
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? (
                                            <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                                        ) : (
                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={inProgress}
                                className="w-full py-3 rounded-full text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: theme.ink, color: theme.bg }}
                            >
                                {inProgress ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
                            <span className="text-[11px] uppercase tracking-widest" style={{ color: theme.subtle }}>
                                or
                            </span>
                            <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
                        </div>

                        <button
                            type="button"
                            onClick={() => googleLogin()}
                            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-full text-sm font-medium transition-colors"
                            style={{
                                border: `1px solid ${theme.borderStrong}`,
                                color: theme.ink,
                                backgroundColor: 'transparent',
                            }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <p className="text-center text-xs" style={{ color: theme.muted }}>
                            New to Task Buddy?{' '}
                            <Link to="/signUp" className="font-semibold underline underline-offset-4">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default NewSignIn;
