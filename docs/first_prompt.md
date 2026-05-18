Build a production-ready modern frontend dashboard for a self-hosted LiveKit infrastructure.

- i18n support with Persian (fa) and English (en)
- RTL/LTR auto switching
- Fully responsive mobile-first design
- Dark mode by default
- Component-driven architecture
- Clean scalable folder structure

Context:
We already have the backend and Docker infrastructure ready.
This frontend should connect to existing APIs.

Goal:
Create a complete admin panel and operator dashboard for managing a self-hosted LiveKit deployment.

The UI should feel like:
- Vercel
- Railway
- Supabase
- Grafana
- Modern DevOps dashboards

Design Requirements:
- Minimal modern UI
- Elegant spacing
- Rounded cards (2xl)
- Smooth animations
- Professional dark theme
- Soft borders and glass effects
- High readability
- Fast UX
- Clean typography
- Modern tables
- Real-time feeling
- Interactive status indicators
- Beautiful loading states and skeletons
- Toast notifications
- Empty states
- Error states
- Search/filter UX

Main Features:

1. Authentication
- Login page
- JWT auth support
- Remember me
- Protected routes
- Logout
- Session expiration handling

2. Dashboard Overview
Cards:
- Active rooms
- Active participants
- Node health
- CPU usage
- RAM usage
- Active streams
- Bandwidth usage
- Total uptime
- Active transports
- Connected clients

Charts:
- Real-time participants graph
- CPU/RAM charts
- Traffic graph
- Room activity timeline

3. Live Rooms Management
Table with:
- Room name
- Participant count
- Created time
- Region
- Codec
- Bitrate
- Status
- Duration
- Actions dropdown

Actions:
- Inspect room
- Delete room
- Force disconnect participant
- Generate invite token
- Copy room ID
- View logs

Features:
- Search
- Pagination
- Sorting
- Real-time updates
- Filters
- Multi-select actions

4. Room Details Page
Tabs:
- Participants
- Tracks
- Events
- Statistics
- Logs

Participant cards:
- Audio state
- Video state
- Bitrate
- Connection quality
- Device info
- Browser info
- Region
- Ping
- Packet loss

Actions:
- Mute participant
- Remove participant
- Disable camera
- Send message

5. Token Generator
Generate:
- Viewer token
- Publisher token
- Admin token

Configurable:
- Room
- Identity
- Expiration
- Metadata
- Permissions

Features:
- Copy token
- QR code generation
- Share link generation

6. Server Management
Show:
- Docker container status
- LiveKit version
- Redis status
- TURN status
- API status
- WebSocket status

Actions:
- Restart LiveKit
- Restart Redis
- Restart TURN
- View logs
- Pull updates
- Health checks

7. Logs Viewer
- Real-time logs
- Search logs
- Filter by level
- Download logs
- JSON/raw mode
- Auto-scroll
- Pause stream

8. Monitoring
Realtime:
- CPU
- RAM
- Disk
- Network
- WebRTC stats
- Active transports
- Packet loss
- Jitter
- RTT

Charts must update live.

9. Settings Page
Sections:
- General settings
- TURN/STUN config
- API config
- Security
- Limits
- Recording
- Egress
- Webhooks

10. Notifications System
- Toasts
- Error alerts
- Server offline alerts
- High CPU warnings
- Disconnect warnings

11. Internationalization
Support:
- English
- Persian

Requirements:
- Full RTL support
- Dynamic language switching
- Persian fonts
- Proper RTL tables/layouts
- Locale-aware formatting

12. API Integration Layer
Create clean reusable API services for:
- Rooms
- Participants
- Tokens
- Logs
- Monitoring
- Docker
- Metrics
- Auth

13. Realtime Features
Use:
- WebSocket or SSE

Realtime updates for:
- Participants
- Rooms
- Logs
- Metrics
- Server health

14. Project Structure
Generate scalable folders:
- components/
- features/
- services/
- hooks/
- stores/
- lib/
- app/
- types/
- i18n/

15. Required Components
Build reusable components:
- StatsCard
- ServerStatusCard
- RoomTable
- ParticipantsTable
- MetricChart
- LogsViewer
- TokenModal
- ConfirmDialog
- Sidebar
- Topbar
- LanguageSwitcher
- ThemeSwitcher
- StatusBadge
- LoadingSkeleton

16. UX Details
- Keyboard shortcuts
- Command palette
- Responsive sidebar
- Sticky top navigation
- Smooth transitions
- Optimistic UI updates
- Debounced search
- Lazy loading
- Infinite scrolling where needed

17. Performance
- Code splitting
- Dynamic imports
- Memoization
- Optimized charts
- Efficient polling
- Proper caching

18. Accessibility
- Keyboard navigation
- ARIA labels
- Focus states
- Contrast compliance

19. Pages Required
- /login
- /dashboard
- /rooms
- /rooms/[id]
- /tokens
- /monitoring
- /logs
- /settings

20. Deliverables
Generate:
- Full frontend codebase
- Reusable architecture
- Realistic mock data
- API abstraction layer
- Production-quality UI
- Responsive design
- Clean TypeScript types
- Professional animations
- Complete routing structure

Important:
- Do NOT generate placeholder toy UI.
- Build it like a real SaaS production panel.
- Use realistic data structures.
- Focus heavily on developer/operator experience.
- UI must feel premium and modern.
- Make everything modular and scalable.
- Use best practices everywhere.
- Ensure the code is clean, maintainable, and well-documented.
