'use client';

import { useState } from 'react';
import type { MarketingResult } from '@/lib/types';

interface Props { result: MarketingResult; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-xs px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-pink-600 text-[#94a3b8] hover:text-white transition-colors font-medium">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">{label}</span>
        <CopyButton text={text} />
      </div>
      <div className="rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4">
        <pre className="text-sm text-[#e2e8f0] whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
      </div>
    </div>
  );
}

export default function MarketingPanel({ result }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (k: string) => setOpen(open === k ? null : k);

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#111827] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e293b]">
        <h3 className="font-bold text-white">Marketing Output</h3>
        <p className="text-xs text-[#94a3b8]">{result.mode} · {new Date(result.completedAt).toLocaleTimeString()}</p>
      </div>
      <div className="p-5 space-y-4">

        {result.content && (<>
          <Block label="LinkedIn Post" text={result.content.linkedinPost} />
          <Block label="Email Newsletter" text={result.content.emailNewsletter} />
          <Block label="Twitter Thread" text={result.content.twitterThread} />
          <Block label="Ad Copy" text={result.content.adCopy} />
        </>)}

        {result.campaign && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4 space-y-2">
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Objective</p>
              <p className="text-sm text-white">{result.campaign.objective}</p>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mt-3">Target Audience</p>
              <p className="text-sm text-[#e2e8f0]">{result.campaign.targetAudience}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Messaging Hierarchy</p>
              {result.campaign.messagingHierarchy.map((m, i) => (
                <div key={i} className="flex gap-3 mb-2">
                  <span className="w-5 h-5 rounded-full bg-pink-900/50 text-pink-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                  <p className="text-sm text-[#e2e8f0]">{m}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Channel Strategy</p>
              {result.campaign.channels.map((ch, i) => (
                <button key={i} onClick={() => toggle(`ch-${i}`)} className="w-full text-left rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4 mb-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{ch.channel}</span>
                    <span className="text-xs text-pink-400">{ch.weeklyBudgetPercent}% budget</span>
                  </div>
                  {open === `ch-${i}` && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-[#94a3b8]">{ch.rationale}</p>
                      <ul className="space-y-1">{ch.tactics.map((t, j) => <li key={j} className="text-xs text-[#e2e8f0] flex gap-2"><span className="text-pink-500">→</span>{t}</li>)}</ul>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">30-Day Sequence</p>
              {result.campaign.thirtyDaySequence.map(week => (
                <button key={week.week} onClick={() => toggle(`w-${week.week}`)} className="w-full text-left rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4 mb-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">Week {week.week}: {week.theme}</span>
                    <span className="text-xs text-[#94a3b8]">{open === `w-${week.week}` ? '▲' : '▼'}</span>
                  </div>
                  {open === `w-${week.week}` && (
                    <div className="mt-3 space-y-3">
                      <div><p className="text-xs text-[#94a3b8] font-semibold mb-1">Activities</p>{week.activities.map((a,i) => <p key={i} className="text-xs text-[#e2e8f0]">• {a}</p>)}</div>
                      <div><p className="text-xs text-[#94a3b8] font-semibold mb-1">KPIs</p>{week.kpis.map((k,i) => <p key={i} className="text-xs text-pink-300">→ {k}</p>)}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {result.seo && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Keyword Opportunities ({result.seo.keywords.length})</p>
              {result.seo.keywords.map((kw, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1e293b] last:border-0">
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${kw.difficulty === 'low' ? 'bg-emerald-900/50 text-emerald-400' : kw.difficulty === 'medium' ? 'bg-amber-900/50 text-amber-400' : 'bg-red-900/50 text-red-400'}`}>{kw.difficulty}</span>
                  <div><p className="text-sm font-medium text-white">{kw.keyword}</p><p className="text-xs text-[#94a3b8]">{kw.opportunity}</p></div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Content Gaps</p>
              {result.seo.contentGaps.map((gap, i) => (
                <div key={i} className="flex gap-2 py-1.5"><span className="text-pink-500 shrink-0">→</span><p className="text-sm text-[#e2e8f0]">{gap}</p></div>
              ))}
            </div>
            <div className="rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4 space-y-2">
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">SEO Article Outline</p>
              <p className="text-base font-bold text-white">{result.seo.outline.title}</p>
              <p className="text-xs text-[#94a3b8]">{result.seo.outline.metaDescription}</p>
              <div className="mt-3 space-y-2">
                {result.seo.outline.sections.map((s, i) => (
                  <div key={i}><p className="text-sm font-semibold text-indigo-300 mb-1">{s.h2}</p>{s.keyPoints.map((kp,j) => <p key={j} className="text-xs text-[#94a3b8] ml-3">• {kp}</p>)}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {result.personalization && (<>
          <Block label="LinkedIn Post" text={result.personalization.linkedinPost} />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Cold Email</span>
              <CopyButton text={`Subject: ${result.personalization.coldEmail.subject}\n\n${result.personalization.coldEmail.body}`} />
            </div>
            <div className="rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4">
              <p className="text-xs text-[#94a3b8] mb-2">Subject: {result.personalization.coldEmail.subject}</p>
              <pre className="text-sm text-[#e2e8f0] whitespace-pre-wrap font-sans">{result.personalization.coldEmail.body}</pre>
            </div>
          </div>
          <Block label="Ad Copy" text={result.personalization.adCopy} />
          {result.personalization.personalizationRationale && (
            <div className="rounded-xl bg-indigo-950/30 border border-indigo-900/50 p-4">
              <p className="text-xs font-semibold text-indigo-400 mb-1">Personalization rationale</p>
              <p className="text-xs text-[#94a3b8]">{result.personalization.personalizationRationale}</p>
            </div>
          )}
        </>)}

        {result.analytics && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${
              result.analytics.overallHealth === 'strong' ? 'border-emerald-800 bg-emerald-950/30'
              : result.analytics.overallHealth === 'average' ? 'border-amber-800 bg-amber-950/30'
              : 'border-red-800 bg-red-950/30'
            }`}>
              <p className={`font-bold text-sm capitalize ${
                result.analytics.overallHealth === 'strong' ? 'text-emerald-400'
                : result.analytics.overallHealth === 'average' ? 'text-amber-400' : 'text-red-400'
              }`}>Campaign Health: {result.analytics.overallHealth}</p>
              <p className="text-sm text-[#e2e8f0] mt-1">{result.analytics.summary}</p>
            </div>
            {result.analytics.whatIsWorking.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">What&apos;s Working</p>
                {result.analytics.whatIsWorking.map((item, i) => (
                  <div key={i} className="rounded-lg bg-[#0a0e1a] border border-emerald-900/30 p-3 mb-2">
                    <p className="text-sm font-medium text-white">{item.finding}</p>
                    <p className="text-xs text-[#94a3b8] mt-1">{item.evidence}</p>
                  </div>
                ))}
              </div>
            )}
            {result.analytics.whatIsFailing.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">What&apos;s Failing</p>
                {result.analytics.whatIsFailing.map((item, i) => (
                  <div key={i} className="rounded-lg bg-[#0a0e1a] border border-red-900/30 p-3 mb-2">
                    <p className="text-sm font-medium text-white">{item.finding}</p>
                    <p className="text-xs text-[#94a3b8] mt-1">{item.evidence}</p>
                  </div>
                ))}
              </div>
            )}
            {result.analytics.nextActions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Highest-ROI Next Actions</p>
                {result.analytics.nextActions.map((action, i) => (
                  <div key={i} className="rounded-lg bg-[#0a0e1a] border border-[#1e293b] p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        action.priority === 'high' ? 'bg-red-900/50 text-red-400'
                        : action.priority === 'medium' ? 'bg-amber-900/50 text-amber-400'
                        : 'bg-[#1e293b] text-[#94a3b8]'
                      }`}>{action.priority}</span>
                      <span className="text-xs text-[#94a3b8]">effort: {action.effort}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{action.action}</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Expected: {action.expectedImpact}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
