import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function FormResponse() {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [category, setCategory] = useState(null);
    const [general, setGeneral] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responses, setResponses] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [view, setView] = useState("form"); // "form" | "success"
    const [searchParams] = useSearchParams();
    const selectedMovie = searchParams.get('movie') || 'ボタニカ';
    const [activeSection, setActiveSection] = useState(null);

    const categoryTitles = ['オープニングムービー', 'プロフィールムービ', 'エンドロール・レタームービーその他'];

    const sections = {
        info: [
            { id: 'couple-info', title: 'おふたりの情報 (名前・挙式日)', description: 'Your Information (Name, Wedding Date)' },
            { id: 'music-dvd', title: '音楽・DVDについて', description: 'About Music and DVD' }
        ],
        photos: [
            { id: 'cover-greeting', title: '表紙・挨拶', description: 'Cover/Greeting' },
            { id: 'groom-part', title: '新郎パート', description: 'Groom\'s Part' },
            { id: 'bride-part', title: '新婦パート', description: 'Bride\'s Part' },
            { id: 'couple-part', title: 'おふたりパート', description: 'Couple\'s Part' },
            { id: 'last-part', title: 'ラスト', description: 'Last' },
            { id: 'children-part', title: 'お子様パート (追加ご注文された方のみ)', description: 'Children\'s Part (Only for those who ordered additionally)' }
        ]
    };

    const faqs = [
        {
            q: 'パートナーに共有したいです',
            a: '○○をして共有できます。'
        },
        {
            q: '動画を入れたいです',
            a: '可能です。入れたい部分が始まりになるよう「切り取り (トリミング)」 してから添付してください。'
        }
    ];

    const handleSectionClick = (sectionId) => {
        setActiveSection(activeSection === sectionId ? null : sectionId);
    };

    useEffect(() => {
        loadForm();
    }, [formId]);

    async function loadForm() {
        try {
            setLoading(true);
            const formData = await api.getFormByShare(formId);
            const categoryData = await api.getCategoryFormID(formId);
            const generalData = await api.getGeneralFormID();

            // normalize fields with proper adminImages parsing
            formData.fields = formData.fields.map(f => ({
                ...f,
                options: typeof f.options === "string" ? JSON.parse(f.options) : f.options,
                checkbox_options: typeof f.checkbox_options === "string" ? JSON.parse(f.checkbox_options) : f.checkbox_options,
                choice_options: typeof f.choice_options === "string" ? JSON.parse(f.choice_options) : f.choice_options,
                adminImages: typeof f.adminImages === "string" ? JSON.parse(f.adminImages) : (f.adminImages || []),
            }));

            setForm(formData);
            setCategory(categoryData);
            setGeneral(generalData);
            console.log(generalData);
            console.log(formData);
        } catch (err) {
            setError(err.response?.data?.message || 'Form not found');
        } finally {
            setLoading(false);
        }
    }

    function handleResponse(fieldId, value) {
        setResponses(prev => {
            const updated = {
                ...prev,
                [fieldId]: value
            };
            return updated;
        });
    }


    // Replace your entire handleSubmit function with this:
    async function handleSubmit(e) {
        e.preventDefault();

        // Validate required fields before submission
        const missingFields = form.fields
            .filter(field => field.required)
            .filter(field => {
                const value = responses[field.uid];
                return !value ||
                    (Array.isArray(value) && value.length === 0) ||
                    (typeof value === 'string' && value.trim() === '');
            })
            .map(field => field.label);

        if (missingFields.length > 0) {
            setError(`Please fill in required fields: ${missingFields.join(', ')}`);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const formData = new FormData();

            // Filter out responses that don't have values
            const validResponses = Object.entries(responses).filter(([fieldId, value]) => {
                if (value === null || value === undefined) return false;
                if (typeof value === 'string' && value.trim() === '') return false;
                if (Array.isArray(value) && value.length === 0) return false;
                return true;
            });

            const formattedAnswers = [];

            for (const [fieldId, value] of validResponses) {
                // Skip checkbox and choice extensions - they're handled with their parent
                if (fieldId.includes('_checkboxes') || fieldId.includes('_choice')) {
                    continue;
                }

                let field = form.fields.find(f => f.uid == fieldId); // Use == for flexible matching
                if (!field) {
                    field = general.flatMap(form => form.fields).find(f => f.uid == fieldId);
                    if (!field) {
                        continue;
                    }
                }

                let formattedAnswer = {
                    questionId: field.uid, // Use field.id as questionId (this is the database ID)
                    fieldUid: field.uid,
                    type: field.type,
                };

                if (field.type === 'image_upload') {
                    if (Array.isArray(value) && value.length > 0) {
                        // Append files with consistent naming
                        value.forEach((file, idx) => {
                            const fileKey = `image_${field.uid}_${idx}`;
                            formData.append(fileKey, file);
                        });

                        formattedAnswer.imageData = value.map((file, idx) => ({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            fileKey: `image_${field.uid}_${idx}`
                        }));

                        // Handle additional checkbox selections
                        if (responses[`${fieldId}_checkboxes`]) {
                            formattedAnswer.checkboxSelections = responses[`${fieldId}_checkboxes`];
                        }
                        // Handle additional multiple choice selection
                        if (responses[`${fieldId}_choice`]) {
                            formattedAnswer.multipleChoiceSelection = responses[`${fieldId}_choice`];
                        }
                    }
                } else if (field.type === 'checkboxes') {
                    formattedAnswer.text = Array.isArray(value) ? value : [value];
                } else if (field.type === 'multiple_choice') {
                    formattedAnswer.text = value;
                } else if (field.type === 'file_upload') {
                    if (Array.isArray(value) && value.length > 0) {
                        value.forEach((file, idx) => {
                            const fileKey = `file_${field.uid}_${idx}`;
                            formData.append(fileKey, file);
                        });
                        formattedAnswer.fileData = value.map((file, idx) => ({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            fileKey: `file_${field.uid}_${idx}`
                        }));
                    }
                } else {
                    formattedAnswer.text = value;
                }

                formattedAnswers.push(formattedAnswer);
            }

            // Append the JSON data
            const answersJson = JSON.stringify(formattedAnswers);
            formData.append('answers', answersJson);

            // Add form metadata
            formData.append('formId', formId);
            formData.append('submissionTimestamp', new Date().toISOString());

            // Add current user information
            const currentUser = JSON.parse(localStorage.getItem('gfc_user') || '{}');
            if (currentUser && currentUser.id) {
                formData.append('userId', currentUser.id);
                formData.append('userName', currentUser.name || '');
                formData.append('userEmail', currentUser.email || '');
                formData.append('userRole', currentUser.role || '');
            }

            // Submit to API
            const response = await api.submitForm(formId, formData);
            alert('ご回答ありがとうございました！')

            setSubmitted(true);
            setResponses({});
            setView("success");   // ✅ switch to success screen
            window.scrollTo(0, 0);

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit form';
            setError(errorMessage);
            console.error('Submission error:', err);

            if (err.response) {
                console.error('Error response status:', err.response.status);
                console.error('Error response data:', err.response.data);
            }
        } finally {
            setSubmitting(false);
        }
    }


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading form...</div>
            </div>
        );
    }

    if (error && !form) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!form) return null;

    return (
        <div>
            <div className="min-h-screen bg-white py-16">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Main Title */}
                    <div className="text-center mb-8 mt-16">
                        <h1 className="text-3xl font-bold text-[#215261]">
                            {categoryTitles[category.category_id]} 「{category.title}」
                        </h1>
                    </div>

                    {/* Sample Video Section */}
                    <div className="text-center mb-12">
                        <div className="relative inline-block sm:bg-red-500 sm-w-full">
                            <div className="w-96 h-64 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden sm-w-full">
                                {/* Video Thumbnail */}
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                        <div className="text-xs text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded">
                                            [結婚式プロフィール...]
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-2">サンプルムービー</div>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <div className="w-1 h-8 bg-[#215261] mr-3"></div>
                            <h2 className="text-[16px] font-semibold text-[#215261]">おふたりの情報</h2>
                        </div>
                        <div className="space-y-2">
                            {general.map((item, idx) => (
                                <a href={`#${item.title}`} key={item.id || idx} className='bg-[#F9F6EF] hover:bg-gray-200 p-4 rounded-lg cursor-pointer flex items-center justify-between transition-colors'>
                                    <div>
                                        <div className="font-medium text-[#191919] text-[16px]">{item.title}</div>
                                        <div className="text-sm text-gray-600 text-[16px]">{item.description}</div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Photos and Messages Section */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <div className="w-1 h-8 bg-[#215261] mr-3"></div>
                            <h2 className="text-[16px] font-semibold text-[#215261]">お写真・メッセージ</h2>
                        </div>
                        <div className="space-y-2">
                            {Array.isArray(form.fields) &&
                                form.fields
                                    .filter(item => item.type === "section")
                                    .map((item, idx) => (
                                        <a href={`#section${item.uid || idx}`} key={item.uid || idx} className="bg-[#F9F6EF] hover:bg-gray-200 p-4 rounded-lg cursor-pointer flex items-center justify-between transition-colors">
                                            <div>
                                                <div className="font-medium text-[#191919] text-[16px]">{item.label}</div>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </a>
                                    ))}
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-pink-500 text-center mb-6">よくある質問</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="font-medium text-[#215261] mb-2">
                                        <span className="text-blue-600">Q.</span> {faq.q}
                                    </div>
                                    <div className="text-gray-600 ml-4">
                                        <span className="text-green-600">A.</span> {faq.a}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40">
                        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-4 justify-between">
                            <a href='#' className="bg-gray-300 hover:bg-gray-400 text-[#191919] px-8 py-3 rounded-lg font-medium transition-colors">
                                一時保存する
                            </a>
                            <button onClick={handleSubmit} className="bg-[#215261] hover:from-orange-500 hover:to-yellow-500 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                                送信する (ムービー作成を依頼)
                            </button>
                        </div>
                    </div>

                    {/* Active Section Modal */}
                    {activeSection && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">
                                        {sections.info.find(s => s.id === activeSection)?.title ||
                                            sections.photos.find(s => s.id === activeSection)?.title}
                                    </h3>
                                    <button
                                        onClick={() => setActiveSection(null)}
                                        className="text-gray-500 hover:text-[#191919]"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="text-gray-600 mb-4">
                                    {sections.info.find(s => s.id === activeSection)?.description ||
                                        sections.photos.find(s => s.id === activeSection)?.description}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#191919] mb-2">
                                            ファイルをアップロード
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#191919] mb-2">
                                            メッセージ (任意)
                                        </label>
                                        <textarea
                                            className="w-full p-2 border border-gray-300 rounded-lg h-20"
                                            placeholder="メッセージを入力してください..."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={() => setActiveSection(null)}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-[#191919] py-2 rounded-lg transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={() => setActiveSection(null)}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                                    >
                                        保存
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="min-h-screen bg-gray-50 py-8 bg-[#F9F6EF] pb-24">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">

                    {view === "success" ? (
                        <div className="p-8 text-center">
                            <h2 className="text-2xl font-bold text-green-600 mb-4">ご回答ありがとうございました！</h2>
                            <p className="text-[#191919] mb-6">ご回答いただきありがとうございました。</p>
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    setResponses({});
                                    setView("form"); // switch back to form
                                }}
                                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                                もう一度回答する
                            </button>
                        </div>
                    ) : (
                        <>
                            {error && form && (
                                <div className="p-4 bg-red-100 text-red-700 rounded m-6">
                                    {error}
                                    <button
                                        onClick={() => setError(null)}
                                        className="ml-3 text-blue-600 underline"
                                    >
                                        閉じる
                                    </button>
                                </div>
                            )}

                            {/* Debug Panel - Remove this in production */}
                            {/* <div className="p-4 bg-gray-100 m-6 rounded">
                            <h3 className="font-bold">Debug Info:</h3>
                            <p>Current responses: {JSON.stringify(responses, null, 2)}</p>
                        </div> */}

                            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                                {general.map((item, idx) => (
                                    <React.Fragment key={item.id || item.uid || idx}>
                                        <div className="p-6 border-b" id={item.title}>
                                            <h1 className="text-[18px] text-center font-bold text-[#000080]" style={{ fontFamily: 'Zen Maru Gothic' }}>{item.title}</h1>
                                            {item.description && (
                                                <p className="mt-2 text-gray-600 text-center">{item.description}</p>
                                            )}
                                        </div>
                                        {
                                            item.fields.map((field) => (
                                                <div key={field.uid} className="space-y-2">
                                                    <label className="block">
                                                        <div
                                                            className={`font-medium text-[#191919] text-[14px] rounded-[5px] ${field.type == 'title' ? 'pl-4 p-2 bg-[#F9F6EF]' : ''}`}
                                                            {...(field.type === 'section' ? { id: `section${field.uid}` } : {})}
                                                        >
                                                            {/* {idx + 1}. {field.label} */}
                                                            {field.type == 'section' ? 'セクション ー' + field.label : field.type == 'title' ? field.label : field.label}
                                                            {field.required && (
                                                                <span className="text-red-500 ml-1">*</span>
                                                            )}
                                                        </div>

                                                        <div className="mt-2">
                                                            {/* short_answer - FIXED */}
                                                            {field.type === 'short_answer' && (
                                                                <input
                                                                    type="text"
                                                                    required={field.required}
                                                                    placeholder={field.placeholder}
                                                                    value={responses[field.uid] || ''}
                                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                                                                    onChange={e => {
                                                                        handleResponse(field.uid, e.target.value);
                                                                    }}
                                                                />
                                                            )}

                                                            {/* paragraph - FIXED */}
                                                            {field.type === 'paragraph' && (
                                                                <textarea
                                                                    required={field.required}
                                                                    placeholder={field.placeholder}
                                                                    value={responses[field.uid] || ''}
                                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                                                                    rows={4}
                                                                    onChange={e => {
                                                                        handleResponse(field.uid, e.target.value);
                                                                    }}
                                                                />
                                                            )}

                                                            {/* multiple_choice - FIXED */}
                                                            {field.type === 'multiple_choice' && (
                                                                <div className="space-y-2">
                                                                    {field.options.map((option, i) => (
                                                                        <label key={i} className="flex items-center space-x-2">
                                                                            <input
                                                                                type="radio"
                                                                                name={`field_${field.uid}`}
                                                                                required={field.required}
                                                                                checked={responses[field.uid] === option}
                                                                                onChange={() => {
                                                                                    handleResponse(field.uid, option);
                                                                                }}
                                                                            />
                                                                            <span>{option}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* dropdown - NEW */}
                                                            {field.type === 'dropdown' && (
                                                                <select
                                                                    required={field.required}
                                                                    value={responses[field.uid] || ''}
                                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                                                                    onChange={e => handleResponse(field.uid, e.target.value)}
                                                                >
                                                                    <option value="">選択...</option>
                                                                    {field.options.map((option, i) => (
                                                                        <option key={i} value={option}>
                                                                            {option}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            )}

                                                            {/* checkboxes - FIXED */}
                                                            {field.type === 'checkboxes' && (
                                                                <div className="space-y-2">
                                                                    {field.options.map((option, i) => (
                                                                        <label key={i} className="flex items-center space-x-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={(responses[field.uid] || []).includes(option)}
                                                                                onChange={e => {
                                                                                    const current = responses[field.uid] || [];
                                                                                    let updated;
                                                                                    if (e.target.checked) {
                                                                                        updated = [...current, option];
                                                                                    } else {
                                                                                        updated = current.filter(v => v !== option);
                                                                                    }
                                                                                    handleResponse(field.uid, updated);
                                                                                }}
                                                                            />
                                                                            <span>{option}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* file_upload - FIXED */}
                                                            {field.type === 'file_upload' && (
                                                                <div className="space-y-4">
                                                                    {field.content && (
                                                                        <div className="text-gray-600">{field.content}</div>
                                                                    )}
                                                                    <div>
                                                                        <input
                                                                            type="file"
                                                                            multiple={field.max_images > 1}
                                                                            required={field.required && (!responses[field.uid] || responses[field.uid].length === 0)}
                                                                            className="w-full"
                                                                            onChange={e => {
                                                                                const newFiles = Array.from(e.target.files);
                                                                                const existing = responses[field.uid] || [];
                                                                                const combined = [...existing, ...newFiles];
                                                                                const limited = field.max_images ?
                                                                                    combined.slice(0, field.max_images) : combined;
                                                                                handleResponse(field.uid, limited);
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    {responses[field.uid]?.length > 0 && (
                                                                        <div className="mt-3 space-y-2">
                                                                            {responses[field.uid].map((file, i) => (
                                                                                <div key={i} className="flex items-center justify-between border p-2 rounded">
                                                                                    <span className="truncate">{file.name}</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const updated = responses[field.uid].filter((_, idx) => idx !== i);
                                                                                            handleResponse(field.uid, updated);
                                                                                        }}
                                                                                        className="text-red-600 text-sm"
                                                                                    >
                                                                                        ✕
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* image_upload - FIXED */}
                                                            {/* {field.type === 'image_upload' && (
                                                <div className="space-y-4">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple={field.max_images > 1}
                                                        required={field.required && (!responses[field.uid] || responses[field.uid].length === 0)}
                                                        className="w-full"
                                                        onChange={e => {
                                                            const newFiles = Array.from(e.target.files);
                                                            const existing = responses[field.uid] || [];
                                                            const merged = [...existing, ...newFiles];
                                                            const limited = field.max_images ? merged.slice(0, field.max_images) : merged;
                                                            handleResponse(field.uid, limited);
                                                        }}
                                                    />

                                                    {responses[field.uid]?.length > 0 && (
                                                        <div className="mt-3 flex gap-4 flex-wrap">
                                                            {responses[field.uid].map((file, i) => (
                                                                <div key={i} className="relative">
                                                                    <img
                                                                        src={URL.createObjectURL(file)}
                                                                        alt={`Preview ${i + 1}`}
                                                                        className="h-24 w-24 object-cover rounded border"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updated = responses[field.uid].filter((_, idx) => idx !== i);
                                                                            handleResponse(field.uid, updated);
                                                                        }}
                                                                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {(field.checkbox_options?.length > 0 || field.choice_options?.length > 0) && (
                                                        <div className="mt-4 p-4 bg-gray-50 rounded border">
                                                            {field.checkbox_options?.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <div className="font-medium">Select all that apply:</div>
                                                                    {field.checkbox_options.map((opt, i) => (
                                                                        <label key={i} className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={(responses[`${field.uid}_checkboxes`] || []).includes(opt.label || opt)}
                                                                                onChange={e => {
                                                                                    const current = responses[`${field.uid}_checkboxes`] || [];
                                                                                    const optionValue = opt.label || opt;
                                                                                    let updated;
                                                                                    if (e.target.checked) {
                                                                                        updated = [...current, optionValue];
                                                                                    } else {
                                                                                        updated = current.filter(v => v !== optionValue);
                                                                                    }
                                                                                    handleResponse(`${field.uid}_checkboxes`, updated);
                                                                                }}
                                                                            />
                                                                            <span>{opt.label || opt}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {field.choice_options?.length > 0 && (
                                                                <div className="mt-4 space-y-2">
                                                                    <div className="font-medium">{field.choice_question || 'Select one:'}</div>
                                                                    {field.choice_options.map((opt, i) => (
                                                                        <label key={i} className="flex items-center gap-2">
                                                                            <input
                                                                                type="radio"
                                                                                name={`${field.uid}_choice`}
                                                                                checked={responses[`${field.uid}_choice`] === (opt.label || opt)}
                                                                                onChange={() => handleResponse(`${field.uid}_choice`, opt.label || opt)}
                                                                            />
                                                                            <span>{opt.label || opt}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )} */}
                                                            {field.type === 'image_upload' && (
                                                                <div className="space-y-4">
                                                                    {/* Display Admin Images if they exist */}
                                                                    {field.enableAdminImages && field.adminImages?.length > 0 && (
                                                                        <div className="mb-4">
                                                                            <div className="text-sm font-medium text-[#191919] mb-2">Reference Images:</div>
                                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                                {field.adminImages.map((adminImg, index) => (
                                                                                    <div key={adminImg.id || index} className="border rounded overflow-hidden">
                                                                                        <img
                                                                                            src={adminImg.url}
                                                                                            alt={`Reference image ${index + 1}`}
                                                                                            className="w-full h-24 object-cover"
                                                                                            onError={(e) => {
                                                                                                e.target.src = '/placeholder-image.jpg';
                                                                                                console.error('Failed to load admin image:', adminImg.url);
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                These are reference images provided by the form creator.
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {/* User Upload Section */}
                                                                    <div>
                                                                        <div className="text-sm font-medium mb-2">
                                                                            アップロードされた画像 {field.max_images > 1 ? `(最大 ${field.max_images})` : ''}
                                                                        </div>

                                                                        {field.content && (
                                                                            <p className="text-gray-600 text-sm mb-3">{field.content}</p>
                                                                        )}

                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            multiple={field.max_images > 1}
                                                                            required={field.required && (!responses[field.uid] || responses[field.uid].length === 0)}
                                                                            className="w-full p-2 border rounded"
                                                                            onChange={e => {
                                                                                const newFiles = Array.from(e.target.files);
                                                                                const existing = responses[field.uid] || [];
                                                                                const merged = [...existing, ...newFiles];
                                                                                const limited = field.max_images ? merged.slice(0, field.max_images) : merged;
                                                                                handleResponse(field.uid, limited);
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    {/* Image Previews */}
                                                                    {responses[field.uid]?.length > 0 && (
                                                                        <div className="mt-3">
                                                                            <div className="text-sm font-medium mb-2">アップロードされた画像:</div>
                                                                            <div className="flex gap-4 flex-wrap">
                                                                                {responses[field.uid].map((file, i) => (
                                                                                    <div key={i} className="relative">
                                                                                        <img
                                                                                            src={URL.createObjectURL(file)}
                                                                                            alt={`Preview ${i + 1}`}
                                                                                            className="h-24 w-24 object-cover rounded border"
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                const updated = responses[field.uid].filter((_, idx) => idx !== i);
                                                                                                handleResponse(field.uid, updated);
                                                                                            }}
                                                                                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded"
                                                                                        >
                                                                                            ✕
                                                                                        </button>
                                                                                        <div className="text-xs text-gray-500 mt-1 text-center">
                                                                                            {file.name}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Checkbox and Multiple Choice Options */}
                                                                    {(field.checkbox_options?.length > 0 || field.choice_options?.length > 0) && (
                                                                        <div className="mt-4 p-4 bg-gray-50 rounded border">
                                                                            {field.checkbox_options?.length > 0 && (
                                                                                <div className="space-y-2">
                                                                                    <div className="font-medium">適用するものを選択:</div>
                                                                                    {field.checkbox_options.map((opt, i) => (
                                                                                        <label key={i} className="flex items-center gap-2">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={(responses[`${field.uid}_checkboxes`] || []).includes(opt.label || opt)}
                                                                                                onChange={e => {
                                                                                                    const current = responses[`${field.uid}_checkboxes`] || [];
                                                                                                    const optionValue = opt.label || opt;
                                                                                                    let updated;
                                                                                                    if (e.target.checked) {
                                                                                                        updated = [...current, optionValue];
                                                                                                    } else {
                                                                                                        updated = current.filter(v => v !== optionValue);
                                                                                                    }
                                                                                                    handleResponse(`${field.uid}_checkboxes`, updated);
                                                                                                }}
                                                                                            />
                                                                                            <span className="text-sm">{opt.label || opt}</span>
                                                                                        </label>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {field.choice_options?.length > 0 && (
                                                                                <div className="mt-4 space-y-2">
                                                                                    <div className="font-medium">{field.choice_question || '1つ選択:'}</div>
                                                                                    {field.choice_options.map((opt, i) => (
                                                                                        <label key={i} className="flex items-center gap-2">
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`${field.uid}_choice`}
                                                                                                checked={responses[`${field.uid}_choice`] === (opt.label || opt)}
                                                                                                onChange={() => handleResponse(`${field.uid}_choice`, opt.label || opt)}
                                                                                            />
                                                                                            <span className="text-sm">{opt.label || opt}</span>
                                                                                        </label>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* date - FIXED */}
                                                            {field.type === 'date' && (
                                                                <input
                                                                    type="date"
                                                                    required={field.required}
                                                                    value={responses[field.uid] || ''}
                                                                    className="p-2 border rounded"
                                                                    onChange={e => {
                                                                        handleResponse(field.uid, e.target.value);
                                                                    }}
                                                                />
                                                            )}

                                                            {/* time - FIXED */}
                                                            {field.type === 'time' && (
                                                                <input
                                                                    type="time"
                                                                    required={field.required}
                                                                    value={responses[field.uid] || ''}
                                                                    className="p-2 border rounded"
                                                                    onChange={e => {
                                                                        handleResponse(field.uid, e.target.value);
                                                                    }}
                                                                />
                                                            )}

                                                            {/* section - Display only */}
                                                            {field.type === 'section' && field.placeholder !== '' && (
                                                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                                                    <div className="text-blue-700">
                                                                        {field.placeholder}
                                                                    </div>
                                                                    {field.adminImages?.length > 0 && (
                                                                        <div className="mb-4 mt-4">
                                                                            <div className="">
                                                                                {field.adminImages.map((adminImg, index) => (
                                                                                    <div key={adminImg.id || index} className="border rounded overflow-hidden">
                                                                                        <img
                                                                                            src={adminImg.url}
                                                                                            alt={`Reference image ${index + 1}`}
                                                                                            className="w-full h-full object-cover"
                                                                                            onError={(e) => {
                                                                                                e.target.src = '/placeholder-image.jpg';
                                                                                                console.error('Failed to load admin image:', adminImg.url);
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </label>
                                                </div>
                                            ))
                                        }
                                    </React.Fragment>
                                ))}
                                {/* < div className="p-6 border-b" >
                                    <h1 className="text-[18px] font-bold text-[#000080] text-center">{form.title}</h1>
                                    {
                                        form.description && (
                                            <p className="mt-2 text-gray-600 text-[14px] text-center">{form.description}</p>
                                        )
                                    }
                                </div> */}
                                {form.fields.map((field, idx) => (
                                    <div key={field.uid} className="space-y-2">
                                        <label className="block">
                                            <div
                                                className={`font-medium text-[14px] rounded-[5px] ${field.type == 'section' ? 'text-[18px] text-center font-bold text-[#000080]' : 'text-[#191919] pl-4 p-2 bg-[#F9F6EF]'}`}
                                                {...(field.type === 'section' ? { id: `section${field.uid}` } : {})}
                                            >
                                                {/* {idx + 1}. {field.label} */}
                                                {field.type == 'section' ? 'セクション ー' + field.label : field.type == 'title' ? field.label : field.label}
                                                {field.required && (
                                                    <span className="text-red-500 ml-1">*</span>
                                                )}
                                            </div>

                                            <div className="mt-2">
                                                {/* short_answer - FIXED */}
                                                {field.type === 'short_answer' && (
                                                    <input
                                                        type="text"
                                                        required={field.required}
                                                        placeholder={field.placeholder}
                                                        value={responses[field.uid] || ''}
                                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                                                        onChange={e => {
                                                            handleResponse(field.uid, e.target.value);
                                                        }}
                                                    />
                                                )}

                                                {/* paragraph - FIXED */}
                                                {field.type === 'paragraph' && (
                                                    <textarea
                                                        required={field.required}
                                                        placeholder={field.placeholder}
                                                        value={responses[field.uid] || ''}
                                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                                                        rows={4}
                                                        onChange={e => {
                                                            handleResponse(field.uid, e.target.value);
                                                        }}
                                                    />
                                                )}

                                                {/* multiple_choice - FIXED */}
                                                {field.type === 'multiple_choice' && (
                                                    <div className="space-y-2">
                                                        {field.options.map((option, i) => (
                                                            <label key={i} className="flex items-center space-x-2">
                                                                <input
                                                                    type="radio"
                                                                    name={`field_${field.uid}`}
                                                                    required={field.required}
                                                                    checked={responses[field.uid] === option}
                                                                    onChange={() => {
                                                                        handleResponse(field.uid, option);
                                                                    }}
                                                                />
                                                                <span>{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* dropdown - NEW */}
                                                {field.type === 'dropdown' && (
                                                    <select
                                                        required={field.required}
                                                        value={responses[field.uid] || ''}
                                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                                                        onChange={e => handleResponse(field.uid, e.target.value)}
                                                    >
                                                        <option value="">選択...</option>
                                                        {field.options.map((option, i) => (
                                                            <option key={i} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {/* checkboxes - FIXED */}
                                                {field.type === 'checkboxes' && (
                                                    <div className="space-y-2">
                                                        {field.options.map((option, i) => (
                                                            <label key={i} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(responses[field.uid] || []).includes(option)}
                                                                    onChange={e => {
                                                                        const current = responses[field.uid] || [];
                                                                        let updated;
                                                                        if (e.target.checked) {
                                                                            updated = [...current, option];
                                                                        } else {
                                                                            updated = current.filter(v => v !== option);
                                                                        }
                                                                        handleResponse(field.uid, updated);
                                                                    }}
                                                                />
                                                                <span>{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* file_upload - FIXED */}
                                                {field.type === 'file_upload' && (
                                                    <div className="space-y-4">
                                                        {field.content && (
                                                            <div className="text-gray-600">{field.content}</div>
                                                        )}
                                                        <div>
                                                            <input
                                                                type="file"
                                                                multiple={field.max_images > 1}
                                                                required={field.required && (!responses[field.uid] || responses[field.uid].length === 0)}
                                                                className="w-full"
                                                                onChange={e => {
                                                                    const newFiles = Array.from(e.target.files);
                                                                    const existing = responses[field.uid] || [];
                                                                    const combined = [...existing, ...newFiles];
                                                                    const limited = field.max_images ?
                                                                        combined.slice(0, field.max_images) : combined;
                                                                    handleResponse(field.uid, limited);
                                                                }}
                                                            />
                                                        </div>

                                                        {responses[field.uid]?.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                {responses[field.uid].map((file, i) => (
                                                                    <div key={i} className="flex items-center justify-between border p-2 rounded">
                                                                        <span className="truncate">{file.name}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const updated = responses[field.uid].filter((_, idx) => idx !== i);
                                                                                handleResponse(field.uid, updated);
                                                                            }}
                                                                            className="text-red-600 text-sm"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* image_upload - FIXED */}
                                                {/* {field.type === 'image_upload' && (
                                                    <div className="space-y-4">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple={field.max_images > 1}
                                                            required={field.required && (!responses[field.uid] || responses[field.uid].length === 0)}
                                                            className="w-full"
                                                            onChange={e => {
                                                                const newFiles = Array.from(e.target.files);
                                                                const existing = responses[field.uid] || [];
                                                                const merged = [...existing, ...newFiles];
                                                                const limited = field.max_images ? merged.slice(0, field.max_images) : merged;
                                                                handleResponse(field.uid, limited);
                                                            }}
                                                        />

                                                        {responses[field.uid]?.length > 0 && (
                                                            <div className="mt-3 flex gap-4 flex-wrap">
                                                                {responses[field.uid].map((file, i) => (
                                                                    <div key={i} className="relative">
                                                                        <img
                                                                            src={URL.createObjectURL(file)}
                                                                            alt={`Preview ${i + 1}`}
                                                                            className="h-24 w-24 object-cover rounded border"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const updated = responses[field.uid].filter((_, idx) => idx !== i);
                                                                                handleResponse(field.uid, updated);
                                                                            }}
                                                                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {(field.checkbox_options?.length > 0 || field.choice_options?.length > 0) && (
                                                            <div className="mt-4 p-4 bg-gray-50 rounded border">
                                                                {field.checkbox_options?.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <div className="font-medium">Select all that apply:</div>
                                                                        {field.checkbox_options.map((opt, i) => (
                                                                            <label key={i} className="flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={(responses[`${field.uid}_checkboxes`] || []).includes(opt.label || opt)}
                                                                                    onChange={e => {
                                                                                        const current = responses[`${field.uid}_checkboxes`] || [];
                                                                                        const optionValue = opt.label || opt;
                                                                                        let updated;
                                                                                        if (e.target.checked) {
                                                                                            updated = [...current, optionValue];
                                                                                        } else {
                                                                                            updated = current.filter(v => v !== optionValue);
                                                                                        }
                                                                                        handleResponse(`${field.uid}_checkboxes`, updated);
                                                                                    }}
                                                                                />
                                                                                <span>{opt.label || opt}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {field.choice_options?.length > 0 && (
                                                                    <div className="mt-4 space-y-2">
                                                                        <div className="font-medium">{field.choice_question || 'Select one:'}</div>
                                                                        {field.choice_options.map((opt, i) => (
                                                                            <label key={i} className="flex items-center gap-2">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`${field.uid}_choice`}
                                                                                    checked={responses[`${field.uid}_choice`] === (opt.label || opt)}
                                                                                    onChange={() => handleResponse(`${field.uid}_choice`, opt.label || opt)}
                                                                                />
                                                                                <span>{opt.label || opt}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )} */}
                                                {field.type === 'image_upload' && (
                                                    <div className="space-y-4">
                                                        {/* Display Admin Images if they exist */}
                                                        {field.enableAdminImages && field.adminImages?.length > 0 && (
                                                            <div className="mb-4">
                                                                <div className="text-sm font-medium text-[#191919] mb-2">Reference Images:</div>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                    {field.adminImages.map((adminImg, index) => (
                                                                        <div key={adminImg.id || index} className="border rounded overflow-hidden">
                                                                            <img
                                                                                src={adminImg.url}
                                                                                alt={`Reference image ${index + 1}`}
                                                                                className="w-full h-24 object-cover"
                                                                                onError={(e) => {
                                                                                    e.target.src = '/placeholder-image.jpg';
                                                                                    console.error('Failed to load admin image:', adminImg.url);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    These are reference images provided by the form creator.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* User Upload Section */}
                                                        <div>
                                                            <div className="text-sm font-medium mb-2">
                                                                アップロードされた画像 {field.max_images > 1 ? `(最大 ${field.max_images})` : ''}
                                                            </div>

                                                            {field.content && (
                                                                <p className="text-gray-600 text-sm mb-3">{field.content}</p>
                                                            )}

                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                multiple={field.max_images > 1}
                                                                required={field.required && (!responses[field.uid] || responses[field.uid].length === 0)}
                                                                className="w-full p-2 border rounded"
                                                                onChange={e => {
                                                                    const newFiles = Array.from(e.target.files);
                                                                    const existing = responses[field.uid] || [];
                                                                    const merged = [...existing, ...newFiles];
                                                                    const limited = field.max_images ? merged.slice(0, field.max_images) : merged;
                                                                    handleResponse(field.uid, limited);
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Image Previews */}
                                                        {responses[field.uid]?.length > 0 && (
                                                            <div className="mt-3">
                                                                <div className="text-sm font-medium mb-2">アップロードされた画像:</div>
                                                                <div className="flex gap-4 flex-wrap">
                                                                    {responses[field.uid].map((file, i) => (
                                                                        <div key={i} className="relative">
                                                                            <img
                                                                                src={URL.createObjectURL(file)}
                                                                                alt={`Preview ${i + 1}`}
                                                                                className="h-24 w-24 object-cover rounded border"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const updated = responses[field.uid].filter((_, idx) => idx !== i);
                                                                                    handleResponse(field.uid, updated);
                                                                                }}
                                                                                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                            <div className="text-xs text-gray-500 mt-1 text-center">
                                                                                {file.name}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Checkbox and Multiple Choice Options */}
                                                        {(field.checkbox_options?.length > 0 || field.choice_options?.length > 0) && (
                                                            <div className="mt-4 p-4 bg-gray-50 rounded border">
                                                                {field.checkbox_options?.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <div className="font-medium">適用するものを選択:</div>
                                                                        {field.checkbox_options.map((opt, i) => (
                                                                            <label key={i} className="flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={(responses[`${field.uid}_checkboxes`] || []).includes(opt.label || opt)}
                                                                                    onChange={e => {
                                                                                        const current = responses[`${field.uid}_checkboxes`] || [];
                                                                                        const optionValue = opt.label || opt;
                                                                                        let updated;
                                                                                        if (e.target.checked) {
                                                                                            updated = [...current, optionValue];
                                                                                        } else {
                                                                                            updated = current.filter(v => v !== optionValue);
                                                                                        }
                                                                                        handleResponse(`${field.uid}_checkboxes`, updated);
                                                                                    }}
                                                                                />
                                                                                <span className="text-sm">{opt.label || opt}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {field.choice_options?.length > 0 && (
                                                                    <div className="mt-4 space-y-2">
                                                                        <div className="font-medium">{field.choice_question || '1つ選択:'}</div>
                                                                        {field.choice_options.map((opt, i) => (
                                                                            <label key={i} className="flex items-center gap-2">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`${field.uid}_choice`}
                                                                                    checked={responses[`${field.uid}_choice`] === (opt.label || opt)}
                                                                                    onChange={() => handleResponse(`${field.uid}_choice`, opt.label || opt)}
                                                                                />
                                                                                <span className="text-sm">{opt.label || opt}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* date - FIXED */}
                                                {field.type === 'date' && (
                                                    <input
                                                        type="date"
                                                        required={field.required}
                                                        value={responses[field.uid] || ''}
                                                        className="p-2 border rounded"
                                                        onChange={e => {
                                                            handleResponse(field.uid, e.target.value);
                                                        }}
                                                    />
                                                )}

                                                {/* time - FIXED */}
                                                {field.type === 'time' && (
                                                    <input
                                                        type="time"
                                                        required={field.required}
                                                        value={responses[field.uid] || ''}
                                                        className="p-2 border rounded"
                                                        onChange={e => {
                                                            handleResponse(field.uid, e.target.value);
                                                        }}
                                                    />
                                                )}

                                                {/* section - Display only */}
                                                {field.type === 'section' && field.placeholder !== '' && (
                                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                                        <div className="text-blue-700">
                                                            {field.placeholder}
                                                        </div>
                                                        {field.adminImages?.length > 0 && (
                                                            <div className="mb-4 mt-4">
                                                                <div className="">
                                                                    {field.adminImages.map((adminImg, index) => (
                                                                        <div key={adminImg.id || index} className="border rounded overflow-hidden">
                                                                            <img
                                                                                src={adminImg.url}
                                                                                alt={`Reference image ${index + 1}`}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    e.target.src = '/placeholder-image.jpg';
                                                                                    console.error('Failed to load admin image:', adminImg.url);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div >
    )
}


