import React from "react";
import { AzureLogin } from "../components/AzureLogin";
import { DevLogin } from "../components/DevLogin";

export default function LoginPage() {
  return (
    <div>
      <DevLogin className="mb-6" />
      <AzureLogin />
    </div>
  );
}
