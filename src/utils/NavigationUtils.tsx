import {
  createNavigationContainerRef,
  CommonActions,
  StackActions,
} from '@react-navigation/native';

/**
 * Navigation Utilities
 *
 * Helper functions to perform navigation actions from outside React components
 * (e.g., from Redux Thunks, Sagas, or plain JS functions).
 *
 * Exports:
 * - navigate: Standard push navigation.
 * - replace: Replace current route.
 * - resetAndNavigate: Reset stack and set new root (supports nested routes).
 * - goBack: Pop current screen.
 */
export const navigationRef = createNavigationContainerRef();

// export async function navigate(routeName: string, params?: object) {
//     navigationRef.isReady();
//     if (navigationRef.isReady()) {
//         navigationRef.dispatch(CommonActions.navigate(routeName, params));
//     }
// }

export function navigate(routeName: string, params?: object) {
  if (!navigationRef.isReady()) return;

  if (routeName.includes('/')) {
    // Handle nested navigation using "Parent/Child" format
    const [parent, child] = routeName.split('/');
    navigationRef.dispatch(
      CommonActions.navigate({
        name: parent,
        params: {
          screen: child,
          params,
        },
      }),
    );
  } else {
    // Handle normal single route navigation
    navigationRef.dispatch(
      CommonActions.navigate({
        name: routeName,
        params,
      }),
    );
  }
}

export async function replace(routeName: string, params?: object) {
  navigationRef.isReady();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(routeName, params));
  }
}

// export async function resetAndNavigate(routeName: string) {
//   navigationRef.isReady();
//   if (navigationRef.isReady()) {
//     navigationRef.dispatch(
//       CommonActions.reset({
//         index: 0,
//         routes: [{name: routeName}],
//       }),
//     );
//   }
// }

// Recursive screen object: { screen: 'Parent', params: { screen: 'Child', params: {...} } }
export type NestedScreenParams = {
  screen: string;
  params?: NestedScreenParams | Record<string, any>;
} & Record<string, any>; // allow extra parent-level params

const isNestedScreenParams = (v: unknown): v is NestedScreenParams =>
  !!v && typeof v === 'object' && 'screen' in (v as any);

// Build nested route for reset() from {screen, params} recursively
const buildFromScreenObj = (obj: NestedScreenParams): any => {
  const {screen, params} = obj;
  if (isNestedScreenParams(params)) {
    return {
      name: screen,
      state: {index: 0, routes: [buildFromScreenObj(params)]},
    };
  }
  return {name: screen, params};
};

// Build nested route for reset() from "Parent/Child/Deeper" path
const buildFromSegments = (
  segments: string[],
  leafParams?: Record<string, any>,
): any => {
  const [head, ...rest] = segments;
  if (!head) return undefined;
  if (rest.length === 0) return {name: head, params: leafParams};
  return {
    name: head,
    state: {index: 0, routes: [buildFromSegments(rest, leafParams)]},
  };
};

/**
 * Reset the navigation state and navigate.
 *
 * Supports:
 *  - Single route: resetAndNavigate('Home', { foo: 1 })
 *  - Parent + screen object: resetAndNavigate('Main', { screen: 'MoodSelect', params: { id: 3 } })
 *  - Slash path: resetAndNavigate('Main/MoodSelect', { id: 3 })
 */
export function resetAndNavigate(
  routeName: string,
  params?: Record<string, any> | NestedScreenParams,
): void {
  if (!navigationRef.isReady()) return;

  // Object style: { screen, params } (supports deep nesting)
  if (params && isNestedScreenParams(params)) {
    const {screen, params: childParams, ...parentParams} = params;

    const childRoute = buildFromScreenObj({screen, params: childParams});

    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: routeName,
            ...(Object.keys(parentParams).length > 0
              ? {params: parentParams}
              : {}),
            state: {index: 0, routes: [childRoute]},
          },
        ],
      }),
    );
    return;
  }

  // Slash path: "Parent/Child[/Deeper]"
  if (routeName.includes('/')) {
    const segments = routeName.split('/').filter(Boolean);
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          buildFromSegments(
            segments,
            params as Record<string, any> | undefined,
          ),
        ],
      }),
    );
    return;
  }

  // Single route
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name: routeName, params}],
    }),
  );
}

export async function goBack() {
  navigationRef.isReady();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.goBack());
  }
}

export async function push(routeName: string, params?: object) {
  navigationRef.isReady();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(routeName, params));
  }
}

export async function prepareNavigation() {
  navigationRef.isReady();
}
