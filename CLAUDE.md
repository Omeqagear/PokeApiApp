# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Quick Development Commands

The application is an Angular project utilizing the Angular CLI.

*   **Start/Serve (Development):** `ng start` or `ng serve`
    *   *Purpose:* Runs the development server for local testing and includes hot-reloading.
*   **Build (Production):** `ng build --configuration production`
    *   *Purpose:* Creates the optimized, production-ready build artifacts.
*   **Run Tests (Unit):** `ng test`
    *   *Purpose:* Executes unit tests using Karma, covering component and service logic.
*   **Lint:** `ng lint`
    *   *Purpose:* Checks the code against predefined ESLint rules to maintain code quality and adherence to standards.
*   **End-to-End (E2E) Tests:** `ng e2e`
    *   *Purpose:* Runs simulated user workflows to test the overall application flow.

## 🧱 Code Architecture and Structure

The application follows a component-driven, modular structure typical of modern Angular applications.

**Core Flow:**
The application is bootstrapped in `src/main.ts` using the new standalone component API (`bootstrapApplication`). It relies on the defined routes in `src/app/app.routes.ts` and uses `provideHttpClient(withInterceptorsFromDi())` to manage all HTTP communication.

**Interception Layer:**
All outgoing HTTP requests are managed by a global interceptor, `CacheInterceptor` (located at `src/app/services/cache.interceptor.ts`), which is registered in `src/main.ts`. This layer suggests that network calls are managed and potentially cached at the application level.

**Key Modules/Components:**
The primary features of the application seem to revolve around a Pokémon data catalog:
*   **`/app/pokedex` (Root):** The main container component.
*   **`/app/home`:** Handles the main landing or home view of the application.
*   **`/app/catalog`:** Manages the browsing or listing of Pokémon data.
*   **`/app/equipo-pokemon`:** Dedicated to managing a collection or team of Pokémon.
*   **`/app/photo-pokemon`:** Likely handles the display or interaction with Pokémon imagery.
*   **Services:** Centralized logic for data fetching is handled by `src/app/services/data-service.service.ts`, complementing the HTTP interception layer.

**Styling and Assets:**
*   **Global Styles:** Primary global styles are defined in `src/styles.scss`.
*   **Theming:** The application utilizes Angular Material components and imports a specific theme: `@angular/material/prebuilt-themes/magenta-violet.css`.
*   **Assets:** Static assets (like logos and images) are organized within the `src/assets/` directory.

## 💡 Key Architectural Decisions

1.  **Reactive Data Flow:** The use of an Angular service (`data-service.service.ts`) in conjunction with an HTTP Interceptor suggests a robust pattern for centralized state management and network request handling, rather than local component state.
2.  **Routing:** The routing is managed using the modern `provideRouter` pattern defined in `src/main.ts`.
3.  **Data Layer:** The pattern of using dedicated services for API interaction and a dedicated interceptor for network logic implies that business logic regarding data fetching/caching should be confined to the services layer.
