import { buildApiUrl, logApiRequest } from "@/services/http";
import { handleUnauthorizedResponse } from "@/services/session";

export type PermissionAction = "create" | "update" | "delete";
export type PermissionModule =
  | "quotations"
  | "products"
  | "approvals"
  | "profile"
  | "pos"
  | "sales"
  | "purchase_order"
  | "inventory"
  | "customers"
  | "crm"
  | "accounts"
  | "applicants"
  | "human_resources"
  | "settings";
export type RoleBackendProfile = "sales" | "admin" | "manager" | "finance";

export type PermissionMatrix = Record<PermissionModule, Record<PermissionAction, boolean>>;

export type ManagedRole = {
  id: string;
  name: string;
  backendProfile: RoleBackendProfile;
  permissions: PermissionMatrix;
};

export type ManagedUser = {
  id: string;
  name: string;
  username: string;
  password: string;
  roleId: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type PermissionApi = {
  module_name: string;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
};

type RoleApi = {
  id: string;
  role_name: string;
  backend_profile: string;
  permissions: PermissionApi[];
};

type UserApi = {
  id: string;
  username: string;
  password: string;
  display_name: string;
  role_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

const sessionRoleIdKey = "qms.session.roleId";
const sessionPermissionsKey = "qms.session.permissions";

const moduleKeys: PermissionModule[] = [
  "quotations",
  "products",
  "approvals",
  "profile",
  "pos",
  "sales",
  "purchase_order",
  "inventory",
  "customers",
  "crm",
  "accounts",
  "applicants",
  "human_resources",
  "settings"
];
const actionKeys: PermissionAction[] = ["create", "update", "delete"];
const availableProfiles: RoleBackendProfile[] = ["sales", "manager", "admin", "finance"];

const zeroPermissions: PermissionMatrix = {
  quotations: { create: false, update: false, delete: false },
  products: { create: false, update: false, delete: false },
  approvals: { create: false, update: false, delete: false },
  profile: { create: false, update: false, delete: false },
  pos: { create: false, update: false, delete: false },
  sales: { create: false, update: false, delete: false },
  purchase_order: { create: false, update: false, delete: false },
  inventory: { create: false, update: false, delete: false },
  customers: { create: false, update: false, delete: false },
  crm: { create: false, update: false, delete: false },
  accounts: { create: false, update: false, delete: false },
  applicants: { create: false, update: false, delete: false },
  human_resources: { create: false, update: false, delete: false },
  settings: { create: false, update: false, delete: false }
};

function requestHeaders(token?: string, init?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init ?? {})
  };
}

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const url = buildApiUrl(path);
  const method = init?.method ?? "GET";
  const startedAt = Date.now();
  logApiRequest(method, url);
  const response = await fetch(url, {
    ...init,
    headers: requestHeaders(token, init?.headers)
  });
  logApiRequest(method, url, response.status, Date.now() - startedAt);
  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorizedResponse();
      throw new Error("Session expired. Please login again.");
    }
    let detail = "";
    try {
      const payload = (await response.json()) as { message?: string };
      detail = payload.message ? `: ${payload.message}` : "";
    } catch {
      detail = "";
    }
    throw new Error(`Request failed: ${response.status}${detail}`);
  }
  return (await response.json()) as T;
}

function normalizeModulePermissions(
  defaults: Record<PermissionAction, boolean>,
  source?: Partial<Record<PermissionAction, boolean>>
): Record<PermissionAction, boolean> {
  return {
    create: source?.create ?? defaults.create,
    update: source?.update ?? defaults.update,
    delete: source?.delete ?? defaults.delete
  };
}

