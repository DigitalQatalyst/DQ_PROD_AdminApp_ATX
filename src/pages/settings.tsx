import React from "react";

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            User Settings
          </h2>
          <p className="text-muted-foreground">
            Settings functionality will be implemented in future updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
