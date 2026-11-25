import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTaskDetails } from '../../../context/taskDetails';
import { useUserDetails } from '../../../context/userDetails';
import { getAllTasks } from '../../../services/tasks';
import { getTwoColorTheme } from '../theme';
import NewHeader from '../components/NewHeader';
import { TaskItem } from '../components/NewTaskModal';
import { Drawer } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const NewInsights = () => {
    const [inverted, setInverted] = useState(false);
    const theme = getTwoColorTheme(inverted);

    const { user, updateUser } = useUserDetails();
    const { tasks, setTasks } = useTaskDetails();

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

    const metrics = useMemo(() => {
        const list: TaskItem[] = tasks || [];
        const total = list.length;
        const done = list.filter((t) => t.status === 'done').length;
        const inProgress = list.filter((t) => t.status === 'in progress').length;
        const todo = list.filter((t) => t.status === 'todo').length;
        const high = list.filter((t) => t.priority === 'High' && t.status !== 'done').length;
        const medium = list.filter((t) => (t.priority === 'Medium' || !t.priority) && t.status !== 'done').length;
        const low = list.filter((t) => t.priority === 'Low' && t.status !== 'done').length;
        const rate = total === 0 ? 0 : Math.round((done / total) * 100);

        const upcoming = list
            .filter((t) => t.deadline && t.status !== 'done')
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .slice(0, 5);

        return { total, done, inProgress, todo, high, medium, low, rate, upcoming };
    }, [tasks]);

    return (
        <div
            className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ backgroundColor: theme.bg, color: theme.ink }}
        >
            <NewHeader
                theme={theme}
                inverted={inverted}
                onToggleInvert={() => setInverted((prev) => !prev)}
                onOpenProfile={() => setDrawerOpen(true)}
                user={user}
            />

            <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-10 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <span
                            className="text-[11px] uppercase tracking-[0.18em] font-semibold"
                            style={{ color: theme.subtle }}
                        >
                            Analytics
                        </span>
                        <h1 className="text-3xl font-semibold tracking-tight mt-1">
                            Task Insights
                        </h1>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4"
                    >
                        Back to workspace
                        <ArrowForwardIcon sx={{ fontSize: 14 }} />
                    </Link>
                </div>

                {!user ? (
                    <div
                        className="p-10 rounded-3xl text-center space-y-4"
                        style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                    >
                        <h2 className="text-xl font-semibold">Sign in to view your insights</h2>
                        <p className="text-sm max-w-md mx-auto" style={{ color: theme.muted }}>
                            Once signed in, this page summarizes your completion rate, priority balance, and upcoming deadlines.
                        </p>
                        <Link
                            to="/signIn"
                            className="inline-block px-6 py-2.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: theme.ink, color: theme.bg }}
                        >
                            Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Top KPI Bento */}
                        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Tasks', value: metrics.total },
                                { label: 'Completion Rate', value: `${metrics.rate}%` },
                                { label: 'Active', value: metrics.todo + metrics.inProgress },
                                { label: 'Completed', value: metrics.done },
                            ].map((kpi) => (
                                <div
                                    key={kpi.label}
                                    className="p-6 rounded-2xl"
                                    style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                                >
                                    <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: theme.subtle }}>
                                        {kpi.label}
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-semibold tabular-nums mt-3">
                                        {kpi.value}
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Status & Priority Bars */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className="p-6 rounded-2xl space-y-4"
                                style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                            >
                                <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                                    By Status
                                </h3>
                                {[
                                    { label: 'To Do', count: metrics.todo },
                                    { label: 'In Progress', count: metrics.inProgress },
                                    { label: 'Done', count: metrics.done },
                                ].map((row) => {
                                    const pct = metrics.total === 0 ? 0 : Math.round((row.count / metrics.total) * 100);
                                    return (
                                        <div key={row.label} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span>{row.label}</span>
                                                <span className="tabular-nums" style={{ color: theme.muted }}>
                                                    {row.count} ({pct}%)
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, backgroundColor: theme.ink }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div
                                className="p-6 rounded-2xl space-y-4"
                                style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                            >
                                <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                                    Active by Priority
                                </h3>
                                {[
                                    { label: 'High Priority', count: metrics.high },
                                    { label: 'Medium Priority', count: metrics.medium },
                                    { label: 'Low Priority', count: metrics.low },
                                ].map((row) => {
                                    const activeTotal = metrics.todo + metrics.inProgress;
                                    const pct = activeTotal === 0 ? 0 : Math.round((row.count / activeTotal) * 100);
                                    return (
                                        <div key={row.label} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span>{row.label}</span>
                                                <span className="tabular-nums" style={{ color: theme.muted }}>
                                                    {row.count}
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, backgroundColor: theme.ink }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Upcoming Deadlines */}
                        <section
                            className="p-6 rounded-2xl space-y-4"
                            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                        >
                            <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                                Upcoming Deadlines
                            </h3>
                            {metrics.upcoming.length === 0 ? (
                                <p className="text-sm" style={{ color: theme.muted }}>
                                    No upcoming deadlines scheduled.
                                </p>
                            ) : (
                                <div className="divide-y" style={{ borderColor: theme.border }}>
                                    {metrics.upcoming.map((t) => (
                                        <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-sm font-medium">{t.title}</div>
                                                <div className="text-xs capitalize" style={{ color: theme.subtle }}>
                                                    {t.status} · {t.priority || 'Medium'}
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium tabular-nums">
                                                {new Date(t.deadline).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
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

export default NewInsights;
