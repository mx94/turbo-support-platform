import { type ReactElement } from "react";
import { AdminLayout } from "../../components/admin-layout";

export default function Layout({ children }: { children: React.ReactNode }): ReactElement {
  return <AdminLayout>{children}</AdminLayout>;
}
