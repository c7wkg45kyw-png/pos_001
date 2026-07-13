const sessionTokenKey = "qms.session.token";
const sessionUserKey = "qms.session.user";
const sessionProfileKey = "qms.session.profile";
const sessionRoleIdKey = "qms.session.roleId";
const sessionPermissionsKey = "qms.session.permissions";
const sessionThemeKey = "qms.session.theme";
const sessionMenuConfigKey = "qms.session.menuConfig";
const sessionCompanyConfigKey = "qms.session.companyConfig";

export function clearSessionStorage() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(sessionTokenKey);
  window.localStorage.removeItem(sessionUserKey);
  window.localStorage.removeItem(sessionProfileKey);
  window.localStorage.removeItem(sessionRoleIdKey);
  window.localStorage.removeItem(sessionPermissionsKey);
  window.localStorage.removeItem(sessionThemeKey);
  window.localStorage.removeItem(sessionMenuConfigKey);
  window.localStorage.removeItem(sessionCompanyConfigKey);
}

export function handleUnauthorizedResponse() {
  if (typeof window === "undefined") {
    return;
  }
  clearSessionStorage();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}
