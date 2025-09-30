import React, { useState } from 'react'

export default function FormsList({ forms = [], onOpen, onDelete, onViewResponses }) {
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);

    const handleShare = (form) => {
        setSelectedForm(form);
        setShowShareModal(true);
    };

    const [copyStatus, setCopyStatus] = useState('');

    const copyToClipboard = async () => {
        const shareUrl = `${window.location.origin}/forms/${selectedForm.id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopyStatus('コピーしました！');  

            // Close modal after 2 seconds
            setTimeout(() => {
                setCopyStatus('');
                setShowShareModal(false);
            }, 2000);
        } catch (err) {
            setCopyStatus('コピーに失敗しました');
        }
    };

    return (
        <>
            <div className="space-y-3">
                <div className="bg-white p-3 rounded shadow">
                    <button onClick={() => onViewResponses({id: 0})} className="px-2 py-1 border rounded text-sm">すべての回答を見る</button>
                </div>
                <div className="bg-white p-3 rounded shadow">
                    <button
                        onClick={() => onOpen(null)}
                        className="w-full text-left font-medium hover:text-blue-600 transition-colors"
                    >
                        + 新規フォーム
                    </button>
                </div>

                {forms.map(f => (
                    <div key={f.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                        <div>
                            <div className="font-medium">{f.title || 'Untitled'}</div>
                            <div className="text-xs text-slate-500">{new Date(f.updated_at).toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleShare(f)}
                                className="px-2 py-1 border rounded text-sm text-blue-600 hover:bg-blue-50"
                            >
                                共有
                            </button>
                            <button onClick={() => onViewResponses(f)} className="px-2 py-1 border rounded text-sm">回答</button>
                            <button onClick={() => onOpen(f)} className="px-2 py-1 border rounded text-sm">編集</button>
                            <button onClick={() => onDelete(f.id)} className="px-2 py-1 border rounded text-red-600 text-sm">削除</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Share Modal */}
            {showShareModal && selectedForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">フォームを共有</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">リンクを知っている人はこのフォームを回答できます:</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/forms/${selectedForm.id}`}
                                    className="flex-1 p-2 border rounded bg-gray-50 text-sm"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {copyStatus || 'コピー'}
                                </button>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="text-sm text-gray-600">
                                <p>✓ サインイン不要</p>
                                <p>✓ 回答は自動的に収集されます</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
