'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    XMarkIcon,
    PaperAirplaneIcon,
    MinusIcon
} from '@heroicons/react/24/outline';

interface ComposeEmailProps {
    accountId: number;
    accountEmail: string;
    onClose: () => void;
    onSent: () => void;
    // Reply/Forward mode
    mode?: 'compose' | 'reply' | 'forward';
    replyToEmail?: {
        id: number;
        from_email: string;
        from_name: string;
        subject: string;
        body_html?: string;
        body_text?: string;
        received_at: string;
    };
}

export default function ComposeEmail({
    accountId,
    accountEmail,
    onClose,
    onSent,
    mode = 'compose',
    replyToEmail
}: ComposeEmailProps) {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [subject, setSubject] = useState('');
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [sending, setSending] = useState(false);
    const [minimized, setMinimized] = useState(false);

    // TipTap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: 'Write your message...',
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
    });

    // Initialize for reply/forward
    useEffect(() => {
        if (replyToEmail && editor) {
            if (mode === 'reply') {
                setTo(replyToEmail.from_email);
                setSubject(`Re: ${replyToEmail.subject.replace(/^Re:\s*/i, '')}`);

                // Add quoted content
                const quotedContent = `
                    <br><br>
                    <div style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 0; color: #666;">
                        <p>On ${new Date(replyToEmail.received_at).toLocaleString()}, ${replyToEmail.from_name} &lt;${replyToEmail.from_email}&gt; wrote:</p>
                        ${replyToEmail.body_html || `<p>${replyToEmail.body_text || ''}</p>`}
                    </div>
                `;
                editor.commands.setContent(quotedContent);
                // Move cursor to beginning
                editor.commands.focus('start');
            } else if (mode === 'forward') {
                setSubject(`Fwd: ${replyToEmail.subject.replace(/^Fwd:\s*/i, '')}`);

                // Add forwarded content
                const forwardedContent = `
                    <br><br>
                    <div style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 0;">
                        <p><strong>---------- Forwarded message ----------</strong></p>
                        <p>From: ${replyToEmail.from_name} &lt;${replyToEmail.from_email}&gt;</p>
                        <p>Date: ${new Date(replyToEmail.received_at).toLocaleString()}</p>
                        <p>Subject: ${replyToEmail.subject}</p>
                        <br>
                        ${replyToEmail.body_html || `<p>${replyToEmail.body_text || ''}</p>`}
                    </div>
                `;
                editor.commands.setContent(forwardedContent);
                editor.commands.focus('start');
            }
        }
    }, [replyToEmail, mode, editor]);

    // Save draft to localStorage
    const saveDraft = useCallback(() => {
        if (!editor) return;

        const draft = {
            to,
            cc,
            bcc,
            subject,
            body: editor.getHTML(),
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(`email_draft_${accountId}`, JSON.stringify(draft));
    }, [to, cc, bcc, subject, editor, accountId]);

    // Auto-save draft every 30 seconds
    useEffect(() => {
        const interval = setInterval(saveDraft, 30000);
        return () => clearInterval(interval);
    }, [saveDraft]);

    // Load draft on mount (only for new compose)
    useEffect(() => {
        if (mode === 'compose') {
            const savedDraft = localStorage.getItem(`email_draft_${accountId}`);
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    // Only load if draft is less than 24 hours old
                    if (new Date().getTime() - new Date(draft.savedAt).getTime() < 24 * 60 * 60 * 1000) {
                        setTo(draft.to || '');
                        setCc(draft.cc || '');
                        setBcc(draft.bcc || '');
                        setSubject(draft.subject || '');
                        if (editor && draft.body) {
                            editor.commands.setContent(draft.body);
                        }
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
    }, [mode, accountId, editor]);

    const handleSend = async () => {
        if (!to.trim()) {
            toast.error('Please enter a recipient');
            return;
        }

        if (!subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        setSending(true);
        try {
            // Parse recipients
            const toList = to.split(',').map(e => e.trim()).filter(Boolean);
            const ccList = cc ? cc.split(',').map(e => e.trim()).filter(Boolean) : [];
            const bccList = bcc ? bcc.split(',').map(e => e.trim()).filter(Boolean) : [];

            await api.post('/emails', {
                account_id: accountId,
                to: toList,
                cc: ccList.length > 0 ? ccList : undefined,
                bcc: bccList.length > 0 ? bccList : undefined,
                subject,
                body: editor?.getHTML() || ''
            });

            // Clear draft
            localStorage.removeItem(`email_draft_${accountId}`);

            toast.success('Email sent successfully!');
            onSent();
            onClose();
        } catch (error: any) {
            console.error('Failed to send email:', error);
            toast.error(error.response?.data?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const getTitle = () => {
        if (mode === 'reply') return 'Reply';
        if (mode === 'forward') return 'Forward';
        return 'New Message';
    };

    if (minimized) {
        return (
            <div
                className="fixed bottom-0 right-4 w-72 bg-white dark:bg-slate-800 shadow-2xl rounded-t-lg border border-gray-200 dark:border-slate-700 cursor-pointer z-50"
                onClick={() => setMinimized(false)}
            >
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-slate-700 rounded-t-lg">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                        {subject || getTitle()}
                    </span>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); setMinimized(false); }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                        >
                            <MinusIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 right-4 w-[600px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 shadow-2xl rounded-t-lg border border-gray-200 dark:border-slate-700 z-50 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-slate-700 rounded-t-lg">
                <span className="font-medium text-gray-900 dark:text-white">{getTitle()}</span>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => setMinimized(true)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    >
                        <MinusIcon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    >
                        <XMarkIcon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Form Fields */}
            <div className="p-3 border-b border-gray-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-slate-400 w-12">From:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{accountEmail}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-slate-400 w-12">To:</span>
                    <input
                        type="text"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="recipient@example.com"
                        className="flex-1 text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    />
                    {!showCcBcc && (
                        <button
                            onClick={() => setShowCcBcc(true)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Cc Bcc
                        </button>
                    )}
                </div>
                {showCcBcc && (
                    <>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 dark:text-slate-400 w-12">Cc:</span>
                            <input
                                type="text"
                                value={cc}
                                onChange={(e) => setCc(e.target.value)}
                                placeholder="cc@example.com"
                                className="flex-1 text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 dark:text-slate-400 w-12">Bcc:</span>
                            <input
                                type="text"
                                value={bcc}
                                onChange={(e) => setBcc(e.target.value)}
                                placeholder="bcc@example.com"
                                className="flex-1 text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                            />
                        </div>
                    </>
                )}
                <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-slate-400 w-12">Subject:</span>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject"
                        className="flex-1 text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center space-x-1 p-2 border-b border-gray-200 dark:border-slate-700">
                <button
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 ${editor?.isActive('bold') ? 'bg-gray-200 dark:bg-slate-600' : ''}`}
                    title="Bold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-gray-600 dark:text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                    </svg>
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 ${editor?.isActive('italic') ? 'bg-gray-200 dark:bg-slate-600' : ''}`}
                    title="Italic"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-gray-600 dark:text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4m-2 16h4m-6-16l-4 16" />
                    </svg>
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 ${editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-slate-600' : ''}`}
                    title="Bullet List"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-600 dark:text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </button>
                <button
                    onClick={() => {
                        const url = window.prompt('Enter URL:');
                        if (url) {
                            editor?.chain().focus().setLink({ href: url }).run();
                        }
                    }}
                    className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 ${editor?.isActive('link') ? 'bg-gray-200 dark:bg-slate-600' : ''}`}
                    title="Add Link"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-600 dark:text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-slate-700">
                <Button
                    variant="primary"
                    onClick={handleSend}
                    disabled={sending}
                >
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    {sending ? 'Sending...' : 'Send'}
                </Button>
                <button
                    onClick={() => {
                        saveDraft();
                        toast.success('Draft saved');
                    }}
                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                >
                    Save draft
                </button>
            </div>
        </div>
    );
}

