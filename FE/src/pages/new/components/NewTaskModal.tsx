import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { TwoColorTheme } from '../theme';

export interface TaskItem {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    deadline: string;
    createdAt: string;
}

interface NewTaskModalProps {
    mode: 'create' | 'edit' | 'view' | null;
    task?: TaskItem | null;
    theme: TwoColorTheme;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    onSwitchToEdit?: () => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({
    mode,
    task,
    theme,
    onClose,
    onSave,
    onSwitchToEdit,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('todo');
    const [priority, setPriority] = useState('Medium');
    const [deadline, setDeadline] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (task && (mode === 'edit' || mode === 'view')) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setStatus(task.status || 'todo');
            setPriority(task.priority || 'Medium');
            setDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
        } else {
            setTitle('');
            setDescription('');
            setStatus('todo');
            setPriority('Medium');
            setDeadline('');
        }
    }, [task, mode]);

    if (!mode) return null;

    const isView = mode === 'view';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isView || !title.trim()) return;
        setSubmitting(true);
        try {
            const payload: any = {
                title: title.trim(),
                description: description.trim(),
                status,
                priority,
                deadline: deadline ? new Date(deadline).toISOString() : '',
            };
            if (mode === 'edit' && task) {
                payload.id = task.id;
                payload.updatedAt = new Date().toISOString();
            } else {
                payload.createdAt = new Date().toISOString();
            }
            await onSave(payload);
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
        color: theme.ink,
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
            style={{ backgroundColor: 'rgba(23, 59, 51, 0.35)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-2xl p-6 sm:p-7 transition-all"
                style={{
                    backgroundColor: theme.bg,
                    border: `1px solid ${theme.borderStrong}`,
                    color: theme.ink,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="flex items-center justify-between pb-4 mb-5"
                    style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                    <div>
                        <span
                            className="text-[11px] uppercase tracking-[0.18em] font-semibold"
                            style={{ color: theme.subtle }}
                        >
                            {mode === 'create' ? 'New Entry' : mode === 'edit' ? 'Update Task' : 'Task Details'}
                        </span>
                        <h3 className="text-xl font-semibold tracking-tight mt-0.5">
                            {mode === 'create' ? 'Create a task' : mode === 'edit' ? 'Edit task' : task?.title}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full transition-colors"
                        style={{ border: `1px solid ${theme.border}`, color: theme.ink }}
                        aria-label="Close modal"
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </button>
                </div>

                {isView && task ? (
                    <div className="space-y-5">
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.15em] mb-1" style={{ color: theme.subtle }}>
                                Description
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                                {task.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Status', value: task.status },
                                { label: 'Priority', value: task.priority || 'Medium' },
                                {
                                    label: 'Deadline',
                                    value: task.deadline
                                        ? new Date(task.deadline).toLocaleDateString('en-GB', {
                                              day: '2-digit',
                                              month: 'short',
                                              year: 'numeric',
                                          })
                                        : 'None',
                                },
                            ].map((meta) => (
                                <div
                                    key={meta.label}
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                                >
                                    <div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: theme.subtle }}>
                                        {meta.label}
                                    </div>
                                    <div className="text-sm font-semibold capitalize mt-1">{meta.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-full text-xs font-medium"
                                style={{ border: `1px solid ${theme.border}`, color: theme.ink }}
                            >
                                Close
                            </button>
                            {onSwitchToEdit && (
                                <button
                                    type="button"
                                    onClick={onSwitchToEdit}
                                    className="px-5 py-2 rounded-full text-xs font-medium"
                                    style={{ backgroundColor: theme.ink, color: theme.bg }}
                                >
                                    Edit Task
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.15em] font-medium mb-1.5" style={{ color: theme.muted }}>
                                Title
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Finalize quarterly roadmap"
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.15em] font-medium mb-1.5" style={{ color: theme.muted }}>
                                Description
                            </label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add brief context or acceptance notes..."
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                                style={inputStyle}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[11px] uppercase tracking-[0.15em] font-medium mb-1.5" style={{ color: theme.muted }}>
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none capitalize"
                                    style={inputStyle}
                                >
                                    <option value="todo" style={{ backgroundColor: theme.bg, color: theme.ink }}>To Do</option>
                                    <option value="in progress" style={{ backgroundColor: theme.bg, color: theme.ink }}>In Progress</option>
                                    <option value="done" style={{ backgroundColor: theme.bg, color: theme.ink }}>Done</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] uppercase tracking-[0.15em] font-medium mb-1.5" style={{ color: theme.muted }}>
                                    Priority
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                    style={inputStyle}
                                >
                                    <option value="Low" style={{ backgroundColor: theme.bg, color: theme.ink }}>Low</option>
                                    <option value="Medium" style={{ backgroundColor: theme.bg, color: theme.ink }}>Medium</option>
                                    <option value="High" style={{ backgroundColor: theme.bg, color: theme.ink }}>High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] uppercase tracking-[0.15em] font-medium mb-1.5" style={{ color: theme.muted }}>
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-full text-xs font-medium"
                                style={{ border: `1px solid ${theme.border}`, color: theme.ink }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2 rounded-full text-xs font-medium transition-opacity hover:opacity-85 disabled:opacity-50"
                                style={{ backgroundColor: theme.ink, color: theme.bg }}
                            >
                                {submitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default NewTaskModal;
