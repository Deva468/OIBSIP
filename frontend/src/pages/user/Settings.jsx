import {
  useEffect,
  useState,
} from "react";

import axiosInstance from "../../api/axiosInstance.js";

import {
  useAuth,
} from "../../context/AuthContext.jsx";

const Settings = () => {
  const {
    user,
    updateUser,
  } = useAuth();

  const [
    orderNotifications,
    setOrderNotifications,
  ] = useState(true);

  const [
    offersNotifications,
    setOffersNotifications,
  ] = useState(true);

  const [
    emailNotifications,
    setEmailNotifications,
  ] = useState(true);

  const [
    profileVisible,
    setProfileVisible,
  ] = useState(true);

  const [
    analyticsEnabled,
    setAnalyticsEnabled,
  ] = useState(true);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  useEffect(() => {
    setOrderNotifications(
      user?.preferences
        ?.orderNotifications ??
        true
    );

    setOffersNotifications(
      user?.preferences
        ?.offersNotifications ??
        true
    );

    setEmailNotifications(
      user?.preferences
        ?.emailNotifications ??
        true
    );

    setProfileVisible(
      user?.privacy
        ?.profileVisible ??
        true
    );

    setAnalyticsEnabled(
      user?.privacy
        ?.analyticsEnabled ??
        true
    );
  }, [user]);

  const saveSettings =
    async () => {
      try {
        setSaving(true);
        setMessage("");

        const response =
          await axiosInstance.patch(
            "/users/settings",
            {
              preferences: {
                orderNotifications,
                offersNotifications,
                emailNotifications,
              },

              privacy: {
                profileVisible,
                analyticsEnabled,
              },
            }
          );

        updateUser(
          response.data.data.user
        );

        setMessage(
          "Settings saved successfully."
        );
      } catch (error) {
        setMessage(
          error.response?.data
            ?.message ||
            "Unable to save settings."
        );
      } finally {
        setSaving(false);
      }
    };

  // PREVIOUSLY: notification toggles only updated local state — nothing
  // was saved to the backend until the user separately clicked
  // "Save Preferences" below. This makes the notification switches
  // specifically save immediately the moment they're flipped, which is
  // what "dynamic ah work aganum" (should work dynamically) was asking
  // for — the privacy toggles and password form still use the explicit
  // Save button since those are less frequently changed.
  const [autoSaving, setAutoSaving] = useState(false);

  const updateNotificationPreference = async (key, value) => {
    const previousValues = {
      orderNotifications,
      offersNotifications,
      emailNotifications,
    };

    // Update the UI instantly...
    if (key === "orderNotifications") setOrderNotifications(value);
    if (key === "offersNotifications") setOffersNotifications(value);
    if (key === "emailNotifications") setEmailNotifications(value);

    // ...then persist right away, without waiting for a Save click.
    try {
      setAutoSaving(true);
      setMessage("");

      const response = await axiosInstance.patch("/users/settings", {
        preferences: {
          ...previousValues,
          [key]: value,
        },
      });

      updateUser(response.data.data.user);
      setMessage("Preference updated.");
    } catch (error) {
      // Roll back on failure so the toggle doesn't show a state that
      // wasn't actually saved.
      if (key === "orderNotifications")
        setOrderNotifications(previousValues.orderNotifications);
      if (key === "offersNotifications")
        setOffersNotifications(previousValues.offersNotifications);
      if (key === "emailNotifications")
        setEmailNotifications(previousValues.emailNotifications);

      setMessage(
        error.response?.data?.message ||
          "Unable to update this preference right now."
      );
    } finally {
      setAutoSaving(false);
    }
  };

  const changePassword =
    async () => {
      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        setMessage(
          "Please fill all password fields."
        );

        return;
      }

      if (
        newPassword.length <
        8
      ) {
        setMessage(
          "New password must contain at least 8 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setMessage(
          "New passwords do not match."
        );

        return;
      }

      try {
        setChangingPassword(
          true
        );

        const response =
          await axiosInstance.patch(
            "/users/password",
            {
              currentPassword,
              newPassword,
            }
          );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setMessage(
          response.data.message ||
            "Password changed successfully."
        );
      } catch (error) {
        setMessage(
          error.response?.data
            ?.message ||
            "Unable to change password."
        );
      } finally {
        setChangingPassword(
          false
        );
      }
    };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <span className="section-label">
          ACCOUNT CONTROL
        </span>

        <h1>
          Settings ⚙
        </h1>

        <p>
          Control your notifications,
          privacy and account security.
        </p>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-card">
          <div className="settings-card-heading">
            <span className="section-label">
              NOTIFICATIONS
            </span>

            <h2>
              Stay Updated
            </h2>

            <p>
              Choose which updates you
              want to receive.
            </p>
          </div>

          <div className="setting-row">
            <div className="setting-icon">
              📦
            </div>

            <div className="setting-content">
              <h3>
                Order Updates
              </h3>

              <p>
                Notifications for order status
                changes.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={
                  orderNotifications
                }
                onChange={(
                  event
                ) =>
                  updateNotificationPreference(
                    "orderNotifications",
                    event.target.checked
                  )
                }
              />

              <span className="slider" />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-icon">
              🎁
            </div>

            <div className="setting-content">
              <h3>
                Offers & Promotions
              </h3>

              <p>
                Special deals and pizza offers.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={
                  offersNotifications
                }
                onChange={(
                  event
                ) =>
                  updateNotificationPreference(
                    "offersNotifications",
                    event.target.checked
                  )
                }
              />

              <span className="slider" />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-icon">
              📧
            </div>

            <div className="setting-content">
              <h3>
                Email Notifications
              </h3>

              <p>
                Account and order emails.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={
                  emailNotifications
                }
                onChange={(
                  event
                ) =>
                  updateNotificationPreference(
                    "emailNotifications",
                    event.target.checked
                  )
                }
              />

              <span className="slider" />
            </label>
          </div>

          <button
            type="button"
            className="settings-save-button"
            disabled={saving}
            onClick={
              saveSettings
            }
          >
            {saving
              ? "Saving..."
              : "Save Preferences"}
          </button>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <span className="section-label">
              PRIVACY
            </span>

            <h2>
              Privacy Controls
            </h2>
          </div>

          <div className="setting-row">
            <div className="setting-icon">
              👤
            </div>

            <div className="setting-content">
              <h3>
                Profile Visibility
              </h3>

              <p>
                Control whether your profile
                information is visible.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={
                  profileVisible
                }
                onChange={(
                  event
                ) =>
                  setProfileVisible(
                    event.target
                      .checked
                  )
                }
              />

              <span className="slider" />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-icon">
              📊
            </div>

            <div className="setting-content">
              <h3>
                Analytics
              </h3>

              <p>
                Allow anonymous usage analytics.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={
                  analyticsEnabled
                }
                onChange={(
                  event
                ) =>
                  setAnalyticsEnabled(
                    event.target
                      .checked
                  )
                }
              />

              <span className="slider" />
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <span className="section-label">
              SECURITY
            </span>

            <h2>
              Change Password
            </h2>
          </div>

          <div className="password-form">
            <input
              type="password"
              value={
                currentPassword
              }
              onChange={(
                event
              ) =>
                setCurrentPassword(
                  event.target
                    .value
                )
              }
              placeholder="Current password"
            />

            <input
              type="password"
              value={
                newPassword
              }
              onChange={(
                event
              ) =>
                setNewPassword(
                  event.target
                    .value
                )
              }
              placeholder="New password"
            />

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(
                event
              ) =>
                setConfirmPassword(
                  event.target
                    .value
                )
              }
              placeholder="Confirm new password"
            />

            <button
              type="button"
              className="primary-button"
              disabled={
                changingPassword
              }
              onClick={
                changePassword
              }
            >
              {changingPassword
                ? "Updating..."
                : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;