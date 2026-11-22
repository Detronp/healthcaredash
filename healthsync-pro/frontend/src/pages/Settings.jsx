import React, { useState } from "react";
import { LuUser, LuBell, LuShieldCheck, LuMonitor, LuInfo } from "react-icons/lu";
import { Card, PageHeader, Switch, Avatar, Badge } from "../components/ui.jsx";
import { USER } from "../components/Layout.jsx";

function SettingRow({ title, desc, k, draft, set }) {
  return (
    <div className="setting">
      <div><b>{title}</b><span>{desc}</span></div>
      <Switch checked={!!draft[k]} onChange={(v) => set(k, v)} label={title} />
    </div>
  );
}

export default function Settings({ settings, setSettings, notify }) {
  const [draft, setDraft] = useState(settings);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  return (
    <div className="page">
      <PageHeader crumbs={["Settings"]} title="Settings" description="Personal preferences and workspace configuration (stored only in this browser session)"
        actions={<>
          <button className="btn" disabled={!dirty} onClick={() => setDraft(settings)}>Discard</button>
          <button className="btn primary" disabled={!dirty} onClick={() => { setSettings(draft); notify("Settings saved for this session"); }}>Save changes</button>
        </>} />

      <div className="grid cols-2">
        <Card title={<span style={{ display: "flex", gap: 8, alignItems: "center" }}><LuUser size={16} />Profile</span>}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <Avatar name={USER.name} size="lg" />
            <div><b style={{ fontSize: 16 }}>{USER.name}</b><div className="muted">{USER.role}</div><div className="mono muted">{USER.id} · {USER.email}</div></div>
          </div>
          <div className="kv">
            <div><small>Role</small><span>Administrator</span></div>
            <div><small>Primary unit</small><span>Executive · Clinical Informatics</span></div>
            <div><small>MFA method</small><span>Authenticator app (demo)</span></div>
            <div><small>Last sign-in</small><span>Nov 22, 2026 07:01</span></div>
          </div>
        </Card>

        <Card title={<span style={{ display: "flex", gap: 8, alignItems: "center" }}><LuShieldCheck size={16} />Session & security</span>}>
          <div className="setting">
            <div><b>Automatic session timeout</b><span>Lock the workspace after a period of inactivity</span></div>
            <select className="select" value={draft.timeout} onChange={(e) => set("timeout", Number(e.target.value))} aria-label="Session timeout">
              {[5, 10, 15, 30].map((m) => <option key={m} value={m}>{m} minutes</option>)}
            </select>
          </div>
          <SettingRow draft={draft} set={set} title="Require MFA for exports" desc="Prompt for a second factor before data export (illustrative)" k="mfaExport" />
          <SettingRow draft={draft} set={set} title="Mask MRNs in lists" desc="Show only the last 4 digits of record numbers" k="maskMrn" />
        </Card>

        <Card title={<span style={{ display: "flex", gap: 8, alignItems: "center" }}><LuBell size={16} />Notifications</span>}>
          <SettingRow draft={draft} set={set} title="Critical clinical alerts" desc="Vital-sign and lab critical values" k="notifCritical" />
          <SettingRow draft={draft} set={set} title="Lab results" desc="New results for patients under your care" k="notifLabs" />
          <SettingRow draft={draft} set={set} title="Bed management" desc="Admission, transfer and discharge updates" k="notifBeds" />
          <SettingRow draft={draft} set={set} title="Security notices" desc="Sign-in and access-review reminders" k="notifSecurity" />
        </Card>

        <Card title={<span style={{ display: "flex", gap: 8, alignItems: "center" }}><LuMonitor size={16} />Display</span>}>
          <SettingRow draft={draft} set={set} title="Compact tables" desc="Reduce row height in data tables" k="compact" />
          <SettingRow draft={draft} set={set} title="Reduce motion" desc="Minimize animations and transitions" k="reduceMotion" />
          <div className="setting">
            <div><b>Temperature units</b><span>Used across vital-sign displays</span></div>
            <select className="select" value={draft.units} onChange={(e) => set("units", e.target.value)} aria-label="Temperature units"><option value="C">Celsius (°C)</option><option value="F" disabled>Fahrenheit (coming soon)</option></select>
          </div>
        </Card>
      </div>

      <Card className="mt" title={<span style={{ display: "flex", gap: 8, alignItems: "center" }}><LuInfo size={16} />About this demo</span>}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <Badge tone="teal">HealthSync Pro v1.0.0-demo</Badge><Badge tone="neutral">Static frontend</Badge><Badge tone="neutral">No backend database</Badge><Badge tone="neutral">Fictional data only</Badge>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Smarter Healthcare. Connected Care. Secure Operations. — This build is a non-production demonstration. It does not connect to an EHR,
          store data, or implement real authentication, encryption or audit logging, and it makes no claim of HIPAA compliance.
        </p>
      </Card>
    </div>
  );
}
