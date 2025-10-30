# Daily Progress Tracker

A comprehensive offline-capable React TypeScript application for tracking daily progress with goals, priorities, and journal entries.

## Features

### 📋 Core Functionality
- **Goals Tracking**: Create and manage goals with time slots (6 AM - 3 AM, 30-minute intervals)
- **Priorities Management**: Set and track priorities without time constraints
- **Journal Editor**: Write daily reflections with word count and auto-save
- **Calendar Navigation**: Browse and navigate through historical records
- **Tri-State Toggle**: Cycle through neutral → done ✓ → not done ✗ states with long press reset

### 🎨 User Experience
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Navigation**: Arrow keys for date navigation, 'T' for today
- **PWA Support**: Installable web app with offline functionality
- **Auto-save**: Automatic saving with visual indicators

### 💾 Data Management
- **IndexedDB Storage**: Local offline storage for complete privacy
- **Export/Import**: Backup and restore functionality
- **Search & Filter**: Find records across goals, priorities, and journal entries
- **Progress Tracking**: Visual progress indicators and statistics

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with custom components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Data Storage**: IndexedDB for offline persistence
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **PWA**: Service Worker with caching strategies

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd daily-progress-tracker
```

2. Install dependencies:
```bash
pnpm install
```

3. Start development server:
```bash
pnpm dev
```

4. Build for production:
```bash
pnpm build
```

5. Preview production build:
```bash
pnpm preview
```

## Usage Guide

### Setting Up Your Day

1. **Navigate to Today's Date**: Use the calendar or press 'T' to jump to today
2. **Add Goals**: Click "Add New Goal" and set time slots for each goal
3. **Set Priorities**: Add priorities that don't require specific time slots
4. **Track Progress**: Use tri-state toggles to mark completion status
5. **Write Journal**: Reflect on your day in the journal section

### Keyboard Shortcuts

- `←` / `→` : Navigate to previous/next day
- `T` : Jump to today
- Click and hold toggles: Reset to neutral state

### Data Management

- **Auto-save**: Changes are automatically saved after a brief delay
- **Export**: Use the download button to export individual records as JSON
- **Offline**: All data is stored locally and works without internet connection
- **Privacy**: All data remains on your device - no external servers

## Project Structure

```
src/
├── components/          # React components
│   ├── TriStateToggle.tsx
│   ├── TimeSelect.tsx
│   ├── GoalsList.tsx
│   ├── ItemList.tsx
│   ├── JournalEditor.tsx
│   ├── Calendar.tsx
│   └── DailyRecordView.tsx
├── hooks/              # Custom React hooks
│   └── useRecords.ts
├── lib/                # Utility libraries
│   ├── utils.ts        # General utilities
│   ├── database.ts     # IndexedDB operations
│   └── theme-provider.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── constants/          # Application constants
│   └── index.ts
└── App.tsx             # Main application component
```

## Features in Detail

### Tri-State Toggle System
- **Neutral**: Gray state, indicates task is pending
- **Done**: Green state with checkmark, indicates completion
- **Not Done**: Red state with X, indicates task was attempted but not completed
- **Long Press**: Reset any state back to neutral

### Time Slot Management
- 30-minute intervals from 6:00 AM to 3:00 AM
- Quick preset buttons for common times
- Visual indicators for available vs. occupied time slots
- Progress tracking per goal based on completed time slots

### Calendar View
- Monthly and weekly view modes
- Visual indicators for days with data
- Progress summary for each day
- Responsive design for mobile and desktop

### Journal Features
- Auto-save with 1-second debounce
- Word count tracking
- Character limit (10,000 characters)
- Writing tips and suggestions
- Timestamp tracking for last modification

## PWA Installation

The app can be installed as a Progressive Web App:

1. Visit the app in a supported browser
2. Look for the "Install" prompt in the address bar
3. Follow the installation prompts
4. The app will be available like a native application

## Browser Support

- Chrome/Chromium 88+
- Firefox 78+
- Safari 14+
- Edge 88+

*IndexedDB and modern JavaScript features required*

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests, please create an issue in the repository.
