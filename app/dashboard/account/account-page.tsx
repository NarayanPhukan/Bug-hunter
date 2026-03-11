// app/dashboard/account/page.tsx
import { auth }    from "@/auth";
import { redirect } from "next/navigation";
import Image       from "next/image";
import Link        from "next/link";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Account Settings</h1>
        <p className="text-text3 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-bg2 border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-text mb-5">Profile</h2>
        <div className="flex items-start gap-5">
          {user.image ? (
            <Image
              src={user.image} alt="Avatar"
              width={64} height={64}
              className="rounded-2xl border border-border2 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo/20 border border-indigo/30 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo2 text-xl font-bold font-display">
                {(user.name || "U")[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-xs font-semibold text-text3 uppercase tracking-wider block mb-1.5">
                Display name
              </label>
              <div className="input-base opacity-60 cursor-not-allowed">
                {user.name || "—"}
              </div>
              <p className="text-[11px] text-text3 mt-1">Synced from your GitHub profile</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-text3 uppercase tracking-wider block mb-1.5">
                Email address
              </label>
              <div className="input-base opacity-60 cursor-not-allowed">
                {user.email || "—"}
              </div>
              <p className="text-[11px] text-text3 mt-1">Synced from your GitHub profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected account */}
      <div className="bg-bg2 border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-text mb-5">Connected accounts</h2>
        <div className="flex items-center justify-between p-4 bg-bg3 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-bg4 border border-border2 flex items-center justify-center">
              <svg className="w-4 h-4 text-text" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-text">GitHub</div>
              <div className="text-xs text-text3">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-green font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" />
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-bg2 border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-text mb-1">Notifications</h2>
        <p className="text-text3 text-xs mb-5">Control when BugHunter alerts you</p>

        <div className="space-y-4">
          {[
            { label: "Critical commits",   desc: "Alert me when a CRITICAL risk commit is detected",     enabled: true,  plan: null    },
            { label: "High risk commits",  desc: "Alert me when a HIGH risk commit is detected",          enabled: false, plan: null    },
            { label: "Weekly digest",      desc: "Summary email every Monday with your risk trends",      enabled: false, plan: "pro"   },
            { label: "Slack notifications",desc: "Send alerts to a Slack channel",                        enabled: false, plan: "pro"   },
          ].map(n => (
            <div key={n.label} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-text">{n.label}</span>
                  {n.plan && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${n.plan === "pro" ? "badge-pro" : "badge-team"}`}>
                      {n.plan.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text3">{n.desc}</p>
              </div>
              {n.plan ? (
                <Link
                  href="/dashboard/billing"
                  className="text-xs text-indigo2 hover:underline flex-shrink-0 mt-0.5"
                >
                  Upgrade
                </Link>
              ) : (
                <button
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                    n.enabled ? "bg-indigo" : "bg-bg4 border border-border2"
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    n.enabled ? "translate-x-5" : ""
                  }`} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-bg2 border border-red/20 rounded-2xl p-6">
        <h2 className="font-semibold text-red mb-1">Danger zone</h2>
        <p className="text-text3 text-xs mb-5">These actions are irreversible</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text">Delete all data</div>
              <div className="text-xs text-text3">Remove all your repos, commits, and analysis history</div>
            </div>
            <button className="text-xs font-semibold border border-red/30 text-red hover:bg-red/10 px-4 py-2 rounded-lg transition-colors">
              Delete data
            </button>
          </div>
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text">Delete account</div>
              <div className="text-xs text-text3">Permanently delete your account and cancel any subscription</div>
            </div>
            <button className="text-xs font-semibold border border-red/30 text-red hover:bg-red/10 px-4 py-2 rounded-lg transition-colors">
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
