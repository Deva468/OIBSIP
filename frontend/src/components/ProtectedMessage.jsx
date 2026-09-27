function ProtectedMessage({
  title = "Access Denied",
  message = "You do not have permission to access this page.",
}) {
  return (
    <div className="page-container">
      <div className="empty-state">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default ProtectedMessage;