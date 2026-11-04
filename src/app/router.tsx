import { createBrowserRouter, Navigate } from "react-router-dom"

import { RootLayout } from "@/app/root-layout"
import { AuthGuard } from "@/features/auth/screens/auth-guard"
import { LoginScreen } from "@/features/auth/screens/login-screen"
import { PublicOnlyRoute } from "@/features/auth/screens/public-only-route"
import { BillingScreen } from "@/features/billing/screens/billing-screen"
import { DemoRequestsScreen } from "@/features/demo-requests/screens/demo-requests-screen"
import { InvitationsScreen } from "@/features/invitations/screens/invitations-screen"
import { BackofficeLayout } from "@/features/layout/screens/backoffice-layout"
import { OrganizationDetailScreen } from "@/features/organizations/screens/organization-detail-screen"
import { OrganizationsScreen } from "@/features/organizations/screens/organizations-screen"
import { ProfilesScreen } from "@/features/profiles/screens/profiles-screen"
import { ProjectDetailScreen } from "@/features/projects/screens/project-detail-screen"
import { ProjectsScreen } from "@/features/projects/screens/projects-screen"

export const appRouter = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [{ path: "/login", element: <LoginScreen /> }],
      },
      {
        element: <AuthGuard />,
        children: [
          {
            element: <BackofficeLayout />,
            children: [
              { path: "/", element: <Navigate replace to="/organizations" /> },
              { path: "/organizations", element: <OrganizationsScreen /> },
              {
                path: "/organizations/:organizationId",
                element: <OrganizationDetailScreen />,
              },
              { path: "/profiles", element: <ProfilesScreen /> },
              { path: "/invitations", element: <InvitationsScreen /> },
              { path: "/projects", element: <ProjectsScreen /> },
              {
                path: "/projects/:workspaceId",
                element: <ProjectDetailScreen />,
              },
              { path: "/billing", element: <BillingScreen /> },
              { path: "/demo-requests", element: <DemoRequestsScreen /> },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate replace to="/organizations" /> },
    ],
  },
])
