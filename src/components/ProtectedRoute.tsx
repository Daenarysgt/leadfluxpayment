import { withSubscription } from './withSubscription';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedComponent = ({ children }: ProtectedRouteProps) => {
  return <>{children}</>;
};

export const ProtectedRoute = withSubscription(ProtectedComponent); 