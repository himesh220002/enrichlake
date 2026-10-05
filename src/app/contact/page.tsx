'use client';

import { useState } from 'react';
import LegalShell, { LegalH } from '@/components/site/LegalShell';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General feedback');
  const [message, setMessage] = useState('');

  const mailto = `mailto:hello@enricher.example?subject=${encodeURIComponent(
    `[Enricher contact] ${topic} — ${name || 'website visitor'}`,
  )}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`;

  return (
    <LegalShell
      eyebrow="Contact us"
      title="Tell us what you're researching."
      intro="Feedback, bug reports, feature requests and partnership ideas — this form opens your mail app with everything pre-filled."
    >
      <LegalH>Send a message</LegalH>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = mailto;
        }}
        className="cf-card space-y-4 p-5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="text-xs font-bold text-[#1b2b4d]">
              Your name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Researcher"
              className="mt-1.5 w-full rounded-xl border border-[#d5e1fb] bg-[#f6f9ff] px-3.5 py-2.5 text-sm text-[#0b1b3f] placeholder-[#9aa7c2] focus:border-[#1f5bff] focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-xs font-bold text-[#1b2b4d]">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-1.5 w-full rounded-xl border border-[#d5e1fb] bg-[#f6f9ff] px-3.5 py-2.5 text-sm text-[#0b1b3f] placeholder-[#9aa7c2] focus:border-[#1f5bff] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="contact-topic" className="text-xs font-bold text-[#1b2b4d]">
            Topic
          </label>
          <select
            id="contact-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[#d5e1fb] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1b2b4d] focus:border-[#1f5bff] focus:outline-none"
          >
            {['General feedback', 'Bug report', 'Feature request', 'Data correction', 'Partnership'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contact-message" className="text-xs font-bold text-[#1b2b4d]">
            Message
          </label>
          <textarea
            id="contact-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What were you researching, and what happened?"
            className="mt-1.5 w-full resize-none rounded-xl border border-[#d5e1fb] bg-[#f6f9ff] px-3.5 py-2.5 text-sm text-[#0b1b3f] placeholder-[#9aa7c2] focus:border-[#1f5bff] focus:bg-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f5bff] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1749d6] sm:w-auto sm:px-8"
        >
          Open mail app to send
        </button>
      </form>
      <p className="text-sm text-[#8a97b3]">
        Prefer direct email? Write to <span className="font-mono font-semibold">hello@enricher.example</span> —
        replace with the real support address before launch.
      </p>
    </LegalShell>
  );
}
