import React, { useEffect, useState } from 'react'
import { getFormResponses } from '../api'

export default function ResponsesModal({ form, onClose }) {
    const [responses, setResponses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedResponse, setSelectedResponse] = useState(null)

    useEffect(() => {
        loadResponses()
    }, [form.id])

    async function loadResponses() {
        try {
            setLoading(true)
            setError(null)
            let data = []
            if (!form.id) {
                data = await getFormResponses(form.id)
            } else {
                data = await getFormResponses(form.id)
            }
            setResponses(data || [])
        } catch (e) {
            console.error('Error loading responses:', e)
            setError('Failed to load responses')
        } finally {
            setLoading(false)
        }
    }

    // async function downloadCSV() {
    //     const res = await exportCSV();
    //     if (!res.ok) throw new Error('Failed to fetch CSV');

    //     const blob = await res.blob();
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = `form_responses_${formId}.csv`;
    //     document.body.appendChild(a);
    //     a.click();
    //     a.remove();
    //     window.URL.revokeObjectURL(url);
    // }

    // Safe JSON parse function
    const safeJsonParse = (str) => {
        if (!str) return null
        try {
            return JSON.parse(str)
        } catch (e) {
            console.error('JSON parse error:', e, 'for string:', str)
            return null
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-11/12 max-w-4xl p-4 rounded shadow max-h-[80vh] overflow-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">回答 — {form.title}</h3>
                    <div className="flex gap-2">
                        {/* <button
                            onClick={() => downloadCSV()}
                            className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100"
                            style={{ border: 'none', background: 'none', color: '#1967d2', fontWeight: 500, fontSize: '1rem' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 40 40" style={{ display: 'inline', verticalAlign: 'middle' }}>
                                <rect width="40" height="40" rx="6" fill="#21A366"/>
                                <rect x="7" y="7" width="26" height="26" rx="2" fill="#fff"/>
                                <rect x="11" y="11" width="18" height="18" rx="1" fill="#21A366"/>
                                <path d="M20 15v10M15 20h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span style={{ color: '#1967d2', fontWeight: 500, fontSize: '1rem' }}>スプレッドシートで表示</span>
                        </button> */}
                        <button onClick={onClose} className="px-3 py-1 border rounded">閉じる</button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-slate-500">回答を読み込んでいます...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : responses.length === 0 ? (
                    <div className="text-slate-500">回答がありません</div>
                ) : (
                    <>
                        {!selectedResponse ? (
                            // Step 1: List of responses
                            responses.map((resp) => {
                                const nameAnswer = resp.answers?.find(a => a.question?.includes('Name'))?.answerText ||
                                    resp.respondent?.name || '匿名';
                                const email = resp.respondent?.email || 'メールなし';
                                const formTitle = resp.form?.title || '無題';

                                return (
                                    <div
                                        key={resp.id}
                                        className="mb-2 p-3 border rounded cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            setSelectedResponse(resp)
                                        }}
                                    >
                                        {new Date(resp.submittedAt).toLocaleString()} — {nameAnswer} ({email}) — {formTitle}
                                    </div>
                                )
                            })
                        ) : (
                            // Step 2: Detailed read-only filled form
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() => setSelectedResponse(null)}
                                        className="px-3 py-1 border rounded"
                                    >
                                        ← 回答に戻る
                                    </button>
                                </div>

                                <div className="mb-4 p-3 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-600">
                                        提出: {new Date(selectedResponse.submittedAt).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        回答者: {selectedResponse.respondent?.name || '匿名'}
                                        ({selectedResponse.respondent?.email || 'No email'})
                                    </div>
                                </div>

                                {selectedResponse.answers?.length > 0 ? (
                                    selectedResponse.answers
                                        .filter(a => a.answerText || a.imageUrls || a.files || a.checkboxSelections || a.multipleChoiceSelection)
                                        .map((answer, index) => {
                                            const imageUrls = Array.isArray(answer.imageUrls) ? answer.imageUrls :
                                                safeJsonParse(answer.imageUrls) || [];
                                            const files = Array.isArray(answer.files) ? answer.files :
                                                safeJsonParse(answer.files) || [];
                                            const checkboxSelections = Array.isArray(answer.checkboxSelections) ? answer.checkboxSelections :
                                                safeJsonParse(answer.checkboxSelections) || [];

                                            return (
                                                <div key={answer.question || index} className="mb-6 p-4 border rounded">
                                                    <div className="text-sm font-medium mb-3">
                                                        {answer.question || `Question ${index + 1}`}
                                                    </div>

                                                    {/* Text Answer */}
                                                    {answer.answerText && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-500">回答:</div>
                                                            <input
                                                                type="text"
                                                                value={answer.answerText}
                                                                readOnly
                                                                className="mt-1 block w-full border rounded px-2 py-1 bg-gray-100"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Checkbox Selections */}
                                                    {checkboxSelections.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-500">選択されたオプション:</div>
                                                            <ul className="list-disc list-inside mt-1 text-sm">
                                                                {checkboxSelections.map((opt, idx) => (
                                                                    <li key={idx}>{opt}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Multiple Choice Selection */}
                                                    {answer.multipleChoiceSelection && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-500">選択された選択肢:</div>
                                                            <div className="mt-1 text-sm p-2 bg-gray-100 rounded">
                                                                {answer.multipleChoiceSelection}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Image URLs */}
                                                    {imageUrls.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-500">アップロードされた画像:</div>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                                                {imageUrls.map((img, idx) => (
                                                                    <img
                                                                        key={idx}
                                                                        src={img}
                                                                        alt={`Uploaded image ${idx + 1}`}
                                                                        className="max-w-full h-32 object-cover rounded border"
                                                                        onError={(e) => {
                                                                            e.target.src = '/placeholder-image.jpg';
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Files */}
                                                    {files.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-500">アップロードされたファイル:</div>
                                                            <div className="mt-2 space-y-1">
                                                                {files.map((file, idx) => {
                                                                    const fileName = typeof file === 'string'
                                                                        ? file.split('/').pop()
                                                                        : file.filename || file.originalname || `file-${idx + 1}`;

                                                                    const fileUrl = typeof file === 'string'
                                                                        ? file
                                                                        : `/uploads/${file.filename}`;

                                                                    return (
                                                                        <a
                                                                            key={idx}
                                                                            href={fileUrl}
                                                                            className="block text-blue-600 hover:underline"
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                        >
                                                                            📎 {fileName}
                                                                        </a>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Image Responses (checkbox selections for images) */}
                                                    {answer.imageResponses && answer.imageResponses.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-500">画像の回答:</div>
                                                            <ul className="list-disc list-inside mt-1 text-sm">
                                                                {answer.imageResponses.map((resp, idx) => (
                                                                    <li key={idx}>{resp}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Fallback for empty answers */}
                                                    {!answer.answerText && !answer.imageUrls && !answer.files &&
                                                        !answer.checkboxSelections && !answer.multipleChoiceSelection && (
                                                            <div className="text-sm text-gray-500 italic">
                                                                回答がありません
                                                            </div>
                                                        )}
                                                </div>
                                            )
                                        })
                                ) : (
                                    <div className="text-gray-500">この回答に対する回答がありません。</div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}