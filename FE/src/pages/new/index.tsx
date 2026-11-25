import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Drawer } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

import { useUserDetails } from '../../context/userDetails';
import { useTaskDetails } from '../../context/taskDetails';
import { addTask, deleteTask, getAllTasks, updateStatus, updateTask } from '../../services/tasks';
import { getTwoColorTheme } from './theme';
import NewHeader from './components/NewHeader';
import NewTaskModal, { TaskItem } from './components/NewTaskModal';

const STATUS_COLUMNS: Array<{ key: string; label: string }> = [
    { key: 'todo', label: 'To Do' },
    { key: 'in progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
];

function NewHome() {
    const [inverted, setInverted] = useState(false);
    const theme = getTwoColorTheme(inverted);

    const { user, updateUser } = useUserDetails();
    const { tasks, setTasks } = useTaskDetails();

    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in progress' | 'done'>('all');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<'all' | 'title' | 'description' | 'deadline'>('all');
    const [quickTitle, setQuickTitle] = useState('');
    const [quickAdding, setQuickAdding] = useState(false);
    const [draggedId, setDraggedId] = useState<string>('');

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modalState, setModalState] = useState<{
        mode: 'create' | 'edit' | 'view' | null;
        task: TaskItem | null;
    }>({ mode: null, task: null });

    // Interactive demo tasks on the landing page when logged out
    const [demoTasks, setDemoTasks] = useState([
        { id: 'd1', title: 'Review product design tokens', tag: 'Today', done: true },
        { id: 'd2', title: 'Draft weekly sprint priorities', tag: 'Today', done: false },
        { id: 'd3', title: 'Deep work: API integration', tag: 'Tomorrow', done: false },
    ]);

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const getAllTasksApi = useCallback(async () => {
        try {
            const response = await getAllTasks();
            if (response) setTasks(response);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, [setTasks]);

    useEffect(() => {
        if (token) {
            const decoded: any = jwtDecode(token);
            updateUser({
                userId: decoded.id,
                email: decoded.email,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
                profilePicture: decoded.profilePicture,
            });
            toast.success('Signed in successfully');
            localStorage.setItem('authToken', token);
            navigate('/', { replace: true });
        }
    }, [token, navigate, updateUser]);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            try {
                const decoded: any = jwtDecode(storedToken);
                if (decoded.exp < Date.now() / 1000) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('loginMessage');
                    localStorage.removeItem('loginTime');
                } else {
                    getAllTasksApi();
                }
            } catch {
                // ignore malformed token
            }
        }
        const loginMessage = localStorage.getItem('loginMessage');
        if (loginMessage) {
            toast.success('Signed in successfully');
            localStorage.removeItem('loginMessage');
        }
    }, [getAllTasksApi]);

    const handleSaveTask = async (taskData: any) => {
        try {
            if (modalState.mode === 'edit' && taskData.id) {
                const res = await updateTask(taskData.id, taskData);
                if (res.message === 'Updated Successfully') {
                    toast.success('Task updated');
                    setModalState({ mode: null, task: null });
                    getAllTasksApi();
                } else {
                    toast.error(res.message || 'Update failed');
                }
            } else {
                const res = await addTask(taskData);
                if (res.message === 'Added Successfully') {
                    toast.success('Task added');
                    setModalState({ mode: null, task: null });
                    getAllTasksApi();
                } else {
                    toast.error(res.message || 'Creation failed');
                }
            }
        } catch {
            toast.error('Unable to save task');
        }
    };

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickTitle.trim() || quickAdding) return;
        setQuickAdding(true);
        try {
            const res = await addTask({
                title: quickTitle.trim(),
                description: '',
                status: 'todo',
                priority: 'Medium',
                deadline: '',
                createdAt: new Date().toISOString(),
            });
            if (res.message === 'Added Successfully') {
                setQuickTitle('');
                getAllTasksApi();
                toast.success('Task added');
            } else {
                toast.error(res.message || 'Failed to add task');
            }
        } catch {
            toast.error('Failed to add task');
        } finally {
            setQuickAdding(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await updateStatus(id, newStatus);
            if (res.message === 'Updated Status Successfully') {
                getAllTasksApi();
                toast.success('Status updated');
            } else {
                toast.error(res.message || 'Status update failed');
            }
        } catch {
            toast.error('Status update failed');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await deleteTask(id);
            if (res === 'Deleted Successfully') {
                getAllTasksApi();
                toast.success('Task deleted');
            } else {
                toast.error('Delete failed');
            }
        } catch {
            toast.error('Delete failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('loginMessage');
        localStorage.removeItem('loginTime');
        updateUser(null);
        setDrawerOpen(false);
        toast.success('Signed out');
    };

    const filteredTasks = useMemo(() => {
        if (!localStorage.getItem('authToken')) return [];
        return (tasks || []).filter((t: TaskItem) => {
            const matchesStatus = statusFilter === 'all' || t.status?.toLowerCase() === statusFilter;
            if (!matchesStatus) return false;
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            if (category === 'title') return t.title?.toLowerCase().includes(q);
            if (category === 'description') return t.description?.toLowerCase().includes(q);
            if (category === 'deadline') return t.deadline?.toLowerCase().includes(q);
            return (
                t.title?.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q) ||
                t.deadline?.toLowerCase().includes(q)
            );
        });
    }, [tasks, statusFilter, search, category]);

    const stats = useMemo(() => {
        const list = tasks || [];
        const total = list.length;
        const done = list.filter((t: TaskItem) => t.status === 'done').length;
        const inProgress = list.filter((t: TaskItem) => t.status === 'in progress').length;
        const todo = list.filter((t: TaskItem) => t.status === 'todo').length;
        const rate = total === 0 ? 0 : Math.round((done / total) * 100);
        return { total, done, inProgress, todo, rate };
    }, [tasks]);

    const formatDate = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

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

            {user ? (
                /* ===================== AUTHENTICATED TODO WORKSPACE ===================== */
                <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-8 space-y-6">
                    {/* Top Greeting + Minimalist Bento Stats */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div
                            className="lg:col-span-6 p-6 rounded-2xl flex flex-col justify-between"
                            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                        >
                            <div>
                                <span
                                    className="text-[11px] uppercase tracking-[0.2em] font-semibold"
                                    style={{ color: theme.subtle }}
                                >
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
                                    Hello, {user.firstName || 'there'}.
                                </h1>
                                <p className="text-sm mt-1" style={{ color: theme.muted }}>
                                    {stats.todo + stats.inProgress === 0
                                        ? 'Your workspace is clear. Add a task below to begin.'
                                        : `You have ${stats.todo + stats.inProgress} active tasks remaining.`}
                                </p>
                            </div>

                            <div className="mt-5">
                                <div className="flex items-center justify-between text-xs font-medium mb-2">
                                    <span style={{ color: theme.muted }}>Completion</span>
                                    <span className="tabular-nums font-semibold">{stats.rate}%</span>
                                </div>
                                <div
                                    className="h-2 w-full rounded-full overflow-hidden"
                                    style={{ backgroundColor: theme.border }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${stats.rate}%`, backgroundColor: theme.ink }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-6 grid grid-cols-3 gap-3">
                            {[
                                { label: 'To Do', count: stats.todo, filter: 'todo' as const },
                                { label: 'In Progress', count: stats.inProgress, filter: 'in progress' as const },
                                { label: 'Done', count: stats.done, filter: 'done' as const },
                            ].map((box) => {
                                const active = statusFilter === box.filter;
                                return (
                                    <button
                                        key={box.label}
                                        type="button"
                                        onClick={() =>
                                            setStatusFilter(active ? 'all' : box.filter)
                                        }
                                        className="p-5 rounded-2xl text-left flex flex-col justify-between transition-all duration-200"
                                        style={{
                                            backgroundColor: active ? theme.ink : theme.surface,
                                            color: active ? theme.bg : theme.ink,
                                            border: `1px solid ${active ? theme.ink : theme.border}`,
                                        }}
                                    >
                                        <span
                                            className="text-[11px] uppercase tracking-[0.16em] font-medium"
                                            style={{ opacity: active ? 0.8 : 0.6 }}
                                        >
                                            {box.label}
                                        </span>
                                        <span className="text-3xl sm:text-4xl font-semibold tabular-nums mt-4">
                                            {box.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Quick Add + Controls Bar */}
                    <section className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                        <form
                            onSubmit={handleQuickAdd}
                            className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full"
                            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                        >
                            <AddIcon sx={{ fontSize: 18, color: theme.subtle }} />
                            <input
                                type="text"
                                value={quickTitle}
                                onChange={(e) => setQuickTitle(e.target.value)}
                                placeholder="Quick add a task and press Enter..."
                                className="flex-1 bg-transparent text-sm outline-none"
                                style={{ color: theme.ink }}
                            />
                            {quickTitle.trim() && (
                                <button
                                    type="submit"
                                    disabled={quickAdding}
                                    className="px-3.5 py-1 rounded-full text-xs font-medium"
                                    style={{ backgroundColor: theme.ink, color: theme.bg }}
                                >
                                    {quickAdding ? 'Adding...' : 'Add'}
                                </button>
                            )}
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search */}
                            <div
                                className="flex items-center gap-2 px-3.5 py-2 rounded-full flex-1 sm:flex-initial"
                                style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                            >
                                <SearchIcon sx={{ fontSize: 16, color: theme.subtle }} />
                                <input
                                    type={category === 'deadline' ? 'date' : 'text'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search tasks..."
                                    className="bg-transparent text-xs outline-none w-32 sm:w-40"
                                    style={{ color: theme.ink }}
                                />
                                <select
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value as any);
                                        setSearch('');
                                    }}
                                    className="bg-transparent text-[11px] font-medium outline-none cursor-pointer"
                                    style={{ color: theme.muted }}
                                >
                                    <option value="all" style={{ backgroundColor: theme.bg, color: theme.ink }}>All</option>
                                    <option value="title" style={{ backgroundColor: theme.bg, color: theme.ink }}>Title</option>
                                    <option value="description" style={{ backgroundColor: theme.bg, color: theme.ink }}>Notes</option>
                                    <option value="deadline" style={{ backgroundColor: theme.bg, color: theme.ink }}>Date</option>
                                </select>
                            </div>

                            {/* View Toggle */}
                            <div
                                className="flex items-center p-1 rounded-full"
                                style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                                    style={{
                                        backgroundColor: viewMode === 'list' ? theme.ink : 'transparent',
                                        color: viewMode === 'list' ? theme.bg : theme.muted,
                                    }}
                                >
                                    <ViewListIcon sx={{ fontSize: 15 }} />
                                    List
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('board')}
                                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                                    style={{
                                        backgroundColor: viewMode === 'board' ? theme.ink : 'transparent',
                                        color: viewMode === 'board' ? theme.bg : theme.muted,
                                    }}
                                >
                                    <ViewColumnIcon sx={{ fontSize: 15 }} />
                                    Board
                                </button>
                            </div>

                            {/* Full Modal Button */}
                            <button
                                type="button"
                                onClick={() => setModalState({ mode: 'create', task: null })}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-opacity hover:opacity-85"
                                style={{ backgroundColor: theme.ink, color: theme.bg }}
                            >
                                <AddIcon sx={{ fontSize: 16 }} />
                                New Task
                            </button>
                        </div>
                    </section>

                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {[
                            { key: 'all', label: 'All Tasks' },
                            { key: 'todo', label: 'To Do' },
                            { key: 'in progress', label: 'In Progress' },
                            { key: 'done', label: 'Done' },
                        ].map((tab) => {
                            const active = statusFilter === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.key as any)}
                                    className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                                    style={{
                                        backgroundColor: active ? theme.ink : 'transparent',
                                        color: active ? theme.bg : theme.muted,
                                        border: `1px solid ${active ? theme.ink : theme.border}`,
                                    }}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Task Views */}
                    {viewMode === 'list' ? (
                        <section
                            className="rounded-2xl overflow-hidden"
                            style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}
                        >
                            {filteredTasks.length === 0 ? (
                                <div className="py-16 text-center space-y-2">
                                    <p className="text-sm font-medium">No tasks match this view.</p>
                                    <p className="text-xs" style={{ color: theme.subtle }}>
                                        Use the quick-add bar above or click New Task.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {filteredTasks.map((task: TaskItem, idx: number) => {
                                        const isDone = task.status === 'done';
                                        return (
                                            <div
                                                key={task.id}
                                                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors"
                                                style={{
                                                    borderTop: idx === 0 ? 'none' : `1px solid ${theme.border}`,
                                                }}
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusChange(task.id, isDone ? 'todo' : 'done')
                                                        }
                                                        aria-label="Toggle complete"
                                                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors"
                                                        style={{
                                                            backgroundColor: isDone ? theme.ink : 'transparent',
                                                            border: `1.5px solid ${theme.ink}`,
                                                            color: theme.bg,
                                                        }}
                                                    >
                                                        {isDone && <CheckIcon sx={{ fontSize: 13 }} />}
                                                    </button>

                                                    <div
                                                        className="min-w-0 cursor-pointer"
                                                        onClick={() => setModalState({ mode: 'view', task })}
                                                    >
                                                        <div
                                                            className={`text-sm font-medium truncate ${isDone ? 'line-through' : ''
                                                                }`}
                                                            style={{ opacity: isDone ? 0.5 : 1 }}
                                                        >
                                                            {task.title}
                                                        </div>
                                                        {task.description && (
                                                            <div
                                                                className="text-xs truncate mt-0.5"
                                                                style={{ color: theme.subtle }}
                                                            >
                                                                {task.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    {task.priority && (
                                                        <span
                                                            className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                                                            style={{
                                                                border: `1px solid ${theme.border}`,
                                                                color: theme.muted,
                                                            }}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                    )}

                                                    {task.deadline && (
                                                        <span
                                                            className="hidden md:inline-block text-xs tabular-nums"
                                                            style={{ color: theme.subtle }}
                                                        >
                                                            {formatDate(task.deadline)}
                                                        </span>
                                                    )}

                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                        className="px-2.5 py-1 rounded-full text-[11px] font-medium capitalize outline-none cursor-pointer"
                                                        style={{
                                                            backgroundColor: theme.bg,
                                                            border: `1px solid ${theme.border}`,
                                                            color: theme.ink,
                                                        }}
                                                    >
                                                        <option value="todo">To Do</option>
                                                        <option value="in progress">In Progress</option>
                                                        <option value="done">Done</option>
                                                    </select>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setModalState({ mode: 'view', task })}
                                                            className="p-1.5 rounded-full hover:opacity-70"
                                                            title="View"
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setModalState({ mode: 'edit', task })}
                                                            className="p-1.5 rounded-full hover:opacity-70"
                                                            title="Edit"
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(task.id)}
                                                            className="p-1.5 rounded-full hover:opacity-70"
                                                            title="Delete"
                                                        >
                                                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    ) : (
                        /* Kanban Board View */
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {STATUS_COLUMNS.map((col) => {
                                const colTasks = filteredTasks.filter(
                                    (t: TaskItem) => t.status?.toLowerCase() === col.key
                                );
                                return (
                                    <div
                                        key={col.key}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => {
                                            if (draggedId) {
                                                handleStatusChange(draggedId, col.key);
                                                setDraggedId('');
                                            }
                                        }}
                                        className="rounded-2xl p-4 flex flex-col min-h-[320px]"
                                        style={{
                                            backgroundColor: theme.surface,
                                            border: `1px solid ${theme.border}`,
                                        }}
                                    >
                                        <div
                                            className="flex items-center justify-between pb-3 mb-3"
                                            style={{ borderBottom: `1px solid ${theme.border}` }}
                                        >
                                            <span className="text-xs font-semibold uppercase tracking-[0.15em]">
                                                {col.label}
                                            </span>
                                            <span
                                                className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
                                            >
                                                {colTasks.length}
                                            </span>
                                        </div>

                                        <div className="space-y-2.5 flex-1">
                                            {colTasks.map((task: TaskItem) => (
                                                <div
                                                    key={task.id}
                                                    draggable
                                                    onDragStart={() => setDraggedId(task.id)}
                                                    className="p-4 rounded-xl cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-0.5"
                                                    style={{
                                                        backgroundColor: theme.bg,
                                                        border: `1px solid ${theme.border}`,
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4
                                                            onClick={() => setModalState({ mode: 'view', task })}
                                                            className="text-sm font-medium leading-snug cursor-pointer"
                                                        >
                                                            {task.title}
                                                        </h4>
                                                        <span
                                                            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                                                            style={{ border: `1px solid ${theme.border}`, color: theme.muted }}
                                                        >
                                                            {task.priority || 'Medium'}
                                                        </span>
                                                    </div>

                                                    {task.description && (
                                                        <p
                                                            className="text-xs mt-1.5 line-clamp-2"
                                                            style={{ color: theme.subtle }}
                                                        >
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between mt-3 pt-2.5" style={{ borderTop: `1px solid ${theme.border}` }}>
                                                        <span className="text-[11px] tabular-nums" style={{ color: theme.subtle }}>
                                                            {task.deadline ? formatDate(task.deadline) : 'No due date'}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => setModalState({ mode: 'edit', task })}
                                                                className="p-1 rounded hover:opacity-70"
                                                            >
                                                                <EditOutlinedIcon sx={{ fontSize: 15 }} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(task.id)}
                                                                className="p-1 rounded hover:opacity-70"
                                                            >
                                                                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    )}
                </main>
            ) : (
                /* ===================== MINIMALIST LANDING PAGE ===================== */
                <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-14 sm:py-20 space-y-20">
                    {/* Editorial Hero + Interactive Preview */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-6 space-y-6">
                            <span
                                className="inline-block px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em]"
                                style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                            >
                                Two-Tone Calm Productivity
                            </span>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08]">
                                Clarity for what matters today.
                            </h1>

                            <p className="text-base sm:text-lg leading-relaxed max-w-lg" style={{ color: theme.muted }}>
                                A quiet, distraction-free task workspace. Plan in lists, organize on boards, and enter deep focus—with zero visual noise.
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Link
                                    to="/signUp"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: theme.ink, color: theme.bg }}
                                >
                                    Start for free
                                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                                </Link>
                                <Link
                                    to="/signIn"
                                    className="px-6 py-3 rounded-full text-sm font-medium transition-colors"
                                    style={{ border: `1px solid ${theme.borderStrong}`, color: theme.ink }}
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>

                        {/* Interactive Mini Workspace Preview */}
                        <div
                            className="lg:col-span-6 p-6 rounded-3xl space-y-4"
                            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderStrong}` }}
                        >
                            <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
                                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                                    Interactive Preview
                                </span>
                                <span className="text-xs tabular-nums" style={{ color: theme.muted }}>
                                    {demoTasks.filter((d) => d.done).length}/{demoTasks.length} Done
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {demoTasks.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() =>
                                            setDemoTasks((prev) =>
                                                prev.map((t) =>
                                                    t.id === item.id ? { ...t, done: !t.done } : t
                                                )
                                            )
                                        }
                                        className="w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all"
                                        style={{
                                            backgroundColor: theme.bg,
                                            border: `1px solid ${theme.border}`,
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                                style={{
                                                    backgroundColor: item.done ? theme.ink : 'transparent',
                                                    border: `1.5px solid ${theme.ink}`,
                                                    color: theme.bg,
                                                }}
                                            >
                                                {item.done && <CheckIcon sx={{ fontSize: 13 }} />}
                                            </span>
                                            <span
                                                className={`text-sm font-medium ${item.done ? 'line-through' : ''}`}
                                                style={{ opacity: item.done ? 0.5 : 1 }}
                                            >
                                                {item.title}
                                            </span>
                                        </div>
                                        <span className="text-[11px]" style={{ color: theme.subtle }}>
                                            {item.tag}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 3-Column Bento Feature Strip */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                num: '01',
                                title: 'List & Board Views',
                                desc: 'Switch effortlessly between a focused daily list and a drag-and-drop Kanban board.',
                            },
                            {
                                num: '02',
                                title: 'Built-in Focus Timer',
                                desc: 'Pair any task with a 25-minute Pomodoro session to eliminate context switching.',
                            },
                            {
                                num: '03',
                                title: 'Quiet Insights',
                                desc: 'Track completion momentum, upcoming deadlines, and workload balance at a glance.',
                            },
                        ].map((f) => (
                            <div
                                key={f.num}
                                className="p-6 rounded-2xl space-y-3"
                                style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                            >
                                <span className="text-xs font-semibold tabular-nums" style={{ color: theme.subtle }}>
                                    {f.num}
                                </span>
                                <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </section>
                </main>
            )}

            {/* Minimalist Footer */}
            <footer
                className="py-5 px-5 text-xs"
                style={{ borderTop: `1px solid ${theme.border}`, color: theme.subtle }}
            >
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>Task Buddy — Minimalist Edition</span>
                    <div className="flex items-center gap-4">
                        <Link to="/focus" className="hover:underline">Focus Mode</Link>
                        <Link to="/insights" className="hover:underline">Insights</Link>
                        <Link to="/" className="hover:underline">Classic View</Link>
                    </div>
                </div>
            </footer>

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

            {/* Task Create / Edit / View Modal */}
            <NewTaskModal
                mode={modalState.mode}
                task={modalState.task}
                theme={theme}
                onClose={() => setModalState({ mode: null, task: null })}
                onSave={handleSaveTask}
                onSwitchToEdit={() =>
                    setModalState((prev) => ({ ...prev, mode: 'edit' }))
                }
            />
        </div>
    );
}

export default NewHome;
