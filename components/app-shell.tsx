"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getMenuConfig, getSessionMenuConfig, getSessionProfile, getSessionToken, getSessionUser, logout } from "@/services/api";

type NavItem = {
  href: string;
  label: string;
  activeKey: string;
  exactMatch?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

function NavIcon({ kind }: { kind: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (kind) {
    case "pos":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M5 6h14v12H5z" />
          <path {...common} d="M8 10h4M8 14h8M15 10h1" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="12" cy="8" r="3.5" />
          <path {...common} d="M5 20a7 7 0 0 1 14 0" />
          <path {...common} d="M17 6h3M18.5 4.5v3" />
        </svg>
      );
    case "sales":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 19h16M7 16V9m5 7V5m5 11v-6" />
        </svg>
      );
    case "purchase-order":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M7 5h10l2 3v11H5V8l2-3Z" />
          <path {...common} d="M9 10h6M9 14h6" />
        </svg>
      );
    case "skus":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
          <path {...common} d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </svg>
      );
    case "price-tiers":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M7 7h10M7 12h7M7 17h4" />
          <path {...common} d="M17 5l2 2-2 2M19 15l-2 2 2 2" />
        </svg>
      );
    case "customers":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
          <circle {...common} cx="9.5" cy="7" r="3" />
          <path {...common} d="M17 11a3 3 0 1 0 0-6M21 19v-1a4 4 0 0 0-3-3.87" />
        </svg>
      );
    case "crm":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 6h16v12H4z" />
          <path {...common} d="M8 10h8M8 14h5" />
          <circle {...common} cx="17.5" cy="16.5" r="2.5" />
        </svg>
      );
    case "accounts":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="12" cy="8" r="3.5" />
          <path {...common} d="M5 20a7 7 0 0 1 14 0" />
          <path {...common} d="M19 6h2M20 5v2" />
        </svg>
      );
    case "applicants":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect {...common} x="4" y="4" width="16" height="16" rx="2" />
          <path {...common} d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case "human-resources":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M5 20v-9l7-4 7 4v9" />
          <path {...common} d="M9 20v-5h6v5M3 20h18M12 4v3" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="12" cy="12" r="3" />
          <path {...common} d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .16 1.7 1.7 0 0 0-.95 1.54V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-.95-1.54 1.7 1.7 0 0 0-1-.16 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.16-1 1.7 1.7 0 0 0-1.54-.95H2.8a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.54-.95 1.7 1.7 0 0 0 .16-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.16 1.7 1.7 0 0 0 .95-1.54V2.8a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 .95 1.54 1.7 1.7 0 0 0 1 .16 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.1.32.16.66.16 1s-.06.68-.16 1Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

