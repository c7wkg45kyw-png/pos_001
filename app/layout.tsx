import "./globals.css";
import "./procurement-master-data.css";
import "./settings/settings.css";
import "./pos-dashboard/pos-dashboard.css";
import "./pos-terminal/pos-terminal.css";
import "./pos-orders/pos-orders.css";
import "./pos-shifts/pos-shifts.css";
import { AppFeedback } from "@/components/app-feedback";
import { ThemeBootstrap } from "@/components/theme-bootstrap";

export const metadata = {
  title: "POS001",
  description: "POS workspace for dashboard, terminal, SKU, price tiers, and theme settings."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeBootstrap />
        <AppFeedback />
        {children}
      </body>
    </html>
  );
}
