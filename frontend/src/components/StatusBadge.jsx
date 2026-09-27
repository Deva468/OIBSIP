function StatusBadge({ status }) {
  return (
    <span className="status-badge">
      {status || "UNKNOWN"}
    </span>
  );
}

export default StatusBadge;