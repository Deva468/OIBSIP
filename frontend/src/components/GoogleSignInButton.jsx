import {
  useEffect,
  useRef,
  useState,
} from "react";

const GOOGLE_SCRIPT_ID =
  "google-identity-services";

const GoogleSignInButton = ({
  onCredential,
  disabled = false,
}) => {
  const buttonRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const [buttonError, setButtonError] =
    useState("");

  onCredentialRef.current = onCredential;

  useEffect(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setButtonError(
        "Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend environment."
      );
      return undefined;
    }

    let disposed = false;

    const renderGoogleButton = () => {
      const googleIdentity =
        window.google?.accounts?.id;

      if (
        disposed ||
        !buttonRef.current ||
        !googleIdentity
      ) {
        return;
      }

      googleIdentity.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onCredentialRef.current?.(
              response.credential
            );
          } else {
            setButtonError(
              "Google did not return a sign-in credential. Please try again."
            );
          }
        },
      });

      buttonRef.current.replaceChildren();
      googleIdentity.renderButton(
        buttonRef.current,
        {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rect",
          logo_alignment: "left",
          width: Math.min(
            buttonRef.current.clientWidth || 360,
            400
          ),
        }
      );
    };

    const handleScriptError = () => {
      setButtonError(
        "Google sign-in could not load. Check your connection and try again."
      );
    };

    let script = document.getElementById(
      GOOGLE_SCRIPT_ID
    );

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.id = GOOGLE_SCRIPT_ID;
        script.src =
          "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener(
        "load",
        renderGoogleButton
      );
      script.addEventListener(
        "error",
        handleScriptError
      );
    }

    return () => {
      disposed = true;
      script?.removeEventListener(
        "load",
        renderGoogleButton
      );
      script?.removeEventListener(
        "error",
        handleScriptError
      );
      buttonRef.current?.replaceChildren();
    };
  }, []);

  return (
    <div
      className="google-auth-button"
      aria-busy={disabled}
    >
      <div ref={buttonRef} />
      {buttonError && (
        <p className="google-auth-error" role="status">
          {buttonError}
        </p>
      )}
    </div>
  );
};

export default GoogleSignInButton;