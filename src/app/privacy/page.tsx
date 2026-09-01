import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-4xl font-black tracking-tight">Privacy</h1>
      <div className="mt-6 space-y-4 leading-7 text-slate-700">
        <p>This is a local planning tool. It does not create user accounts and does not sell personal data.</p>
        <p>Saved trips and checklists stay in this browser&apos;s local storage. Clearing site data deletes them.</p>
        <p>Optional location permission is used only to sort nearby destinations. Coordinates are not stored on a server.</p>
        <p>Weather and official map lookups are requested through this app&apos;s own API routes. No advertising or analytics pixels are included.</p>
        <p>Error messages may be written to the server console to diagnose failed weather or GIS lookups. They are not tied to an identity.</p>
      </div>
    </div>
  );
}