const navGroups: NavGroup[] = [
  {
    id: "profile",
    label: "Profile",
    items: [
      { href: "/profile", label: "Profile", activeKey: "/profile" }
    ]
  },
  {
    id: "pos",
    label: "POS",
    items: [
      { href: "/pos-dashboard", label: "POS Dashboard", activeKey: "/pos-dashboard" },
      { href: "/pos-terminal", label: "Sale Terminal", activeKey: "/pos-terminal" },
      { href: "/pos-shifts", label: "Shift / Drawer Management", activeKey: "/pos-shifts" },
      { href: "/pos-orders", label: "POS Orders / Receipts", activeKey: "/pos-orders" }
    ]
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { href: "/", label: "Quotations Dashboard", activeKey: "/" },
      { href: "/quotations", label: "Quotations", activeKey: "/quotations" },
      { href: "/payment-methods", label: "Payment Method", activeKey: "/payment-methods" },
      { href: "/terms", label: "Terms", activeKey: "/terms" },
      { href: "/approvals", label: "Approvals", activeKey: "/approvals" },
      { href: "/sale-orders", label: "Sale Orders", activeKey: "/sale-orders" }
    ]
  },
  {
    id: "purchase-order",
    label: "Purchase Order",
    items: [
      { href: "/purchase-orders-dashboard", label: "Purchase Orders Dashboard", activeKey: "/purchase-orders-dashboard" },
      { href: "/purchase-requisitions", label: "Purchase Requisitions", activeKey: "/purchase-requisitions" },
      { href: "/purchase-approvals", label: "Approvals", activeKey: "/purchase-approvals" },
      { href: "/purchase-orders", label: "Purchase Orders", activeKey: "/purchase-orders" },
      { href: "/goods-receipts", label: "Goods Receipts", activeKey: "/goods-receipts" },
      { href: "/invoicing-payments", label: "Invoicing & Payment", activeKey: "/invoicing-payments" },
      { href: "/suppliers", label: "Suppliers", activeKey: "/suppliers" },
      { href: "/delivery-terms", label: "Delivery Terms", activeKey: "/delivery-terms" }
    ]
  },
  {
    id: "skus",
    label: "SKUs",
    items: [
      { href: "/sku-dashboard", label: "SKUs Dashboard", activeKey: "/sku-dashboard" },
      { href: "/products", label: "Products", activeKey: "/products" },
      { href: "/categories", label: "Categories", activeKey: "/categories" },
      { href: "/materials", label: "Materials", activeKey: "/materials" },
      { href: "/colors", label: "Colors", activeKey: "/colors" }
    ]
  },
  {
    id: "price-tiers",
    label: "Price Tiers",
    items: [
      { href: "/price-tiers-dashboard", label: "Price Tiers Dashboard", activeKey: "/price-tiers-dashboard" },
      { href: "/price-tiers", label: "Price Tiers", activeKey: "/price-tiers" },
      { href: "/product-price-tiers", label: "Product Price Tiers", activeKey: "/product-price-tiers" }
    ]
  },
  {
    id: "customers",
    label: "Customer Registration",
    items: [
      { href: "/customers-dashboard", label: "Customers Dashboard", activeKey: "/customers-dashboard" },
      { href: "/customers", label: "Customers", activeKey: "/customers", exactMatch: true },
      { href: "/customers/contacts", label: "Contacts", activeKey: "/customers/contacts" },
      { href: "/customers/enterprise", label: "Enterprise", activeKey: "/customers/enterprise" }
    ]
  },
  {
    id: "crm",
    label: "Customer Relationship",
    items: [
      { href: "/crm-dashboard", label: "Dashboard & Overview", activeKey: "/crm-dashboard" },
      { href: "/crm-customers", label: "Members Management", activeKey: "/crm-customers" },
      { href: "/crm-loyalties", label: "Loyalties Management", activeKey: "/crm-loyalties" },
      { href: "/crm-rewards", label: "Rewards Management", activeKey: "/crm-rewards" },
      { href: "/crm-coupons", label: "Coupons Management", activeKey: "/crm-coupons" },
      { href: "/crm-earning-rules", label: "Point Management", activeKey: "/crm-earning-rules" },
      { href: "/crm-segments", label: "Segments", activeKey: "/crm-segments" },
      { href: "/crm-sales-pipeline", label: "Sales & Pipeline", activeKey: "/crm-sales-pipeline" },
      { href: "/crm-marketing-automation", label: "Promotion Management", activeKey: "/crm-marketing-automation" }
    ]
  },
  {
    id: "accounts",
    label: "Accounts",
    items: [
      { href: "/accounts-dashboard", label: "Account Dashboard", activeKey: "/accounts-dashboard" },
      { href: "/accounts", label: "Accounts", activeKey: "/accounts", exactMatch: true },
      { href: "/accounts/permissions", label: "Permission", activeKey: "/accounts/permissions" }
    ]
  },
  {
    id: "applicants",
    label: "Applicants",
    items: [
      { href: "/applicants-dashboard", label: "Applicants Dashboard", activeKey: "/applicants-dashboard" },
      { href: "/job-listings", label: "Job Listings", activeKey: "/job-listings" },
      { href: "/applicants", label: "Applicants", activeKey: "/applicants" },
      { href: "/interviews", label: "Interviews", activeKey: "/interviews" },
      { href: "/assessments", label: "Assessments", activeKey: "/assessments" },
      { href: "/offers", label: "Offers", activeKey: "/offers" },
      { href: "/tests", label: "Tests Repository", activeKey: "/tests" }
    ]
  },
  {
    id: "human-resources",
    label: "Human Resources",
    items: [
      { href: "/hr-dashboard", label: "HR Dashboard", activeKey: "/hr-dashboard" },
      { href: "/hris-repository", label: "HRIS Repository", activeKey: "/hris-repository" },
      { href: "/time-attendance", label: "Time & Attendance", activeKey: "/time-attendance" },
      { href: "/payroll", label: "Payroll", activeKey: "/payroll" },
      { href: "/performance-management", label: "Performance Management", activeKey: "/performance-management" },
      { href: "/training-development", label: "Training & Development", activeKey: "/training-development" }
    ]
  },
  {
    id: "settings",
    label: "Settings",
    items: [
      { href: "/settings/preview", label: "Quotation Layout", activeKey: "/settings/preview" },
      { href: "/settings/bill-layout", label: "Bill Layout", activeKey: "/settings/bill-layout" },
      { href: "/settings/inventory", label: "Inventory", activeKey: "/settings/inventory" },
      { href: "/settings/theme", label: "Theme", activeKey: "/settings/theme" },
      { href: "/settings/layout", label: "Layout", activeKey: "/settings/layout" },
      { href: "/settings/clear-data", label: "Clear Data", activeKey: "/settings/clear-data" }
    ]
  }
];

