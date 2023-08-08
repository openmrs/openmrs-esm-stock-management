import React from "react";
export const UnknownError = ({ error }: { error: any | null }) => {
  return (
    <div className="stkpg-page">
      <div className="stkpg-page-header">
        <h1 className="stkpg-page-title">500</h1>
        <h3 className={`stkpg-page-subtitle`}>Internal server error</h3>
      </div>
      <div className="stkpg-page-body">
        <h3>
          The application encountered something unexpected that didn't allow it
          to complete the request.
        </h3>
        {error != null && process.env.NODE_ENV === "development" && (
          <h4>{error}</h4>
        )}
        <button
          className="btn btn-primary"
          onClick={(e) => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};
