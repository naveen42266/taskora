import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ContrastIcon from '@mui/icons-material/Contrast';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { TwoColorTheme } from '../theme';
import TaskoraLogo from './TaskoraLogo';

interface NewHeaderProps {
    theme: TwoColorTheme;
    inverted: boolean;
    onToggleInvert: () => void;
    onOpenProfile?: () => void;
    user?: any;
}

const NewHeader: React.FC<NewHeaderProps> = ({
    theme,
    inverted,
    onToggleInvert,
    onOpenProfile,
    user,
}) => {
    const location = useLocation();

    const navItems = [
        { label: 'Tasks', path: '/' },
        { label: 'Focus', path: '/focus' },
        { label: 'Insights', path: '/insights' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header
            className="sticky top-0 z-40 backdrop-blur-md transition-colors duration-300"
            style={{
                backgroundColor: inverted ? 'rgba(23, 59, 51, 0.88)' : 'rgba(246, 243, 236, 0.88)',
                borderBottom: `1px solid ${theme.border}`,
                color: theme.ink,
            }}
        >
            <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                {/* Brand */}
                <Link
                    to="/"
                    className="flex items-center group"
                    style={{ color: theme.ink }}
                >
                    <TaskoraLogo theme={theme} size="md" />
                </Link>

                {/* Center Navigation */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-full" style={{ backgroundColor: theme.surface }}>
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200"
                                style={{
                                    backgroundColor: active ? theme.ink : 'transparent',
                                    color: active ? theme.bg : theme.muted,
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onToggleInvert}
                        title="Invert 2-Color Palette"
                        aria-label="Invert 2-Color Palette"
                        className="p-2 rounded-full transition-colors duration-200"
                        style={{
                            border: `1px solid ${theme.border}`,
                            color: theme.ink,
                            backgroundColor: 'transparent',
                        }}
                    >
                        <ContrastIcon sx={{ fontSize: 18 }} />
                    </button>

                    {onOpenProfile ? (
                        <button
                            type="button"
                            onClick={onOpenProfile}
                            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200"
                            style={{
                                border: `1px solid ${theme.border}`,
                                color: theme.ink,
                                backgroundColor: theme.surface,
                            }}
                        >
                            <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase"
                                style={{ backgroundColor: theme.ink, color: theme.bg }}
                            >
                                {user?.firstName ? user.firstName[0] : <PersonOutlineIcon sx={{ fontSize: 14 }} />}
                            </span>
                            <span className="hidden sm:inline">
                                {user?.firstName ? user.firstName : 'Account'}
                            </span>
                        </button>
                    ) : (
                        <Link
                            to="/signIn"
                            className="px-4 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-85"
                            style={{
                                backgroundColor: theme.ink,
                                color: theme.bg,
                            }}
                        >
                            Sign in
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default NewHeader;
