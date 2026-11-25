export interface TwoColorTheme {
    /** Primary background color */
    bg: string;
    /** Primary text / ink / accent color */
    ink: string;
    /** Subtle tinted surface (8% ink) */
    surface: string;
    /** Subtle hover surface (12% ink) */
    surfaceHover: string;
    /** Hairline border (16% ink) */
    border: string;
    /** Strong border (35% ink) */
    borderStrong: string;
    /** Muted secondary text (65% ink) */
    muted: string;
    /** Subtle caption text (48% ink) */
    subtle: string;
}

export const LIGHT_PALETTE: TwoColorTheme = {
    bg: '#F6F3EC',       // Warm Alabaster
    ink: '#173B33',      // Deep Forest Pine
    surface: 'rgba(23, 59, 51, 0.05)',
    surfaceHover: 'rgba(23, 59, 51, 0.09)',
    border: 'rgba(23, 59, 51, 0.15)',
    borderStrong: 'rgba(23, 59, 51, 0.35)',
    muted: 'rgba(23, 59, 51, 0.68)',
    subtle: 'rgba(23, 59, 51, 0.48)',
};

export const INVERTED_PALETTE: TwoColorTheme = {
    bg: '#173B33',       // Deep Forest Pine
    ink: '#F6F3EC',      // Warm Alabaster
    surface: 'rgba(246, 243, 236, 0.07)',
    surfaceHover: 'rgba(246, 243, 236, 0.12)',
    border: 'rgba(246, 243, 236, 0.18)',
    borderStrong: 'rgba(246, 243, 236, 0.4)',
    muted: 'rgba(246, 243, 236, 0.72)',
    subtle: 'rgba(246, 243, 236, 0.5)',
};

export const getTwoColorTheme = (inverted: boolean): TwoColorTheme =>
    inverted ? INVERTED_PALETTE : LIGHT_PALETTE;
