import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoryForm } from '../api';

export default function Top() {
    const [responses, setResponses] = useState([]);
    const [selected, setSelected] = useState({
        1: '',
        2: '',
        3: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            setLoading(true);
            const data = await getCategoryForm();
            setResponses(data);

            // Set default selected for each category if available
            const categories = [1, 2, 3];
            const newSelected = {};
            categories.forEach(cat => {
                const found = data.find(d => String(d.category_id) === String(cat));
                newSelected[cat] = found ? found.id : '';
            });
            setSelected(newSelected);
        } catch (err) {
            console.error('Error fetching responses:', err);
            setError('Failed to load response data');
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = (categoryId) => {
        const movieId = selected[categoryId];
        if (!movieId) return;
        navigate(`/forms/${movieId}`);
    };

    const renderMovieSection = (categoryId, label) => (
        <div className="space-y-4 mb-16">
            {/* Movie type display */}
            <div className="bg-[#F9F6EF] p-4 rounded-[10px]">
                <div className="text-left">
                    <span className="text-[14px] font-semibold">
                        {label}
                    </span>
                </div>
            </div>
            {/* Movie selection dropdown */}
            <div className="flex items-center gap-1">
                <div className="flex-1">
                    <select
                        value={selected[categoryId]}
                        onChange={e => setSelected(s => ({ ...s, [categoryId]: e.target.value }))}
                        className="w-full p-4 text-[14px] border-2 border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 appearance-none bg-white"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 12px center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '16px'
                        }}
                    >
                        {responses.filter(data => String(data.category_id) === String(categoryId)).length === 0 ? (
                            <option value="">選択してください</option>
                        ) : (
                            responses
                                .filter(data => String(data.category_id) === String(categoryId))
                                .map(data => (
                                    <option key={data.id} value={data.id}>
                                        {data.title}
                                    </option>
                                ))
                        )}
                    </select>
                </div>
                {/* Proceed button */}
                <button
                    onClick={() => handleProceed(categoryId)}
                    className={`px-8 py-4 rounded-lg font-semibold text-[14px] transition-colors duration-200 flex items-center gap-2 ${
                        selected[categoryId] 
                            ? 'bg-[#215261] hover:bg-[#97AEB5] text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!selected[categoryId]}
                >
                    入力へ進む
                    <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7" 
                        />
                    </svg>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F9F6EF] py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg sm-top-sp">
                {/* Header */}
                <div className="bg-[#D6939D] text-white p-8 rounded-t-lg">
                    <h1 className="text-3xl font-bold text-center font-zen-maru-gothic text-[24px]">
                        お写真提出フォーム
                    </h1>
                </div>

                {/* Content */}
                <div className="py-8">
                    {/* Thank you message */}
                    <div className="text-center mb-8 text-[14px]">
                        <p className="text-gray-700 mb-2">
                            オーダーいただきまして、ありがとうございます。
                        </p>
                        <p className="text-gray-700">
                            ご注文のムービーを選択し、お写真を提出してください。
                        </p>
                    </div>

                    {/* Movie selection section */}
                    <div className="p-6 rounded-lg mb-8">
                        <h2 className="text-[14px] font-bold text-[#D6939D] mb-6 text-center">
                            ご注文のムービーをお選びください
                        </h2>
                        {renderMovieSection(1, 'オープニングムービー')}
                        {renderMovieSection(2, 'プロフィールムービー')}
                        {renderMovieSection(3, 'エンドロール・レタームービーその他')}
                    </div>

                    {/* Additional info */}
                    <div className="text-center text-gray-600 sm-text-p">
                        <p className="text-sm">
                            選択したムービーに応じて、適切な写真提出フォームに移動します。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}