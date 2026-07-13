"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { defaultA4PreviewLayout, getA4PreviewLayout, saveA4PreviewLayout, type A4PreviewLayout } from "@/services/a4-preview";
import { getPreviewLayoutConfig, getSessionProfile, getSessionUser, requireSessionToken, savePreviewLayoutConfig } from "@/services/api";
import {
  backendProfiles,
  createRole,
  createUser,
  deleteRole,
  deleteUser,
  emptyPermissions,
  listRoles,
  listUsers,
  permissionActions,
  permissionModules,
  permissionSummary,
  updateRole,
  updateUser,
  type ManagedRole,
  type ManagedUser,
  type PermissionAction,
  type PermissionMatrix,
  type PermissionModule,
  type RoleBackendProfile
} from "@/services/permissions";

type RoleFormState = {
  id?: string;
  name: string;
  backendProfile: RoleBackendProfile;
  permissions: PermissionMatrix;
};

type UserFormState = {
  id?: string;
  name: string;
  username: string;
  password: string;
  roleId: string;
};

const modules = permissionModules();
const actions = permissionActions();
const profiles = backendProfiles();

function clonePermissions(matrix: PermissionMatrix): PermissionMatrix {
  return modules.reduce<PermissionMatrix>((accumulator, module) => {
    accumulator[module.key] = { ...matrix[module.key] };
    return accumulator;
  }, emptyPermissions());
}

function initialRoleForm(): RoleFormState {
  return {
    name: "",
    backendProfile: "sales",
    permissions: emptyPermissions()
  };
}

function initialUserForm(roleId = ""): UserFormState {
  return {
    name: "",
    username: "",
    password: "",
    roleId
  };
}