const posWorkspaceRoutes = new Set([
  "/pos-dashboard",
  "/pos-terminal",
  "/pos-shifts",
  "/pos-orders",
  "/sku-dashboard",
  "/products",
  "/categories",
  "/materials",
  "/colors",
  "/price-tiers-dashboard",
  "/price-tiers",
  "/product-price-tiers",
  "/settings/theme",
  "/settings/layout"
]);

const posWorkspaceNavGroups = navGroups
  .map((group) => ({
    ...group,
    items: group.items.filter((item) => posWorkspaceRoutes.has(item.href))
  }))
  .filter((group) => group.items.length > 0);

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/profile": {
    title: "Profile",
    subtitle: "Review merchant context, current user information, and session-level workspace details."
  },
  "/pos-dashboard": {
    title: "POS Dashboard",
    subtitle: "Monitor daily POS health, payment mix, active terminals, and store-level sales momentum."
  },
  "/pos-terminal": {
    title: "Sale Terminal",
    subtitle: "High-throughput checkout for barcode scanning, walk-in sales, and auto ERP processing."
  },
  "/pos-shifts": {
    title: "Shift / Drawer Management",
    subtitle: "Monitor cashier shifts, drawer state, and opening or closing routines."
  },
  "/pos-orders": {
    title: "POS Orders / Receipts",
    subtitle: "Review POS receipts, ERP links, and cashier-side transaction history."
  },
  "/": {
    title: "Quotation Dashboard",
    subtitle: "Monitor quotation activity, revenue trends, and team performance."
  },
  "/quotations": {
    title: "Quotations",
    subtitle: "Create, revise, submit, and track quotations."
  },
  "/quotations/new": {
    title: "New Quotations",
    subtitle: "Prepare customer details, validity, terms, and item list."
  },
  "/payment-methods": {
    title: "Payment Method",
    subtitle: "Manage payment method options for quotations."
  },
  "/terms": {
    title: "Terms",
    subtitle: "Manage quotation term options."
  },
  "/approvals": {
    title: "Approvals",
    subtitle: "Review submitted quotations and record decisions."
  },
  "/sale-orders": {
    title: "Sale Orders",
    subtitle: "Convert approved quotations into executable orders for operations and finance."
  },
  "/purchase-orders-dashboard": {
    title: "Purchase Orders Dashboard",
    subtitle: "Track purchase order activity, pending work, and supplier-side operations."
  },
  "/purchase-requisitions": {
    title: "Purchase Requisitions",
    subtitle: "Prepare and review internal requests before issuing purchase orders."
  },
  "/purchase-requisitions/details": {
    title: "Purchase Requisition Details",
    subtitle: "Review the complete request header, budget, and item breakdown."
  },
  "/purchase-approvals": {
    title: "Purchase Approvals",
    subtitle: "Review requisitions and purchasing decisions waiting for approval."
  },
  "/purchase-orders": {
    title: "Purchase Orders",
    subtitle: "Manage supplier orders, order status, and downstream receiving flow."
  },
  "/goods-receipts": {
    title: "Goods Receipts",
    subtitle: "Capture received items and reconcile incoming stock against purchase orders."
  },
  "/goods-receipts/details": {
    title: "Goods Receipt Details",
    subtitle: "Review receipt quantities, draft progress, and posting information."
  },
  "/invoicing-payments": {
    title: "Invoicing & Payment",
    subtitle: "Follow invoice matching, payment status, and purchasing settlement."
  },
  "/suppliers": {
    title: "Suppliers",
    subtitle: "Maintain supplier master data, contact details, and payment information."
  },
  "/delivery-terms": {
    title: "Delivery Terms",
    subtitle: "Manage delivery responsibility rules used across supplier and purchasing flow."
  },
  "/sku-dashboard": {
    title: "SKUs Dashboard",
    subtitle: "Track SKU coverage and product master data activity."
  },
  "/products": {
    title: "Products",
    subtitle: "Manage SKU records, pricing context, and product details."
  },
  "/categories": {
    title: "Categories",
    subtitle: "Maintain SKU categories used across products."
  },
  "/materials": {
    title: "Materials",
    subtitle: "Maintain material master data for products."
  },
  "/colors": {
    title: "Colors",
    subtitle: "Maintain color master data for products."
  },
  "/price-tiers-dashboard": {
    title: "Price Tiers Dashboard",
    subtitle: "Review tier usage and product pricing coverage."
  },
  "/price-tiers": {
    title: "Price Tiers",
    subtitle: "Manage reusable pricing tiers before linking them to products."
  },
  "/product-price-tiers": {
    title: "Product Price Tiers",
    subtitle: "Manage tier-based pricing assigned to each product."
  },
  "/customers-dashboard": {
    title: "Customers Dashboard",
    subtitle: "Track customer activity, ownership, and top accounts."
  },
  "/customers": {
    title: "Customers",
    subtitle: "Manage customer records, account codes, and ownership."
  },
  "/customers/contacts": {
    title: "Contacts",
    subtitle: "Review individual customer contacts and their relationship details."
  },
  "/customers/enterprise": {
    title: "Enterprise",
    subtitle: "Manage company customer records, linked contacts, and enterprise details."
  },
  "/crm-dashboard": {
    title: "Dashboard & Overview",
    subtitle: "Executive CRM view for sales momentum, activity visibility, and customer engagement."
  },
  "/crm-customers": {
    title: "Member Management",
    subtitle: "Manage the shared member registry and open member benefits without leaving the list."
  },
  "/crm-segments": {
    title: "Segments",
    subtitle: "Review reusable audience rules and segment members in a dedicated workspace."
  },
  "/crm-sales-pipeline": {
    title: "Sales & Pipeline",
    subtitle: "Track opportunities, sales quotes, and commercial order progress."
  },
  "/crm-marketing-automation": {
    title: "Promotion Management",
    subtitle: "Coordinate promotion workflows, loyalty offers, and list-based campaign planning."
  },
  "/crm-loyalties": {
    title: "Loyalties Management",
    subtitle: "Manage loyalty tiers, spending thresholds, and member lifecycle rules."
  },
  "/crm-loyalties/[id]": {
    title: "Loyalty Details",
    subtitle: "Update one loyalty tier, its members, and connected benefits."
  },
  "/crm-rewards": {
    title: "Rewards Management",
    subtitle: "Manage reward inventory, point cost, stock, and ownership visibility."
  },
  "/crm-coupons": {
    title: "Coupons Management",
    subtitle: "Manage coupon pools, value rules, loyalty targeting, and expiry."
  },
  "/crm-earning-rules": {
    title: "Point Management",
    subtitle: "Manage earning logic, trigger rules, and tier-specific reward formulas."
  },
  "/crm-support": {
    title: "Customer Service / Support",
    subtitle: "Manage tickets, customer help content, and feedback collection."
  },
  "/crm-reports-analytics": {
    title: "Reports & Analytics",
    subtitle: "Review sales outcomes, customer trends, and team performance signals."
  },
  "/accounts-dashboard": {
    title: "Account Dashboard",
    subtitle: "Review account activity and access administration."
  },
  "/accounts": {
    title: "Accounts",
    subtitle: "Manage user accounts and operational access."
  },
  "/accounts/permissions": {
    title: "Permission",
    subtitle: "Configure permissions for users and roles."
  },
  "/applicants-dashboard": {
    title: "Applicants Dashboard",
    subtitle: "Overview for applicant pipeline and recruiting activity."
  },
  "/job-listings": {
    title: "Job Listings",
    subtitle: "Manage open positions and recruiting posts."
  },
  "/job-listings/new": {
    title: "New Job Listing",
    subtitle: "Create a draft or publish a recruiting position."
  },
  "/job-listings/[id]": {
    title: "Job Listing Details",
    subtitle: "Review position details, applicants, and recruiting activity."
  },
  "/applicants": {
    title: "Applicants",
    subtitle: "Track candidate profiles and application progress."
  },
  "/applicants/new": {
    title: "New Applicant",
    subtitle: "Create a candidate profile and submit it to the hiring pipeline."
  },
  "/interviews": {
    title: "Interviews",
    subtitle: "Organize interview schedules and status updates."
  },
  "/assessments": {
    title: "Assessments",
    subtitle: "Prepare and review candidate assessments."
  },
  "/offers": {
    title: "Offers",
    subtitle: "Prepare offer stages and follow-up actions."
  },
  "/tests": {
    title: "Tests Repository",
    subtitle: "Manage reusable assessment templates and question banks."
  },
  "/tests/[id]": {
    title: "Test Details",
    subtitle: "Review test setup and manage question details."
  },
  "/hr-dashboard": {
    title: "HR Dashboard",
    subtitle: "Track workforce metrics, operations, and upcoming HR activities."
  },
  "/hris-repository": {
    title: "HRIS Repository",
    subtitle: "Organize employee master data and core HR records."
  },
  "/time-attendance": {
    title: "Time & Attendance",
    subtitle: "Monitor attendance, shifts, and timekeeping activity."
  },
  "/payroll": {
    title: "Payroll",
    subtitle: "Review payroll cycles, compensation records, and payout readiness."
  },
  "/performance-management": {
    title: "Performance Management",
    subtitle: "Track review cycles, goals, and development conversations."
  },
  "/training-development": {
    title: "Training & Development",
    subtitle: "Manage learning plans, training progress, and team growth."
  },
  "/settings/preview": {
    title: "Quotation Layout",
    subtitle: "Configure the quotation preview layout."
  },
  "/settings/bill-layout": {
    title: "Bill Layout",
    subtitle: "Adjust Sale Terminal receipt sizing and print placement."
  },
  "/settings/inventory": {
    title: "Inventory",
    subtitle: "Review stock-related settings and inventory control preferences."
  },
  "/settings/theme": {
    title: "Theme",
    subtitle: "Select and manage workspace themes."
  },
  "/settings/layout": {
    title: "Layout",
    subtitle: "Select the workspace layout density used across POS001 screens."
  },
  "/settings/clear-data": {
    title: "Clear Data",
    subtitle: "Clear master data and transaction data from controlled maintenance tools."
  }
};

