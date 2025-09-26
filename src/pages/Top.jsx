import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Top() {
    const [selectedMovie, setSelectedMovie] = useState('ボタニカ');
    const navigate = useNavigate();

    const movieOptions = [
        'ボタニカ',
        'サクラ',
        'ハナビ',
        'ユキ',
        'カエデ',
        'モミジ'
    ];

    const handleProceed = () => {
        // Navigate to profile movie form page with selected movie
        navigate(`/profile-movie?movie=${encodeURIComponent(selectedMovie)}`);
    };

    return (
        <div className="min-h-screen bg-[#F9F6EF] py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
                {/* Header */}
                <div className="bg-[#D6939D] text-white p-8 rounded-t-lg">
                    <h1 className="text-3xl font-bold text-center">
                        お写真提出フォーム
                    </h1>
                </div>

                {/* Content */}
                <div className="py-8">
                    {/* Thank you message */}
                    <div className="text-center mb-8">
                        <p className="text-lg text-gray-700 mb-2">
                            オーダーいただきまして、ありがとうございます。
                        </p>
                        <p className="text-lg text-gray-700">
                            ご注文のムービーを選択し、お写真を提出してください。
                        </p>
                    </div>

                    {/* Movie selection section */}
                    <div className="p-6 rounded-lg mb-8">
                        <h2 className="text-2xl font-bold text-[#D6939D] mb-6 text-center">
                            ご注文のムービーをお選びください
                        </h2>

                        <div className="space-y-4 mb-16 mt-10">
                            {/* Movie type display */}
                            <div className="bg-[#E6B372] p-4">
                                <div className="text-center">
                                    <span className="text-lg font-semibold text-white">
                                        オープニングムービー
                                    </span>
                                </div>
                            </div>

                            {/* Movie selection dropdown */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <select
                                        value={selectedMovie}
                                        onChange={(e) => setSelectedMovie(e.target.value)}
                                        className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 12px center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '16px'
                                        }}
                                    >
                                        {movieOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Proceed button */}
                                <button
                                    onClick={handleProceed}
                                    className="bg-[#215261] hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center gap-2"
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
                        <div className="space-y-4 mb-16">
                            {/* Movie type display */}
                            <div className="bg-[#E6B372] p-4">
                                <div className="text-center">
                                    <span className="text-lg font-semibold text-white">
                                        プロフィールムービ
                                    </span>
                                </div>
                            </div>

                            {/* Movie selection dropdown */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <select
                                        value={selectedMovie}
                                        onChange={(e) => setSelectedMovie(e.target.value)}
                                        className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 12px center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '16px'
                                        }}
                                    >
                                        {movieOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Proceed button */}
                                <button
                                    onClick={handleProceed}
                                    className="bg-[#215261] hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center gap-2"
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
                        <div className="space-y-4">
                            {/* Movie type display */}
                            <div className="bg-[#E6B372] p-4">
                                <div className="text-center">
                                    <span className="text-lg font-semibold text-white">
                                        エンドロール・レタームービーその他
                                    </span>
                                </div>
                            </div>

                            {/* Movie selection dropdown */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <select
                                        value={selectedMovie}
                                        onChange={(e) => setSelectedMovie(e.target.value)}
                                        className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 12px center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '16px'
                                        }}
                                    >
                                        {movieOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Proceed button */}
                                <button
                                    onClick={handleProceed}
                                    className="bg-[#215261] hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center gap-2"
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
                    </div>

                    {/* Additional info */}
                    <div className="text-center text-gray-600">
                        <p className="text-sm">
                            選択したムービーに応じて、適切な写真提出フォームに移動します。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}