export function SettingsContent({ section }: { section: "accounts" | "permissions" | "preview" }) {
  const [profile, setProfile] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [token, setToken] = useState("");
  const [roles, setRoles] = useState<ManagedRole[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [message, setMessage] = useState(
    section === "accounts"
      ? "Manage user accounts and their assigned access roles."
      : section === "permissions"
      ? "Manage roles, menu permissions, and user access."
      : "Adjust the quotation layout for A4 quotation output."
  );
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [a4Layout, setA4Layout] = useState<A4PreviewLayout>(defaultA4PreviewLayout());
  const [draftA4Layout, setDraftA4Layout] = useState<A4PreviewLayout>(defaultA4PreviewLayout());
  const [roleForm, setRoleForm] = useState<RoleFormState>(initialRoleForm());
  const [userForm, setUserForm] = useState<UserFormState>(initialUserForm());
  const canManagePermissions = profile === "admin" || profile === "manager";

  useEffect(() => {
    async function load() {
      try {
        const nextToken = requireSessionToken();
        setToken(nextToken);
        setProfile(getSessionProfile());
        setDisplayName(getSessionUser());
        const nextLayoutConfig = await getPreviewLayoutConfig(nextToken);
        const nextLayout = {
          sellerFontSize: nextLayoutConfig.sellerFontSize,
          buyerFontSize: nextLayoutConfig.buyerFontSize,
          metaFontSize: nextLayoutConfig.metaFontSize,
          metaPanelWidth: nextLayoutConfig.metaPanelWidth,
          termsFontSize: nextLayoutConfig.termsFontSize,
          tableWidth: nextLayoutConfig.tableWidth,
          headerGap: nextLayoutConfig.headerGap,
          metaGap: nextLayoutConfig.metaGap,
          termsTop: nextLayoutConfig.termsTop
        };
        setA4Layout(nextLayout);
        setDraftA4Layout(nextLayout);
        saveA4PreviewLayout(nextLayout);
        const [nextRoles, nextUsers] = await Promise.all([listRoles(nextToken), listUsers(nextToken)]);
        setRoles(nextRoles);
        setUsers(nextUsers);
        setMessage(
          section === "accounts"
            ? "User accounts loaded from backend."
            : section === "permissions"
            ? "Roles and users loaded from backend."
            : "Quotation layout loaded from local settings."
        );
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load settings.");
      }
    }
    void load();
  }, [section]);

  const roleNames = useMemo(
    () => Object.fromEntries(roles.map((role) => [role.id, role.name])),
    [roles]
  );
  const roleProfiles = useMemo(
    () => Object.fromEntries(roles.map((role) => [role.id, role.backendProfile])),
    [roles]
  );

  async function refresh() {
    if (!token) {
      return;
    }
    const [nextRoles, nextUsers] = await Promise.all([listRoles(token), listUsers(token)]);
    setRoles(nextRoles);
    setUsers(nextUsers);
  }

  function openNewRoleModal() {
    setRoleForm(initialRoleForm());
    setRoleModalOpen(true);
  }

  function openEditRoleModal(role: ManagedRole) {
    setRoleForm({
      id: role.id,
      name: role.name,
      backendProfile: role.backendProfile,
      permissions: clonePermissions(role.permissions)
    });
    setRoleModalOpen(true);
  }

  function openNewUserModal() {
    const defaultRoleId = roles[0]?.id ?? "";
    setUserForm(initialUserForm(defaultRoleId));
    setUserModalOpen(true);
  }

  function openEditUserModal(user: ManagedUser) {
    setUserForm({
      id: user.id,
      name: user.name,
      username: user.username,
      password: user.password,
      roleId: user.roleId
    });
    setUserModalOpen(true);
  }

  function toggleRolePermission(module: PermissionModule, action: PermissionAction) {
    setRoleForm((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [module]: {
          ...current.permissions[module],
          [action]: !current.permissions[module][action]
        }
      }
    }));
  }

  async function submitRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = roleForm.name.trim();
    if (!name) {
      setMessage("Role name is required.");
      return;
    }

    try {
      if (roleForm.id) {
        await updateRole({
          id: roleForm.id,
          name,
          backendProfile: roleForm.backendProfile,
          permissions: clonePermissions(roleForm.permissions)
        }, token);
        setMessage(`${name} role updated.`);
      } else {
        await createRole({
          name,
          backendProfile: roleForm.backendProfile,
          permissions: clonePermissions(roleForm.permissions)
        }, token);
        setMessage(`${name} role created.`);
      }

      await refresh();
      setRoleModalOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save role.");
    }
  }

  async function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = userForm.name.trim();
    const username = userForm.username.trim().toLowerCase();
    const password = userForm.password;

    if (!name || !username || !password || !userForm.roleId) {
      setMessage("Name, username, password, and role are required.");
      return;
    }

    const duplicate = users.find((user) => user.username.toLowerCase() === username && user.id !== userForm.id);
    if (duplicate) {
      setMessage("Username already exists.");
      return;
    }

    try {
      if (userForm.id) {
        await updateUser({
          id: userForm.id,
          name,
          username,
          password,
          roleId: userForm.roleId,
          status: "active"
        }, token);
        setMessage(`${name} user updated.`);
        if (displayName === users.find((user) => user.id === userForm.id)?.name) {
          window.localStorage.setItem("qms.session.user", name);
          setDisplayName(name);
        }
      } else {
        await createUser({
          name,
          username,
          password,
          roleId: userForm.roleId,
          status: "active"
        }, token);
        setMessage(`${name} user created.`);
      }

      await refresh();
      setUserModalOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save user.");
    }
  }

  async function removeRole(role: ManagedRole) {
    try {
      const result = await deleteRole(role.id, token);
      setMessage(result.message);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete role.");
    }
  }

  async function removeUser(user: ManagedUser) {
    try {
      const result = await deleteUser(user.id, token);
      setMessage(result.message);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete user.");
    }
  }

  function updateA4Layout<K extends keyof A4PreviewLayout>(key: K, value: A4PreviewLayout[K]) {
    if (!canManagePermissions) {
      return;
    }
    const next = { ...draftA4Layout, [key]: value };
    setDraftA4Layout(next);
      setMessage("Quotation layout has pending changes.");
  }

  async function applyA4Layout() {
    try {
      const saved = await savePreviewLayoutConfig(token, draftA4Layout);
      const nextLayout = {
        sellerFontSize: saved.sellerFontSize,
        buyerFontSize: saved.buyerFontSize,
        metaFontSize: saved.metaFontSize,
        metaPanelWidth: saved.metaPanelWidth,
        termsFontSize: saved.termsFontSize,
        tableWidth: saved.tableWidth,
        headerGap: saved.headerGap,
        metaGap: saved.metaGap,
        termsTop: saved.termsTop
      };
      setA4Layout(nextLayout);
      setDraftA4Layout(nextLayout);
      saveA4PreviewLayout(nextLayout);
      setMessage("Quotation layout applied.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not apply preview layout.");
    }
  }

  const hasPendingA4Changes = JSON.stringify(draftA4Layout) !== JSON.stringify(a4Layout);
  const activeNav = section === "accounts" ? "/accounts" : section === "permissions" ? "/settings/permissions" : "/settings/preview";

  const headerActions =
    canManagePermissions && section === "permissions" ? (
      <button className="button primary" type="button" onClick={openNewRoleModal}>New Role</button>
    ) : canManagePermissions && section === "accounts" ? (
      <button className="button primary" type="button" onClick={openNewUserModal}>New User</button>
    ) : section === "preview" ? (
      <button className="button primary" type="button" onClick={applyA4Layout} disabled={!canManagePermissions || !hasPendingA4Changes}>
        Apply
      </button>
    ) : null;

  return (
    <AppShell active={activeNav} headerActions={headerActions}>
      <div className="topbar">
        <div>
          <h1 className="title">{section === "accounts" ? "Accounts" : section === "permissions" ? "Permissions" : "Quotation Layout"}</h1>
          <p className="subtitle">
            {section === "accounts"
              ? "Create, update, and remove user accounts."
              : section === "permissions"
              ? "Manage roles, menu permissions, and user access."
              : "Adjust the quotation layout for the A4 quotation output."}
          </p>
        </div>
      </div>
      <div className="notice">{message}</div>

      {section === "permissions" ? (
        canManagePermissions ? (
          <section className="section">
            <div className="ranking-header">
              <h2>Roles</h2>
            </div>
            <DataTable
              headers={["Role", "Access Profile", ...modules.map((module) => module.label), "Action"]}
              rows={roles.map((role) => [
                role.name,
                role.backendProfile,
                ...modules.map((module) => permissionSummary(role.permissions, module.key)),
                <div className="row-actions" key={role.id}>
                  <button className="button compact" type="button" onClick={() => openEditRoleModal(role)}>Edit</button>
                  <button className="button compact danger" type="button" onClick={() => removeRole(role)}>Delete</button>
                </div>
              ])}
            />
          </section>
        ) : (
          <section className="section">
            <div className="card restricted-card">
              <h2>Access restricted</h2>
              <p>Only manager and admin accounts can manage permissions.</p>
            </div>
          </section>
        )
      ) : section === "accounts" ? (
        canManagePermissions ? (
          <section className="section">
            <div className="ranking-header">
              <h2>Users</h2>
            </div>
            <DataTable
              headers={["Name", "Username", "Role", "Access Profile", "Action"]}
              rows={users.map((user) => [
                user.name,
                user.username,
                roleNames[user.roleId] ?? "Unknown",
                roleProfiles[user.roleId] ?? "-",
                <div className="row-actions" key={user.id}>
                  <button className="button compact" type="button" onClick={() => openEditUserModal(user)}>Edit</button>
                  <button className="button compact danger" type="button" onClick={() => removeUser(user)}>Delete</button>
                </div>
              ])}
            />
          </section>
        ) : (
          <section className="section">
            <div className="card restricted-card">
              <h2>Access restricted</h2>
              <p>Only manager and admin accounts can manage user accounts.</p>
            </div>
          </section>
        )
      ) : (
        <section className="section">
          <div className="settings-preview-layout">
            <div className="settings-preview-controls">
              <div className="form-grid settings-preview-form">
                <label className="field">
                  <span>Seller Font Size ({draftA4Layout.sellerFontSize})</span>
                  <input type="range" min="10" max="20" value={draftA4Layout.sellerFontSize} onChange={(event) => updateA4Layout("sellerFontSize", Number(event.target.value))} disabled={!canManagePermissions} />
                </label>
                <label className="field">
                  <span>Buyer Font Size ({draftA4Layout.buyerFontSize})</span>
                  <input type="range" min="10" max="20" value={draftA4Layout.buyerFontSize} onChange={(event) => updateA4Layout("buyerFontSize", Number(event.target.value))} disabled={!canManagePermissions} />
                </label>
                <label className="field">
                  <span>Meta Font Size ({draftA4Layout.metaFontSize})</span>
                  <input type="range" min="10" max="18" value={draftA4Layout.metaFontSize} onChange={(event) => updateA4Layout("metaFontSize", Number(event.target.value))} disabled={!canManagePermissions} />
                </label>
                <label className="field">
                  <span>Meta Table Width ({draftA4Layout.metaPanelWidth})</span>
                  <input type="range" min="220" max="360" value={draftA4Layout.metaPanelWidth} onChange={(event) => updateA4Layout("metaPanelWidth", Number(event.target.value))} disabled={!canManagePermissions} />
                </label>
                <label className="field">
                  <span>Terms Font Size ({draftA4Layout.termsFontSize})</span>
                  <input type="range" min="10" max="18" value={draftA4Layout.termsFontSize} onChange={(event) => updateA4Layout("termsFontSize", Number(event.target.value))} disabled={!canManagePermissions} />
                </label>
                <label className="field">
                  <span>Table Width ({draftA4Layout.tableWidth})</span>
                  <input type="range" min="70" max="100" value={draftA4Layout.tableWidth} onChange={(event) => updateA4Layout("tableWidth", Number(event.target.value))} disabled={!canManagePermissions} />
                </label>
                <label className="field">
                  <span>Buyer/Seller Gap ({draftA4Layout.headerGap})</span>
                  <input type="range" min="8" max="40" value={draftA4Layout.headerGap} onChange={(event) => updateA4Layout("headerGap", Number(event.target.value))} disabled={!canManagePermissions} />
                </label>
                <label className="field">
                  <span>Meta Position ({draftA4Layout.metaGap})</span>
                  <input type="range" min="8" max="40" value={draftA4Layout.metaGap} onChange={(event) => updateA4Layout("metaGap", Number(event.target.value))} disabled={!canManagePermissions} />
                </label>
                <label className="field">
                  <span>Terms Position ({draftA4Layout.termsTop})</span>
                  <input type="range" min="8" max="40" value={draftA4Layout.termsTop} onChange={(event) => updateA4Layout("termsTop", Number(event.target.value))} disabled={!canManagePermissions} />
                </label>
              </div>
            </div>
            <article className="print-sheet settings-print-preview">
              <section className="print-header print-header-with-meta" style={{ gap: draftA4Layout.headerGap, marginBottom: draftA4Layout.metaGap }}>
                <div className="print-party-group">
                  <div className="print-party" style={{ fontSize: draftA4Layout.sellerFontSize }}>
                    <h3>Seller</h3>
                    <strong>Quotation MS Co., Ltd.</strong>
                    <p>99 Business Center Road</p>
                  </div>
                  <div className="print-party" style={{ fontSize: draftA4Layout.buyerFontSize }}>
                    <h3>Buyer</h3>
                    <strong>Sample Customer</strong>
                    <p>Sample Address</p>
                  </div>
                </div>
                <div
                  className="print-meta-panel print-meta-panel-compact"
                  style={{ fontSize: draftA4Layout.sellerFontSize, maxWidth: draftA4Layout.metaPanelWidth }}
                >
                  <div className="print-meta-row">
                    <span>Quotation No.</span>
                    <strong>Q-Preview</strong>
                  </div>
                  <div className="print-meta-row">
                    <span>Date</span>
                    <strong>20/06/2026</strong>
                  </div>
                  <div className="print-meta-row">
                    <span>Sales</span>
                    <strong>Sales Manager</strong>
                  </div>
                </div>
              </section>
              <div className="print-table-wrap" style={{ width: `${draftA4Layout.tableWidth}%` }}>
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>SKU</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>total price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>
                        <div className="print-sku">
                          <div className="print-product-thumb">PRD-001</div>
                          <strong>Sample Product</strong>
                          <div>PRD-001</div>
                        </div>
                      </td>
                      <td>
                        <p>Sample description for A4 preview layout.</p>
                      </td>
                      <td>5</td>
                      <td>1,000.00</td>
                      <td>5,000.00</td>
                    </tr>
                    <tr className="print-summary-row">
                      <td className="print-summary-spacer" />
                      <td className="print-summary-spacer" />
                      <td className="print-summary-label">
                        <div>Subtotal before VAT</div>
                        <div>VAT (7%)</div>
                        <div>Net Total</div>
                      </td>
                      <td className="print-summary-spacer" />
                      <td className="print-summary-spacer" />
                      <td className="print-summary-value">
                        <div>5,000.00</div>
                        <div>350.00</div>
                        <div>5,350.00</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <section className="print-terms" style={{ marginTop: draftA4Layout.termsTop, fontSize: draftA4Layout.termsFontSize }}>
                <strong>TERMS</strong>
                <p>Payment due within 30 days after acceptance.</p>
              </section>
            </article>
          </div>
        </section>
      )}

      {section === "permissions" && roleModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal modal-wide" onSubmit={submitRole}>
            <div className="panel-heading">
              <h2>{roleForm.id ? "Edit Role" : "New Role"}</h2>
              <button className="button compact" type="button" onClick={() => setRoleModalOpen(false)}>Close</button>
            </div>
            <div className="form-grid permissions-form-grid">
              <label className="field">
                <span>Role Name</span>
                <input
                  value={roleForm.name}
                  onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Role name"
                  autoFocus
                  required
                />
              </label>
              <label className="field">
                <span>Access Profile</span>
                <select
                  value={roleForm.backendProfile}
                  onChange={(event) => setRoleForm((current) => ({ ...current, backendProfile: event.target.value as RoleBackendProfile }))}
                  required
                >
                  {profiles.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="card permissions-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Menu</th>
                    <th>Create</th>
                    <th>Update</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => (
                    <tr key={module.key}>
                      <td>{module.label}</td>
                      {actions.map((action) => (
                        <td key={`${module.key}-${action}`}>
                          <label className="permission-toggle">
                            <input
                              type="checkbox"
                              checked={roleForm.permissions[module.key][action]}
                              onChange={() => toggleRolePermission(module.key, action)}
                            />
                            <span>{roleForm.permissions[module.key][action] ? "Allowed" : "Blocked"}</span>
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="toolbar">
              <button className="button" type="button" onClick={() => setRoleModalOpen(false)}>Cancel</button>
              <button className="button primary" type="submit">{roleForm.id ? "Update Role" : "Save Role"}</button>
            </div>
          </form>
        </div>
      ) : null}

      {section === "accounts" && userModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={submitUser}>
            <div className="panel-heading">
              <h2>{userForm.id ? "Edit User" : "New User"}</h2>
              <button className="button compact" type="button" onClick={() => setUserModalOpen(false)}>Close</button>
            </div>
            <label className="field">
              <span>Name</span>
              <input
                value={userForm.name}
                onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Full name"
                autoFocus
                required
              />
            </label>
            <label className="field">
              <span>Username</span>
              <input
                value={userForm.username}
                onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="username"
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={userForm.password}
                onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="password"
                required
              />
            </label>
            <label className="field">
              <span>Role</span>
              <select
                value={userForm.roleId}
                onChange={(event) => setUserForm((current) => ({ ...current, roleId: event.target.value }))}
                required
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </label>
            <div className="toolbar">
              <button className="button" type="button" onClick={() => setUserModalOpen(false)}>Cancel</button>
              <button className="button primary" type="submit">{userForm.id ? "Update User" : "Save User"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
