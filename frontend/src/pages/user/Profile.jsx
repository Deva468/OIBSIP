import {
  useEffect,
  useState,
} from "react";

import axiosInstance from "../../api/axiosInstance.js";

import {
  useAuth,
} from "../../context/AuthContext.jsx";

const emptyAddress = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const Profile = () => {
  const {
    user,
    updateUser,
  } = useAuth();

  const [editing, setEditing] =
    useState(false);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [addresses, setAddresses] =
    useState([]);

  const [newAddress, setNewAddress] =
    useState(emptyAddress);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    setName(
      user?.name || ""
    );

    setPhone(
      user?.phone || ""
    );

    setAddresses(
      user?.addresses || []
    );
  }, [user]);

  const handlePhoneChange =
    (event) => {
      const value =
        event.target.value.replace(
          /\D/g,
          ""
        );

      if (
        value.length <= 10
      ) {
        setPhone(value);
      }
    };

  const saveProfile =
    async () => {
      try {
        setSaving(true);
        setMessage("");
        setError("");

        if (
          phone &&
          phone.length !== 10
        ) {
          setError(
            "Phone number must contain exactly 10 digits."
          );

          return;
        }

        const response =
          await axiosInstance.patch(
            "/users/profile",
            {
              name:
                name.trim(),

              phone,

              addresses,
            }
          );

        updateUser(
          response.data.data.user
        );

        setEditing(false);

        setMessage(
          "Profile updated successfully."
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Profile update failed."
        );
      } finally {
        setSaving(false);
      }
    };

  const addAddress = () => {
    if (
      !newAddress.fullName.trim() ||
      !newAddress.phone ||
      !newAddress.addressLine.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim() ||
      !newAddress.pincode
    ) {
      setError(
        "Please fill all address details."
      );

      return;
    }

    if (
      !/^\d{10}$/.test(
        newAddress.phone
      )
    ) {
      setError(
        "Address phone must contain exactly 10 digits."
      );

      return;
    }

    if (
      !/^\d{6}$/.test(
        newAddress.pincode
      )
    ) {
      setError(
        "Pincode must contain exactly 6 digits."
      );

      return;
    }

    const address = {
      ...newAddress,
      isDefault:
        addresses.length ===
        0
          ? true
          : newAddress.isDefault,
    };

    let updated =
      [...addresses];

    if (address.isDefault) {
      updated =
        updated.map(
          (item) => ({
            ...item,
            isDefault: false,
          })
        );
    }

    updated.push(address);

    setAddresses(updated);

    setNewAddress(
      emptyAddress
    );

    setError("");

    setMessage(
      "Address added. Save Changes to store it."
    );
  };

  const removeAddress = (
    index
  ) => {
    let updated =
      addresses.filter(
        (_, i) =>
          i !== index
      );

    if (
      updated.length > 0 &&
      !updated.some(
        (item) =>
          item.isDefault
      )
    ) {
      updated[0] = {
        ...updated[0],
        isDefault: true,
      };
    }

    setAddresses(updated);
  };

  return (
    <div className="profile-page">

      <section className="profile-hero">

        <div className="profile-avatar-large">
          👤
        </div>

        <div>
          <span className="profile-welcome">
            MY ACCOUNT
          </span>

          <h1>
            {user?.name ||
              "Pizza Lover"}
          </h1>

          <p>
            {user?.email}
          </p>

          <span className="account-badge">
            Customer
          </span>
        </div>

      </section>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <section className="profile-card-large">

        <div className="profile-section-heading">

          <div>
            <span className="section-label">
              PERSONAL DETAILS
            </span>

            <h2>
              Profile Information
            </h2>
          </div>

          {!editing ? (
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setEditing(true)
              }
            >
              ✏ Edit Profile
            </button>
          ) : (
            <div className="profile-edit-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditing(
                    false
                  );

                  setName(
                    user?.name ||
                      ""
                  );

                  setPhone(
                    user?.phone ||
                      ""
                  );

                  setAddresses(
                    user?.addresses ||
                      []
                  );
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                disabled={saving}
                onClick={
                  saveProfile
                }
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          )}

        </div>

        <div className="profile-info-grid">

          <div className="profile-info-item">
            <span>
              Full Name
            </span>

            {editing ? (
              <input
                className="profile-input"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
              />
            ) : (
              <strong>
                {user?.name ||
                  "-"}
              </strong>
            )}
          </div>

          <div className="profile-info-item">
            <span>
              Email
            </span>

            <strong>
              {user?.email ||
                "-"}
            </strong>
          </div>

          <div className="profile-info-item">
            <span>
              Mobile Number
            </span>

            {editing ? (
              <input
                className="profile-input"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={
                  handlePhoneChange
                }
                placeholder="10 digit mobile number"
              />
            ) : (
              <strong>
                {user?.phone ||
                  "Not added"}
              </strong>
            )}
          </div>

          <div className="profile-info-item">
            <span>
              Account Type
            </span>

            <strong>
              Customer
            </strong>
          </div>

        </div>

      </section>

      <section className="address-section">

        <div className="section-heading-row">

          <div>
            <span className="section-label">
              DELIVERY
            </span>

            <h2>
              Saved Addresses
            </h2>
          </div>

          {!editing && (
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setEditing(true)
              }
            >
              + Add Address
            </button>
          )}

        </div>

        <div className="address-grid">

          {addresses.map(
            (address, index) => (
              <div
                key={
                  address._id ||
                  index
                }
                className="address-card"
              >

                <div className="address-card-top">

                  <strong>
                    📍{" "}
                    {address.label ||
                      "Address"}
                  </strong>

                  {address.isDefault && (
                    <span className="default-badge">
                      Default
                    </span>
                  )}

                </div>

                <h3>
                  {address.fullName}
                </h3>

                <p>
                  {address.addressLine}
                </p>

                <p>
                  {address.city},{" "}
                  {address.state}{" "}
                  -{" "}
                  {address.pincode}
                </p>

                <p>
                  📞{" "}
                  {address.phone}
                </p>

                {editing && (
                  <button
                    type="button"
                    className="remove-address"
                    onClick={() =>
                      removeAddress(
                        index
                      )
                    }
                  >
                    Remove
                  </button>
                )}

              </div>
            )
          )}

          {editing && (
            <div className="address-card add-address-card">

              <h3>
                Add New Address
              </h3>

              <input
                value={
                  newAddress.label
                }
                onChange={(event) =>
                  setNewAddress({
                    ...newAddress,
                    label:
                      event.target.value,
                  })
                }
                placeholder="Home / Work"
              />

              <input
                value={
                  newAddress.fullName
                }
                onChange={(event) =>
                  setNewAddress({
                    ...newAddress,
                    fullName:
                      event.target.value,
                  })
                }
                placeholder="Full name"
              />

              <input
                inputMode="numeric"
                maxLength={10}
                value={
                  newAddress.phone
                }
                onChange={(event) =>
                  setNewAddress({
                    ...newAddress,
                    phone:
                      event.target.value.replace(
                        /\D/g,
                        ""
                      ),
                  })
                }
                placeholder="10 digit mobile number"
              />

              <textarea
                value={
                  newAddress.addressLine
                }
                onChange={(event) =>
                  setNewAddress({
                    ...newAddress,
                    addressLine:
                      event.target.value,
                  })
                }
                placeholder="Door No / Street / Area"
              />

              <div className="address-input-row">

                <input
                  value={
                    newAddress.city
                  }
                  onChange={(event) =>
                    setNewAddress({
                      ...newAddress,
                      city:
                        event.target.value,
                    })
                  }
                  placeholder="City"
                />

                <input
                  value={
                    newAddress.state
                  }
                  onChange={(event) =>
                    setNewAddress({
                      ...newAddress,
                      state:
                        event.target.value,
                    })
                  }
                  placeholder="State"
                />

              </div>

              <input
                inputMode="numeric"
                maxLength={6}
                value={
                  newAddress.pincode
                }
                onChange={(event) =>
                  setNewAddress({
                    ...newAddress,
                    pincode:
                      event.target.value.replace(
                        /\D/g,
                        ""
                      ),
                  })
                }
                placeholder="6 digit pincode"
              />

              <label className="default-address-checkbox">

                <input
                  type="checkbox"
                  checked={
                    newAddress.isDefault
                  }
                  onChange={(event) =>
                    setNewAddress({
                      ...newAddress,
                      isDefault:
                        event.target.checked,
                    })
                  }
                />

                Make default address

              </label>

              <button
                type="button"
                className="primary-button"
                onClick={
                  addAddress
                }
              >
                Add Address
              </button>

            </div>
          )}

        </div>

      </section>

    </div>
  );
};

export default Profile;