function normalizePermissions(source?: Partial<PermissionMatrix> | PermissionMatrix): PermissionMatrix {
  return {
    quotations: normalizeModulePermissions(zeroPermissions.quotations, source?.quotations),
    products: normalizeModulePermissions(zeroPermissions.products, source?.products),
    approvals: normalizeModulePermissions(zeroPermissions.approvals, source?.approvals),
    profile: normalizeModulePermissions(zeroPermissions.profile, source?.profile),
    pos: normalizeModulePermissions(zeroPermissions.pos, source?.pos),
    sales: normalizeModulePermissions(zeroPermissions.sales, source?.sales),
    purchase_order: normalizeModulePermissions(zeroPermissions.purchase_order, source?.purchase_order),
    inventory: normalizeModulePermissions(zeroPermissions.inventory, source?.inventory),
    customers: normalizeModulePermissions(zeroPermissions.customers, source?.customers),
    crm: normalizeModulePermissions(zeroPermissions.crm, source?.crm),
    accounts: normalizeModulePermissions(zeroPermissions.accounts, source?.accounts),
    applicants: normalizeModulePermissions(zeroPermissions.applicants, source?.applicants),
    human_resources: normalizeModulePermissions(zeroPermissions.human_resources, source?.human_resources),
    settings: normalizeModulePermissions(zeroPermissions.settings, source?.settings)
  };
}

export function defaultPermissions(): PermissionMatrix {
  return normalizePermissions(zeroPermissions);
}

export function fullPermissions(): PermissionMatrix {
  return normalizePermissions({
    quotations: { create: true, update: true, delete: true },
    products: { create: true, update: true, delete: true },
    approvals: { create: true, update: true, delete: true },
    profile: { create: true, update: true, delete: true },
    pos: { create: true, update: true, delete: true },
    sales: { create: true, update: true, delete: true },
    purchase_order: { create: true, update: true, delete: true },
    inventory: { create: true, update: true, delete: true },
    customers: { create: true, update: true, delete: true },
    crm: { create: true, update: true, delete: true },
    accounts: { create: true, update: true, delete: true },
    applicants: { create: true, update: true, delete: true },
    human_resources: { create: true, update: true, delete: true },
    settings: { create: true, update: true, delete: true }
  });
}

function mapRole(role: RoleApi): ManagedRole {
  if (role.backend_profile === "admin") {
    return {
      id: role.id,
      name: role.role_name,
      backendProfile: "admin",
      permissions: fullPermissions()
    };
  }
  const permissions = emptyPermissions();
  for (const permission of role.permissions ?? []) {
    const moduleName = permission.module_name as PermissionModule;
    if (!moduleKeys.includes(moduleName)) {
      continue;
    }
    permissions[moduleName] = {
      create: permission.can_create,
      update: permission.can_update,
      delete: permission.can_delete
    };
  }
  return {
    id: role.id,
    name: role.role_name,
    backendProfile: availableProfiles.includes(role.backend_profile as RoleBackendProfile)
      ? (role.backend_profile as RoleBackendProfile)
      : "sales",
    permissions: normalizePermissions(permissions)
  };
}

function mapUser(user: UserApi): ManagedUser {
  return {
    id: user.id,
    name: user.display_name,
    username: user.username,
    password: user.password,
    roleId: user.role_id,
    status: user.status || "active",
    createdAt: user.created_at ?? "",
    updatedAt: user.updated_at ?? ""
  };
}

function permissionsToPayload(permissions: PermissionMatrix): PermissionApi[] {
  return moduleKeys.map((moduleName) => ({
    module_name: moduleName,
    can_create: permissions[moduleName].create,
    can_update: permissions[moduleName].update,
    can_delete: permissions[moduleName].delete
  }));
}

export function getCurrentRoleId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(sessionRoleIdKey) ?? "";
}

export function setCurrentRoleId(roleId: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(sessionRoleIdKey, roleId);
  }
}

export function clearCurrentRoleId() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(sessionRoleIdKey);
    window.localStorage.removeItem(sessionPermissionsKey);
  }
}

export function setSessionPermissions(permissions: PermissionMatrix) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(sessionPermissionsKey, JSON.stringify(normalizePermissions(permissions)));
  }
}

export function applyProfilePermissions(profile: RoleBackendProfile | "") {
  if (profile === "admin") {
    setSessionPermissions(fullPermissions());
  }
}

export function getPermissions(): PermissionMatrix {
  if (typeof window === "undefined") {
    return defaultPermissions();
  }
  const raw = window.localStorage.getItem(sessionPermissionsKey);
  if (!raw) {
    return defaultPermissions();
  }
  try {
    return normalizePermissions(JSON.parse(raw) as PermissionMatrix);
  } catch {
    return defaultPermissions();
  }
}

