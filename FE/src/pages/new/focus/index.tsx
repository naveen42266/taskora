import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckIcon from '@mui/icons-material/Check';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTaskDetails } from '../../../context/taskDetails';
import { useUserDetails } from '../../../context/userDetails';
import { getAllTasks, updateStatus } from '../../../services/tasks';
import { getTwoColorTheme } from '../theme';
import NewHeader from '../components/NewHeader';
import { TaskItem } from '../components/NewTaskModal';
import { Drawer } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';


const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const NewFocus = () => {
    const [inverted, setInverted] = useState(false);
    const theme = getTwoColorTheme(inverted);

    const { user, updateUser } = useUserDetails();
    const { tasks, setTasks } = useTaskDetails();

    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
    const [running, setRunning] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('loginMessage');
        localStorage.removeItem('loginTime');
        updateUser(null);
        setDrawerOpen(false);
        toast.success('Signed out');
    };

    useEffect(() => {
        if (user && (!tasks || tasks.length === 0)) {
            getAllTasks()
                .then((res) => res && setTasks(res))
                .catch(() => { });
        }
    }, [user, tasks, setTasks]);

    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setRunning(false);
                    toast.success(mode === 'focus' ? 'Focus session complete!' : 'Break finished!');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [running, mode]);

    const switchMode = (nextMode: 'focus' | 'break') => {
        setRunning(false);
        setMode(nextMode);
        setSecondsLeft(nextMode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
    };

    const resetTimer = () => {
        setRunning(false);
        setSecondsLeft(mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
    };

    const activeTasks = (tasks || []).filter((t: TaskItem) => t.status !== 'done');
    const selectedTask = activeTasks.find((t: TaskItem) => t.id === selectedTaskId);

    const handleMarkDone = async () => {
        if (!selectedTask) return;
        try {
            const res = await updateStatus(selectedTask.id, 'done');
            if (res.message === 'Updated Status Successfully') {
                const updated = await getAllTasks();
                if (updated) setTasks(updated);
                setSelectedTaskId('');
                toast.success('Task marked as done');
            }
        } catch {
            toast.error('Could not update task');
        }
    };

    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');
    const total = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
    const progress = ((total - secondsLeft) / total) * 100;

    return (
        <div
            className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ backgroundColor: theme.bg, color: theme.ink }}
        >
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />

            <NewHeader
                theme={theme}
                inverted={inverted}
                onToggleInvert={() => setInverted((prev) => !prev)}
                onOpenProfile={() => setDrawerOpen(true)}
                user={user}
            />

            <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-12 flex flex-col items-center justify-center space-y-8">
                {/* Mode Pill */}
                <div
                    className="flex items-center p-1 rounded-full"
                    style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                >
                    {[
                        { key: 'focus', label: 'Focus · 25m' },
                        { key: 'break', label: 'Break · 5m' },
                    ].map((m) => {
                        const active = mode === m.key;
                        return (
                            <button
                                key={m.key}
                                type="button"
                                onClick={() => switchMode(m.key as 'focus' | 'break')}
                                className="px-5 py-1.5 rounded-full text-xs font-medium transition-colors"
                                style={{
                                    backgroundColor: active ? theme.ink : 'transparent',
                                    color: active ? theme.bg : theme.muted,
                                }}
                            >
                                {m.label}
                            </button>
                        );
                    })}
                </div>

                {/* Minimalist Timer Display */}
                <div
                    className="w-full p-10 sm:p-14 rounded-3xl text-center space-y-6"
                    style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                >
                    <div className="text-7xl sm:text-8xl font-semibold tracking-tight tabular-nums">
                        {mins}:{secs}
                    </div>

                    <div
                        className="h-1.5 w-full max-w-xs mx-auto rounded-full overflow-hidden"
                        style={{ backgroundColor: theme.border }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: theme.ink }}
                        />
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setRunning((prev) => !prev)}
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
                            style={{ backgroundColor: theme.ink, color: theme.bg }}
                        >
                            {running ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
                            {running ? 'Pause' : 'Start'}
                        </button>
                        <button
                            type="button"
                            onClick={resetTimer}
                            aria-label="Reset timer"
                            className="p-3 rounded-full transition-colors"
                            style={{ border: `1px solid ${theme.borderStrong}`, color: theme.ink }}
                        >
                            <ReplayIcon sx={{ fontSize: 18 }} />
                        </button>
                    </div>
                </div>

                {/* Task Selector */}
                <div
                    className="w-full p-5 rounded-2xl space-y-3"
                    style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                >
                    <div className="flex items-center justify-between">
                        <span
                            className="text-[11px] uppercase tracking-[0.16em] font-semibold"
                            style={{ color: theme.subtle }}
                        >
                            Focusing On
                        </span>
                        {!user && (
                            <Link to="/signIn" className="text-xs underline underline-offset-4">
                                Sign in to load your tasks
                            </Link>
                        )}
                    </div>

                    {user ? (
                        activeTasks.length > 0 ? (
                            <div className="flex flex-col sm:flex-row gap-2.5">
                                <select
                                    value={selectedTaskId}
                                    onChange={(e) => setSelectedTaskId(e.target.value)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                                    style={{
                                        backgroundColor: theme.bg,
                                        border: `1px solid ${theme.border}`,
                                        color: theme.ink,
                                    }}
                                >
                                    <option value="">Select an active task...</option>
                                    {activeTasks.map((t: TaskItem) => (
                                        <option key={t.id} value={t.id}>
                                            {t.title}
                                        </option>
                                    ))}
                                </select>

                                {selectedTask && (
                                    <button
                                        type="button"
                                        onClick={handleMarkDone}
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium"
                                        style={{ backgroundColor: theme.ink, color: theme.bg }}
                                    >
                                        <CheckIcon sx={{ fontSize: 15 }} />
                                        Complete Task
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm" style={{ color: theme.muted }}>
                                All tasks are completed. Enjoy the quiet!
                            </p>
                        )
                    ) : (
                        <p className="text-sm" style={{ color: theme.muted }}>
                            Use the timer freely, or sign in to link it to your personal task list.
                        </p>
                    )}
                </div>
            </main>

            {/* Profile Drawer */}
            <Drawer open={drawerOpen} anchor="right" onClose={() => setDrawerOpen(false)}>
                <div
                    className="w-[85vw] sm:w-[340px] h-full flex flex-col justify-between p-6"
                    style={{ backgroundColor: theme.bg, color: theme.ink }}
                >
                    <div>
                        <div
                            className="flex items-center justify-between pb-4"
                            style={{ borderBottom: `1px solid ${theme.border}` }}
                        >
                            <span className="text-sm font-semibold uppercase tracking-[0.15em]">Account</span>
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                className="p-1.5 rounded-full"
                                style={{ border: `1px solid ${theme.border}` }}
                            >
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </button>
                        </div>

                        {user ? (
                            <div className="pt-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold uppercase"
                                        style={{ backgroundColor: theme.ink, color: theme.bg }}
                                    >
                                        {user.firstName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {user.firstName} {user.lastName}
                                        </h3>
                                        <p className="text-xs" style={{ color: theme.muted }}>
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Link
                                        to="/focus"
                                        onClick={() => setDrawerOpen(false)}
                                        className="block w-full px-4 py-2.5 rounded-xl text-xs font-medium"
                                        style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                                    >
                                        Open Focus Timer
                                    </Link>
                                    <Link
                                        to="/insights"
                                        onClick={() => setDrawerOpen(false)}
                                        className="block w-full px-4 py-2.5 rounded-xl text-xs font-medium"
                                        style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                                    >
                                        View Task Insights
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="pt-10 space-y-4">
                                <h3 className="text-xl font-semibold">Welcome to Task Buddy</h3>
                                <p className="text-sm" style={{ color: theme.muted }}>
                                    Sign in to sync your tasks across sessions and devices.
                                </p>
                                <div className="flex flex-col gap-2.5 pt-2">
                                    <Link
                                        to="/signIn"
                                        className="w-full text-center py-2.5 rounded-full text-xs font-medium"
                                        style={{ backgroundColor: theme.ink, color: theme.bg }}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/signUp"
                                        className="w-full text-center py-2.5 rounded-full text-xs font-medium"
                                        style={{ border: `1px solid ${theme.borderStrong}`, color: theme.ink }}
                                    >
                                        Create Account
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {user && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-medium"
                            style={{ border: `1px solid ${theme.borderStrong}`, color: theme.ink }}
                        >
                            <LogoutIcon sx={{ fontSize: 15 }} />
                            Sign Out
                        </button>
                    )}
                </div>
            </Drawer>
        </div>
    );
};

export default NewFocus;
