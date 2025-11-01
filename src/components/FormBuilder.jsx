import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import FormPreview from './FormPreview'
import FieldEditor from './FieldEditor'
import FormSettings from './FormSettings'

function emptyForm() {
    return {
        title: '無題のフォーム',
        description: '',
        theme: 'default',
        fields: [],
        questions: [], // ensure compatibility with backend
        allow_multiple_responses: true,
        require_email: false
    }
}

export default function FormBuilderPanel({ form, onSave }) {
    const [local, setLocal] = useState(form || emptyForm())

    useEffect(() => {
        if (form) {
            setLocal(form)
        } else if (!local.fields?.length) {
            setLocal(emptyForm())
        }
    }, [form])

    function addQuestion(type = 'short_answer') {
        const q = {
            id: null, // will be created by backend if saving new
            uid: uuidv4(),
            label: '',
            type,
            required: false,
            placeholder: '',
            ex_placeholder: '',
            options: [],
            adminImages: [], // Array to store admin uploaded images
            enableAdminImages: false // Flag to enable/disable admin images
        }
        setLocal(prevLocal => ({
            ...prevLocal,
            fields: [...(prevLocal.fields || []), q]
        }))
    }

    function updateField(uid, patch) {
        setLocal(prevLocal => ({
            ...prevLocal,
            fields: prevLocal.fields.map(f =>
                f.uid === uid ? { ...f, ...patch } : f
            )
        }))
    }

    function removeField(uid) {
        setLocal(prevLocal => ({
            ...prevLocal,
            fields: prevLocal.fields.filter(f => f.uid !== uid)
        }))
    }

    function moveField(uid, dir) {
        setLocal(prevLocal => {
            const idx = prevLocal.fields.findIndex(f => f.uid === uid)
            if (idx === -1) return prevLocal
            const arr = [...prevLocal.fields]
            const [item] = arr.splice(idx, 1)
            arr.splice(idx + dir, 0, item)
            return { ...prevLocal, fields: arr }
        })
    }
    function copyField(uid) {
        const field = local.fields.find(f => f.uid === uid)
        if (!field) return
        const q = {
            id: null, // will be created by backend if saving new
            uid: uuidv4(),
            label: field.label,
            type: field.type,
            required: field.required,
            placeholder: field.placeholder,
            ex_placeholder: field.ex_placeholder,
            options: field.options,
            adminImages: field.adminImages,
            enableAdminImages: field.enableAdminImages
        }
        setLocal(prevLocal => ({
            ...prevLocal,
            fields: [...(prevLocal.fields || []), q]
        }))
    }

    // ✅ Added helper to normalize array fields
    function normalizeArray(val) {
        if (!val) return []
        if (Array.isArray(val)) return val
        try {
            return JSON.parse(val) // handle string like "[]"
        } catch {
            return []
        }
    }

    async function save() {        
        try {
            // convert uid fields to simple objects acceptable by API
            const payload = {
                id: local.id,
                title: local.title || '無題のフォーム',
                category_id: local.category_id || null,
                description: local.description || '',
                theme: local.theme || 'default',
                allow_multiple_responses: local.allow_multiple_responses ?? true,
                require_email: local.require_email ?? false,
                fields: local.fields.map((f, i) => ({
                    id: f.id, // Keep original ID if it exists
                    label: f.label || '無題の質問',
                    type: f.type || 'short_answer',
                    required: !!f.required,
                    placeholder: f.placeholder || '',
                    ex_placeholder: f.ex_placeholder || '',
                    text_number: f.text_number || '',
                    options: normalizeArray(f.options).map(o =>
                        typeof o === 'string' ? o : o.label || ''
                    ),
                    content: f.content || '',
                    max_images: f.max_images || 1,
                    checkbox_options: normalizeArray(f.checkbox_options),
                    choice_question: f.choice_question || '',
                    choice_options: normalizeArray(f.choice_options),
                    image_only: f.image_only || false,
                    enable_checkboxes: f.enable_checkboxes || false,
                    enable_multiple_choice: f.enable_multiple_choice || false,
                    multiple_choice_label: f.multiple_choice_label || '',
                    multiple_choice_options: normalizeArray(f.multiple_choice_options),
                    image_options: normalizeArray(f.image_options),
                    // Store file paths instead of base64
                    imageUrl: f.imageUrl, // This is now a file path like '/uploads/filename.jpg'
                    adminImages: f.adminImages ? f.adminImages.map(img => ({
                        id: img.id,
                        url: img.url // This is now a file path
                    })) : [],
                    enableAdminImages: f.enableAdminImages || false
                }))
            };            
            await onSave(payload);
            alert('フォームが保存されました。');
        } catch (error) {
            console.error('フォームの保存に失敗しました:', error);
            alert('フォームの保存に失敗しました: ' + (error.message || '再度お試しください'));
        }
    }

    function mapTypeToBackend(type) {
        // map frontend types to backend types
        const map = {
            text: 'short_answer',
            textarea: 'paragraph',
            radio: 'multiple_choice',
            checkbox: 'checkboxes',
            select: 'dropdown',
            date: 'date',
            time: 'time',
            file: 'file_upload',
            image: 'image',
            image_upload: 'image_upload',
            section: 'section',
            title: 'title'
        }
        return type // Keep the frontend types as is, no need to map
    }    
    return (
        <>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                    <div className="bg-white p-4 rounded shadow space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                            <select
                                value={local.category_id || ''}
                                onChange={e => setLocal({ ...local, category_id: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="0">カテゴリを選択</option>
                                <option value="1">オープニングムービー</option>
                                <option value="2">プロフィールムービー</option>
                                <option value="3">エンドロール・レタームービーその他</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <input value={local.title} onChange={e => setLocal({ ...local, title: e.target.value })} placeholder="フォームタイトル" className="text-xl font-semibold w-full p-2 border rounded" />
                            <button onClick={save} className="bg-purple-600 text-white px-4 py-2 rounded">{local.id ? '更新' : '保存'}</button>
                        </div>
                        <textarea value={local.description} onChange={e => setLocal({ ...local, description: e.target.value })} placeholder="フォームの説明" className="w-full p-2 border rounded" />
                        <div className="space-y-3">
                            {local.fields.map((f, idx) => (
                                <div key={f.uid} className="p-3 border rounded">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <div className="text-sm text-slate-500 mb-1">
                                                質問 {idx + 1} • {f.type.replace('_', ' ')}
                                            </div>
                                            <input
                                                value={f.label}
                                                onChange={e => updateField(f.uid, { label: e.target.value })}
                                                placeholder={f.type == "section" ? "セクションタイトル" : f.type == "title" ? "タイトル" : "質問テキスト"}
                                                className="w-full p-2 border rounded mb-2"
                                            />
                                            <FieldEditor field={f} onChange={(patch) => updateField(f.uid, patch)} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => moveField(f.uid, -1)} className="px-2 py-1 border rounded">↑</button>
                                            <button onClick={() => moveField(f.uid, 1)} className="px-2 py-1 border rounded">↓</button>
                                            <button onClick={() => copyField(f.uid)} className="px-2 py-1 border rounded text-[#3d52e4]">コピー</button>
                                            <button onClick={() => removeField(f.uid)} className="px-2 py-1 border rounded text-red-600">削除</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-span-6">
                    <FormPreview title={local.title} description={local.description} fields={local.fields} />
                </div>
            </div>
            <div className="fixed flex gap-2 flex-wrap justify-center left-0 bottom-0 p-6 w-full bg-white border-t-2 shadow">
                <button onClick={() => addQuestion('title')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">タイトル</button>
                <button onClick={() => addQuestion('section')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">セクション</button>
                <button onClick={() => addQuestion('short_answer')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">短答</button>
                <button onClick={() => addQuestion('paragraph')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">長答</button>
                <button onClick={() => addQuestion('multiple_choice')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">複数選択</button>
                <button onClick={() => addQuestion('checkboxes')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">チェックボックス</button>
                <button onClick={() => addQuestion('dropdown')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">ドロップダウン</button>
                <button onClick={() => addQuestion('date')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">日付</button>
                <button onClick={() => addQuestion('time')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">時間</button>
                <button onClick={() => addQuestion('file_upload')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">ファイルアップロード</button>
                {/* <button onClick={() => addQuestion('image')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">画像</button> */}
                <button onClick={() => addQuestion('image_upload')} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 text-sm">画像アップロード</button>
            </div>
        </>

    )
}