export function AppShell({
  active,
  children,
  headerActions
}: {
  active: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}) {
  const router = useRouter();
  function isActiveRoute(route: string) {
    return active === route || active.startsWith(`${route}/`);
  }
  function isNavItemActive(item: NavItem) {
    if (item.exactMatch) {
      return active === item.activeKey;
    }
    return isActiveRoute(item.activeKey);
  }
  const [displayName, setDisplayName] = useState("");
  const [profile, setProfile] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [menuConfig, setMenuConfig] = useState<Awaited<ReturnType<typeof getSessionMenuConfig>>>([]);
  const [menuConfigResolved, setMenuConfigResolved] = useState(false);
  const visibleNavGroups = useMemo(() => {
    if (menuConfig.length === 0) {
      return posWorkspaceNavGroups;
    }
    const visibleGroupIds = new Set(menuConfig.filter((group) => group.visible).map((group) => group.id));
    return posWorkspaceNavGroups
      .map((group) => {
        const configGroup = menuConfig.find((item) => item.id === group.id);
        if (configGroup && !visibleGroupIds.has(group.id)) {
          return null;
        }
        return group;
      })
      .filter((group): group is NavGroup => group !== null);
  }, [menuConfig]);
  const [openGroupIds, setOpenGroupIds] = useState<string[]>([]);
  const activeGroup = visibleNavGroups.find((group) => group.items.some((item) => isNavItemActive(item)));
  const activeItem = activeGroup?.items.find((item) => isNavItemActive(item));
  const hasMenuAccess = visibleNavGroups.some((group) => group.items.some((item) => isNavItemActive(item)));
  const fallbackHref = visibleNavGroups[0]?.items[0]?.href ?? "/";
  const activeMeta = pageMeta[active] ?? {
    title: activeItem?.label || "Workspace",
    subtitle: activeGroup ? `${activeGroup.label} workspace` : "Workspace"
  };

  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setDisplayName(getSessionUser());
    setProfile(getSessionProfile());
    const currentMenu = getSessionMenuConfig();
    if (currentMenu.length > 0) {
      setMenuConfig(currentMenu);
      setMenuConfigResolved(true);
      return;
    }
    void getMenuConfig(token)
      .then((items) => {
        setMenuConfig(items);
        setMenuConfigResolved(true);
      })
      .catch(() => {
        setMenuConfig([]);
        setMenuConfigResolved(true);
      });
  }, [router]);

  useEffect(() => {
    const currentGroupId = visibleNavGroups.find((group) => group.items.some((item) => isNavItemActive(item)))?.id;
    if (!currentGroupId) {
      return;
    }
    setOpenGroupIds((current) => (current.includes(currentGroupId) ? current : [...current, currentGroupId]));
  }, [active, visibleNavGroups]);

  useEffect(() => {
    if (!menuConfigResolved) {
      return;
    }
    if (menuConfig.length === 0) {
      return;
    }
    if (hasMenuAccess) {
      return;
    }
    if (active !== fallbackHref) {
      router.replace(fallbackHref);
    }
  }, [active, fallbackHref, hasMenuAccess, menuConfig, menuConfigResolved, router]);

  function toggleGroup(groupId: string) {
    setOpenGroupIds((current) =>
      current.includes(groupId) ? current.filter((item) => item !== groupId) : [...current, groupId]
    );
  }

  return (
    <div className={`shell${isSidebarCollapsed ? " shell-collapsed" : ""}`}>
      <header className="shell-brandbar">
        <div className="brand">
          <div>
            <div style={{ fontWeight: 700 }}>POS001</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>POS Workspace</div>
          </div>
        </div>
      </header>
      <div className="shell-topcard">
        <header className="shell-searchbar">
          <label className="shell-search-input" aria-label="Workspace search">
            <input type="text" placeholder="Search" />
          </label>
        </header>
        <div className="shell-topspacer" aria-hidden="true" />
        <header className="shell-topactions">
          <div className="profile-chip">
            <div className="profile-summary">
              <strong>{displayName || "Signed in"}</strong>
            </div>
            <div className="profile-avatar" aria-hidden="true">
              {(displayName || "S").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
      </div>
      <header className="shell-profilebar">
        <div className="profilebar-title">
          <h1>{activeMeta.title}</h1>
          <p>{activeMeta.subtitle}</p>
        </div>
        {headerActions ? <div className="shell-profilebar-actions">{headerActions}</div> : null}
      </header>
      <aside className="sidebar">
        <div className="nav-header">
          <button
            className="nav-header-brand"
            type="button"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? "Open side menu" : "Close side menu"}
            title={isSidebarCollapsed ? "Open side menu" : "Close side menu"}
          >
            <span className="nav-header-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {isSidebarCollapsed ? (
                  <path
                    d="M9 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M15 6l-6 6 6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </span>
            <span className="nav-header-label">Navigation</span>
          </button>
        </div>
        <nav className="nav">
          {visibleNavGroups.map((group) => {
            const isOpen = openGroupIds.includes(group.id);
            return (
              <div className="nav-group" key={group.id}>
                <button
                  className="nav-group-toggle"
                  type="button"
                  data-open={isOpen ? "true" : "false"}
                  onClick={() => toggleGroup(group.id)}
                  aria-label={group.label}
                  title={group.label}
                >
                  <span className="nav-group-label-wrap">
                    <span className="nav-group-icon">
                      <NavIcon kind={group.id} />
                    </span>
                    <span className="nav-group-label">{group.label}</span>
                  </span>
                  <span className="nav-group-chevron">{isOpen ? "-" : "+"}</span>
                </button>
                {isOpen && !isSidebarCollapsed ? (
                  <div className="nav-group-items">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href} data-active={isNavItemActive(item) ? "true" : "false"}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="icon-button" type="button" onClick={logout} aria-label="Logout" title="Logout">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M14 7V5a2 2 0 0 0-2-2H5A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 12h11M18 8l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </aside>
      <main className="main">
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