export async function listRoles(token: string): Promise<ManagedRole[]> {
  const response = await request<ApiResponse<RoleApi[]>>("/admin/roles", undefined, token);
  return response.data.map(mapRole);
}

export async function listUsers(token: string): Promise<ManagedUser[]> {
  const response = await request<ApiResponse<UserApi[]>>("/admin/users", undefined, token);
  return response.data.map(mapUser);
}

export async function getRoleById(roleId: string, token: string): Promise<ManagedRole | undefined> {
  const roles = await listRoles(token);
  return roles.find((role) => role.id === roleId);
}

export async function createRole(
  input: { name: string; backendProfile: RoleBackendProfile; permissions: PermissionMatrix },
  token: string
): Promise<ManagedRole> {
  const response = await request<ApiResponse<RoleApi>>(
    "/admin/roles",
    {
      method: "POST",
      body: JSON.stringify({
        role_name: input.name.trim(),
        backend_profile: input.backendProfile,
        permissions: permissionsToPayload(normalizePermissions(input.permissions))
      })
    },
    token
  );
  return mapRole(response.data);
}

export async function updateRole(role: ManagedRole, token: string): Promise<ManagedRole> {
  const response = await request<ApiResponse<RoleApi>>(
    `/admin/roles/${role.id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        role_name: role.name.trim(),
        backend_profile: role.backendProfile,
        permissions: permissionsToPayload(normalizePermissions(role.permissions))
      })
    },
    token
  );
  return mapRole(response.data);
}

export async function deleteRole(roleId: string, token: string): Promise<{ success: boolean; message: string }> {
  const response = await request<ApiResponse<null>>(
    `/admin/roles/${roleId}`,
    {
      method: "DELETE"
    },
    token
  );
  return { success: response.success, message: response.message };
}

export async function createUser(
  input: { name: string; username: string; password: string; roleId: string; status?: string },
  token: string
): Promise<ManagedUser> {
  const response = await request<ApiResponse<UserApi>>(
    "/admin/users",
    {
      method: "POST",
      body: JSON.stringify({
        display_name: input.name.trim(),
        username: input.username.trim().toLowerCase(),
        password: input.password,
        role_id: input.roleId,
        status: input.status ?? "active"
      })
    },
    token
  );
  return mapUser(response.data);
}

export async function updateUser(user: ManagedUser, token: string): Promise<ManagedUser> {
  const response = await request<ApiResponse<UserApi>>(
    `/admin/users/${user.id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        display_name: user.name.trim(),
        username: user.username.trim().toLowerCase(),
        password: user.password,
        role_id: user.roleId,
        status: user.status || "active"
      })
    },
    token
  );
  return mapUser(response.data);
}

export async function deleteUser(userId: string, token: string): Promise<{ success: boolean; message: string }> {
  const response = await request<ApiResponse<null>>(
    `/admin/users/${userId}`,
    {
      method: "DELETE"
    },
    token
  );
  return { success: response.success, message: response.message };
}

export function permissionSummary(matrix: PermissionMatrix, module: PermissionModule): string {
  return actionKeys
    .map((action) => (matrix[module][action] ? action.slice(0, 1).toUpperCase() : "-"))
    .join("/");
}

export function emptyPermissions(): PermissionMatrix {
  return normalizePermissions(zeroPermissions);
}

export function permissionModules(): Array<{ key: PermissionModule; label: string }> {
  return [
    { key: "profile", label: "Profile" },
    { key: "pos", label: "POS" },
    { key: "sales", label: "Sales" },
    { key: "purchase_order", label: "Purchase Order" },
    { key: "inventory", label: "Inventory" },
    { key: "customers", label: "Customers" },
    { key: "crm", label: "CRM" },
    { key: "accounts", label: "Accounts" },
    { key: "applicants", label: "Applicants" },
    { key: "human_resources", label: "Human Resources" },
    { key: "settings", label: "Settings" }
  ];
}

export function permissionActions(): PermissionAction[] {
  return [...actionKeys];
}

export function backendProfiles(): RoleBackendProfile[] {
  return [...availableProfiles];
}
